import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService';
import { providerOrchestrator } from '../providers/ProviderOrchestrator';
import { Transaction } from '../models/Transaction';
import { ProductService } from '../services/ProductService';
import { User } from '../models/User';

export class PurchaseController {
  static async buyData(req: any, res: Response) {
    try {
      const { productId, recipient, quantity = 1 } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenantId;

      const product = await ProductService.getProductById(tenantId, productId);
      if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

      const cost = product.costPrice * quantity;
      const userPrice = product.sellingPrice * quantity;

      await WalletService.debitUser(userId, userPrice, {
        product: { productId, name: product.name, category: product.category },
        recipient,
        quantity
      });

      const ref = `TXN-${Date.now()}`;

      const result = await providerOrchestrator.executeWithFailover(tenantId, 'buyData', {
        planId: product.providerId,
        phone: recipient,
        network: product.provider,
        ref
      });

      if (result.success) {
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
          product: { productId, name: product.name, category: product.category, recipient, quantity },
          provider: { name: result.usedProvider, reference: result.reference },
          paymentReference: ref
        });

        res.json({ success: true, message: 'Data delivered successfully', ref });
      } else {
        await WalletService.creditUser(userId, userPrice, 'refund_failed_delivery', ref);
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async buyAirtime(req: any, res: Response) {
    try {
      const { network, phone, amount, quantity = 1 } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenantId;

      // For airtime, we usually have a fixed cost of 100% in the system
      // But we use ProductService to check if there's a specific airtime product
      const product = await ProductService.getProductById(tenantId, `airtime_${network.toLowerCase()}`);
      if (!product) return res.status(404).json({ success: false, error: 'Airtime network not supported' });

      const cost = amount * quantity;
      const userPrice = amount * quantity; // Airtime usually has no markup for users

      await WalletService.debitUser(userId, userPrice, {
        product: { productId: product.id, name: `${network} Airtime`, category: 'airtime' },
        recipient: phone,
        quantity
      });

      const ref = `AT-${Date.now()}`;

      const result = await providerOrchestrator.executeWithFailover(tenantId, 'buyAirtime', {
        network,
        phone,
        amount: amount * quantity,
        ref
      });

      if (result.success) {
        await WalletService.adjustTenantBalance(tenantId, -cost);
        await Transaction.create({
          tenantId, userId, amount: userPrice, cost, profit: 0, type: 'purchase',
          status: 'success', deliveryStatus: 'delivered',
          product: { productId: product.id, name: `${network} Airtime`, category: 'airtime', recipient: phone, quantity },
          provider: { name: result.usedProvider, reference: result.reference },
          paymentReference: ref
        });
        res.json({ success: true, message: 'Airtime delivered successfully', ref });
      } else {
        await WalletService.creditUser(userId, userPrice, 'refund_failed_delivery', ref);
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }

  static async buyCable(req: any, res: Response) {
    try {
      const { productId, smartcard, phone } = req.body;
      const userId = req.user.id;
      const tenantId = req.user.tenantId;

      const product = await ProductService.getProductById(tenantId, productId);
      if (!product) return res.status(404).json({ success: false, error: 'Cable plan not found' });

      const cost = product.costPrice;
      const userPrice = product.sellingPrice;

      await WalletService.debitUser(userId, userPrice, {
        product: { productId, name: product.name, category: 'cable' },
        recipient: smartcard,
        quantity: 1
      });

      const ref = `CB-${Date.now()}`;
      const result = await providerOrchestrator.executeWithFailover(tenantId, 'buyCable', {
        provider: product.provider,
        smartcard,
        planId: product.providerId,
        phone,
        ref
      });

      if (result.success) {
        await WalletService.adjustTenantBalance(tenantId, -cost);
        await Transaction.create({
          tenantId, userId, amount: userPrice, cost, profit: userPrice - cost, type: 'purchase',
          status: 'success', deliveryStatus: 'delivered',
          product: { productId, name: product.name, category: 'cable', recipient: smartcard, quantity: 1 },
          provider: { name: result.usedProvider, reference: result.reference },
          paymentReference: ref
        });
        res.json({ success: true, message: 'Cable subscription successful', ref });
      } else {
        await WalletService.creditUser(userId, userPrice, 'refund_failed_delivery', ref);
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (e: any) {
      res.status(400).json({ success: false, error: e.message });
    }
  }
}
