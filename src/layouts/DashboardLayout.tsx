import {
  LayoutDashboard, Wallet, ReceiptText, User, ShoppingCart,
  Settings, Users, ShieldCheck, LogOut, Menu, X, Zap,
  Tv, Smartphone, MessageSquare,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const USER_LINKS = [
  { name: 'Dashboard',     to: '/app',              icon: LayoutDashboard, end: true },
  { name: 'Buy Data',      to: '/app/buy-data',     icon: ShoppingCart },
  { name: 'Buy Airtime',   to: '/app/buy-airtime',  icon: Smartphone },
  { name: 'TV / Cable',    to: '/app/tv',           icon: Tv },
  { name: 'Wallet',        to: '/app/wallet',       icon: Wallet },
  { name: 'Transactions',  to: '/app/transactions', icon: ReceiptText },
  { name: 'Support',       to: '/app/support',      icon: MessageSquare },
  { name: 'Settings',      to: '/app/settings',     icon: Settings },
];

const ADMIN_EXTRA = [
  { name: 'Admin Panel',   to: '/app/tenant-admin', icon: ShieldCheck },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
        <span className="text-white font-extrabold text-lg sm:text-xl leading-none">D</span>
      </div>
      <span className="font-extrabold text-lg sm:text-xl tracking-tight text-gray-900">DATAHUB</span>
    </div>
  );
}

function NavItem({ link, onClick }: { link: (typeof USER_LINKS)[0]; onClick?: () => void }) {
  return (
    <NavLink
      to={link.to}
      end={(link as any).end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all touch-manipulation',
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
        )
      }
    >
      <link.icon size={18} />
      {link.name}
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'ADMIN';
  const links = [...(isAdmin ? ADMIN_EXTRA : []), ...USER_LINKS];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Mobile Top Bar ────────────────────────────────────── */}
      <header className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <Logo />
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-40"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <Logo />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-400" aria-label="Close menu">
                  <X size={22} />
                </button>
              </div>

              {/* User pill mobile */}
              <div className="mx-4 mt-4 p-3 bg-gray-50 rounded-2xl flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0">
                  {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-gray-900 truncate">{user?.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {isAdmin ? `⚡ ${String(user?.backendRole).toLowerCase() === 'super_admin' ? 'Super Admin' : String(user?.backendRole).toLowerCase() === 'tenant_admin' ? 'Tenant Admin' : 'Admin'}` : 'Customer'}
                  </p>
                </div>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                  <NavItem key={link.to} link={link} onClick={() => setIsMobileMenuOpen(false)} />
                ))}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1">
        {/* ── Desktop Sidebar ───────────────────────────────────── */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed h-full z-30 shadow-sm">
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="mb-8">
              <Logo />
            </div>

            {/* User pill */}
            <div className="mb-6 p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-extrabold shrink-0">
                {user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  {isAdmin ? `⚡ ${String(user?.backendRole).toLowerCase() === 'super_admin' ? 'Super Admin' : String(user?.backendRole).toLowerCase() === 'tenant_admin' ? 'Tenant Admin' : 'Admin'}` : 'Customer'}
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {links.map((link) => (
                <NavItem key={link.to} link={link} />
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Content ─────────────────────────────────────── */}
        <main className="flex-1 md:ml-64 min-h-screen">
          <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}