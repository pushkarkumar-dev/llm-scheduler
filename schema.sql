CREATE TABLE IF NOT EXISTS tasks (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  description     TEXT,
  prompt          TEXT NOT NULL,
  model           VARCHAR(255),

  schedule_type   ENUM('hourly','daily','adhoc_once','adhoc_n_times') NOT NULL,
  hourly_minute   INT,
  daily_time      TIME,
  interval_minutes INT,
  max_runs        INT,
  run_count       INT NOT NULL DEFAULT 0,

  status          ENUM('active','paused','completed') NOT NULL DEFAULT 'active',
  next_run_at     DATETIME,

  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_executions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  task_id      INT NOT NULL,
  status       ENUM('pending','running','success','failed') NOT NULL DEFAULT 'pending',
  `trigger`    ENUM('schedule','manual') NOT NULL DEFAULT 'schedule',
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
