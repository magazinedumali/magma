import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface BucketTest {
  name: string;
  status: 'testing' | 'success' | 'error';
  error?: string;
  files?: any[];
}

const SupabaseStorageTest: React.FC = () => {
  const [buckets, setBuckets] = useState<BucketTest[]>([
    { name: 'article-images', status: 'testing' },
    { name: 'article-audios', status: 'testing' },
    { name: 'banners', status: 'testing' },
    { name: 'stories', status: 'testing' },
    { name: 'albums', status: 'testing' },
    { name: 'medias', status: 'testing' },
    { name: 'polls', status: 'testing' },
  ]);

  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    testAllBuckets();
  }, []);

  const testAllBuckets = async () => {
    const results: string[] = [];
    
    for (const bucket of buckets) {
      try {
        results.push(`Testing bucket: ${bucket.name}`);
        
        // Test 1: List files
        const { data: files, error: listError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 5 });
        
        if (listError) {
          results.push(`❌ Error listing ${bucket.name}: ${listError.message}`);
          setBuckets(prev => prev.map(b => 
            b.name === bucket.name 
              ? { ...b, status: 'error', error: listError.message }
              : b
          ));
        } else {
          results.push(`✅ Successfully listed ${bucket.name}: ${files?.length || 0} files`);
          setBuckets(prev => prev.map(b => 
            b.name === bucket.name 
              ? { ...b, status: 'success', files: files || [] }
              : b
          ));
        }

        // Test 2: Try to get public URL for a file (if any)
        if (files && files.length > 0) {
          const testFile = files[0];
          const { data: publicUrlData } = supabase.storage
            .from(bucket.name)
            .getPublicUrl(testFile.name);
          
          results.push(`🔗 Public URL for ${testFile.name}: ${publicUrlData.publicUrl}`);
        }

      } catch (error: any) {
        results.push(`❌ Exception testing ${bucket.name}: ${error.message}`);
        setBuckets(prev => prev.map(b => 
          b.name === bucket.name 
            ? { ...b, status: 'error', error: error.message }
            : b
        ));
      }
    }

    setTestResults(results);
  };

  const testImageUrl = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch (error: any) {
      return {
        status: 0,
        ok: false,
        error: error.message
      };
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.9)', 
      color: 'white', 
      padding: '20px', 
      fontSize: '12px', 
      zIndex: 10000,
      overflow: 'auto'
    }}>
      <h2>Supabase Storage Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Bucket Status:</h3>
        {buckets.map(bucket => (
          <div key={bucket.name} style={{ marginBottom: '10px' }}>
            <span style={{ 
              color: bucket.status === 'success' ? 'green' : 
                    bucket.status === 'error' ? 'red' : 'orange',
              fontWeight: 'bold'
            }}>
              {bucket.status === 'success' ? '✅' : 
               bucket.status === 'error' ? '❌' : '⏳'} {bucket.name}
            </span>
            {bucket.error && <div style={{ color: 'red', marginLeft: '20px' }}>Error: {bucket.error}</div>}
            {bucket.files && bucket.files.length > 0 && (
              <div style={{ marginLeft: '20px', fontSize: '10px' }}>
                Files: {bucket.files.map(f => f.name).join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>

      <div>
        <h3>Test Results:</h3>
        <pre style={{ 
          background: '#333', 
          padding: '10px', 
          borderRadius: '5px',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          {testResults.join('\n')}
        </pre>
      </div>

      <button 
        onClick={() => window.location.reload()}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#ff184e',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Close
      </button>
    </div>
  );
};

export default SupabaseStorageTest;
