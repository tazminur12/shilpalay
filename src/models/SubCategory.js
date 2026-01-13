import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a sub-category name'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a parent category'],
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
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
}, { timestamps: true });

// Indexes for better query performance
SubCategorySchema.index({ slug: 1 });
SubCategorySchema.index({ category: 1 });
SubCategorySchema.index({ status: 1 });
SubCategorySchema.index({ category: 1, status: 1 });

export default mongoose.models.SubCategory || mongoose.model('SubCategory', SubCategorySchema);
