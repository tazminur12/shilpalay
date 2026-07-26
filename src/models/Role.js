import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a role name'],
      trim: true,
      maxlength: 80,
    },
    key: {
      type: String,
      required: [true, 'Please provide a role key'],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 40,
      match: [/^[a-z0-9_]+$/, 'Role key may only contain lowercase letters, numbers, and underscores'],
    },
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

RoleSchema.index({ status: 1 });
RoleSchema.index({ key: 1 });

if (mongoose.models.Role) {
  delete mongoose.models.Role;
}

export default mongoose.model('Role', RoleSchema);
