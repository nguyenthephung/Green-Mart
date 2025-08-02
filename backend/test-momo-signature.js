const crypto = require('crypto');

// Test MoMo signature calculation using exact data from the LATEST error message
const config = {
  partnerCode: 'MOMOIQA420180417',
  accessKey: 'SvDmj2cOTYZmQQ3H',
  secretKey: 'PPuDXq1KowPT1ftR8DvlQTHhC03aul17'
};

// Exact data from LATEST MoMo error message
const testData = {
  amount: 2222212,
  extraData: '',
  ipnUrl: 'https://developers.momo.vn/notify',
  orderId: '688d767224ba91ef38575f68',
  orderInfo: 'GreenMart Order 688d767224ba91ef38575f68',
  redirectUrl: 'https://developers.momo.vn/return',
  requestId: '688d767224ba91ef38575f68-1754101362697',
  requestType: 'captureWallet'
};

// Create signature exactly as MoMo expects (from their latest error message)
const expectedRawSignature = `accessKey=${config.accessKey}&amount=${testData.amount}&extraData=${testData.extraData}&ipnUrl=${testData.ipnUrl}&orderId=${testData.orderId}&orderInfo=${testData.orderInfo}&partnerCode=${config.partnerCode}&redirectUrl=${testData.redirectUrl}&requestId=${testData.requestId}&requestType=${testData.requestType}`;

console.log('=== MoMo Signature Test (LATEST) ===');
console.log('Expected raw signature:', expectedRawSignature);

// Test all possible signature calculations
const signatures = [
  { method: 'basic', value: crypto.createHmac('sha256', config.secretKey).update(expectedRawSignature).digest('hex') },
  { method: 'utf8', value: crypto.createHmac('sha256', config.secretKey).update(expectedRawSignature, 'utf8').digest('hex') },
  { method: 'ascii', value: crypto.createHmac('sha256', config.secretKey).update(expectedRawSignature, 'ascii').digest('hex') },
  { method: 'buffer', value: crypto.createHmac('sha256', Buffer.from(config.secretKey, 'utf8')).update(Buffer.from(expectedRawSignature, 'utf8')).digest('hex') }
];

signatures.forEach(sig => {
  console.log(`Signature ${sig.method}:`, sig.value);
});

console.log('\n=== Environment Test ===');
// Load environment variables like the actual service does
require('dotenv').config();

const envConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  redirectUrl: process.env.MOMO_REDIRECT_URL,
  ipnUrl: process.env.MOMO_IPN_URL
};

console.log('Environment values:');
console.log('Partner Code:', envConfig.partnerCode);
console.log('Access Key:', envConfig.accessKey);
console.log('Secret Key Length:', envConfig.secretKey?.length);
console.log('Redirect URL:', envConfig.redirectUrl);
console.log('IPN URL:', envConfig.ipnUrl);

// Create signature using environment values
const envRawSignature = `accessKey=${envConfig.accessKey}&amount=${testData.amount}&extraData=${testData.extraData}&ipnUrl=${envConfig.ipnUrl}&orderId=${testData.orderId}&orderInfo=${testData.orderInfo}&partnerCode=${envConfig.partnerCode}&redirectUrl=${envConfig.redirectUrl}&requestId=${testData.requestId}&requestType=${testData.requestType}`;

const envSignature = crypto.createHmac('sha256', envConfig.secretKey).update(envRawSignature).digest('hex');

console.log('\nEnvironment-based signature calculation:');
console.log('Raw signature:', envRawSignature);
console.log('Signature:', envSignature);
