import mongoose from 'mongoose';

const ChildCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a child category name'],
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: [true, 'Please select a parent sub-category'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, { timestamps: true });

// Indexes for better query performance
ChildCategorySchema.index({ slug: 1 });
ChildCategorySchema.index({ subCategory: 1 });
ChildCategorySchema.index({ status: 1 });
ChildCategorySchema.index({ subCategory: 1, status: 1 });

export default mongoose.models.ChildCategory || mongoose.model('ChildCategory', ChildCategorySchema);
