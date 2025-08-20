// Simplified setup for google-ads-api package
const { GoogleAdsApi } = require('google-ads-api');
const readline = require('readline');

console.log('===========================================');
console.log('Google Ads API - Simple Setup');
console.log('===========================================\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your Client ID: ', (clientId) => {
  rl.question('Enter your Client Secret: ', (clientSecret) => {
    rl.question('Enter your Developer Token: ', (devToken) => {
      
      // Create the OAuth URL manually (since the package method isn't working)
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: 'http://localhost',
        scope: 'https://www.googleapis.com/auth/adwords',
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
      });
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      
      console.log('\n==================================================');
      console.log('Step 1: Open this URL in your browser:\n');
      console.log(authUrl);
      console.log('\n==================================================');
      console.log('\nStep 2: After authorizing, you\'ll be redirected to localhost');
      console.log('The page will fail to load (that\'s OK!)');
      console.log('\nStep 3: Look at the URL bar - it will contain:');
      console.log('http://localhost/?code=XXXXXXXXX&scope=...');
      console.log('\nCopy ONLY the code value (between code= and &)');
      console.log('==================================================\n');
      
      rl.question('Paste the authorization code here: ', async (code) => {
        try {
          // Exchange code for tokens using the Google OAuth endpoint directly
          const tokenUrl = 'https://oauth2.googleapis.com/token';
          const tokenParams = new URLSearchParams({
            code: code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: 'http://localhost',
            grant_type: 'authorization_code'
          });
          
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: tokenParams.toString()
          });
          
          const tokens = await response.json();
          
          if (tokens.refresh_token) {
            console.log('\n✅ Success! Add these to your .env file:\n');
            console.log('# Google Ads API Configuration');
            console.log(`GOOGLE_ADS_CLIENT_ID=${clientId}`);
            console.log(`GOOGLE_ADS_CLIENT_SECRET=${clientSecret}`);
            console.log(`GOOGLE_ADS_DEVELOPER_TOKEN=${devToken}`);
            console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log(`\n# Add your Google Ads Customer ID (from Google Ads account, no dashes):`);
            console.log(`GOOGLE_ADS_CUSTOMER_ID=YOUR-CUSTOMER-ID-HERE`);
            console.log('\n==================================================');
            console.log('Next steps:');
            console.log('1. Add these to your .env file');
            console.log('2. Get your Customer ID from Google Ads (top right)');
            console.log('3. Run: node test-google-ads.js');
            console.log('==================================================');
          } else if (tokens.error) {
            console.error('\n❌ Error:', tokens.error);
            console.error('Description:', tokens.error_description);
            console.log('\nCommon issues:');
            console.log('- Make sure the code is copied correctly');
            console.log('- The code expires quickly, try again if needed');
            console.log('- Check that redirect URI matches exactly: http://localhost');
          } else {
            console.error('\n❌ Unexpected response:', tokens);
          }
          
        } catch (error) {
          console.error('\n❌ Error:', error.message);
          console.log('\nMake sure you have node-fetch installed:');
          console.log('npm install node-fetch');
        }
        rl.close();
      });
    });
  });
});