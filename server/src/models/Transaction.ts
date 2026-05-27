import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  amount: { type: Number, required: true },
  cost: { type: Number, default: 0 }, // The raw cost paid to provider
  profit: { type: Number, default: 0 },

  type: {
    type: String,
    enum: ['deposit', 'purchase', 'refund', 'admin_adjustment'],
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },

  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending'
  },

  product: {
    productId: String,
    name: String,
    category: String,
    recipient: String,
    quantity: { type: Number, default: 1 }
  },

  provider: {
    name: String,
    reference: String,
    apiResponse: Object
  },

  paymentReference: { type: String }, // Paystack/Flutterwave ref
  failReason: { type: String },
  deliveryError: { type: String },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

TransactionSchema.index({ tenantId: 1, userId: 1 });
TransactionSchema.index({ paymentReference: 1 });
TransactionSchema.index({ 'provider.reference': 1 });

export const Transaction = mongoose.model('Transaction', TransactionSchema);
