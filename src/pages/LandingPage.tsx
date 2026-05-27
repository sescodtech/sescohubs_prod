import { Link } from 'react-router-dom';
import { ArrowRight, Smartphone, ShieldCheck, Database, Zap, Menu, X, Tv, CheckCircle2, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const FEATURES = [
  {
    icon: Smartphone,
    title: 'All Networks, One Platform',
    desc: 'MTN, Airtel, Glo, 9Mobile — data, airtime, and cable TV in one place.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Zap,
    title: 'Lightning Fast Delivery',
    desc: 'Data delivered in seconds. No delays, no manual approvals, 24/7 automated.',
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    icon: ShieldCheck,
    title: 'Secured with Paystack',
    desc: "Every payment is encrypted and processed by Paystack, Nigeria's most trusted gateway.",
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Database,
    title: 'Cheapest SME Data Rates',
    desc: 'We source directly from multiple providers to always give you the best price.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Tv,
    title: 'Cable TV Subscriptions',
    desc: 'Renew DStv, GOtv, and StarTimes instantly — no queues, no hassle.',
    color: 'bg-orange-100 text-orange-600',
  },
  {
    icon: CheckCircle2,
    title: 'Verified & Reliable',
    desc: 'Trusted by thousands of Nigerians daily. Dispute resolution within minutes.',
    color: 'bg-red-100 text-red-600',
  },
];

const NETWORKS = [
  { id: 'mtn',    name: 'MTN',    bg: 'bg-yellow-400', text: 'text-gray-900', sample: '1GB — ₦350' },
  { id: 'airtel', name: 'Airtel', bg: 'bg-red-600',    text: 'text-white',    sample: '2GB — ₦700' },
  { id: 'glo',    name: 'Glo',    bg: 'bg-green-600',  text: 'text-white',    sample: '3GB — ₦900' },
  { id: '9mobile',name: '9Mobile',bg: 'bg-emerald-800',text: 'text-white',    sample: '1GB — ₦300' },
];

const TESTIMONIALS = [
  { name: 'Chidi Emmanuel', location: 'Lagos', text: "Best platform I've ever used for cheap data. MTN SME 5GB for ₦1,400? Nowhere else in Lagos.", rating: 5 },
  { name: 'Amina Bello', location: 'Abuja', text: "I buy data for my whole family from DATAHUB. Never had a failed transaction in 6 months.", rating: 5 },
  { name: 'Tunde Okafor', location: 'Port Harcourt', text: "DStv renewal at midnight, processed in 10 seconds. Support team also responded within 2 mins.", rating: 5 },
];

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-lg z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-lg sm:text-2xl leading-none">D</span>
            </div>
            <span className="text-lg sm:text-2xl font-extrabold tracking-tight text-gray-900">DATAHUB</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#networks" className="hover:text-blue-600 transition-colors">Networks</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <Link to="/login" className="px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors">Login</Link>
            <Link to="/signup" className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 font-bold">
              Get Started Free
            </Link>
          </div>

          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ────────────────────────────────────────── */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 md:hidden flex flex-col p-6 animate-in slide-in-from-right duration-200">
          <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-extrabold text-xl">D</span>
              </div>
              <span className="text-2xl font-extrabold">DATAHUB</span>
            </div>
            <button onClick={() => setIsMenuOpen(false)} aria-label="Close menu"><X size={28} /></button>
          </div>
          <nav className="flex flex-col gap-5 text-xl font-semibold text-gray-800">
            <a href="#features" onClick={() => setIsMenuOpen(false)}>Features</a>
            <a href="#networks" onClick={() => setIsMenuOpen(false)}>Networks</a>
            <a href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</a>
            <hr className="border-gray-100" />
            <Link to="/login" className="text-blue-600">Login</Link>
            <Link to="/signup" className="w-full py-4 bg-blue-600 text-white rounded-2xl text-center shadow-xl font-bold active:scale-95 transition-transform">
              Create Free Account
            </Link>
          </nav>
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs sm:text-sm font-bold border border-blue-100"
        >
          <Zap size={14} fill="currentColor" />
          Nigeria's Fastest & Cheapest VTU Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tighter text-gray-900 mb-4 sm:mb-6 max-w-4xl leading-[1.05] px-2"
        >
          Buy <span className="text-blue-600">Data & Airtime</span>{' '}
          <span className="block sm:inline">Cheaper Than Anywhere Else</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-4"
        >
          MTN, Airtel, Glo, 9Mobile — SME data, airtime top-ups, DStv/GOtv renewals, and electricity
          bills. All in seconds. All in one place.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-md sm:max-w-none"
        >
          <Link
            to="/signup"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-2xl text-base sm:text-lg font-bold hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all flex items-center justify-center gap-2 touch-manipulation"
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
          <Link
            to="/login"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 border-2 border-gray-200 rounded-2xl text-base sm:text-lg font-bold hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center justify-center touch-manipulation"
          >
            Sign In
          </Link>
        </motion.div>

        {/* Social proof numbers */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-6 sm:gap-8 md:gap-16"
        >
          {[
            { num: '50,000+', label: 'Transactions Daily' },
            { num: '₦2M+', label: 'Processed Today' },
            { num: '99.9%', label: 'Delivery Rate' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{s.num}</p>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Networks Strip ─────────────────────────────────────── */}
      <section id="networks" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-10">
            Supported Networks
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {NETWORKS.map((net) => (
              <div
                key={net.id}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black mb-4 ${net.bg} ${net.text}`}>
                  {net.name[0]}
                </div>
                <p className="font-bold text-gray-900">{net.name}</p>
                <p className="text-xs text-gray-500 mt-1">From {net.sample}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              One platform. All networks. Instant delivery. Zero stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${f.color}`}>
                  <f.icon size={24} />
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Banner ─────────────────────────────────────── */}
      <section id="pricing" className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <p className="text-blue-200 font-bold uppercase tracking-widest text-xs mb-4">No subscription fees</p>
          <h2 className="text-4xl font-extrabold mb-4">Pay Only When You Buy</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            No monthly charges. No hidden fees. You pay Paystack per transaction — that's it.
            Create your account for free and start buying instantly.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 rounded-2xl text-lg font-extrabold hover:bg-blue-50 transition-all shadow-xl"
          >
            Get Started — It's Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Loved Across Nigeria</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Ready to save money on data?
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Join thousands of Nigerians already buying data cheaper on DATAHUB.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl text-lg font-extrabold hover:bg-blue-700 shadow-2xl shadow-blue-200 transition-all"
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-10 pb-10 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-extrabold text-xl">D</span>
                </div>
                <span className="text-2xl font-extrabold">DATAHUB</span>
              </div>
              <p className="text-gray-400 max-w-xs">Nigeria's fastest VTU platform. Data, Airtime, Cable TV, Bills.</p>
              <p className="text-gray-500 text-sm mt-3">Support: 08140112803</p>
            </div>

            <div className="flex gap-16 text-sm">
              <div className="flex flex-col gap-3">
                <p className="font-extrabold text-gray-300 uppercase tracking-widest text-xs mb-2">Services</p>
                <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Buy Data</span>
                <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Buy Airtime</span>
                <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Cable TV</span>
                <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Electricity</span>
              </div>
              <div className="flex flex-col gap-3">
                <p className="font-extrabold text-gray-300 uppercase tracking-widest text-xs mb-2">Account</p>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link>
                <Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link>
                <Link to="/app/support" className="text-gray-400 hover:text-white transition-colors">Support</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} DATAHUB Digital Marketplace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
