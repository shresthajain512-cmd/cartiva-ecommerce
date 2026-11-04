/**
 * Verification script: Checks that passwords in MongoDB are properly hashed
 * WITHOUT displaying or printing any actual password values or hash strings.
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: __dirname + '/.env' });

const User = require('./models/User');

const verifyPasswordHashing = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cartiva');
    console.log('\n======================================================');
    console.log('🔒 MONGODB PASSWORD HASH VERIFICATION');
    console.log('======================================================\n');

    // Query users and explicitly include password field for inspection
    const users = await User.find({ email: { $in: ['alice@example.com', 'bob@example.com'] } }).select('+password');

    for (const u of users) {
      const isPlaintext = u.password === 'SecurePassword123';
      const isBcrypt = typeof u.password === 'string' && u.password.startsWith('$2') && u.password.length === 60;

      console.log(`User: ${u.email}`);
      console.log(`- Role: ${u.role}`);
      console.log(`- Password field exists: ${Boolean(u.password)}`);
      console.log(`- Is stored as plain text: ${isPlaintext ? 'YES (UNSAFE ❌)' : 'NO (SAFE ✅)'}`);
      console.log(`- Is valid salted bcrypt hash: ${isBcrypt ? 'YES (Bcrypt 60-char format ✅)' : 'NO ❌'}`);
      console.log('------------------------------------------------------');
    }

    await mongoose.disconnect();
    console.log('✅ Verification completed securely.\n');
  } catch (err) {
    console.error('Error during verification:', err.message);
  }
};

verifyPasswordHashing();
