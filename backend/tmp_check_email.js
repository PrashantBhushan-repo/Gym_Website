import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/gym_website';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: String,
  password: String,
  role: { type: String, enum: ['member', 'trainer', 'admin'], default: 'member' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function checkEmails() {
  await mongoose.connect(mongoURI, { dbName: 'gym_website' });
  const emails = ['fjeoji12345@gmail.com', 'prashfer13454@gmail.com', 'fjeoji12345@gmail.com'.toLowerCase()];
  for (const email of emails) {
    const user = await User.findOne({ email }).lean();
    console.log(email, user ? 'FOUND' : 'NOT FOUND');
  }
  const regexUsers = await User.find({ email: { $regex: 'fjeo', $options: 'i' } }).lean();
  console.log('regex users', regexUsers.map((u) => u.email));
  await mongoose.disconnect();
}

checkEmails().catch((err) => { console.error(err); process.exit(1); });
