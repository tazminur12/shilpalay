import mongoose from 'mongoose';

const PromotionalSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: 'Shop Now',
  },
  buttonLink: {
    type: String,
    default: '#',
  },
  sectionType: {
    type: String,
    enum: ['banner', 'two-column', 'full-width', 'sidebar'],
    default: 'banner',
  },
  position: {
    type: String,
    enum: ['homepage', 'category', 'product', 'cart', 'checkout', 'global'],
    default: 'homepage',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
PromotionalSectionSchema.index({ position: 1, status: 1 });
PromotionalSectionSchema.index({ category: 1 });
PromotionalSectionSchema.index({ startDate: 1, endDate: 1 });

// Prevent model overwrite during hot-reload
if (mongoose.models.PromotionalSection) {
  delete mongoose.models.PromotionalSection;
}

const PromotionalSection = mongoose.models.PromotionalSection || mongoose.model('PromotionalSection', PromotionalSectionSchema);

export default PromotionalSection;
