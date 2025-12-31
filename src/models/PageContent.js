import mongoose from 'mongoose';

const PageContentSchema = new mongoose.Schema({
  // Category reference - null for homepage
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
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
  
  // Page Type: 'home' or 'category'
  pageType: {
    type: String,
    enum: ['home', 'category'],
    default: 'category',
    required: true,
  },
  
  // Hero Section
  hero: {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    image: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '#' },
    enabled: { type: Boolean, default: true },
  },
  
  // Category Grid Section (Shop by Category)
  categoryGrid: {
    title: { type: String, default: 'SHOP BY CATEGORY' },
    enabled: { type: Boolean, default: true },
    // Categories will be fetched based on the page category
  },
  
  // Featured Collections (2 grid items)
  featuredCollections: {
    title: { type: String, default: 'FEATURED COLLECTIONS' },
    enabled: { type: Boolean, default: true },
    items: [{
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      image: { type: String, default: '' },
      buttonText: { type: String, default: 'Shop Now' },
      buttonLink: { type: String, default: '#' },
    }],
  },
  
  // Recommended/Whats New Section
  recommended: {
    title: { type: String, default: 'RECOMMENDED FOR YOU' },
    enabled: { type: Boolean, default: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Will be implemented when Product model exists
  },
  
  // Trending Section
  trending: {
    title: { type: String, default: 'TRENDING' },
    enabled: { type: Boolean, default: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Will be implemented when Product model exists
  },
  
  // Promotional Banner Section
  promoBanner: {
    title: { type: String, default: '' },
    image: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    buttonLink: { type: String, default: '#' },
    enabled: { type: Boolean, default: false },
  },
  
  // Two Column Banner Section (e.g., Jewellery highlight)
  twoColumnBanners: {
    enabled: { type: Boolean, default: true },
    items: [{
      title: { type: String, default: '' },
      subtitle: { type: String, default: '' },
      image: { type: String, default: '' },
      buttonText: { type: String, default: 'Shop Now' },
      buttonLink: { type: String, default: '#' },
    }],
  },
  
  // Newsletter Section
  newsletter: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'STAY TUNED' },
    description: { type: String, default: "Don't miss the opportunity to get daily updates on all that's new at Shilpalay." },
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, { timestamps: true });

// Index for faster queries
PageContentSchema.index({ category: 1 });
PageContentSchema.index({ subCategory: 1 });
PageContentSchema.index({ childCategory: 1 });
PageContentSchema.index({ pageType: 1 });

export default mongoose.models.PageContent || mongoose.model('PageContent', PageContentSchema);

