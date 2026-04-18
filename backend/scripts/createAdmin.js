require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌  MONGO_URI not set in .env');
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  password:    { type: String, required: true },
  role:        { type: String, default: 'admin' },
  isActive:    { type: Boolean, default: true },
  permissions: { type: [String], default: [] },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));

async function main() {
  // ── defaults ──────────────────────────────────────────────────
  const DEFAULT_NAME     = 'Admin';
  const DEFAULT_EMAIL    = 'admin@ballandboujee.com';
  const DEFAULT_PASSWORD = 'Admin@BnB2025!';

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   Ball & Boujee — Create Admin       ║');
  console.log('╚══════════════════════════════════════╝\n');
  console.log('Press Enter to accept defaults shown in [brackets].\n');

  const name     = (await ask(`Name     [${DEFAULT_NAME}]: `)).trim()     || DEFAULT_NAME;
  const email    = (await ask(`Email    [${DEFAULT_EMAIL}]: `)).trim()    || DEFAULT_EMAIL;
  const password = (await ask(`Password [${DEFAULT_PASSWORD}]: `)).trim() || DEFAULT_PASSWORD;
  rl.close();

  console.log('\nConnecting to MongoDB…');
  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 15000,
  });
  console.log('✓  Connected');

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`\n✓  Existing user promoted to admin: ${email}`);
    } else {
      console.log(`\n⚠  Admin already exists: ${email}`);
    }
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({ name, email, password: hashed, role: 'admin' });

  console.log('\n✅  Admin created successfully!');
  console.log('─────────────────────────────');
  console.log(`   Name    : ${name}`);
  console.log(`   Email   : ${email}`);
  console.log(`   Password: ${password}`);
  console.log('─────────────────────────────');
  console.log('Login at: http://localhost:7003/login\n');

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\n❌ ', err.message);
  process.exit(1);
});
