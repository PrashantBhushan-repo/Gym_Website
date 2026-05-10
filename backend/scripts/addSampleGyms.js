import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/gym_website";

// Gym Center Schema (copied from server.js)
const gymCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  contactPerson: { type: String, required: true },
  collaborationTerms: { type: String, required: true },
  facilityDescription: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const GymCenter = mongoose.model('GymCenter', gymCenterSchema);

const addSampleGymCenters = async () => {
  try {
    await mongoose.connect(mongoURI, { dbName: 'gym_website' });
    console.log('Connected to MongoDB');

    const sampleGyms = [
      {
        name: "FitZone Main Center",
        address: "123 Main Street, Connaught Place",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110001",
        latitude: 28.6139,
        longitude: 77.2090,
        phone: "+91-9876543210",
        email: "main@fitzone.com",
        contactPerson: "Rajesh Kumar",
        collaborationTerms: "Standard partnership terms - 20% revenue share",
        facilityDescription: "Main gym center with full facilities including cardio, weights, yoga, and personal training"
      },
      {
        name: "FitZone South Delhi",
        address: "456 South Avenue, Saket",
        city: "New Delhi",
        state: "Delhi",
        postalCode: "110017",
        latitude: 28.5244,
        longitude: 77.2066,
        phone: "+91-9876543211",
        email: "south@fitzone.com",
        contactPerson: "Priya Sharma",
        collaborationTerms: "Standard partnership terms - 20% revenue share",
        facilityDescription: "Modern gym with state-of-the-art equipment and group fitness classes"
      },
      {
        name: "FitZone Gurgaon",
        address: "789 Golf Course Road, Sector 43",
        city: "Gurgaon",
        state: "Haryana",
        postalCode: "122002",
        latitude: 28.4595,
        longitude: 77.0266,
        phone: "+91-9876543212",
        email: "gurgaon@fitzone.com",
        contactPerson: "Amit Singh",
        collaborationTerms: "Standard partnership terms - 20% revenue share",
        facilityDescription: "Premium gym center with spa facilities and nutrition counseling"
      },
      {
        name: "FitZone Noida",
        address: "321 Sector 18, Noida",
        city: "Noida",
        state: "Uttar Pradesh",
        postalCode: "201301",
        latitude: 28.5355,
        longitude: 77.3910,
        phone: "+91-9876543213",
        email: "noida@fitzone.com",
        contactPerson: "Sneha Gupta",
        collaborationTerms: "Standard partnership terms - 20% revenue share",
        facilityDescription: "Family-friendly gym with childcare facilities and diverse class offerings"
      }
    ];

    for (const gym of sampleGyms) {
      const existingGym = await GymCenter.findOne({ email: gym.email });

      if (existingGym) {
        console.log(`Gym center ${gym.name} already exists. Skipping...`);
      } else {
        const newGym = new GymCenter(gym);
        await newGym.save();
        console.log(`✓ Added gym center: ${gym.name}`);
      }
    }

    console.log('\nSample gym centers setup complete!');
    console.log('You can now test the nearby gyms feature.');

  } catch (error) {
    console.error('Error adding sample gym centers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

addSampleGymCenters();