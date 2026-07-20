const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function testMongo() {
  try {
    const OLD_URI = 'mongodb+srv://arathinair242_db_user:Doreamon2006@cluster0.swi9txf.mongodb.net/her2her?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Connecting to OLD URI...');
    await mongoose.connect(OLD_URI);
    console.log('Connected successfully!');

    // Test Write
    const TestSchema = new mongoose.Schema({ name: String });
    const TestModel = mongoose.model('ConnectionTest', TestSchema);
    const testDoc = new TestModel({ name: 'Connection Audit ' + new Date().toISOString() });
    await testDoc.save();
    console.log('Write Test: SUCCESS');

    // Test Read
    const readDoc = await TestModel.findOne({ name: testDoc.name });
    if (readDoc) console.log('Read Test: SUCCESS');

    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('Cleanup: SUCCESS');
    
    process.exit(0);
  } catch (err) {
    console.error('Test FAILED:', err);
    process.exit(1);
  }
}

testMongo();
