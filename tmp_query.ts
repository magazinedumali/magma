import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('banners').select('*');
  if (error) {
    console.error("Error fetching banners:", error);
    return;
  }
  console.log("Current banners:");
  console.log(JSON.stringify(data, null, 2));

  // If there are specific URLs, print them out
  const urls = data.map(b => b.image_url).filter(url => url);
  console.log("URLs:", urls);
}

main();
