import { useState, useEffect } from 'react';
import { Search, ArrowDownLeft, ShoppingCart, Smartphone, Tv, Zap, Download, RefreshCw, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { transactions as txnApi, formatNaira, formatDate, type Transaction } from '../lib/api';

function txIcon(category: string, amount: number) {
  if (amount > 0) return <ArrowDownLeft size={18} />;
  if (category === 'airtime') return <Smartphone size={18} />;
  if (category === 'cable') return <Tv size={18} />;
  if (category === 'bills' || category === 'electricity') return <Zap size={18} />;
  return <ShoppingCart size={18} />;
}

function statusBadge(status: string, deliveryStatus: string) {
  const resolved = deliveryStatus === 'delivered' ? 'Success'
    : deliveryStatus === 'failed' ? 'Failed'
    : status === 'success' ? 'Success'
    : status === 'failed' ? 'Failed'
    : 'Pending';

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
      resolved === 'Success' ? 'bg-green-100 text-green-700' :
      resolved === 'Failed' ? 'bg-red-100 text-red-700' :
      'bg-orange-100 text-orange-700'
    )}>
      {resolved}
    </span>
  );
}

type FilterType = 'ALL' | 'SUCCESS' | 'FAILED' | 'PENDING';

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [retryMsg, setRetryMsg] = useState('');

  const loadTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await txnApi.list();
      setTxns(res.transactions);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadTransactions(); }, []);

  const handleRetry = async (txn: Transaction) => {
    if (retryingId) return;
    setRetryingId(txn.id);
    setRetryMsg('');
    try {
      const res = await txnApi.retry(txn.id);
      setRetryMsg('✅ Retry successful! Product delivered.');
      loadTransactions();
    } catch (err: any) {
      setRetryMsg(`❌ ${err.message || 'Retry failed'}`);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredTxns = txns.filter((tx) => {
    const resolved = tx.deliveryStatus === 'delivered' ? 'Success'
      : tx.deliveryStatus === 'failed' ? 'Failed'
      : 'Pending';

    const matchSearch =
      tx.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.recipient.includes(searchTerm) ||
      tx.product.toLowerCase().includes(searchTerm.toLowerCase());

    if (filter === 'ALL') return matchSearch;
    if (filter === 'SUCCESS') return matchSearch && resolved === 'Success';
    if (filter === 'FAILED') return matchSearch && resolved === 'Failed';
    if (filter === 'PENDING') return matchSearch && resolved === 'Pending';
    return matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Transaction History</h1>
          <p className="text-gray-500 text-sm">Review all your purchases and receipts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadTransactions}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={cn(isLoading && 'animate-spin')} /> Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={16} /> Export
          </button>
        </div>
      </header>

      {/* Retry message */}
      <AnimatePresence>
        {retryMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={cn(
              'p-4 rounded-2xl text-sm font-medium',
              retryMsg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
            )}
          >
            {retryMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by ref, phone, or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100 overflow-x-auto whitespace-nowrap">
          {(['ALL', 'SUCCESS', 'PENDING', 'FAILED'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all',
                filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 className="animate-spin" size={24} />
            <span className="font-medium">Loading your transactions...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <AlertCircle size={36} className="text-red-400" />
            <p className="text-gray-600 font-semibold">{error}</p>
            <button onClick={loadTransactions} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
              Try Again
            </button>
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">
              {searchTerm || filter !== 'ALL' ? 'No transactions match your filter.' : 'No transactions yet.'}
            </p>
            {(searchTerm || filter !== 'ALL') && (
              <button onClick={() => { setSearchTerm(''); setFilter('ALL'); }} className="text-blue-600 text-sm font-bold hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 hidden md:table-cell">Recipient</th>
                  <th className="px-6 py-4 hidden lg:table-cell text-right">Date</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {filteredTxns.map((tx) => {
                  const isFailed = tx.deliveryStatus === 'failed';
                  const isPending = tx.deliveryStatus === 'pending' || tx.status === 'pending';
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          )}>
                            {txIcon(tx.category, tx.amount)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-xs leading-tight">{tx.product}</p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{tx.ref}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn('font-bold', tx.amount > 0 ? 'text-green-600' : 'text-gray-900')}>
                          {tx.amount > 0 ? '+' : ''}{formatNaira(Math.abs(tx.amount))}
                        </span>
                      </td>
                      <td className="px-6 py-4">{statusBadge(tx.status, tx.deliveryStatus)}</td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="font-mono text-xs text-gray-600">{tx.recipient}</span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-right text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-4">
                        {(isFailed || isPending) && (
                          <button
                            onClick={() => handleRetry(tx)}
                            disabled={!!retryingId}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            {retryingId === tx.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && filteredTxns.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-50 text-xs text-gray-400 font-medium">
            Showing {filteredTxns.length} of {txns.length} transactions
          </div>
        )}
      </div>
    </div>
  );
}
