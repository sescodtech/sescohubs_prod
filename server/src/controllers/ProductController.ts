import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
  static async list(req: any, res: Response) {
    try {
      const tenantId = req.user?.tenantId || 'default';
      const catalog = await ProductService.getCatalog(tenantId);
      res.json({ success: true, products: catalog });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }

  static async getOne(req: any, res: Response) {
    try {
      const { id } = req.params;
      const tenantId = req.user?.tenantId || 'default';
      const product = await ProductService.getProductById(tenantId, id);
      if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
      res.json({ success: true, product });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  }
}
