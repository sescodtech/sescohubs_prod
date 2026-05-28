import { Request, Response } from 'express';
import { Tenant } from '../models/Tenant';
import { User } from '../models/User';

export class SuperAdminController {
  /**
   * Create a new white-label tenant (Client)
   */
  static async createTenant(req: Request, res: Response) {
    try {
      const { name, slug, primaryColor, secondaryColor, providerConfigs } = req.body;

      const tenant = await Tenant.create({
        name,
        slug,
        primaryColor,
        secondaryColor,
        providerConfigs
      });

      res.status(201).json({ success: true, tenant });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async listTenants(req: Request, res: Response) {
    try {
      const tenants = await Tenant.find();
      res.json({ success: true, tenants });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async updateTenant(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const tenant = await Tenant.findByIdAndUpdate(id, updates, { new: true });
      res.json({ success: true, tenant });
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
