import mongoose from 'mongoose';

const SMSTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    maxlength: 160, // Standard SMS character limit
  },
  templateType: {
    type: String,
    enum: ['order-confirmation', 'order-shipped', 'order-delivered', 'otp', 'promotional', 'custom'],
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
SMSTemplateSchema.index({ templateType: 1 });
SMSTemplateSchema.index({ status: 1 });

// Prevent model overwrite during hot-reload
if (mongoose.models.SMSTemplate) {
  delete mongoose.models.SMSTemplate;
}

const SMSTemplate = mongoose.models.SMSTemplate || mongoose.model('SMSTemplate', SMSTemplateSchema);

export default SMSTemplate;
