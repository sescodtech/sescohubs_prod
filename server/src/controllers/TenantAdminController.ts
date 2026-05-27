import { Request, Response } from 'express';
import { User } from '../models\User';
import { Tenant } from '../models\Tenant';

export class TenantAdminController {
  /**
   * Manage users within this tenant
   */
  static async listUsers(req: any, res: Response) {
    try {
      const users = await User.find({ tenantId: req.user.tenantId });
      res.json({ success: true, users });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  /**
   * Set markup for the tenant
   */
  static async updateMarkup(req: any, res: Response) {
    try {
      const { markup } = req.body; // e.g. { 'data': 15, 'airtime': 5 }
      const tenant = await Tenant.findById(req.user.tenantId);
      if (!tenant) throw new Error('Tenant not found');

      tenant.markupSettings = markup;
      await tenant.save();

      res.json({ success: true, message: 'Markup settings updated', markup: tenant.markupSettings });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async getStats(req: any, res: Response) {
    // In a real app, this would aggregate from the Transaction model
    res.json({
      success: true,
      stats: {
        totalRevenue: 0,
        totalProfit: 0,
        transactionCount: 0
      }
    });
  }
}
