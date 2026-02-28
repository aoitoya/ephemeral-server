ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "life" real;


UPDATE posts
SET
    life = GREATEST(
        0,
        LEAST(
            1.0,
            1.0 - (0.006 * EXTRACT(epoch FROM (NOW() - created_at)) / 3600)
        )
    )
WHERE life IS NULL;

ALTER TABLE posts ALTER column life SET DEFAULT 1.0 ;

ALTER TABLE posts ALTER COLUMN life SET NOT NULL ;
