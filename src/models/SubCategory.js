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
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

SubCategorySchema.index({ category: 1 });
SubCategorySchema.index({ status: 1 });
SubCategorySchema.index({ sortOrder: 1 });
SubCategorySchema.index({ category: 1, status: 1 });
SubCategorySchema.index({ category: 1, sortOrder: 1 });

if (mongoose.models.SubCategory) {
  delete mongoose.models.SubCategory;
}

export default mongoose.model('SubCategory', SubCategorySchema);
