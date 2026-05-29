import { useState, useEffect } from 'react';
import {
  ShieldAlert, Building, Activity, DollarSign, Globe, Lock, Server,
  BarChart3, Search, CheckCircle2, XCircle, Plus, X,
  Settings, Database, Cpu, Globe2, LayoutGrid, List,
  ArrowUpRight, ArrowDownRight, RefreshCw, HardDrive,
  AlertTriangle, Activity as ActivityIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { admin } from '../lib/api';
import { toast } from 'sonner';

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
  plan: string;
  usersCount?: number;
}

interface GlobalStats {
  revenue: number;
  users: number;
  tenants: number;
  monthlyVolume: string;
}

interface ProviderStatus {
  name: string;
  status: string;
  reliability: string;
}

export default function SuperAdminPage() {
  const [activeView, setActiveView] = useState<'infrastructure' | 'tenants' | 'finance' | 'logs'>('infrastructure');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [markup, setMarkup] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({
    name: '',
    slug: '',
    primaryColor: '#ef4444',
    secondaryColor: '#b91c1b',
    adminUser: { name: '', email: '', password: '', phone: '' }
  });

  useEffect(() => {
    initializeAppData();
  }, []);

  async function initializeAppData() {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchTenants(),
        fetchStats(),
        fetchProviders(),
        fetchMarkup()
      ]);
    } catch (e: any) {
      toast.error('Failed to initialize system data');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTenants() {
    const data = await admin.listTenants();
    setTenants(data.tenants || []);
  }

  async function fetchStats() {
    const data = await admin.stats();
    setStats(data.stats);
  }

  async function fetchProviders() {
    const data = await admin.providerStatus();
    setProviders(data.providers || []);
  }

  async function fetchMarkup() {
    const data = await admin.getMarkup();
    setMarkup(data.markup || {});
  }

  async function handleUpdateTenant(id: string, updates: Partial<Tenant>) {
    try {
      await admin.updateTenant(id, updates);
      toast.success('Tenant updated successfully');
      await fetchTenants();
      setSelectedTenant(null);
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`);
    }
  }

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    try {
      await admin.createTenant(newTenant);
      toast.success('Tenant created successfully');
      setIsCreateModalOpen(false);
      setNewTenant({
        name: '',
        slug: '',
        primaryColor: '#ef4444',
        secondaryColor: '#b91c1b',
        adminUser: { name: '', email: '', password: '', phone: '' }
      });
      await fetchTenants();
    } catch (e: any) {
      toast.error(`Creation failed: ${e.message}`);
    }
  }

  async function handleUpdateGlobalMarkup(category: string, value: number) {
    try {
      const newMarkup = { ...markup, [category]: value };
      await admin.setMarkup(newMarkup);
      setMarkup(newMarkup);
      toast.success(`Global ${category} markup updated`);
    } catch (e: any) {
      toast.error(`Failed to update markup: ${e.message}`);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
              <ShieldAlert size={24} />
           </div>
           <div className="flex flex-col">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">SescoHubs Control Center</h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Global Ecosystem Administration</p>
           </div>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner">
           {[
             { id: 'infrastructure', label: 'Infrastructure', icon: Cpu },
             { id: 'tenants', label: 'Tenant Ecosystem', icon: Globe2 },
             { id: 'finance', label: 'Global Finance', icon: DollarSign },
             { id: 'logs', label: 'System Logs', icon: Database },
           ].map(v => (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeView === v.id ? "bg-white text-red-600 shadow-sm ring-1 ring-gray-200" : "text-gray-500 hover:text-gray-900"
                )}
              >
                <v.icon size={14} /> {v.label}
              </button>
           ))}
        </div>
      </header>

      {/* Global Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Global Revenue', value: stats ? `₦${stats.revenue.toLocaleString()}` : '...', icon: DollarSign, trend: '+12.5%', color: 'text-green-600' },
          { label: 'Total Users', value: stats ? stats.users.toLocaleString() : '...', icon: Users, trend: '+8.2%', color: 'text-blue-600' },
          { label: 'Active Platforms', value: stats ? stats.tenants.toLocaleString() : '...', icon: Building, trend: 'Stable', color: 'text-purple-600' },
          { label: 'System Health', value: '99.9%', icon: ActivityIcon, trend: 'Nominal', color: 'text-indigo-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group hover:border-red-100 transition-all">
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-50", s.color)}>
              <s.icon size={22} />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-gray-900 tracking-tighter">{s.value}</p>
                <span className="text-[10px] font-bold text-green-500">{s.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeView === 'infrastructure' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                 <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs flex items-center gap-2">
                       <Server size={16} className="text-red-600" /> API Node Health
                    </h3>
                    <button onClick={fetchProviders} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                       <RefreshCw size={14} />
                    </button>
                 </div>
                 <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {providers.map(p => (
                      <div key={p.name} className="p-4 rounded-2xl border border-gray-100 bg-white flex items-center justify-between hover:shadow-md transition-all group">
                         <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", p.status === 'Online' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500")} />
                            <div className="flex flex-col">
                               <p className="text-sm font-black text-gray-900">{p.name}</p>
                               <p className="text-[10px] font-bold text-gray-400 uppercase">{p.status}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-gray-900">{p.reliability}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">Reliability</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
                    <div className="flex-1">
                       <div className="flex items-center gap-2 mb-4">
                          <ActivityIcon size={20} className="text-red-500" />
                          <h3 className="font-black uppercase tracking-widest text-xs">Live System Load</h3>
                       </div>
                       <div className="space-y-4">
                          {[
                            { name: 'Core Gateway', load: 42, status: 'Healthy' },
                            { name: 'Database Cluster', load: 15, status: 'Healthy' },
                            { name: 'Auth Service', load: 8, status: 'Healthy' },
                            { name: 'Payment Webhooks', load: 74, status: 'High' },
                          ].map(node => (
                            <div key={node.name} className="space-y-1.5">
                               <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter">
                                  <span className="text-gray-400">{node.name}</span>
                                  <span className={node.load > 70 ? 'text-red-400' : 'text-green-400'}>{node.load}%</span>
                               </div>
                               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${node.load}%` }}
                                    className={cn("h-full transition-all", node.load > 70 ? "bg-red-500" : "bg-blue-500")}
                                  />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm min-w-[240px]">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Global Distribution</h4>
                       <div className="space-y-3">
                          <div className="flex justify-between items-center p-2 bg-white/5 rounded-xl">
                             <span className="text-xs font-bold">Washington, DC</span>
                             <span className="text la- la- la- la- la- la- la- la- la- la- la- la- la- la- la- l l l la- l l l l la- l la l la l l la l l l lL la- l de la l de l la l l l l l de l
(note: Edit also tried swapping \uXXXX escapes and their characters; neither form matched, so the mismatch is likely elsewhere in old_string. Re-read the file and copy the exact surrounding text.)
