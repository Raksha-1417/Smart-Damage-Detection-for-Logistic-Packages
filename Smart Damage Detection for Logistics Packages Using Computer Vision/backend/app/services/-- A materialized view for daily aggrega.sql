-- A materialized view for daily aggregates (Total inspected, damaged_count, damage_rate)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_daily_stats AS
SELECT
  DATE(inspected_at) AS day,
  COUNT(*) AS total_inspected,
  COUNT(*) FILTER (WHERE status = 'damaged') AS damaged_count,
  (COUNT(*) FILTER (WHERE status = 'damaged')::numeric / NULLIF(COUNT(*),0)) AS damage_rate
FROM packages
GROUP BY DATE(inspected_at);CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);ALTER TABLE images ADD CONSTRAINT fk_images_package FOREIGN KEY (package_id) REFERENCES packages(package_id) ON DELETE SET NULL;