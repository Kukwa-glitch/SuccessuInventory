require('dotenv').config();
const mongoose = require('mongoose');

console.log('\n╔════════════════════════════════════════════╗');
console.log('║   SKU DUPLICATE FIX - Starting...          ║');
console.log('╚════════════════════════════════════════════╝\n');

const fixSKU = async () => {
  try {
    // Step 1: Connect
    console.log('⏳ Step 1/4: Connecting to MongoDB...');
    
    if (!process.env.MONGODB_URI) {
      throw new Error('❌ MONGODB_URI not found in .env file!');
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // Step 2: Check current indexes
    console.log('⏳ Step 2/4: Checking current indexes...');
    const db = mongoose.connection.db;
    const collection = db.collection('products');
    const indexes = await collection.indexes();
    
    console.log('   Current indexes:');
    indexes.forEach(idx => {
      const uniqueLabel = idx.unique ? '🔒 UNIQUE' : '🔓 Not Unique';
      console.log(`   - ${idx.name}: ${uniqueLabel}`);
    });
    console.log('');

    // Step 3: Drop unique index
    console.log('⏳ Step 3/4: Dropping unique SKU index...');
    try {
      await collection.dropIndex('sku_1');
      console.log('✅ Successfully dropped sku_1 index!\n');
    } catch (error) {
      if (error.message.includes('index not found')) {
        console.log('ℹ️  Index sku_1 not found (already dropped or never existed)\n');
      } else {
        throw error;
      }
    }

    // Step 4: Create non-unique index
    console.log('⏳ Step 4/4: Creating non-unique SKU index...');
    try {
      await collection.createIndex({ sku: 1 });
      console.log('✅ Created non-unique sku index!\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Non-unique index already exists\n');
      } else {
        throw error;
      }
    }

    // Show final result
    console.log('📊 Final indexes:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(idx => {
      const uniqueLabel = idx.unique ? '🔒 UNIQUE' : '🔓 Not Unique';
      console.log(`   - ${idx.name}: ${uniqueLabel}`);
    });

    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║   ✅ SUCCESS! Fix completed!               ║');
    console.log('║                                            ║');
    console.log('║   You can now:                             ║');
    console.log('║   - Create products with duplicate SKUs    ║');
    console.log('║   - Restart your backend server            ║');
    console.log('║   - Test creating products                 ║');
    console.log('╚════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('\n╔════════════════════════════════════════════╗');
    console.error('║   ❌ ERROR                                 ║');
    console.error('╚════════════════════════════════════════════╝\n');
    console.error('Error:', error.message);
    console.error('\nCommon fixes:');
    console.error('1. Check if MongoDB is running');
    console.error('2. Check MONGODB_URI in your .env file');
    console.error('3. Make sure you have database permissions\n');
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
};

// Run it!
fixSKU();