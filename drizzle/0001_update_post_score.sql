-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION update_post_score() RETURNS JSONB AS $$

DECLARE
  v_result JSONB;
  v_batch_size INTEGER := 1000;
  v_updated INTEGER := 0;
  v_avg_engagement DECIMAL;
  v_base_decay DECIMAL := 0.006;
  v_hours_since_creation DECIMAL;
BEGIN
  SELECT AVG(total_points)::DECIMAL INTO v_avg_engagement
  FROM (
    SELECT COALESCE(SUM(eh.points), 0) AS total_points
    FROM engagement_hourly eh
    GROUP BY eh.content_id
    ORDER BY total_points DESC
    LIMIT 10000
  ) AS top_posts;

  v_avg_engagement := COALESCE(v_avg_engagement, 10.0);

  WITH posts_to_update AS (
    SELECT 
      p.id AS post_id,
      p.created_at,
      p.life,
      EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 3600 AS hours_since_creation
    FROM posts p
    WHERE p.life > 0
      AND (p.score_updated_at < NOW() - INTERVAL '10 minutes' OR p.next_score_update <= NOW())
    ORDER BY p.next_score_update NULLS FIRST, p.score_updated_at ASC
    LIMIT v_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  calculated_engagement AS (
    SELECT
      ptu.post_id,
      ptu.life,
      ptu.hours_since_creation,
      COALESCE(curr.points, 0) AS current_pts,
      COALESCE(recent.points, 0) AS recent_pts,
      COALESCE(total.points, 0) AS total_pts,
      (
        0.33 * COALESCE(total.points, 0) +
        0.33 * COALESCE(recent.points, 0) +
        0.33 * COALESCE(curr.points, 0)
      ) AS engagement,
      CASE 
        WHEN COALESCE(recent.points, 0) > 0 AND v_avg_engagement > 0
        THEN COALESCE(recent.points, 0)::DECIMAL / v_avg_engagement
        ELSE 1.0
      END AS engagement_multiplier
    FROM posts_to_update ptu
    LEFT JOIN LATERAL (
      SELECT points FROM engagement_hourly
      WHERE content_id = ptu.post_id
        AND hour = date_trunc('hour', NOW())
    ) curr ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(points), 0) AS points FROM engagement_hourly
      WHERE content_id = ptu.post_id
        AND hour >= date_trunc('hour', NOW() - INTERVAL '5 hour')
        AND hour < date_trunc('hour', NOW())
    ) recent ON true
    LEFT JOIN LATERAL (
      SELECT COALESCE(SUM(points), 0) AS points FROM engagement_hourly
      WHERE content_id = ptu.post_id
    ) total ON true
  ),
  calculated_life AS (
    SELECT
      ce.post_id,
      GREATEST(0, LEAST(1.0,
        ce.life - (v_base_decay * ce.hours_since_creation * (1 + LN(ce.engagement_multiplier)))
      )) AS new_life,
      ce.engagement
    FROM calculated_engagement ce
  )
  UPDATE
    posts p
  SET
    life = cl.new_life,
    score = cl.new_life * (1 + LN(GREATEST(1, cl.engagement))),
    score_updated_at = NOW(),
    next_score_update = CASE
      WHEN cl.new_life < 0.1 THEN NOW() + INTERVAL '1 minute'
      WHEN cl.new_life < 0.3 THEN NOW() + INTERVAL '2 minutes'
      WHEN cl.new_life < 0.5 THEN NOW() + INTERVAL '5 minutes'
      ELSE NOW() + INTERVAL '15 minutes'
    END
  FROM calculated_life cl
  WHERE p.id = cl.post_id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;

  SELECT COALESCE(
    EXTRACT(EPOCH FROM MIN(next_score_update) - NOW())::INTEGER,
    300
  ) INTO v_result
  FROM posts
  WHERE next_score_update > NOW() AND life > 0;
  
  RETURN jsonb_build_object(
    'updated', v_updated,
    'batch_size', v_batch_size,
    'next_run_in', v_result,
    'avg_engagement', v_avg_engagement,
    'timestamp', NOW()
  );
END;

$$ LANGUAGE plpgsql;
