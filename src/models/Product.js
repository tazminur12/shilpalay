import mongoose from 'mongoose';

const VariationSchema = new mongoose.Schema({
  color: { type: String, required: false },
  colorCode: { type: String, default: '' },
  size: { type: String, required: false },
  material: { type: String, default: '' },
  stock: { type: Number, required: false, default: 0 },
  priceOverride: { type: Number, default: null },
  sku: { type: String, required: false },
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    default: null,
  },
  childCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChildCategory',
    default: null,
  },
  collection: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: 'Own Brand',
  },
  price: {
    regularPrice: {
      type: Number,
      required: [true, 'Regular price is required'],
      min: 0,
    },
    salePrice: {
      type: Number,
      default: null,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ['flat', 'percent'],
      default: 'percent',
    },
  },
  variations: [VariationSchema],
  inventory: {
    totalStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    lowStockAlert: {
      type: Number,
      default: 10,
      min: 0,
    },
    availability: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'preorder'],
      default: 'in_stock',
    },
  },
  images: {
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail image is required'],
    },
    gallery: [{
      type: String,
    }],
    video: {
      type: String,
      default: '',
    },
  },
  description: {
    shortDescription: {
      type: String,
      default: '',
    },
    fullDescription: {
      type: String,
      default: '',
    },
    fabric: {
      type: String,
      default: '',
    },
    workType: {
      type: String,
      default: '',
    },
    fit: {
      type: String,
      default: '',
    },
    washCare: {
      type: String,
      default: '',
    },
    origin: {
      type: String,
      default: '',
    },
  },
  shipping: {
    weight: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingClass: {
      type: String,
      default: 'standard',
    },
    estimatedDelivery: {
      type: Number,
      default: 7,
      min: 1,
    },
  },
  seo: {
    metaTitle: {
      type: String,
      default: '',
    },
    metaDescription: {
      type: String,
      default: '',
    },
    keywords: [{
      type: String,
    }],
  },
  tags: [{
    type: String,
    enum: ['Eid', 'New', 'Limited Edition', 'Sale', 'Featured'],
  }],
      flags: {
        featured: {
          type: Boolean,
          default: false,
        },
        showOnHomepage: {
          type: Boolean,
          default: false,
        },
        trending: {
          type: Boolean,
          default: false,
        },
        recommended: {
          type: Boolean,
          default: false,
        },
        whatsNew: {
          type: Boolean,
          default: false,
        },
      },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
}, {
  timestamps: true,
  strictPopulate: false,
  suppressReservedKeysWarning: true,
});

// Index for better query performance
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });

// Delete the model from cache if it exists to force recompilation
if (mongoose.models.Product) {
  delete mongoose.models.Product;
}

export default mongoose.model('Product', ProductSchema);
