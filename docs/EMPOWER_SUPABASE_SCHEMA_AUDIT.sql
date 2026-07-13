-- =============================================================================
-- Empower Supabase — full schema audit (run in SQL Editor on Empower project)
-- Copy each section's results (or export CSV) and share for hub migration mapping.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0) Quick overview: which schemas have user tables?
-- -----------------------------------------------------------------------------
SELECT
  table_schema,
  COUNT(*) AS table_count
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema NOT IN ('pg_catalog', 'information_schema')
  AND table_schema NOT LIKE 'pg_toast%'
  AND table_schema NOT LIKE 'pg_temp%'
GROUP BY table_schema
ORDER BY table_schema;


-- -----------------------------------------------------------------------------
-- 1) ALL TABLES + COLUMNS (main inventory for migration)
--    Includes public, ankshaastra, storage, auth (read-only reference), etc.
-- -----------------------------------------------------------------------------
SELECT
  c.table_schema,
  c.table_name,
  c.ordinal_position AS col_pos,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.character_maximum_length,
  c.numeric_precision,
  c.numeric_scale,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
JOIN information_schema.tables t
  ON t.table_schema = c.table_schema
 AND t.table_name = c.table_name
 AND t.table_type = 'BASE TABLE'
WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema')
  AND c.table_schema NOT LIKE 'pg_toast%'
  AND c.table_schema NOT LIKE 'pg_temp%'
ORDER BY c.table_schema, c.table_name, c.ordinal_position;


-- -----------------------------------------------------------------------------
-- 2) Focus: public + ankshaastra only (Empower app tables — most likely)
-- -----------------------------------------------------------------------------
SELECT
  c.table_schema,
  c.table_name,
  c.ordinal_position AS col_pos,
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable,
  c.column_default
FROM information_schema.columns c
WHERE c.table_schema IN ('public', 'ankshaastra')
ORDER BY c.table_schema, c.table_name, c.ordinal_position;


-- -----------------------------------------------------------------------------
-- 3) Primary keys
-- -----------------------------------------------------------------------------
SELECT
  tc.table_schema,
  tc.table_name,
  kcu.column_name,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema NOT IN ('pg_catalog', 'information_schema', 'auth', 'storage', 'realtime', 'supabase_functions', 'vault', 'graphql', 'graphql_public', 'pgsodium', 'extensions')
ORDER BY tc.table_schema, tc.table_name, kcu.ordinal_position;


-- -----------------------------------------------------------------------------
-- 4) Foreign keys (relationship map for migration order)
-- -----------------------------------------------------------------------------
SELECT
  tc.table_schema AS from_schema,
  tc.table_name AS from_table,
  kcu.column_name AS from_column,
  ccu.table_schema AS to_schema,
  ccu.table_name AS to_table,
  ccu.column_name AS to_column,
  tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema IN ('public', 'ankshaastra')
ORDER BY from_schema, from_table, from_column;


-- -----------------------------------------------------------------------------
-- 5) Unique constraints & indexes (non-PK)
-- -----------------------------------------------------------------------------
SELECT
  schemaname AS table_schema,
  tablename AS table_name,
  indexname AS index_name,
  indexdef
FROM pg_indexes
WHERE schemaname IN ('public', 'ankshaastra')
ORDER BY schemaname, tablename, indexname;


-- -----------------------------------------------------------------------------
-- 6) Custom ENUM types (hub uses website_source, order_type, etc.)
-- -----------------------------------------------------------------------------
SELECT
  n.nspname AS schema_name,
  t.typname AS enum_name,
  e.enumlabel AS enum_value,
  e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname IN ('public', 'ankshaastra')
ORDER BY schema_name, enum_name, sort_order;


-- -----------------------------------------------------------------------------
-- 7) Approximate row counts per table (fast; uses pg stats)
-- -----------------------------------------------------------------------------
SELECT
  schemaname AS table_schema,
  relname AS table_name,
  n_live_tup AS approx_row_count,
  last_vacuum,
  last_analyze
FROM pg_stat_user_tables
WHERE schemaname IN ('public', 'ankshaastra')
ORDER BY schemaname, relname;


-- -----------------------------------------------------------------------------
-- 8) Exact row counts (slower — run only on tables you care about)
--    Uncomment and replace schema/table as needed:
-- -----------------------------------------------------------------------------
-- SELECT COUNT(*) FROM ankshaastra.orders;
-- SELECT COUNT(*) FROM ankshaastra.customer_details;
-- SELECT COUNT(*) FROM public.orders;


-- -----------------------------------------------------------------------------
-- 9) RLS policies (know what Supabase enforces on Empower)
-- -----------------------------------------------------------------------------
SELECT
  schemaname AS table_schema,
  tablename AS table_name,
  policyname,
  permissive,
  roles,
  cmd,
  qual AS using_expression,
  with_check AS with_check_expression
FROM pg_policies
WHERE schemaname IN ('public', 'ankshaastra')
ORDER BY schemaname, tablename, policyname;


-- -----------------------------------------------------------------------------
-- 10) Storage buckets (invoice PDFs, uploads)
-- -----------------------------------------------------------------------------
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
ORDER BY name;

SELECT
  bucket_id,
  COUNT(*) AS object_count,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) AS total_size
FROM storage.objects
GROUP BY bucket_id
ORDER BY bucket_id;


-- -----------------------------------------------------------------------------
-- 11) Sample column list as JSON per table (easy to paste into migration doc)
-- -----------------------------------------------------------------------------
SELECT
  c.table_schema,
  c.table_name,
  json_agg(
    json_build_object(
      'column', c.column_name,
      'type', c.udt_name,
      'nullable', c.is_nullable,
      'default', c.column_default
    )
    ORDER BY c.ordinal_position
  ) AS columns
FROM information_schema.columns c
WHERE c.table_schema IN ('public', 'ankshaastra')
GROUP BY c.table_schema, c.table_name
ORDER BY c.table_schema, c.table_name;


-- -----------------------------------------------------------------------------
-- 12) One-shot “migration snapshot” view (run this if you only want one query)
-- -----------------------------------------------------------------------------
WITH cols AS (
  SELECT
    c.table_schema,
    c.table_name,
    json_agg(
      c.column_name || ' ' || c.udt_name
      || CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
      ORDER BY c.ordinal_position
    ) AS column_list
  FROM information_schema.columns c
  WHERE c.table_schema IN ('public', 'ankshaastra')
  GROUP BY c.table_schema, c.table_name
),
counts AS (
  SELECT schemaname, relname, n_live_tup
  FROM pg_stat_user_tables
  WHERE schemaname IN ('public', 'ankshaastra')
)
SELECT
  cols.table_schema,
  cols.table_name,
  COALESCE(counts.n_live_tup, 0) AS approx_rows,
  cols.column_list
FROM cols
LEFT JOIN counts
  ON counts.schemaname = cols.table_schema
 AND counts.relname = cols.table_name
ORDER BY cols.table_schema, cols.table_name;
