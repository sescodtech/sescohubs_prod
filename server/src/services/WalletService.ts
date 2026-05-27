import { User } from '../models/User';
import { Transaction } from '../models/Transaction';
import { Tenant } from '../models/Tenant';

export class WalletService {
  /**
   * Credit a user's wallet
   */
  static async creditUser(userId: string, amount: number, type: string, ref?: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    user.walletBalance += amount;
    await user.save();

    await Transaction.create({
      tenantId: user.tenantId,
      userId: user._id,
      amount,
      type,
      status: 'success',
      paymentReference: ref
    });

    return user.walletBalance;
  }

  /**
   * Debit a user's wallet
   */
  static async debitUser(userId: string, amount: number, transactionData: any) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.walletBalance < amount) {
      throw new Error('Insufficient wallet balance');
    }

    user.walletBalance -= amount;
    await user.save();

    // Create transaction record
    await Transaction.create({
      tenantId: user.tenantId,
      userId: user._id,
      amount: -amount, // Negative for debit
      type: 'purchase',
      status: 'success',
      ...transactionData
    });

    return user.walletBalance;
  }

  /**
   * Credit/Debit the Tenant's business wallet
   * In a real SaaS, the Tenant's balance would be tracked in the Tenant model
   * or a separate BusinessWallet model. For now, let's add a field to Tenant.
   */
  static async adjustTenantBalance(tenantId: string, amount: number) {
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new Error('Tenant not found');

    // We will add 'businessBalance' to the Tenant model in a moment
    (tenant as any).businessBalance = ((tenant as any).businessBalance || 0) + amount;
    await tenant.save();

    return (tenant as any).businessBalance;
  }
}
