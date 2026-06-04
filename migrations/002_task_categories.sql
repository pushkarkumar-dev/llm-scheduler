-- Adds task categories (production / experimental / test).
-- Run once against an existing database:
--   mysql -u root -p task_scheduler < migrations/002_task_categories.sql

ALTER TABLE tasks
  ADD COLUMN category ENUM('production','experimental','test') NOT NULL DEFAULT 'experimental';

CREATE INDEX idx_tasks_category ON tasks (category);
