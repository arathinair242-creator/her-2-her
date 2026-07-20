const mongoose = require('mongoose');
const User = require('./models/User');
const Expert = require('./models/Expert');
const dotenv = require('dotenv');

dotenv.config();

const resetPassword = async (email, newPassword) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check User collection
    let account = await User.findOne({ email });
    if (!account) {
      // Check Expert collection
      account = await Expert.findOne({ email });
    }

    if (!account) {
      console.error(`Account with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`Found account for ${email}. Updating password...`);
    account.password = newPassword;
    await account.save();

    console.log('Password updated and hashed successfully! ✅');
    process.exit(0);
  } catch (err) {
    console.error('Error resetting password:', err.message);
    process.exit(1);
  }
};

const email = process.argv[2] || 'arathinair242@gmail.com';
const password = process.argv[3] || 'Doreamon2006';

resetPassword(email, password);
