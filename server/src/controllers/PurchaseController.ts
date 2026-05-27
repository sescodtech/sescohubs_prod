import { Request, Response } from 'express';
import { WalletService } from '../services\WalletService';
import { providerOrchestrator } from '../providers\ProviderOrchestrator';
import { Transaction } from '../models\Transaction';
import { User } from '../models\User';

export class PurchaseController {
  static async buyData(req: any, res: Response) {
    try {
      const { productId, recipient, quantity = 1 } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenantId;

      // 1. Fetch product and price (from Phase 4 logic)
      // For now, let's assume a fixed cost for demo
      const cost = 100 * quantity;
      const userPrice = 120 * quantity;

      // 2. Debit User Wallet
      await WalletService.debitUser(userId, userPrice, {
        product: { productId, name: 'Data Plan', category: 'data' },
        recipient,
        quantity
      });

      const ref = `TXN-${Date.now()}`;

      // 3. Dispatch via Orchestrator
      const result = await providerOrchestrator.executeWithFailover(tenantId, 'buyData', {
        planId: productId,
        phone: recipient,
        network: 'mtn', // Should be derived from product
        ref
      });

      if (result.success) {
        // Debit Tenant Business Wallet
        await WalletService.adjustTenantBalance(tenantId, -cost);

        await Transaction.create({
          tenantId,
          userId,
          amount: userPrice,
          cost: cost,
          profit: userPrice - cost,
          type: 'purchase',
          status: 'success',
          deliveryStatus: 'delivered',
          product: { productId, name: 'Data Plan', category: 'data', recipient, quantity },
          provider: { name: result.usedProvider, reference: result.reference },
          paymentReference: ref
        });

        res.json({ success: true, message: 'Data delivered successfully', ref });
      } else {
        // Refund user on failure
        await WalletService.creditUser(userId, userPrice, 'refund_failed_delivery', ref);

        res.status(500).json({ success: false, error: result.error });
      }
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
