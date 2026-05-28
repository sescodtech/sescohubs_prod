// ============================================================
// DATAHUB API Service Layer
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const normalizeProvider = (value?: string) =>
  String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '');

const providerAliasMap: Record<string, string[]> = {
  mtn: ['mtn'],
  airtel: ['airtel'],
  glo: ['glo', 'globacom'],
  '9mobile': ['9mobile', 'etisalat'],
  dstv: ['dstv', 'dstvsubscription', 'dstv_subscription'],
  gotv: ['gotv', 'gotvsubscription', 'gotv_subscription'],
  startimes: ['startimes', 'startimessubscription', 'startimes_subscription'],
  ikedc: ['ikedc', 'ikejaelectric', 'ikejaelectricity'],
  ekedc: ['ekedc', 'ekoelectric', 'ekoelectricity'],
  aedc: ['aedc', 'abujaelectric', 'abujaelectricity'],
  phden: ['phden', 'portharcourtelectricity'],
  ibedc: ['ibedc', 'ibadandisco', 'ibadanelectricity'],
  kedco: ['kedco', 'kanodisco', 'kanoelectricity'],
};

export const matchesProvider = (product: Product, providerId: string) => {
  const normalizedProduct = normalizeProvider(product.provider || product.prov);
  const normalizedTarget = normalizeProvider(providerId);
  if (!normalizedProduct || !normalizedTarget) return false;
  if (normalizedProduct === normalizedTarget) return true;

  const normalizedAliases = providerAliasMap[normalizedTarget] ?? [normalizedTarget];
  if (normalizedAliases.includes(normalizedProduct)) return true;

  return normalizedProduct.includes(normalizedTarget) || normalizedTarget.includes(normalizedProduct);
};

// ── Token storage ─────────────────────────────────────────────
export const token = {
  get: () => localStorage.getItem('dh_token'),
  set: (t: string) => localStorage.setItem('dh_token', t),
  clear: () => localStorage.removeItem('dh_token'),
};

