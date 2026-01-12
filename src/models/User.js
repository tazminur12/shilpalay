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
    enum: [
      'super_admin',
      'admin',
      'vendor',
      'inventory_manager',
      'order_staff',
      'delivery',
      'accounts',
      'customer_support',
      'qc',
      'marketing_manager',
      'customer'
    ],
    default: 'customer',
  },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);
