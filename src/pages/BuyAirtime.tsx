import { useState } from 'react';
import { Smartphone, ArrowLeft, Loader2, AlertCircle, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { products as productsApi, matchesProvider, payment, NETWORKS, AIRTIME_UNIT_COST, formatNaira, type Product } from '../lib/api';

const AIRTIME_AMOUNTS = [50, 100, 200, 500, 1000, 2000, 5000];

export default function BuyAirtime() {
  const { user, refreshUser } = useAuth();
  const [selectedNetwork, setSelectedNetwork] = useState<typeof NETWORKS[number] | null>(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [airtimePlans, setAirtimePlans] = useState<Product[]>([]);

  const isValidPhone  = /^(07|08|09)\d{9}$/.test(phoneNumber.replace(/\s/g, ''));
  const isValidAmount = Number(amount) >= 50 && Number(amount) <= 50000;

  const handleNetworkSelect = async (network: typeof NETWORKS[number]) => {
    setSelectedNetwork(network);
    setError('');
    setStep(1);
    try {
      const res = await productsApi.list();
      setAirtimePlans(res.products.filter((p) => (p.category || p.cat) === 'airtime'));
    } catch {}
  };

  const handlePay = async () => {
    if (!selectedNetwork || !amount || !phoneNumber || !user?.email) return;
    setError('');
    setIsProcessing(true);

    try {
      // Find the airtime product for this network
      const networkPlans = airtimePlans.filter((p) => matchesProvider(p, selectedNetwork.id));
      const plan = networkPlans[0];

      if (!plan) {
        throw new Error(`${selectedNetwork.name} airtime not available. Please contact support.`);
      }

      // quantity = how many ₦100 units the user wants
      // e.g. user wants ₦500 → quantity = 5 → backend dispatches ₦500 airtime
      const quantity = Number(amount) / AIRTIME_UNIT_COST;

      if (user.walletBalance == null || user.walletBalance < Number(amount)) {
        setError('Insufficient wallet balance. Please fund your wallet first.');
        setIsProcessing(false);
        return;
      }

      await payment.walletBuy({
        productId: plan.id,
        recipient: phoneNumber.replace(/\s/g, ''),
        quantity,
      });

      await refreshUser();
      window.location.href = '/app/transactions';
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <Link to="/app" className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-100">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Buy Airtime</h1>
          <p className="text-gray-500 text-sm">Top up any network instantly.</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-10">
        <AnimatePresence mode="wait">

          {step === 0 && (
            <motion.div key="net" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="text-lg font-extrabold text-gray-900 mb-6">Select Network</h2>
              <div className="grid grid-cols-2 gap-4">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => handleNetworkSelect(net)}
                    className="p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all group text-left"
                  >
                    <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-4 transition-transform group-hover:scale-110', net.bg, net.textColor)}>
                      {net.id[0].toUpperCase()}
                    </div>
                    <p className="font-bold text-gray-900">{net.name}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && selectedNetwork && (
            <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-8">
                <button onClick={() => { setStep(0); setError(''); }} className="p-2 hover:bg-gray-50 rounded-xl">
                  <ArrowLeft size={18} className="text-gray-500" />
                </button>
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg', selectedNetwork.bg, selectedNetwork.textColor)}>
                  {selectedNetwork.id[0].toUpperCase()}
                </div>
                <h2 className="text-lg font-extrabold text-gray-900">{selectedNetwork.name}</h2>
              </div>

              {/* Amount */}
              <div className="mb-6">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-3">Amount (₦)</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {AIRTIME_AMOUNTS.map((a) => (
                    <button
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all',
                        amount === String(a)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-100 text-gray-700 hover:border-blue-200',
                      )}
                    >
                      {formatNaira(a)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Or enter custom amount (min ₦50)"
                  min="50" max="50000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>

              {/* Phone */}
              <div className="mb-8">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 11))}
                    placeholder="08012345678"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono tracking-widest transition-all"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700">
                    <AlertCircle size={16} /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-start gap-3 text-xs text-blue-700">
                <Wallet size={14} className="shrink-0 mt-0.5 text-blue-600" />
                Payment will be deducted from your wallet balance.
              </div>

              <button
                onClick={handlePay}
                disabled={!isValidPhone || !isValidAmount || isProcessing}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : (
                  <>Pay {amount ? formatNaira(Number(amount)) : '---'} from Wallet</>
                )}
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
