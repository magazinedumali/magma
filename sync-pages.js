// sync-pages.js
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// À personnaliser avec tes infos Supabase
const supabaseUrl = 'https://zwtdnfmwxddrmmmruaoc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dGRuZm13eGRkcm1tbXJ1YW9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczMzE2NTksImV4cCI6MjA2MjkwNzY1OX0.NASReESXkS3-GVafOk3uIEMXU4ptV_PApnaflmRHZgs';
const supabase = createClient(supabaseUrl, supabaseKey);

const pagesDir = path.join(__dirname, 'src/pages');
const ignore = ['api', 'superadmin', 'admin', 'mobile']; // à adapter selon ton projet

function getPages(dir, prefix = '') {
  return fs.readdirSync(dir).flatMap(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && !ignore.includes(file)) {
      return getPages(fullPath, prefix + '/' + file);
    }
    if (file.endsWith('.tsx') && !file.startsWith('_')) {
      let route = prefix + '/' + file.replace(/\.tsx$/, '');
      if (route.endsWith('/Index')) route = route.replace(/\/Index$/, '/');
      if (route === '/Index') route = '/';
      return [{ title: file.replace(/\.tsx$/, ''), path: route }];
    }
    return [];
  });
}

async function syncPages() {
  const pages = getPages(pagesDir);
  for (const page of pages) {
    await supabase.from('pages').upsert({ title: page.title, path: page.path, is_active: true }, { onConflict: 'path' });
  }
  console.log('Pages synchronisées !');
}

syncPages(); 