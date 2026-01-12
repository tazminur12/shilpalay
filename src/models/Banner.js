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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
}, { 
  timestamps: true,
  strictPopulate: false 
});

// Delete the model from cache if it exists to force recompilation
if (mongoose.models.Banner) {
  delete mongoose.models.Banner;
}

export default mongoose.model('Banner', BannerSchema);

