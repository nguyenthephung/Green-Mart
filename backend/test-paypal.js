// Test PayPal Configuration
const path = require('path');

// Load environment variables first
require('dotenv').config();

async function testPayPalConfig() {
  try {
    console.log('Testing PayPal Configuration...');
    console.log('Current directory:', __dirname);
    
    // Dynamic import since this is a TypeScript project
    const { PayPalService } = await import('./dist/services/paypalService.js');
    
    // Initialize PayPal service
    const paypalService = new PayPalService();
    
    console.log('PayPal Service initialized successfully!');
    console.log('Environment variables check:');
    console.log('- PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID ? `${process.env.PAYPAL_CLIENT_ID.slice(0, 10)}...` : 'Missing');
    console.log('- PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? `${process.env.PAYPAL_CLIENT_SECRET.slice(0, 10)}...` : 'Missing');
    console.log('- PAYPAL_MODE:', process.env.PAYPAL_MODE || 'Not set (defaults to sandbox)');
    
    // Try to get access token
    console.log('\nTesting PayPal API connection...');
    const testOrder = {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: '1.00'
        },
        description: 'Test order for PayPal configuration'
      }]
    };
    
    const result = await paypalService.createOrder(testOrder);
    console.log('✅ PayPal API test successful!');
    console.log('- Order ID:', result.id);
    console.log('- Order Status:', result.status);
    
  } catch (error) {
    console.error('❌ PayPal configuration test failed:');
    console.error(error.message);
    
    if (error.message.includes('credentials')) {
      console.log('\n💡 Solution: Check your .env file has the correct PayPal credentials');
    } else if (error.message.includes('Cannot find module')) {
      console.log('\n💡 Solution: Build the TypeScript project first with: npm run build');
    }
  }
}

// Run test
testPayPalConfig();
