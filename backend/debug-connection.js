// Debug script para probar conexión MongoDB
const mongoose = require('mongoose');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/control-financiero';

console.log('🔍 Testing MongoDB Connection...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI (first 30 chars):', mongoUri.substring(0, 30) + '...');
console.log('All environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('MONGO') || key.includes('DATABASE')) {
    console.log(`${key}: ${process.env[key]?.substring(0, 20)}...`);
  }
});

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 10000,
})
.then(() => {
  console.log('✅ MongoDB Connected Successfully!');
  process.exit(0);
})
.catch(err => {
  console.error('❌ MongoDB Connection Error:', err.message);
  process.exit(1);
});
