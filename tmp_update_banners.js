import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zwtdnfmwxddrmmmruaoc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dGRuZm13eGRkcm1tbXJ1YW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzE2NTksImV4cCI6MjA2MjkwNzY1OX0.NASReESXkS3-GVafOk3uIEMXU4ptV_PApnaflmRHZgs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const { data, error } = await supabase.from('banners').select('*');
  if (error) {
    console.error("Error fetching banners:", error);
    return;
  }
  
  if (!data || data.length === 0) {
    console.log("No banners found in the database. It might be empty.");
    return;
  }

  for (const b of data) {
    const text = encodeURIComponent(b.position || 'Banner');
    const placeholderUrl = `https://placehold.co/800x400/1a1a1a/ffffff?text=${text}`;
    
    console.log(`Updating ${b.position} to ${placeholderUrl}`);
    const { error: updateError } = await supabase
      .from('banners')
      .update({ image_url: placeholderUrl })
      .eq('id', b.id);
      
    if (updateError) {
      console.error(`Failed to update ${b.id}:`, updateError);
    }
  }
  
  console.log("Finished updating banners!");
}

main();
