# Contributing to OpenTaskScheduler

Thanks for your interest in contributing! This is a self-hosted tool and contributions of all kinds are welcome — bug reports, feature suggestions, documentation improvements, and code.

## Table of Contents

- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Code Guidelines](#code-guidelines)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)

---

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8+
- LM Studio (for testing LLM integration)

### Local Setup

1. **Fork and clone** the repo
   ```bash
   git clone https://github.com/your-username/OpenTaskScheduler.git
   cd OpenTaskScheduler
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your MySQL credentials
   ```

4. **Create the database and run the schema**
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS task_scheduler;"
   mysql -u root -p task_scheduler < schema.sql
   ```

5. **Start the dev server**
   ```bash
   npm run dev
   ```

6. **Verify the DB connection**
   ```
   GET http://localhost:3000/api/health
   → { "ok": true, "db": "connected" }
   ```

---

## Project Structure

```
app/
  api/
    tasks/             GET list, POST create
    tasks/[id]/        GET, PUT (edit + pause/resume), DELETE
    tasks/[id]/run/    POST manual run
    executions/        GET list (filterable, paginated)
    executions/[id]/   GET, DELETE
    health/            GET connectivity check
  tasks/new/           Create task page
  tasks/[id]/          Task detail page
  tasks/[id]/edit/     Edit task page
  executions/          Global execution log page
  layout.js            Root layout with Navbar
  page.js              Dashboard

lib/
  db.js          MySQL connection pool + query() helper
  schedule.js    computeNextRun(), validateTask(), scheduleLabel()
  runner.js      runTask() — shared execute-one-task logic
  llm.js         callLLM() — LM Studio API client

components/
  Navbar.jsx         Top navigation
  Dashboard.jsx      Task list with stats and inline actions
  TaskForm.jsx       Create / edit form with live validation
  ExecutionLog.jsx   Filterable, paginated execution table
  StatusBadge.jsx    Colored status pill
  RunNowButton.jsx   Client-side run trigger with feedback
  Toast.jsx          Slide-up notifications
  ConfirmDialog.jsx  Deletion confirm modal
  Skeleton.jsx       Loading skeleton rows/cards

instrumentation.js   Registers the cron tick on server boot
schema.sql           Database schema (DDL)
```

---

## Development Workflow

- **Scheduler** runs on a 1-minute `node-cron` tick started via `instrumentation.js`. The `isTicking` guard prevents tick overlap.
- **`runner.js`** is the single source of execution logic — used by both the scheduler and the manual "Run now" endpoint.
- **`lib/schedule.js`** owns all scheduling math. If you're changing how `next_run_at` is computed, change it there.
- **Manual runs** never affect scheduling state (`status`, `next_run_at`). Only scheduled runs advance state.

### Running with a mock LLM

If you don't have LM Studio running, you can stub `lib/llm.js` locally for development:

```js
// lib/llm.js (local dev stub)
export async function callLLM({ prompt }) {
  return `Mock response for: ${prompt.slice(0, 50)}`;
}
```

---

## Submitting a Pull Request

1. **Branch** from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes.** Keep PRs focused — one feature or fix per PR.

3. **Test manually:**
   - Create tasks of each schedule type and verify `next_run_at` is correct
   - Run the scheduler tick and confirm executions are recorded
   - Test the manual "Run now" flow
   - Check the executions page filters and pagination

4. **No TypeScript** — this project is intentionally plain JavaScript. Please don't introduce `.ts`/`.tsx` files or type annotations.

5. **No ORM** — DB access goes through the `query()` helper in `lib/db.js` with raw SQL. Keep it simple and transparent.

6. **Open a PR** with a clear title and description of what changed and why.

---

## Code Guidelines

| Rule | Reason |
|------|--------|
| Plain JavaScript (`.js`/`.jsx`) | Keeps the codebase accessible without a TS toolchain |
| All DB access via `lib/db.js` | Single connection pool, no scattered raw queries |
| Schedule logic in `lib/schedule.js` | Single source of truth for `next_run_at` |
| Execution logic in `lib/runner.js` | Shared between scheduler and manual run |
| Validate at API boundaries | `validateTask()` runs in the route, not scattered in components |
| No new dependencies without discussion | Keep the dependency footprint small |

---

## Reporting Bugs

Please open a GitHub Issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your Node.js version, MySQL version, and OS
- Relevant server logs (from `npm run dev` output)

## Requesting Features

Open a GitHub Issue with the `enhancement` label. Describe:
- The use case (what are you trying to do?)
- Your proposed solution or behaviour
- Any alternatives you've considered

Stretch goals already on the radar (from the project spec):
- Per-task system prompt + temperature
- Streaming responses in the run-now view
- Export executions to CSV
- Success rate / runs-over-time charts
- Pause-all / scheduler on-off toggle
