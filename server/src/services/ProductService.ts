import { IProvider } from '../providers/IProvider';
import { Tenant } from '../models/Tenant';

export interface Product {
  id: string;
  name: string;
  category: string;
  provider: string;
  costPrice: number;
  sellingPrice: number;
  validity?: string;
  planType?: string;
  isPromo: boolean;
  originalPrice?: number;
}

export class ProductService {
  /**
   * Fetches a unified catalog of products across all providers
   * and applies tenant-specific markups.
   */
  static async getCatalog(tenantId: string) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    const markups = tenant.markupSettings || {};
    const overrides = await this.getOverrides(tenantId);

    // In a real implementation, we would iterate through all registered providers
    // and call their getAllPlans() method.
    // For now, we implement a merged list based on the porting logic from the old system.
    const rawPlans = await this.fetchRawPlans();

    const catalog: Product[] = [];

    for (const plan of rawPlans) {
      const category = plan.category || 'data';
      const markupPct = markups[category] || 10; // default 10%

      const sellingPrice = Math.ceil(plan.cost * (1 + markupPct / 100));

      // Check if there is a price override (Promo)
      const override = overrides.find(o => o.productId === plan.id);

      catalog.push({
        id: plan.id,
        name: plan.name,
        category,
        provider: plan.provider,
        costPrice: plan.cost,
        sellingPrice: override ? override.price : sellingPrice,
        validity: plan.validity,
        planType: plan.planType,
        isPromo: !!override,
        originalPrice: override ? sellingPrice : undefined
      });
    }

    return catalog;
  }

  static async getProductById(tenantId: string, productId: string) {
    const catalog = await this.getCatalog(tenantId);
    return catalog.find(p => p.id === productId);
  }

  private async fetchRawPlans() {
    // This mimics the RAW array and dynamic fetching from the old system
    // In production, this would be:
    // return await Promise.all(providers.map(p => p.getAllPlans()))
    return [
      { id: 'mtn_1gb', name: 'MTN 1GB', category: 'data', provider: 'jarapoint', cost: 470, validity: '30 Days', planType: 'SME' },
      { id: 'glo_1gb', name: 'Glo 1GB', category: 'data', provider: 'jarapoint', cost: 350, validity: '30 Days', planType: 'SME' },
      { id: 'air_1gb', name: 'Airtel 1GB', category: 'data', provider: 'jarapoint', cost: 835, validity: '30 Days', planType: 'SME' },
      { id: 'airtime_mtn', name: 'MTN Airtime', category: 'airtime', provider: 'jarapoint', cost: 100, validity: '', planType: 'airtime' },
    ];
  }

  private async getOverrides(tenantId: string) {
    // Implementation for fetching active overrides from the DB
    return [];
  }
}
