-- Custom SQL migration file, put your code below! --
-- Add life column to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS life REAL DEFAULT 1.0;

-- Initialize life for existing posts based on age (cap at 1.0)
-- Use hours since creation as proxy for decay
UPDATE posts 
SET life = GREATEST(0, LEAST(1.0, 1.0 - (0.006 * EXTRACT(EPOCH FROM (NOW() - created_at)) / 3600)))
WHERE life IS NULL;

-- Set default life for new posts
ALTER TABLE posts ALTER COLUMN life SET DEFAULT 1.0;

-- Make life not null
ALTER TABLE posts ALTER COLUMN life SET NOT NULL;
