require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Testing Cloudinary connection...');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✓ SET' : '✗ NOT SET');
console.log('');

// Test 1: Create a simple base64 image (1x1 pixel red PNG)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

console.log('Uploading test image to Cloudinary...');

cloudinary.uploader.upload(testImageBase64, {
  folder: 'test',
  public_id: 'test_image_' + Date.now()
})
.then(result => {
  console.log('\n✅ SUCCESS! Cloudinary is working perfectly!');
  console.log('');
  console.log('Upload Details:');
  console.log('  URL:', result.secure_url);
  console.log('  Public ID:', result.public_id);
  console.log('  Format:', result.format);
  console.log('  Size:', result.bytes, 'bytes');
  console.log('');
  console.log('🎉 You can now upload images and PDFs in your app!');
  console.log('');
  console.log('View your upload at:', result.secure_url);
})
.catch(error => {
  console.error('\n❌ ERROR! Cloudinary failed:');
  console.error('');
  console.error('Error message:', error.message);
  console.error('');
  console.error('Common fixes:');
  console.error('1. Check CLOUDINARY_CLOUD_NAME is correct:', process.env.CLOUDINARY_CLOUD_NAME);
  console.error('2. Check CLOUDINARY_API_KEY is correct:', process.env.CLOUDINARY_API_KEY);
  console.error('3. Check CLOUDINARY_API_SECRET is set');
  console.error('4. Verify credentials at: https://console.cloudinary.com/');
});