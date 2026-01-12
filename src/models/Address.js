import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  mobile: {
    type: String,
    required: [true, 'Mobile number is required'],
    trim: true,
  },
  email: {
    type: String,
    trim: true,
  },
  streetAddress1: {
    type: String,
    required: [true, 'Street address is required'],
    trim: true,
  },
  streetAddress2: {
    type: String,
    trim: true,
    default: '',
  },
  country: {
    type: String,
    default: 'Bangladesh',
    trim: true,
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  zipCode: {
    type: String,
    required: [true, 'ZIP code is required'],
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  addressType: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home',
  },
  label: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
});

// Indexes
AddressSchema.index({ user: 1 });
AddressSchema.index({ user: 1, isDefault: 1 });

// Ensure only one default address per user
AddressSchema.pre('save', async function(next) {
  if (this.isDefault && this.isModified('isDefault')) {
    await mongoose.model('Address').updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
  next();
});

// Delete the model from cache if it exists
if (mongoose.models.Address) {
  delete mongoose.models.Address;
}

export default mongoose.models.Address || mongoose.model('Address', AddressSchema);
