import { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHome from './pages/DashboardHome';
import BuyDataFlow from './pages/BuyDataFlow';
import BuyAirtime from './pages/BuyAirtime';
import UtilityBills from './pages/UtilityBills';
import TransactionsPage from './pages/TransactionsPage';
import WalletPage from './pages/WalletPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import APIPage from './pages/APIPage';
import TenantAdminPage from './pages/TenantAdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// ── Protected route ─────────────────────────────────────────
function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={36} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  const roleStr = String(user.backendRole).toLowerCase();
  if (adminOnly && !['admin', 'tenant_admin', 'super_admin'].includes(roleStr)) return <Navigate to="/app" replace />;
  return <>{children}</>;
}

// ── Payment callback page ───────────────────────────────────
function PaymentCallbackPage() {
  const [params] = useSearchParams();
  const status = params.get('payment');
  const trxref = params.get('trxref') || params.get('reference');

  if (status === 'error' || status === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={40} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Issue</h1>
          <p className="text-gray-500 mb-8">Something went wrong with your payment. No funds were charged. Please try again.</p>
          <a href="/app/buy-data" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
            Try Again
          </a>
          <a href="/app/transactions" className="block mt-3 text-sm text-gray-500 hover:underline">
            View transactions
          </a>
        </div>
      </div>
    );
  }

  // Success or unknown — assume success if there's a reference
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="text-green-500" size={40} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-4">Your payment was received. Your order is being processed and will be delivered shortly.</p>
        {trxref && (
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Reference</p>
            <p className="font-mono text-sm text-gray-700 font-bold">{trxref}</p>
          </div>
        )}
        <a href="/app/transactions" className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
          View Transactions
        </a>
        <a href="/app" className="block mt-3 text-sm text-gray-500 hover:underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Paystack callback — backend redirects here after payment */}
          <Route path="/payment/callback" element={<PaymentCallbackPage />} />

          {/* Protected dashboard routes */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="buy-data" element={<BuyDataFlow />} />
            <Route path="buy-airtime" element={<BuyAirtime />} />
            <Route path="tv" element={<UtilityBills />} />
            <Route path="electricity" element={<UtilityBills />} />
            <Route path="wallet" element={<WalletPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="api" element={<APIPage />} />

            {/* Admin-only routes */}
            <Route
              path="tenant-admin"
              element={
                <ProtectedRoute adminOnly>
                  <TenantAdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="super-admin"
              element={
                <ProtectedRoute adminOnly>
                  <SuperAdminPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
