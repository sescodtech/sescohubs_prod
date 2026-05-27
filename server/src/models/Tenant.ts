import mongoose from 'mongoose';

const TenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // used for white-label domains
  logo: { type: String },
  primaryColor: { type: String, default: '#0284c7' },
  secondaryColor: { type: String, default: '#0f172a' },

  // Provider API keys for this specific tenant
  providerConfigs: {
    type: Map,
    of: String, // e.g., { 'jarapoint': 'api_key_123' }
    default: {}
  },

  // Markup settings for this tenant (category -> percentage)
  markupSettings: {
    type: Map,
    of: Number, // e.g., { 'data': 15, 'airtime': 5 }
    default: {}
  },

  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },

  businessBalance: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const Tenant = mongoose.model('Tenant', TenantSchema);
