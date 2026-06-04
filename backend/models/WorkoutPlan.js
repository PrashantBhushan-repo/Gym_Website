import mongoose from 'mongoose';

const workoutPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  targetGoals: [{
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility']
  }],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  duration: {
    type: Number, // in weeks
    default: 4
  },
  exercises: [{
    name: String,
    sets: Number,
    reps: String,
    restTime: Number, // in seconds
    notes: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WorkoutPlan = mongoose.model('WorkoutPlan', workoutPlanSchema);

export default WorkoutPlan;