// ── Base fetch helper ──────────────────────────────────────────
async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (auth) {
    const t = token.get();
    if (t) headers['Authorization'] = `Bearer ${t}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || data.message || `HTTP ${res.status}`);
  }
  return data as T;
}

// ============================================================
// AUTH
// ============================================================
export interface AuthUser {
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin' | 'tenant_admin' | 'super_admin';
  walletBalance?: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

export const auth = {
  register: (name: string, email: string, password: string, phone?: string) =>
    apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    }),

  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  requestPasswordReset: (email: string) =>
    apiFetch<{ success: boolean; message: string }>('/api/auth/request-reset', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, email: string, newPassword: string) =>
    apiFetch<AuthResponse>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, newPassword }),
    }),

  updateProfile: (data: { name?: string; phone?: string }) =>
    apiFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }, true),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }, true),
};

// ============================================================
// PRODUCTS / PLANS
// ============================================================
export interface Product {
  id: string;
  name: string;
  category: string;
  provider: string;
  price: number;
  validity?: string;
  planType?: string;
  apiSource?: string;
  is_promo?: boolean;
  original_price?: number;
  // Legacy aliases kept for safety
  cat?: string;
  prov?: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
}

export const products = {
  list: () => apiFetch<ProductsResponse>('/api/products'),

  byNetwork: async (network: string, cat = 'data') => {
    const res = await products.list();
    return res.products.filter((p) =>
      matchesProvider(p, network) &&
      ((p.category || p.cat) === cat || (cat === 'data' && !p.category && !p.cat)),
    );
  },

  byCategory: async (cat: string) => {
    const res = await products.list();
    return res.products.filter((p) => (p.category || p.cat) === cat);
  },
};

// ============================================================
// PAYMENT
// ============================================================
export interface PaymentInitResponse {
  success: boolean;
  paymentUrl: string;
  reference: string;
}

export const payment = {
  /** Pay via Paystack (no wallet needed) */
  initiate: (params: {
    productId: string;
    recipient: string;
    quantity?: number;
    customerEmail: string;
  }) =>
    apiFetch<PaymentInitResponse>('/api/payment/initiate', {
      method: 'POST',
      body: JSON.stringify({ ...params, quantity: params.quantity ?? 1 }),
    }),

  /** Pay using wallet balance */
  walletBuy: (params: {
    productId: string;
    recipient: string;
    quantity?: number;
  }) =>
    apiFetch<{ success: boolean; message: string; transaction: any }>(
      '/api/payment/wallet-buy',
      { method: 'POST', body: JSON.stringify({ ...params, quantity: params.quantity ?? 1 }) },
      true,
    ),
};

// ============================================================
// WALLET
// ============================================================
export interface WalletLedgerEntry {
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  balance?: number;
}

export interface WalletResponse {
  success: boolean;
  balance: number;
  ledger: WalletLedgerEntry[];
}

export const wallet = {
  /** Get live wallet balance and last 30 ledger entries */
  get: () => apiFetch<WalletResponse>('/api/my/wallet', {}, true),

  /** Initiate a Paystack payment to top up the wallet */
  depositInitiate: (amount: number) =>
    apiFetch<PaymentInitResponse>('/api/wallet/deposit/initiate', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }, true),
};

// ============================================================
// TRANSACTIONS
// ============================================================
export interface Transaction {
  id: string;
  ref: string;
  product: string;
  category: string;
  recipient: string;
  amount: number;
  status: 'success' | 'pending' | 'failed' | 'paid';
  deliveryStatus: 'delivered' | 'pending' | 'failed';
  date: string;
  statusMessage?: string;
}

export interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
}

export const transactions = {
  list: () => apiFetch<TransactionsResponse>('/api/my/transactions', {}, true),
  retry: (txnId: string) =>
    apiFetch(`/api/my/retry/${txnId}`, { method: 'POST' }, true),
};

// ============================================================
// PLATFORM INFO
// ============================================================
export interface InfoResponse {
  business: string;
  version: string;
  support: { phone: string; whatsapp: string };
}

export const info = {
  get: () => apiFetch<InfoResponse>('/api/info'),
};

// ============================================================
// ADMIN
// ============================================================
export const admin = {
  stats: () => apiFetch('/api/admin/stats', {}, true),
  transactions: (limit = 500) =>
    apiFetch(`/api/admin/transactions?limit=${limit}`, {}, true),
  users: () => apiFetch('/api/admin/users', {}, true),
  updateUserRole: (userId: string, role: string) =>
    apiFetch(`/api/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }, true),
  getMarkup: () => apiFetch('/api/admin/markup', {}, true),
  setMarkup: (markup: Record<string, number>) =>
    apiFetch('/api/admin/markup', { method: 'PUT', body: JSON.stringify(markup) }, true),
  getServices: () => apiFetch('/api/admin/services', {}, true),
  setServices: (enabled: Record<string, boolean>) =>
    apiFetch('/api/admin/services', { method: 'PUT', body: JSON.stringify({ enabled }) }, true),
  adminWallet: () => apiFetch('/api/admin/wallet', {}, true),
  providerStatus: () => apiFetch('/api/admin/providers/status', {}, true),
  diagnostics: () => apiFetch('/api/admin/diagnostics', {}, true),
  retryTxn: (txnId: string) =>
    apiFetch(`/api/admin/retry/${txnId}`, { method: 'POST' }, true),
  refreshPlans: () =>
    apiFetch('/api/admin/plans/refresh', { method: 'POST' }, true),
  getOverrides: () => apiFetch('/api/admin/overrides', {}, true),
  toggleProduct: (productId: string) =>
    apiFetch(`/api/admin/products/${productId}/toggle`, { method: 'POST' }, true),
  featureProduct: (productId: string, featured: boolean) =>
    apiFetch(`/api/admin/products/${productId}/feature`, { method: 'POST', body: JSON.stringify({ featured }) }, true),
  listTenants: () => apiFetch('/api/superadmin/tenants', {}, true),
  createTenant: (data: any) => apiFetch('/api/superadmin/tenants', { method: 'POST', body: JSON.stringify(data) }, true),
  updateTenant: (id: string, data: any) => apiFetch(`/api/superadmin/tenants/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
};

// ============================================================
// UTILITIES
// ============================================================
export const NETWORKS = [
  { id: 'mtn',     name: 'MTN Nigeria',  shortColor: '#FFCB04', bg: 'bg-yellow-400', textColor: 'text-gray-900' },
  { id: 'airtel',  name: 'Airtel Nigeria', shortColor: '#EF4444', bg: 'bg-red-600',    textColor: 'text-white' },
  { id: 'glo',     name: 'Glo World',    shortColor: '#16A34A', bg: 'bg-green-600',  textColor: 'text-white' },
  { id: '9mobile', name: '9Mobile',      shortColor: '#065F46', bg: 'bg-emerald-900', textColor: 'text-white' },
] as const;

export const CABLE_PROVIDERS = [
  { id: 'dstv_subscription', name: 'DSTV', bg: 'bg-blue-700',    textColor: 'text-white' },
  { id: 'gotv_subscription', name: 'GOTV', bg: 'bg-orange-500',  textColor: 'text-white' },
  { id: 'startimes',         name: 'StarTimes', bg: 'bg-red-700', textColor: 'text-white' },
] as const;

export const AIRTIME_UNIT_COST = 100; // backend RAW airtime cost per unit

export function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG')}`;
}

export function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('en-NG', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}
