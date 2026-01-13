import mongoose from 'mongoose';

const CustomerMessageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: '',
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'resolved', 'archived'],
    default: 'new',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  category: {
    type: String,
    enum: ['general', 'order', 'product', 'payment', 'shipping', 'return', 'technical', 'other'],
    default: 'general',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  replies: [{
    message: { type: String, required: true },
    repliedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    repliedAt: { type: Date, default: Date.now },
  }],
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
}, {
  timestamps: true,
});

// Indexes
CustomerMessageSchema.index({ status: 1, createdAt: -1 });
CustomerMessageSchema.index({ email: 1 });
CustomerMessageSchema.index({ category: 1 });

// Prevent model overwrite during hot-reload
if (mongoose.models.CustomerMessage) {
  delete mongoose.models.CustomerMessage;
}

const CustomerMessage = mongoose.models.CustomerMessage || mongoose.model('CustomerMessage', CustomerMessageSchema);

export default CustomerMessage;
