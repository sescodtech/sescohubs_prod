import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },

  role: {
    type: String,
    enum: ['super_admin', 'tenant_admin', 'customer'],
    required: true,
    default: 'customer'
  },

  // Link to the tenant (White-label owner)
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: function() {
      return (this as any).role !== 'super_admin';
    }
  },

  walletBalance: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },

  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
