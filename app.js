// Nama tabel di Supabase project "bot signal"
const TABLE_NAME = 'usersignal'; // Pastikan nama tabel sesuai di dashboard

const SUPABASE_URL = 'https://oaatowhxrefpjlwucvvg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYXRvd2h4cmVmcGpsd3VjdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzgzMDQsImV4cCI6MjA2NDAxNDMwNH0.-Qf6y5JiWVx2PAVkMej9Y6qXHr5WSTlJwqG9GInPD7g';

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  console.log('Mengambil data dari tabel:', TABLE_NAME);

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*');

  if (error) {
    console.error('Gagal ambil data:', error.message);
    process.exit(1);
  }
  console.log('Data:', data);
}

main();
