// Super simple setup using the google-ads-api package
const { GoogleAdsApi } = require('google-ads-api');
const readline = require('readline');

console.log('===========================================');
console.log('Google Ads API - Simple Setup');
console.log('===========================================\n');

console.log('Step 1: Create OAuth credentials in Google Cloud Console');
console.log('  - Go to: https://console.cloud.google.com');
console.log('  - APIs & Services → Credentials → Create OAuth Client ID');
console.log('  - Type: Web application');
console.log('  - Redirect URI: http://localhost:8080/callback\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your Client ID: ', (clientId) => {
  rl.question('Enter your Client Secret: ', (clientSecret) => {
    rl.question('Enter your Developer Token (from Google Ads API Center): ', (devToken) => {
      
      const client = new GoogleAdsApi({
        client_id: clientId,
        client_secret: clientSecret,
        developer_token: devToken,
      });

      // Ask if the server is running
      console.log('\nIs your operations server running? (yarn dev)');
      console.log('1. Yes - running on port 8080');
      console.log('2. No - use manual method');
      
      rl.question('\nEnter 1 or 2: ', (choice) => {
        const redirect_uri = choice === '1' 
          ? 'http://localhost:8080/api/google-ads/callback'
          : 'http://localhost';
        
        const authUrl = client.generateAuthenticationUrl({
          redirect_uri,
          scope: 'https://www.googleapis.com/auth/adwords',
          access_type: 'offline',
          prompt: 'consent'
        });

        console.log('\nStep 2: Authorize the application');
        console.log('Open this URL in your browser:\n');
        console.log(authUrl);
        
        if (choice === '1') {
          console.log('\nAfter authorizing, you\'ll see the refresh token on the page!');
          console.log('Just copy it and add to your .env file.');
          rl.close();
        } else {
          console.log('\nAfter authorizing, you\'ll be redirected to localhost');
          console.log('The page will fail to load (that\'s OK!)');
          console.log('Look at the URL bar - it will have: localhost?code=XXXXXX');
          console.log('Copy everything after "code=" and before any "&"');
          
          rl.question('\nEnter the authorization code from the URL: ', async (code) => {
        try {
          const tokens = await client.getRefreshTokenFromAuthCode(code);
          
          console.log('\n✅ Success! Add these to your .env file:\n');
          console.log(`GOOGLE_ADS_CLIENT_ID=${clientId}`);
          console.log(`GOOGLE_ADS_CLIENT_SECRET=${clientSecret}`);
          console.log(`GOOGLE_ADS_DEVELOPER_TOKEN=${devToken}`);
          console.log(`GOOGLE_ADS_REFRESH_TOKEN=${tokens.refresh_token}`);
          console.log(`GOOGLE_ADS_CUSTOMER_ID=YOUR-CUSTOMER-ID (from Google Ads account)`);
          
          console.log('\nThat\'s it! The google-ads-api package handles everything else.');
          
            } catch (error) {
              console.error('Error:', error.message);
            }
            rl.close();
          });
        }
      });
    });
  });
});