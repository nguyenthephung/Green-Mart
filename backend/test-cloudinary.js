const { v2: cloudinary } = require('cloudinary');
require('dotenv').config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvbo6qxz4',
  api_key: process.env.CLOUDINARY_API_KEY || '714992923528963',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'GSdZB_HkxoiBP8CZ1zdrXHc5LeA',
});

async function testCloudinary() {
  try {
    console.log('🔧 Testing Cloudinary configuration...');
    console.log('Cloud name:', process.env.CLOUDINARY_CLOUD_NAME || 'dvbo6qxz4');
    console.log('API Key:', process.env.CLOUDINARY_API_KEY || '714992923528963');
    
    // Test bằng cách upload một ảnh base64 nhỏ
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('📤 Uploading test image...');
    const result = await cloudinary.uploader.upload(testImageBase64, {
      folder: 'greenmart/test',
      public_id: 'test_image_' + Date.now()
    });
    
    console.log('✅ Upload successful!');
    console.log('🔗 Image URL:', result.secure_url);
    console.log('📁 Public ID:', result.public_id);
    
    // Test xóa ảnh
    console.log('🗑️  Deleting test image...');
    await cloudinary.uploader.destroy(result.public_id);
    console.log('✅ Delete successful!');
    
    console.log('\n🎉 Cloudinary configuration is working correctly!');
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.message);
    console.error('Full error:', error);
  }
}

testCloudinary();
