-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION refresh_engagement_cache_smart ()
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_batch_size INTEGER := 1000;
  v_updated INTEGER := 0;
BEGIN
  WITH posts_to_update AS (
    SELECT pec.post_id,
    FROM post_engagement_cache pec
    WHERE pec.updated_at < NOW() - INTERVAL '10 minutes'
       OR pec.next_update <= NOW()
       OR pec.version = 1
    LIMIT v_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  updated_cache AS (
    SELECT 
      ptu.post_id,
      -- Current velocity: sum of scores in current hour bucket
      COALESCE(
        (SELECT SUM(eh.score) 
         FROM engagement_hourly eh 
         WHERE eh.content_id = ptu.post_id 
           AND eh.hour = date_trunc('hour', NOW())),
        0
      )::INTEGER as current_velocity,
      -- Previous velocity: previous hour bucket (1 hour ago)
      COALESCE(
        (SELECT SUM(eh.score) 
         FROM engagement_hourly eh 
         WHERE eh.content_id = ptu.post_id 
             AND eh.hour >= date_trunc('hour', NOW() - INTERVAL '2 hours')
           AND eh.hour < date_trunc('hour', NOW() - INTERVAL '1 hour')),
        0
      )::INTEGER as prev_velocity
    FROM posts_to_update ptu
  )
  UPDATE post_engagement_cache pec
  SET 
    current_velocity = uc.current_velocity,
    peak_velocity = GREATEST(pec.peak_velocity, uc.current_velocity),
    health = CASE 
      WHEN GREATEST(pec.peak_velocity, uc.current_velocity) > 0 
      THEN LEAST(uc.current_velocity::DECIMAL / GREATEST(pec.peak_velocity, uc.current_velocity), 1.0)
      ELSE 1.0 
    END,
    status = CASE 
      WHEN pec.version = 1 THEN 'new'::engagement_status
      WHEN uc.current_velocity > uc.prev_velocity * 1.2 THEN 'rising'::engagement_status
      WHEN uc.current_velocity < uc.prev_velocity * 0.8 THEN 'falling'::engagement_status
      ELSE 'stable'::engagement_status
    END,
    version = pec.version + 1,
    updated_at = NOW(),
    next_update = CASE 
      WHEN uc.current_velocity > 50 THEN NOW() + INTERVAL '2 minutes'
      WHEN uc.current_velocity > 10 THEN NOW() + INTERVAL '5 minutes'
      ELSE NOW() + INTERVAL '15 minutes'
    END
  FROM updated_cache uc
  WHERE pec.post_id = uc.post_id;
  
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  
  SELECT jsonb_build_object(
    'updated', v_updated,
    'batch_size', v_batch_size,
    'next_run_in', COALESCE(
      EXTRACT(EPOCH FROM (
        SELECT MIN(next_update) - NOW() 
        FROM post_engagement_cache
        WHERE next_update > NOW()
      ))::INTEGER,
      0
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql ;
