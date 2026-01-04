import mongoose from 'mongoose';

const BannerSchema = new mongoose.Schema({
  title: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    required: [true, 'Please provide a banner image'],
  },
  link: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  position: {
    type: String,
    enum: ['Homepage Hero', 'Homepage Banner', 'Featured Banner', 'Featured Collection', 'Category Banner', 'Sidebar'],
    default: 'Homepage Banner',
  },
}, { timestamps: true });

export default mongoose.models.Banner || mongoose.model('Banner', BannerSchema);

