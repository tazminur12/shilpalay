import mongoose from 'mongoose';

const FlashSaleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Flash sale name is required'],
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
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  startTime: {
    type: String,
    default: '00:00',
  },
  endTime: {
    type: String,
    default: '23:59',
  },
  enabled: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes
FlashSaleSchema.index({ enabled: 1 });
FlashSaleSchema.index({ startDate: 1, endDate: 1 });

// Delete the model from cache if it exists
if (mongoose.models.FlashSale) {
  delete mongoose.models.FlashSale;
}

export default mongoose.models.FlashSale || mongoose.model('FlashSale', FlashSaleSchema);
