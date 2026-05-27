import { IProvider, ProviderResponse } from './IProvider';
import { JarapointProvider } from './JarapointProvider';
import { CheapDataHubProvider } from './CheapDataHubProvider';
import { GladTidingsProvider } from './GladTidingsProvider';
import { Tenant } from '../models/Tenant';

export class ProviderOrchestrator {
  private providers: Map<string, IProvider> = new Map();
  private minBalance = 500;

  constructor() {
    this.providers.set('jarapoint', new JarapointProvider());
    this.providers.set('cheapdatahub', new CheapDataHubProvider());
    this.providers.set('gladtidings', new GladTidingsProvider());
  }

  private async getTenantPriority(tenantId: string): Promise<string[]> {
    const tenant = await Tenant.findById(tenantId);
    // Default priority if not configured: Gladtidings -> CheapDataHub -> Jarapoint
    return tenant?.priorityOrder || ['gladtidings', 'cheapdatahub', 'jarapoint'];
  }

  async executeWithFailover(
    tenantId: string,
    serviceType: keyof IProvider,
    params: any
  ): Promise<ProviderResponse> {
    const priority = await this.getTenantPriority(tenantId);
    const errors: any[] = [];

    for (const providerName of priority) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      // 1. Health & Balance Check
      const balanceCheck = await provider.getBalance(tenantId);
      if (!balanceCheck.success || balanceCheck.balance < this.minBalance) {
        errors.push({ provider: providerName, error: balanceCheck.error || 'Insufficient balance' });
        continue;
      }

      // 2. Execute Operation
      try {
        const result = await (provider as any)[serviceType](params, tenantId);
        if (result.success) {
          return { ...result, usedProvider: providerName };
        }
        errors.push({ provider: providerName, error: result.error });
      } catch (e: any) {
        errors.push({ provider: providerName, error: e.message });
      }
    }

    return {
      success: false,
      error: 'All available providers failed',
      failReason: 'provider_error',
      errors
    };
  }
}

export const providerOrchestrator = new ProviderOrchestrator();
