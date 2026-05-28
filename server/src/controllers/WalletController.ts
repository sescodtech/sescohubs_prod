import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

export class WalletController {
  /**
   * GET /api/my/wallet
   */
  static async getMyWallet(req: any, res: Response) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      const ledger = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(30);
      res.json({
        success: true,
        balance: user.walletBalance,
        ledger: ledger.map(t => ({
          type: t.amount > 0 ? 'credit' : 'debit',
          amount: Math.abs(t.amount),
          description: t.product?.name || t.type,
          date: t.createdAt,
          balance: user.walletBalance
        }))
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  /**
   * GET /api/my/transactions
   */
  static async getMyTransactions(req: any, res: Response) {
    try {
      const transactions = await Transaction.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate('product');

      res.json({
        success: true,
        transactions
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  /**
   * POST /api/wallet/deposit/initiate
   */
  static async depositInitiate(req: any, res: Response) {
    try {
      const { amount } = req.body;
      const user = req.user;
      const reference = `DEP-${Date.now()}-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;

      res.json({ success: true, paymentUrl: 'https://paystack.com/pay', reference });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
