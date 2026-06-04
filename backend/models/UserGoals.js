import mongoose from 'mongoose';

const userGoalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fitnessGoals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness']
  }],
  dietaryPreferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'keto', 'low_carb', 'high_protein', 'gluten_free', 'dairy_free']
  }],
  activityLevel: {
    type: String,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
    default: 'moderately_active'
  },
  targetWeight: Number,
  currentWeight: Number,
  height: Number,
  age: Number,
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  medicalConditions: [String],
  allergies: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const UserGoals = mongoose.model('UserGoals', userGoalsSchema);

export default UserGoals;