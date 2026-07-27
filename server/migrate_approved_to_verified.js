/**
 * One-time migration: Normalize all Approved experts to Verified in the DB.
 * Run this once, then it can be deleted.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const ExpertSchema = new mongoose.Schema({ name: String, email: String, status: String });
const Expert = mongoose.model('Expert', ExpertSchema);

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await Expert.updateMany(
    { status: { $in: ['Approved', 'approved'] } },
    { $set: { status: 'Verified' } }
  );
  console.log(`Migration complete. Updated ${result.modifiedCount} expert(s) from "Approved" -> "Verified".`);

  const updated = await Expert.find({});
  console.log('Current expert statuses:');
  updated.forEach(e => console.log(`  ${e.name}: ${e.status}`));

  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
