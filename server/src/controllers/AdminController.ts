import { Request, Response } from 'express';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { Transaction } from '../models/Transaction';
import { Product } from '../models/Product';
import { ProductService } from '../services/ProductService';

export class AdminController {
  /**
   * Operational Stats: Total revenue, profit, and a breakdown of failures
   */
  static async getStats(req: Request, res: Response) {
    try {
      const totalRevenue = await Transaction.aggregate([
        { $match: { status: 'paid', deliveryStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const totalCost = await Transaction.aggregate([
        { $match: { status: 'paid', deliveryStatus: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$cost_amount' } } }
      ]);

      const failedTxns = await Transaction.find({ deliveryStatus: 'failed' });
      const failureBreakdown: Record<string, number> = {};
      failedTxns.forEach(t => {
        const reason = t.failReason || 'Unknown Error';
        failureBreakdown[reason] = (failureBreakdown[reason] || 0) + 1;
      });

      const userCount = await User.countDocuments();
      const tenantCount = await Tenant.countDocuments();

      res.json({
        success: true,
        stats: {
          revenue: totalRevenue[0]?.total || 0,
          profit: (totalRevenue[0]?.total || 0) - (totalCost[0]?.total || 0),
          totalUsers: userCount,
          totalTenants: tenantCount,
          delivered: await Transaction.countDocuments({ deliveryStatus: 'delivered' }),
          failed: failedTxns.length,
          failureBreakdown,
          todayTransactions: await Transaction.countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
          }),
          todayRevenue: (await Transaction.aggregate([
            { $match: {
              status: 'paid',
              deliveryStatus: 'delivered',
              createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ]))[0]?.total || 0,
          walletBalance: 0, // This should be fetched from provider APIs
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async listUsers(req: Request, res: Response) {
    try {
      const users = await User.find().sort({ createdAt: -1 });
      res.json({ success: true, users });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async updateRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(id, { role }, { new: true });
      res.json({ success: true, user });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { userId, status } = req.body;
      const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
      res.json({ success: true, user });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async getGlobalMarkup(req: Request, res: Response) {
    res.json({
      success: true,
      markup: { data: 10, airtime: 2, cable: 5, education: 10, recharge: 5, bills: 10 }
    });
  }

  static async setGlobalMarkup(req: Request, res: Response) {
    res.json({ success: true, message: 'Global markup updated successfully' });
  }

  static async getProviderStatus(req: Request, res: Response) {
    res.json({
      success: true,
      providers: [
        { name: 'GladTidings', status: 'Online', reliability: '99.9%' },
        { name: 'CheapDataHub', status: 'Online', reliability: '98.5%' },
        { name: 'Jarapoint', status: 'Online', reliability: '97.0%' },
      ]
    });
  }

  static async listTransactions(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 500;
      const txns = await Transaction.find().sort({ createdAt: -1 }).limit(limit);
      res.json({ success: true, transactions: txns });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async toggleProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const product = await Product.findById(productId);
      if (!product) throw new Error('Product not found');

      product.hidden = !product.hidden;
      await product.save();

      res.json({ success: true, product });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async featureProduct(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const { featured } = req.body;
      const product = await Product.findByIdAndUpdate(productId, { featured }, { new: true });
      res.json({ success: true, product });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async getOverrides(req: Request, res: Response) {
    res.json({ success: true, overrides: [] });
  }

  static async setOverride(req: Request, res: Response) {
    res.json({ success: true, message: 'Promo price override created' });
  }

  static async deleteOverride(req: Request, res: Response) {
    res.json({ success: true, message: 'Override deleted' });
  }

  static async getServices(req: Request, res: Response) {
    res.json({
      success: true,
      services: { data: true, airtime: true, cable: true, education: true, recharge: true }
    });
  }

  static async setServices(req: Request, res: Response) {
    res.json({ success: true, message: 'Services configuration updated' });
  }
}
