-- Renames the gated task category from 'test' to 'private'.
-- Run once against an existing database:
--   mysql -u root -p task_scheduler < migrations/003_rename_test_to_private.sql

-- 1. Temporarily allow both values
ALTER TABLE tasks
  MODIFY COLUMN category ENUM('production','experimental','test','private') NOT NULL DEFAULT 'experimental';

-- 2. Migrate existing rows
UPDATE tasks SET category = 'private' WHERE category = 'test';

-- 3. Drop the old value
ALTER TABLE tasks
  MODIFY COLUMN category ENUM('production','experimental','private') NOT NULL DEFAULT 'experimental';
