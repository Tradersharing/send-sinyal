const { createClient } = require('@supabase/supabase-js');

// Data koneksi Supabase kamu

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Contoh data sinyal (bisa kamu ubah/loop sesuai hasil parsing dari API)
const signal = {
  pair: 'EURUSD',
  type: 'BUY',
  entry: '1.23456',
  tp1: '1.23600',
  tp2: '1.23800',
  tp3: '1.24000',
  sl1: '1.23200',
  sl2: '1.23000',
  source: 'myfxbook',
  sent_to: 'telegram',
  sent_at: new Date().toISOString(),
  raw_json: JSON.stringify({ // bisa diisi data mentah dari API, atau kosongkan jika tidak perlu
    pair: 'EURUSD',
    type: 'BUY',
    entry: '1.23456',
    tp1: '1.23600',
    tp2: '1.23800',
    tp3: '1.24000',
    sl1: '1.23200',
    sl2: '1.23000',
  }),
};

// Fungsi insert sinyal ke tabel forex
async function insertSignal(signal) {
  const { data, error } = await supabase
    .from('forex')
    .insert([signal]);

  if (error) {
    console.error('Gagal insert ke Supabase:', error.message);
  } else {
    console.log('Sukses insert ke Supabase:', data);
  }
}

// Jalankan (untuk satu sinyal, atau panggil dalam loop untuk banyak sinyal)
insertSignal(signal);
