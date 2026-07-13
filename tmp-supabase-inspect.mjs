import { createClient } from '@supabase/supabase-js';
const url = 'https://ybiodnymjwnmvdwcloxz.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaW9kbnltandubXZkd2Nsb3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMTYzNDIsImV4cCI6MjA5MTg5MjM0Mn0.dEsSAGQyaT70h4sBafWh9KdpEbNeMPjOlEp9NG1YIJs';
const supabase = createClient(url, key, { auth: { persistSession: false } });

const tests = [
  { name: 'service-table-sample', fn: async () => supabase.from('services').select('id,title,description,category,price,gst_rate,is_active').limit(1) },
  { name: 'table-list', fn: async () => supabase.from('pg_catalog.pg_tables').select('tablename,schemaname').eq('schemaname', 'public').limit(20) },
  { name: 'service-columns', fn: async () => supabase.from('information_schema.columns').select('column_name,data_type').eq('table_name', 'services') },
];

for (const test of tests) {
  const result = await test.fn();
  console.log('---', test.name, '---');
  console.log(JSON.stringify(result, null, 2));
}
