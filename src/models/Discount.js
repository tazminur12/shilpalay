import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Discount name is required'],
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  discountType: {
    type: String,
    enum: ['percent', 'fixed'],
    default: 'percent',
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: 0,
  },
  applyTo: {
    type: String,
    enum: ['all', 'category', 'product'],
    default: 'all',
  },
  categoryIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  enabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
DiscountSchema.index({ enabled: 1 });
DiscountSchema.index({ startDate: 1, endDate: 1 });
DiscountSchema.index({ applyTo: 1 });

// Delete the model from cache if it exists
if (mongoose.models.Discount) {
  delete mongoose.models.Discount;
}

export default mongoose.models.Discount || mongoose.model('Discount', DiscountSchema);
