import { useState, useEffect } from 'react';
import { Wallet, Smartphone, Tv, Zap, ArrowUpRight, ArrowDownLeft, Clock, ShoppingCart, ChevronRight, AlertCircle, LayoutDashboard, ReceiptText, Loader2, RefreshCw, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { transactions as txnApi, products as productsApi, formatNaira, formatDate, type Transaction, type Product } from '../lib/api';

const NETWORK_STATUS = [
  { name: 'MTN SME', status: 'Online', color: 'bg-green-500' },
  { name: 'MTN Gifting', status: 'Slight Delay', color: 'bg-orange-500' },
  { name: 'Airtel CG', status: 'Online', color: 'bg-green-500' },
  { name: '9Mobile', status: 'Offline', color: 'bg-red-500' },
];

export default function DashboardHome() {
  const { user } = useAuth();
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [isLoadingTxns, setIsLoadingTxns] = useState(true);

  const quickActions = [
    { title: 'Buy Data', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100', to: '/app/buy-data' },
    { title: 'Buy Airtime', icon: Smartphone, color: 'text-green-600', bg: 'bg-green-100', to: '/app/buy-airtime' },
    { title: 'TV Subscription', icon: Tv, color: 'text-purple-600', bg: 'bg-purple-100', to: '/app/tv' },
    { title: 'Electricity', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-100', to: '/app/electricity' },
  ];

  const [promoProducts, setPromoProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await txnApi.list();
        setTxns(res.transactions.slice(0, 5));
      } catch { /* ignore - show empty state */ }
      finally { setIsLoadingTxns(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await productsApi.list();
        const promos = res.products.filter(p => p.is_promo).slice(0, 6);
        setPromoProducts(promos);
      } catch(e) { console.warn('Failed to load promo products', e); }
    })();
  }, []);

  // Compute stats from real transactions
  const totalSpent = txns
    .filter((t) => t.deliveryStatus === 'delivered' && t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const totalFunded = txns
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="font-extrabold text-xl">D</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-none">DATAHUB</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
              Welcome back, {user?.name.split(' ')[0]} 👋
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/app/buy-data"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 touch-manipulation"
          >
            <ShoppingCart size={16} /> Buy Data
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Wallet Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-200">
          <div className="relative z-10">
            <p className="text-blue-100 text-sm font-medium uppercase tracking-wider mb-2">Account Overview</p>
            <div className="flex items-baseline gap-2 mb-6 sm:mb-8">
              <span className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                {user?.name || 'Welcome'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group touch-manipulation">
                <div className="flex justify-between items-start mb-2">
                  <Wallet className="text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Wallet Balance</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{formatNaira(user?.walletBalance || 0)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1 border border-white/10 hover:bg-white/20 transition-colors cursor-pointer group touch-manipulation">
                <div className="flex justify-between items-start mb-2">
                  <ArrowUpRight className="text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-200">Spent</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{formatNaira(totalSpent)}</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
          <div className="absolute bottom-10 right-10 flex gap-1 transform rotate-6 scale-150 opacity-20 pointer-events-none">
            <div className="w-8 h-8 rounded-lg bg-white" />
            <div className="w-8 h-8 rounded-lg bg-white" />
            <div className="w-8 h-8 rounded-lg bg-white" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
            <LayoutDashboard size={18} className="text-blue-600" />
            Quick Service
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.to}
                className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100 touch-manipulation"
              >
                <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform', action.bg, action.color)}>
                  <action.icon size={20} />
                </div>
                <span className="text-xs font-bold text-gray-700 text-center leading-tight">{action.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions & Network Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Hot Deals */}
          {promoProducts.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  Hot Deals
                </h3>
                <Link to="/app/buy-data" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {promoProducts.map((p) => (
                  <Link
                    key={p.id}
                    to={`/app/buy-data?productId=${p.id}`}
                    className="p-3 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase text-gray-400 tracking-tighter">{p.provider}</span>
                      <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-1.5 rounded">PROMO</span>
                    </div>
                    <p className="font-bold text-gray-900 text-xs truncate">{p.name}</p>
                    <p className="text-lg font-extrabold text-blue-600">{formatNaira(p.price)}</p>
                    {p.original_price && (
                      <p className="text-[10px] text-gray-400 line-through">{formatNaira(p.original_price)}</p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 pb-0 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Clock size={18} className="text-blue-600" />
                Recent Purchases
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    setIsLoadingTxns(true);
                    try {
                      const res = await txnApi.list();
                      setTxns(res.transactions.slice(0, 5));
                    } catch {}
                    finally { setIsLoadingTxns(false); }
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <RefreshCw size={14} className={cn(isLoadingTxns && 'animate-spin')} />
                </button>
                <Link to="/app/transactions" className="text-xs font-bold text-blue-600 hover:underline">View All</Link>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2 overflow-x-auto">
            {isLoadingTxns ? (
              <div className="flex items-center justify-center py-12 text-gray-400 gap-3">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm">Loading transactions...</span>
              </div>
            ) : txns.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                  <ReceiptText size={32} />
                </div>
                <p className="text-gray-500 font-medium">No transactions yet.</p>
                <Link to="/app/buy-data" className="mt-3 text-sm text-blue-600 font-bold hover:underline">Buy your first data plan →</Link>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 hidden md:table-cell text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {txns.map((tx) => {
                    const isDelivered = tx.deliveryStatus === 'delivered';
                    const isFailed = tx.deliveryStatus === 'failed';
                    const statusLabel = isDelivered ? 'Success' : isFailed ? 'Failed' : 'Pending';
                    return (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0',
                              tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                            )}>
                              {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ShoppingCart size={18} />}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-xs leading-tight">{tx.product}</p>
                              <p className="text-xs text-gray-500 font-medium">{tx.recipient}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={cn('font-bold', tx.amount > 0 ? 'text-green-600' : 'text-gray-900')}>
                            {tx.amount > 0 ? '+' : ''}{formatNaira(Math.abs(tx.amount))}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className={cn(
                            'inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter',
                            statusLabel === 'Success' ? 'bg-green-100 text-green-700' :
                            statusLabel === 'Pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          )}>
                            {statusLabel}
                          </div>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell text-right text-xs text-gray-400 font-medium whitespace-nowrap">
                          {formatDate(tx.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Network Status */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              Network Status
            </h3>
            <div className="space-y-4">
              {NETWORK_STATUS.map((n) => (
                <div key={n.name} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{n.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{n.status}</span>
                    <div className={cn('w-2 h-2 rounded-full', n.color)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-blue-600 rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer">
            <h4 className="text-xl font-bold mb-2">Need Help?</h4>
            <p className="text-blue-100 text-sm mb-4">Our support team is available 24/7 for any issues.</p>
            <Link
              to="/app/support"
              className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 group-hover:gap-3 transition-all"
            >
              Contact Support <ChevronRight size={14} />
            </Link>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
