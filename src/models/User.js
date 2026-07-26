import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  mobile: {
    type: String,
    required: [true, 'Please provide a mobile number'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  dateOfBirth: {
    type: Date,
  },
  role: {
    type: String,
    default: 'customer',
    trim: true,
    lowercase: true,
  },
}, { timestamps: true });

// Indexes for better performance
UserSchema.index({ role: 1 });
UserSchema.index({ email: 1, role: 1 });

if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model('User', UserSchema);
