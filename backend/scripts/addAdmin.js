import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/gym_website";

// User Schema
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: false, unique: true, sparse: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  picture: { type: String },
  password: { type: String, required: false },
  role: { type: String, enum: ['member', 'trainer', 'admin'], default: 'member' },
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const addAdminUsers = async () => {
  try {
    await mongoose.connect(mongoURI, { dbName: 'gym_website' });
    console.log('Connected to MongoDB');

    const adminEmails = [
      'prashant.bhushan.tech@gmail.com',
      'prashant189041830@gmail.com'
    ];
    const password = '130036';

    for (const email of adminEmails) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        console.log(`User ${email} already exists. Updating to admin...`);
        existingUser.role = 'admin';
        existingUser.isVerified = true;
        if (password) {
          existingUser.password = await bcrypt.hash(password, 10);
        }
        await existingUser.save();
        console.log(`✓ Updated ${email} to admin`);
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new User({
          displayName: email.split('@')[0],
          email,
          password: hashedPassword,
          role: 'admin',
          isVerified: true
        });
        await newAdmin.save();
        console.log(`✓ Created admin user: ${email}`);
      }
    }

    console.log('\nAdmin users setup complete!');
    console.log('Email: prashant.bhushan.tech@gmail.com');
    console.log('Email: prashant189041830@gmail.com');
    console.log('Password: 130036');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

addAdminUsers();