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
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
