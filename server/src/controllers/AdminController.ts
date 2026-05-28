import { Request, Response } from 'express';
import { User } from '../models/User';
import { Tenant } from '../models/Tenant';
import { Transaction } from '../models/Transaction';

export class AdminController {
  static async getStats(req: Request, res: Response) {
    try {
      const totalRevenue = await Transaction.aggregate([
        { $match: { status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const userCount = await User.countDocuments();
      const tenantCount = await Tenant.countDocuments();

      res.json({
        success: true,
        stats: {
          revenue: totalRevenue[0]?.total || 0,
          users: userCount,
          tenants: tenantCount,
          monthlyVolume: 'Calculating...' // In a real app, we'd filter by date
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

  static async getGlobalMarkup(req: Request, res: Response) {
    // For simplicity, we return a default map.
    // In a full app, this would be stored in a 'GlobalConfig' collection.
    res.json({
      success: true,
      markup: { data: 10, airtime: 2, cable: 5, electricity: 5 }
    });
  }

  static async setGlobalMarkup(req: Request, res: Response) {
    // Mock implementation
    res.json({ success: true, message: 'Global markup updated' });
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
}
