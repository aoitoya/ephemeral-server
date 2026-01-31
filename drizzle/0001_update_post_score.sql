-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION update_post_score () RETURNS JSONB AS $$

DECLARE
  v_result JSONB;
  v_batch_size INTEGER := 1000;
  v_updated INTEGER := 0;
  v_avg_score DECIMAL;
  v_post_lifespan INTEGER;
BEGIN
  SELECT value::DECIMAL INTO v_avg_score
  FROM configs WHERE key = 'AVG_SCORE';

  SELECT value::INTEGER INTO v_post_lifespan
  FROM configs WHERE key = 'POST_LIFESPAN';

  v_avg_score := COALESCE(v_avg_score, 100.0);
  v_post_lifespan := COALESCE(v_post_lifespan, 86400);

  WITH posts_to_update AS (
    SELECT p.id AS post_id, p.created_at
    FROM posts p
    WHERE NOT p.is_dead AND (
      p.score_updated_at < NOW() - INTERVAL '10 minutes'
      OR p.next_score_update <= NOW()
    )
    ORDER BY next_score_update NULLS FIRST, score_updated_at ASC
    LIMIT v_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  calculated_points AS (
    SELECT
      ptu.post_id,
      ptu.created_at,
      COALESCE(curr.points, 0) AS curr_hr_pts,
      COALESCE(last_hr.points, 0) AS last_hr_pts,
      COALESCE(avg_old.points, 0) AS old_avg_pts,
      COALESCE(total.points, 0) AS total_pts,
      (
        COALESCE(curr.points, 0) * 1.5 +
        COALESCE(last_hr.points, 0) * 0.8 +
        COALESCE(avg_old.points, 0) * 0.3 +
        COALESCE(total.points, 0) * 0.2
      ) as score
    FROM posts_to_update ptu
    LEFT JOIN LATERAL (
      SELECT points FROM engagement_hourly
      WHERE content_id = ptu.post_id
        AND hour = date_trunc('hour', NOW())
    ) as curr ON true
    LEFT JOIN LATERAL (
      SELECT points FROM engagement_hourly
      WHERE content_id = ptu.post_id
        AND hour = date_trunc('hour', NOW() - INTERVAL '1 hour')
    ) as last_hr ON true
    LEFT JOIN LATERAL (
      SELECT SUM(points) AS points FROM engagement_hourly
      WHERE content_id = ptu.post_id
        AND hour >= date_trunc('hour', NOW() - INTERVAL '5 hour')
        AND hour <= date_trunc('hour', NOW() - INTERVAL '2 hour')
    ) as avg_old ON true
    LEFT JOIN LATERAL (
      SELECT SUM(points) AS points FROM engagement_hourly
      WHERE content_id = ptu.post_id
    ) total ON true
  ),
  posts_with_life AS (
    SELECT
      cp.post_id,
      cp.score,
      GREATEST(1, LEAST(3.333,
          LN(LEAST(1, cp.score)/v_avg_score)
      )) AS life
    FROM
      calculated_points cp
  )
  UPDATE
    posts p
  SET
    score = pl.score,
    is_dead = pl.life <= 0,
    score_updated_at = NOW(),
    next_score_update = CASE
      WHEN pl.life < 10 THEN NOW() + INTERVAL '2 minutes'
      WHEN pl.life < 30 THEN NOW() + INTERVAL '5 minutes'
      ELSE NOW() + INTERVAL '15 minutes'
    END
  FROM posts_with_life pl
  WHERE p.id = pl.post_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  SELECT COALESCE(
    EXTRACT(EPOCH FROM MIN(next_score_update) - NOW())::INTEGER,
    300
  ) INTO v_result
  FROM posts
  WHERE next_score_update > NOW() AND NOT is_dead;
  
  RETURN jsonb_build_object(
    'updated', v_updated,
    'batch_size', v_batch_size,
    'next_run_in', v_result,
    'timestamp', NOW()
  );
END;

$$ LANGUAGE plpgsql ;
