import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  slug: { type: String },
  price: {
    regularPrice: { type: Number, required: true },
    salePrice: { type: Number, default: null },
  },
  quantity: { type: Number, required: true, min: 1 },
  selectedVariation: {
    color: String,
    size: String,
    material: String,
  },
  images: {
    thumbnail: String,
  },
}, { _id: true });

const ShippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String },
  streetAddress1: { type: String, required: true },
  streetAddress2: { type: String },
  country: { type: String, default: 'Bangladesh' },
  district: { type: String, required: true },
  city: { type: String, required: true },
  zipCode: { type: String, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  items: [OrderItemSchema],
  shippingAddress: {
    type: ShippingAddressSchema,
    required: true,
  },
  billingAddress: {
    type: ShippingAddressSchema,
    default: null,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0,
  },
  vat: {
    type: Number,
    default: 0,
    min: 0,
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingMethod: {
    type: String,
    default: 'standard',
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bkash', 'cod'],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending',
  },
  returnType: {
    type: String,
    enum: ['return', 'exchange'],
    default: null,
  },
  returnStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: null,
  },
  deliveryInstructions: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Indexes
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customer: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

// Delete the model from cache if it exists
if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
