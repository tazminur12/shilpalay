import mongoose from 'mongoose';

const StaticPageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  pageType: {
    type: String,
    enum: ['about', 'privacy', 'terms', 'shipping', 'returns', 'faq', 'contact', 'other'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  metaTitle: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
StaticPageSchema.index({ slug: 1 });
StaticPageSchema.index({ pageType: 1 });
StaticPageSchema.index({ status: 1 });
StaticPageSchema.index({ status: 1, pageType: 1 });

// Prevent model overwrite during hot-reload
if (mongoose.models.StaticPage) {
  delete mongoose.models.StaticPage;
}

const StaticPage = mongoose.models.StaticPage || mongoose.model('StaticPage', StaticPageSchema);

export default StaticPage;
