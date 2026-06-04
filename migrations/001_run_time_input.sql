-- Adds optional run-time input support.
-- Run once against an existing database:
--   mysql -u root -p task_scheduler < migrations/001_run_time_input.sql

ALTER TABLE tasks
  ADD COLUMN accepts_input TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN input_label   VARCHAR(255);

ALTER TABLE task_executions
  ADD COLUMN input_data TEXT;
