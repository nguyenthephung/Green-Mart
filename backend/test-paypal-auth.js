require('dotenv').config();
const axios = require('axios');

async function testPayPalCredentials() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  console.log('=== Testing PayPal Credentials ===');
  console.log('Client ID:', clientId ? clientId.slice(0, 20) + '...' : 'MISSING');
  console.log('Client Secret:', clientSecret ? clientSecret.slice(0, 20) + '...' : 'MISSING');
  
  if (!clientId || !clientSecret) {
    console.log('❌ Missing credentials');
    return;
  }
  
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  try {
    console.log('Testing PayPal API...');
    const response = await axios.post(
      'https://api.sandbox.paypal.com/v1/oauth2/token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    console.log('✅ PayPal API Success!');
    console.log('Access token received:', response.data.access_token ? 'YES' : 'NO');
    console.log('Token type:', response.data.token_type);
    console.log('Expires in:', response.data.expires_in, 'seconds');
    
  } catch (error) {
    console.log('❌ PayPal API Error:');
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    } else {
      console.log('Error message:', error.message);
    }
  }
}

testPayPalCredentials();
