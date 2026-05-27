import { useState, useEffect } from 'react';
import { CreditCard, ArrowDownLeft, ArrowUpRight, Wallet, ShieldCheck, ExternalLink, Loader2, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { wallet as walletApi, transactions as txnApi, formatNaira, formatDate, type Transaction, type WalletLedgerEntry } from '../lib/api';

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000];

export default function WalletPage() {
  const { user, refreshUser } = useAuth();

  const [walletBalance, setWalletBalance]   = useState<number>(0);
  const [ledger, setLedger]                 = useState<WalletLedgerEntry[]>([]);
  const [txns, setTxns]                     = useState<Transaction[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [topUpAmount, setTopUpAmount]       = useState('');
  const [topUpError, setTopUpError]         = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [walletRes, txnRes] = await Promise.all([
        walletApi.get(),
        txnApi.list(),
      ]);
      setWalletBalance(walletRes.balance);
      setLedger(walletRes.ledger || []);
      setTxns(txnRes.transactions || []);
    } catch {
      // silently fail — show zeros
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Handle payment return from Paystack
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('wallet') === 'success') {
      loadData();
      refreshUser();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleTopUp = async () => {
    const amt = Number(topUpAmount);
    if (!amt || amt < 100) {
      setTopUpError('Minimum deposit is ₦100');
      return;
    }
    setTopUpError('');
    setIsTopUpLoading(true);
    try {
      const res = await walletApi.depositInitiate(amt);
      window.location.href = res.paymentUrl;
    } catch (err: any) {
      setTopUpError(err.message || 'Failed to initiate top-up. Try again.');
      setIsTopUpLoading(false);
    }
  };

  const totalSpent    = txns.filter((t) => t.deliveryStatus === 'delivered').reduce((s, t) => s + Math.abs(t.amount), 0);
  const successCount  = txns.filter((t) => t.deliveryStatus === 'delivered').length;
  const pendingCount  = txns.filter((t) => t.deliveryStatus === 'pending').length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Wallet</h1>
          <p className="text-gray-500 text-sm">Fund your wallet and track spending.</p>
        </div>
        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} />
          Refresh
        </button>
      </header>

      {/* Wallet Balance Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-blue-200" />
            <p className="text-blue-200 text-sm font-semibold">Wallet Balance</p>
          </div>
          {isLoading ? (
            <div className="h-10 sm:h-12 w-32 sm:w-40 bg-white/20 rounded-xl animate-pulse mb-2" />
          ) : (
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{formatNaira(walletBalance)}</p>
          )}
          <p className="text-blue-200 text-sm">{user?.name} · {user?.email}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm relative overflow-hidden group">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Total Spent</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{isLoading ? '...' : formatNaira(totalSpent)}</p>
          <p className="text-xs text-gray-500 mt-1">Across {txns.length} transaction{txns.length !== 1 ? 's' : ''}</p>
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-blue-100/40 rounded-full blur-2xl group-hover:scale-150 transition-all" />
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Successful</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-green-600 tracking-tight">{successCount}</p>
          <p className="text-xs text-gray-500 mt-1">Delivered transactions</p>
        </div>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm">
          <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Pending</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-orange-500 tracking-tight">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting delivery</p>
        </div>
      </div>

      {/* Fund Wallet */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
            <ArrowDownLeft size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Fund Wallet</h2>
            <p className="text-sm text-gray-500">Add money via Paystack — use for purchases</p>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => setTopUpAmount(String(a))}
              className={cn(
                'px-3 sm:px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all touch-manipulation',
                topUpAmount === String(a)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-100 text-gray-700 hover:border-blue-200',
              )}
            >
              {formatNaira(a)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₦</span>
            <input
              type="number"
              value={topUpAmount}
              onChange={(e) => { setTopUpAmount(e.target.value); setTopUpError(''); }}
              placeholder="Enter amount (min ₦100)"
              min="100"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-base"
            />
          </div>
          <button
            onClick={handleTopUp}
            disabled={isTopUpLoading || !topUpAmount}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200 touch-manipulation text-base"
          >
            {isTopUpLoading ? <><Loader2 className="animate-spin" size={18} /> Processing...</> : <>Fund Wallet</>}
          </button>
        </div>

        <AnimatePresence>
          {topUpError && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
              <AlertCircle size={14} /> {topUpError}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={14} />
          <span>Secured by Paystack · Instant credit to wallet</span>
        </div>
      </div>

      {/* Wallet Ledger */}
      {ledger.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="font-extrabold text-gray-900">Wallet Activity</h3>
            <p className="text-xs text-gray-400 mt-0.5">Last 30 entries</p>
          </div>
          <div className="divide-y divide-gray-50">
            {ledger.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center',
                    entry.type === 'credit' ? 'bg-green-100' : 'bg-red-100')}>
                    {entry.type === 'credit'
                      ? <ArrowDownLeft size={16} className="text-green-600" />
                      : <ArrowUpRight size={16} className="text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{entry.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(entry.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn('font-bold text-sm', entry.type === 'credit' ? 'text-green-600' : 'text-red-600')}>
                    {entry.type === 'credit' ? '+' : '-'}{formatNaira(entry.amount)}
                  </p>
                  {entry.balance !== undefined && (
                    <p className="text-xs text-gray-400">Bal: {formatNaira(entry.balance)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-gray-900">Recent Purchases</h3>
            <p className="text-xs text-gray-400 mt-0.5">Your last transactions</p>
          </div>
          <ExternalLink size={16} className="text-gray-400" />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
            <Loader2 className="animate-spin" size={22} />
            <span className="text-sm font-medium">Loading...</span>
          </div>
        ) : txns.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center gap-3">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm font-semibold">No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {txns.slice(0, 10).map((tx) => {
              const isSuccess = tx.deliveryStatus === 'delivered';
              const isFailed  = tx.deliveryStatus === 'failed';
              return (
                <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 leading-tight">{tx.product}</p>
                      <p className="text-xs text-gray-400">{tx.recipient} · {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-900">{formatNaira(Math.abs(tx.amount))}</p>
                    <span className={cn('text-[10px] font-black uppercase',
                      isSuccess ? 'text-green-600' : isFailed ? 'text-red-500' : 'text-orange-500')}>
                      {isSuccess ? 'Delivered' : isFailed ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
