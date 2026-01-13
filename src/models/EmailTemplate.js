import mongoose from 'mongoose';

const EmailTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  body: {
    type: String,
    required: true,
  },
  templateType: {
    type: String,
    enum: ['order-confirmation', 'order-shipped', 'order-delivered', 'password-reset', 'welcome', 'newsletter', 'promotional', 'custom'],
    required: true,
  },
  variables: [{
    type: String,
    trim: true,
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, {
  timestamps: true,
});

// Indexes
EmailTemplateSchema.index({ templateType: 1 });
EmailTemplateSchema.index({ status: 1 });

// Prevent model overwrite during hot-reload
if (mongoose.models.EmailTemplate) {
  delete mongoose.models.EmailTemplate;
}

const EmailTemplate = mongoose.models.EmailTemplate || mongoose.model('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
