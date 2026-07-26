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
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

ChildCategorySchema.index({ subCategory: 1 });
ChildCategorySchema.index({ status: 1 });
ChildCategorySchema.index({ sortOrder: 1 });
ChildCategorySchema.index({ subCategory: 1, status: 1 });
ChildCategorySchema.index({ subCategory: 1, sortOrder: 1 });

if (mongoose.models.ChildCategory) {
  delete mongoose.models.ChildCategory;
}

export default mongoose.model('ChildCategory', ChildCategorySchema);
