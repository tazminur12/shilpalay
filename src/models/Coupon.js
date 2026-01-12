import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
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
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
    min: 0,
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1,
  },
  usageLimitPerUser: {
    type: Number,
    default: 1,
    min: 1,
  },
  usedCount: {
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
CouponSchema.index({ code: 1 });
CouponSchema.index({ enabled: 1 });
CouponSchema.index({ startDate: 1, endDate: 1 });

// Delete the model from cache if it exists
if (mongoose.models.Coupon) {
  delete mongoose.models.Coupon;
}

export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
