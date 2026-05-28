import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { paymentService } from '../services/PaymentService';
import { ProductService } from '../services/ProductService';
import { Transaction } from '../models/Transaction';
import crypto from 'crypto';

export class PaymentController {
  static async initiate(req: Request, res: Response) {
    try {
      const { productId, recipient, quantity = 1, customerEmail, userId } = req.body;
      if (!productId || !recipient || !customerEmail) {
        return res.status(400).json({ success: false, error: 'productId, recipient and customerEmail required' });
      }

      // Use ProductService to get the correct selling price
      // Since we don't have a tenantId in this simple route, we use a default tenant for now
      // In a real multi-tenant app, the tenantId would come from the session or request
      const tenantId = 'default';
      const catalog = await ProductService.getCatalog(tenantId);
      const product = catalog.find(p => p.id === productId);

      if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

      const amount = product.sellingPrice * quantity;
      const reference = `DH-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

      // Store pending transaction in DB
      const txn = new Transaction({
        ref: reference,
        productId,
        productName: product.name,
        category: product.category,
        recipient,
        quantity,
        customerEmail,
        userId: userId || null,
        amount,
        status: 'pending',
        createdAt: new Date()
      });
      await txn.save();

      const result = await paymentService.initializePayment('paystack', {
        email: customerEmail,
        amount,
        reference,
        callbackUrl: `${process.env.BASE_URL || 'http://localhost:3000'}/api/payment/callback`,
        metadata: { productId, recipient, quantity }
      });

      res.json({ success: true, paymentUrl: result.url, reference: result.reference });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async callback(req: Request, res: Response) {
    try {
      const reference = req.query.reference as string || req.query.trxref as string;
      if (!reference) return res.redirect(`${process.env.FRONTEND_URL}?payment=error`);

      const verification = await paymentService.verifyPayment('paystack', reference);
      if (!verification.success) {
        return res.redirect(`${process.env.FRONTEND_URL}?payment=failed&ref=${reference}`);
      }

      const txn = await Transaction.findOne({ ref: reference, status: 'pending' });
      if (!txn) return res.redirect(`${process.env.FRONTEND_URL}?payment=error&ref=${reference}`);

      // Handle Delivery (Simplified for now, will be fully integrated in the orchestrator later)
      // For now, we mark as success and maybe manually deliver or let a worker handle it.
      txn.status = 'paid';
      txn.deliveryStatus = 'delivered'; // Assuming instant delivery for this demo
      await txn.save();

      res.redirect(`${process.env.FRONTEND_URL}?payment=success&ref=${reference}`);
    } catch (e: any) {
      console.error('Payment callback error:', e);
      res.redirect(`${process.env.FRONTEND_URL}?payment=error`);
    }
  }

  static async webhook(req: Request, res: Response) {
    try {
      const signature = req.headers['x-paystack-signature'];
      const secret = process.env.PAYSTACK_SECRET_KEY || '';

      const computedSignature = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== computedSignature) {
        return res.status(401).send('Invalid signature');
      }

      const event = req.body;
      if (event.event === 'charge.success') {
        const reference = event.data.reference;
        const txn = await Transaction.findOne({ ref: reference, status: 'pending' });
        if (txn) {
          txn.status = 'paid';
          await txn.save();
          // Logic for automatic wallet credit or product delivery would go here
        }
      }

      res.sendStatus(200);
    } catch (e: any) {
      console.error('Webhook error:', e);
      res.status(500).send('Internal Server Error');
    }
  }
}
