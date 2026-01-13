import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
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
  excerpt: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    required: true,
  },
  featuredImage: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    default: 'Admin',
  },
  category: {
    type: String,
    enum: ['fashion', 'lifestyle', 'tips', 'news', 'stories', 'other'],
    default: 'stories',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  metaTitle: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    default: '',
  },
  publishedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
BlogSchema.index({ slug: 1 });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1 });
BlogSchema.index({ featured: 1 });
BlogSchema.index({ tags: 1 });

// Prevent model overwrite during hot-reload
if (mongoose.models.Blog) {
  delete mongoose.models.Blog;
}

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

export default Blog;
