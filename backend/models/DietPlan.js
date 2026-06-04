import mongoose from 'mongoose';

const dietPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  targetGoals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'health']
  }],
  dietaryType: {
    type: String,
    enum: ['balanced', 'keto', 'vegetarian', 'vegan', 'low_carb', 'high_protein'],
    default: 'balanced'
  },
  calories: Number,
  macronutrients: {
    protein: Number, // percentage
    carbs: Number,   // percentage
    fat: Number      // percentage
  },
  meals: [{
    name: String,
    time: String,
    foods: [{
      name: String,
      quantity: String,
      calories: Number
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

export default DietPlan;