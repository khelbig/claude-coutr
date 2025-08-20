// Quick test to verify Google Ads connection works
require('dotenv').config();
const { GoogleAdsApi } = require('google-ads-api');

async function testConnection() {
  try {
    console.log('Testing Google Ads API connection...\n');
    
    // Check if credentials are set
    const required = [
      'GOOGLE_ADS_CLIENT_ID',
      'GOOGLE_ADS_CLIENT_SECRET', 
      'GOOGLE_ADS_DEVELOPER_TOKEN',
      'GOOGLE_ADS_REFRESH_TOKEN',
      'GOOGLE_ADS_CUSTOMER_ID'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      console.error('❌ Missing environment variables:', missing.join(', '));
      console.log('\nMake sure you added all credentials to .env file');
      return;
    }
    
    // Create client
    const client = new GoogleAdsApi({
      client_id: process.env.GOOGLE_ADS_CLIENT_ID,
      client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
      developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    });

    // Create customer instance
    const customer = client.Customer({
      customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID.replace(/-/g, ''),
      refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    });

    // Try to fetch account info
    console.log('Fetching account information...');
    const account = await customer.query(`
      SELECT 
        customer.id,
        customer.descriptive_name,
        customer.currency_code,
        customer.time_zone
      FROM customer
      LIMIT 1
    `);

    if (account && account[0]) {
      console.log('\n✅ Success! Connected to Google Ads\n');
      console.log('Account Details:');
      console.log('- ID:', account[0].customer.id);
      console.log('- Name:', account[0].customer.descriptive_name);
      console.log('- Currency:', account[0].customer.currency_code);
      console.log('- Timezone:', account[0].customer.time_zone);
      
      // Try to get campaigns count
      const campaigns = await customer.query(`
        SELECT campaign.id, campaign.name
        FROM campaign
        WHERE campaign.status != 'REMOVED'
      `);
      
      console.log(`\nFound ${campaigns.length} campaigns`);
      if (campaigns.length > 0) {
        console.log('First 3 campaigns:');
        campaigns.slice(0, 3).forEach(c => {
          console.log(`- ${c.campaign.name}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error occurred during connection test\n');
    
    // Handle different error types
    if (!error) {
      console.error('Unknown error occurred (error object is undefined)');
      return;
    }
    
    // Log the full error for debugging
    console.log('Full error details:');
    console.log(JSON.stringify(error, null, 2));
    
    // Check error message if it exists
    const errorMessage = error?.message || error?.toString() || 'Unknown error';
    console.error('\nError message:', errorMessage);
    
    // Check for specific error types
    if (error?.errors) {
      console.log('\nDetailed errors:');
      error.errors.forEach((e, i) => {
        console.log(`${i + 1}. ${e.message || e}`);
      });
    }
    
    // Common issues based on error
    if (errorMessage.includes('PERMISSION_DENIED')) {
      console.log('\n⚠️  Permission Denied:');
      console.log('1. Your developer token might still be pending approval');
      console.log('2. The account ID might be incorrect');
      console.log('3. The refresh token might be invalid');
    } else if (errorMessage.includes('UNAUTHENTICATED')) {
      console.log('\n⚠️  Authentication Failed:');
      console.log('1. Check your refresh token is valid');
      console.log('2. Verify client ID and secret match');
      console.log('3. Make sure the token hasn\'t expired');
    } else if (errorMessage.includes('INVALID_CUSTOMER_ID')) {
      console.log('\n⚠️  Invalid Customer ID:');
      console.log('1. Check the customer ID in your .env file');
      console.log('2. Make sure it\'s just numbers (no dashes)');
      console.log('3. Verify you have access to this account');
    } else if (errorMessage.includes('DEVELOPER_TOKEN')) {
      console.log('\n⚠️  Developer Token Issue:');
      console.log('1. Your token might not be approved yet');
      console.log('2. Check for typos in the token');
      console.log('3. Token might be for wrong environment (test vs production)');
    }
    
    console.log('\nDebug info:');
    console.log('- Customer ID:', process.env.GOOGLE_ADS_CUSTOMER_ID);
    console.log('- Developer Token:', process.env.GOOGLE_ADS_DEVELOPER_TOKEN?.substring(0, 10) + '...');
    console.log('- Client ID:', process.env.GOOGLE_ADS_CLIENT_ID?.substring(0, 20) + '...');
  }
}

testConnection();