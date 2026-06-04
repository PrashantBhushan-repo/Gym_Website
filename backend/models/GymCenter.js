import mongoose from 'mongoose';

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
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const GymCenter = mongoose.model('GymCenter', gymCenterSchema);
export default GymCenter;
