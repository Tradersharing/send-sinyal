const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://oaatowhxrefpjlwucvvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hYXRvd2h4cmVmcGpsd3VjdnZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MzgzMDQsImV4cCI6MjA2NDAxNDMwNH0.-Qf6y5JiWVx2PAVkMej9Y6qXHr5WSTlJwqG9GInPD7g';
const supabase = createClient(supabaseUrl, supabaseKey);

// Contoh query
(async () => {
  const { data, error } = await supabase
    .from('nama_tabel_anda')
    .select('*');
  console.log(data, error);
})();
