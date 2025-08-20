// Use native fetch in Node 18+

async function testSalesChannel() {
  try {
    // 1. Create a sales channel
    console.log('Creating Online Store sales channel...');
    const createResponse = await fetch('http://localhost:8000/api/sales/channels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Email': 'test@example.com',
        'X-User-Role': 'admin'
      },
      body: JSON.stringify({
        name: 'online_store',
        platform: 'shopify',
        type: 'online_store'
      })
    });
    
    const createResult = await createResponse.json();
    console.log('Created channel:', createResult);
    
    // 2. Get all channels
    console.log('\nFetching all sales channels...');
    const getResponse = await fetch('http://localhost:8000/api/sales/channels', {
      headers: {
        'X-User-Email': 'test@example.com',
        'X-User-Role': 'admin'
      }
    });
    
    const channels = await getResponse.json();
    console.log('All channels:', channels);
    
    // 3. Sync from Shopify (creates default channels)
    console.log('\nSyncing default channels from Shopify...');
    const syncResponse = await fetch('http://localhost:8000/api/sales/sync/shopify', {
      method: 'POST',
      headers: {
        'X-User-Email': 'test@example.com',
        'X-User-Role': 'superadmin'
      }
    });
    
    const syncResult = await syncResponse.json();
    console.log('Sync result:', syncResult);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testSalesChannel();