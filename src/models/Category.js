import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Indexes for better query performance
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1 });
CategorySchema.index({ sortOrder: 1 });
CategorySchema.index({ status: 1, sortOrder: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
