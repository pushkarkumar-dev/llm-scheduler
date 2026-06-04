# Claude Task Scheduler — Build Spec & Claude Code Prompt

> **How to use this file:** Save it in the empty project folder as `PROJECT_SPEC.md` (or `CLAUDE.md`), open Claude Code in that folder, and say:
> *"Read PROJECT_SPEC.md and build Phase 1. Stop after each phase so I can verify the acceptance criteria before continuing."*
> Building phase-by-phase keeps each step verifiable instead of getting one giant unreviewable diff.

---

## 1. Goal

A self-hosted **Claude Task Scheduler** web app. Users define text "tasks" (each task = a prompt). The scheduler runs each task on its configured schedule, sends the prompt to a **local LLM running in LM Studio**, and stores every run as an "execution" record with the response. The UI lets users manage tasks and browse execution history/logs.

---

## 2. Tech stack & hard constraints

- **Next.js (App Router)** — latest stable.
- **JavaScript only. NO TypeScript.** Use `.js` / `.jsx`. No `.ts`/`.tsx`, no `tsconfig.json`, no type annotations, no `prisma generate` TS types. This is a firm rule — if any tool defaults to TS, configure it for JS.
- **MySQL** as the database, accessed via the **`mysql2/promise`** driver with a small connection-pool helper. (No ORM, to keep it transparent and JS-friendly. Schema lives in a plain `schema.sql` file.)
- **Tailwind CSS** for styling.
- **`node-cron`** for scheduling (see Section 5 for how it's wired into Next.js).
- **LM Studio** local server (OpenAI-compatible API) for LLM calls (Section 6).
- No auth (single-user local tool). No external/cloud services.

---

## 3. Data model

Two tables. Use this exact DDL as `schema.sql` (adjust types only if you have a good reason, and explain why):

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  prompt          TEXT NOT NULL,                 -- the text sent to the LLM
  model           VARCHAR(255),                  -- optional LM Studio model name; null = server default

  schedule_type   ENUM('hourly','daily','adhoc_once','adhoc_n_times') NOT NULL,
  hourly_minute   INT,            -- 0-59, for 'hourly': which minute of each hour to run
  daily_time      TIME,           -- for 'daily': time of day to run
  interval_minutes INT,           -- for 'adhoc_n_times': minutes between runs
  max_runs        INT,            -- for 'adhoc_n_times': total number of runs
  run_count       INT NOT NULL DEFAULT 0,

  status          ENUM('active','paused','completed') NOT NULL DEFAULT 'active',
  next_run_at     DATETIME,       -- computed; NULL when paused/completed

  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_executions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  task_id      INT NOT NULL,
  status       ENUM('pending','running','success','failed') NOT NULL DEFAULT 'pending',
  trigger      ENUM('schedule','manual') NOT NULL DEFAULT 'schedule',
  prompt_sent  TEXT,
  response     LONGTEXT,
  error        TEXT,
  started_at   DATETIME,
  finished_at  DATETIME,
  duration_ms  INT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_exec_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_due ON tasks (status, next_run_at);
CREATE INDEX idx_exec_task ON task_executions (task_id, created_at);
```

---

## 4. Task configuration semantics

| `schedule_type`  | Required fields            | Behavior                                                                 |
|------------------|----------------------------|--------------------------------------------------------------------------|
| `hourly`         | `hourly_minute` (0–59)     | Runs once every hour at that minute. Repeats forever until paused.        |
| `daily`          | `daily_time`               | Runs once per day at that time. Repeats forever until paused.             |
| `adhoc_once`     | —                          | Runs a single time (ASAP), then `status` → `completed`.                   |
| `adhoc_n_times`  | `max_runs`, `interval_minutes` | Runs `max_runs` times, `interval_minutes` apart; then → `completed`. |

`run_count` increments on every successful **or** failed attempt. `paused` tasks are never scheduled. The user can re-activate a paused task; `completed` tasks can be cloned but not re-activated.

---

## 5. Scheduler design (important — read carefully)

Next.js App Router runs route handlers on-demand, so per-task cron jobs registered inside a request won't persist. Use a **single tick-based scheduler** instead — it's far more robust than juggling many cron jobs that need invalidation when tasks change.

**Wiring:** Use Next.js `instrumentation.js` at the project root. Its `register()` runs once when the server process boots. In it (guard for the `nodejs` runtime only), start a single `node-cron` job that fires **every minute**.

**The tick (runs every minute):**
1. `SELECT * FROM tasks WHERE status='active' AND next_run_at IS NOT NULL AND next_run_at <= NOW()`.
2. For each due task, process sequentially (await each before the next so a slow LLM call can't get double-triggered):
   - Insert a `task_executions` row (`status='running'`, `trigger='schedule'`, `started_at=now`).
   - Call LM Studio with the task's `prompt` and `model` (Section 6).
   - On success: update execution (`status='success'`, `response`, `finished_at`, `duration_ms`).
   - On error: update execution (`status='failed'`, `error`, ...). **A failed run must not crash the tick.**
   - `run_count += 1`, then recompute scheduling:
     - `hourly` → `next_run_at` = next occurrence of `hourly_minute`.
     - `daily` → `next_run_at` = next occurrence of `daily_time`.
     - `adhoc_once` → `status='completed'`, `next_run_at=NULL`.
     - `adhoc_n_times` → if `run_count >= max_runs` then `completed`/NULL, else `next_run_at = now + interval_minutes`.

**Computing `next_run_at`:** Centralize this in `lib/schedule.js` as `computeNextRun(task, fromDate)`. Call it whenever a task is **created** or **updated** to active, and after each run. Keep a single source of truth.

**Concurrency guard:** Set an in-memory `isTicking` flag so overlapping ticks (if a tick runs long) don't stack.

---

## 6. LM Studio integration

LM Studio exposes an **OpenAI-compatible** REST API (default base URL `http://localhost:1234/v1`). Put it behind env vars and a helper in `lib/llm.js`:

- `callLLM({ prompt, model })` → POST to `${LMSTUDIO_BASE_URL}/chat/completions` with body `{ model, messages: [{ role: 'user', content: prompt }] }` and header `Authorization: Bearer ${LMSTUDIO_API_KEY}` (any non-empty string works for LM Studio).
- If `model` is null, omit it / let the server pick its loaded model.
- Return the assistant message text; throw a clear error on non-2xx so the execution is recorded as `failed`.
- Use plain `fetch` (built into Node) — no SDK needed.

> ⚠️ Confirm your LM Studio server URL/port and that a model is loaded before relying on the defaults.

---

## 7. Project structure (target)

```
/
├─ instrumentation.js          # starts the cron tick on server boot
├─ schema.sql
├─ .env.local                  # see Section 9
├─ app/
│  ├─ layout.jsx
│  ├─ page.jsx                  # dashboard / task list
│  ├─ tasks/new/page.jsx        # create task form
│  ├─ tasks/[id]/page.jsx       # task detail + edit + its executions
│  ├─ executions/page.jsx       # all executions (filter by task/status)
│  └─ api/
│     ├─ tasks/route.js                 # GET list, POST create
│     ├─ tasks/[id]/route.js            # GET, PUT, DELETE
│     ├─ tasks/[id]/run/route.js        # POST manual "run now"
│     ├─ executions/route.js            # GET list (query: taskId, status)
│     └─ executions/[id]/route.js       # GET, DELETE
├─ lib/
│  ├─ db.js                     # mysql2 pool + query helper
│  ├─ schedule.js               # computeNextRun + validation
│  ├─ runner.js                 # runTask(taskId, trigger): the shared execute-one-task logic
│  └─ llm.js                    # callLLM
└─ components/                  # TaskForm, TaskCard, StatusBadge, ExecutionRow, etc.
```

`runner.js` is shared by both the scheduler tick and the manual "run now" endpoint — write the execute-one-task logic **once**.

---

## 8. API & UI surface

**API (CRUD + actions):**
- Tasks: list, create, read, update, delete, **run now**.
- Executions: list (filterable by `taskId` and `status`), read, delete.
- All handlers: validate input, return proper status codes, never leak raw SQL errors.

**UI pages:**
- **Dashboard** — table of tasks with name, schedule summary (human-readable, e.g. "Daily at 09:00"), status badge, `next_run_at`, last execution result. Actions: edit, pause/resume, delete, run now.
- **Task form** (create/edit) — fields conditionally shown based on `schedule_type` (e.g. show `daily_time` only for daily). Validate required fields per type.
- **Task detail** — task info + paginated list of its executions with expandable response/error.
- **Executions** — global execution log with filters and status badges.

---

## 9. Environment variables (`.env.local`)

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=changeme
DATABASE_NAME=task_scheduler

LMSTUDIO_BASE_URL=http://localhost:1234/v1
LMSTUDIO_API_KEY=lm-studio
```

---

## 10. Phased build plan (with acceptance criteria)

Build and stop at the end of each phase.

**Phase 1 — Scaffold & DB**
- `create-next-app` (JS, App Router, Tailwind, no TS). Add `mysql2`, `node-cron`.
- Add `schema.sql`, `lib/db.js` (pool + `query()` helper), `.env.local`.
- ✅ Done when: app runs, and a tiny test route can `SELECT 1` from MySQL successfully.

**Phase 2 — Task CRUD (API + UI)**
- Implement task API routes + `lib/schedule.js` validation and `computeNextRun`.
- Dashboard list, create form, edit, delete, pause/resume.
- ✅ Done when: you can create each of the 4 schedule types, see `next_run_at` populated correctly, and edit/delete works.

**Phase 3 — LLM + single execution**
- `lib/llm.js` and `lib/runner.js` (`runTask`). Wire the **run now** endpoint + button.
- ✅ Done when: clicking "Run now" creates an execution, calls LM Studio, and stores the response (or a clean error).

**Phase 4 — Scheduler**
- `instrumentation.js` → minute cron tick using `runner.js`. Recompute `next_run_at`/`status`/`run_count` per Section 5.
- ✅ Done when: an `hourly` task set to the current minute fires automatically; an `adhoc_n_times` task runs exactly `max_runs` times then goes `completed`.

**Phase 5 — Executions UI**
- Task-detail execution list + global executions page with filters, status badges, expandable response/error, delete.
- ✅ Done when: history is browsable and filterable.

**Phase 6 — Polish**
- Human-readable schedule summaries, loading/empty states, input validation messages, defensive error handling so one bad task never breaks the tick.

---

## 11. Stretch goals (optional, after core works)
- Manual "pause all" / scheduler on-off toggle.
- Per-task system prompt + temperature.
- Streaming responses in the run-now view.
- Export executions to CSV.
- Simple charts (success rate, runs over time).

---

## 12. Coding conventions for Claude Code
- JavaScript only — reject any TS suggestion.
- Keep DB access in `lib/db.js`; no raw queries scattered in route files.
- Share the execute-one-task logic (`runner.js`) between cron and manual run.
- Validate all API input; return meaningful HTTP status codes.
- Small, focused components. No premature abstractions.
- After each phase, print the acceptance check and wait.