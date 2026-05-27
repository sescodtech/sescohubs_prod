import { Request, Response } from 'express';
import { WalletService } from '../services\WalletService';
import { paymentService } from '../services\PaymentService';
import { Transaction } from '../models\Transaction';

export class PaymentController {
  static async callback(req: Request, res: Response) {
    try {
      const reference = req.query.reference as string;
      if (!reference) return res.status(400).json({ error: 'Reference required' });

      // In a real app, we'd determine which gateway to use based on the reference format or a database lookup
      const verification = await paymentService.verifyPayment('paystack', reference);

      if (!verification.success) {
        return res.status(400).json({ success: false, error: 'Payment verification failed' });
      }

      const txn = await Transaction.findOne({ paymentReference: reference, status: 'pending' });
      if (!txn) return res.status(404).json({ success: false, error: 'Transaction not found or already processed' });

      // Credit the user's wallet
      await WalletService.creditUser(txn.userId.toString(), verification.amount, 'deposit', reference);

      // Update transaction status
      txn.status = 'success';
      await txn.save();

      res.json({ success: true, message: 'Wallet funded successfully' });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
