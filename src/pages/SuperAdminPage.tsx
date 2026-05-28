import { useState, useEffect } from 'react';
import { ShieldAlert, Users, Building, Activity, DollarSign, Globe, Settings, Lock, Server, BarChart3, Search, MoreVertical, CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { admin } from '../lib/api';
import { toast } from 'sonner';

interface Tenant {
  _id: string;
  name: string;
  slug: string;
  status: 'Active' | 'Suspended';
  plan: string;
  usersCount?: number;
}

export default function SuperAdminPage() {
  const [activeView, setActiveView] = useState<'overview' | 'tenants' | 'system'>('overview');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', slug: '', primaryColor: '#ef4444', secondaryColor: '#b91c1c' });

  useEffect(() => {
    fetchTenants();
  }, []);

  async function fetchTenants() {
    try {
      setIsLoading(true);
      const data = await admin.listTenants();
      setTenants(data.tenants || []);
    } catch (e: any) {
      toast.error(`Failed to fetch tenants: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
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
      setNewTenant({ name: '', slug: '', primaryColor: '#ef4444', secondaryColor: '#b91c1c' });
      await fetchTenants();
    } catch (e: any) {
      toast.error(`Creation failed: ${e.message}`);
    }
  }

  const stats = [
    { label: 'Active Tenants', value: tenants.filter(t => t.status === 'Active').length, change: 'Live', icon: Building, color: 'text-blue-600' },
    { label: 'Total Platforms', value: tenants.length, change: 'Global', icon: Globe, color: 'text-purple-600' },
    { label: 'System Health', value: '99.9%', change: 'Stable', icon: Server, color: 'text-green-600' },
    { label: 'API Nodes', value: '12', change: 'Active', icon: BarChart3, color: 'text-orange-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
              <ShieldAlert size={24} />
           </div>
           <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Super Admin Hub</h1>
              <p className="text-gray-500 text-sm">Sescohubs Infrastructure Monitoring & Global Ecosystem.</p>
           </div>
        </div>
        <div className="flex bg-white rounded-2xl border border-gray-100 p-1 shadow-sm">
           {['overview', 'tenants', 'system'].map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v as any)}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeView === v ? "bg-red-600 text-white shadow-lg shadow-red-100" : "text-gray-500 hover:text-gray-900"
                )}
              >
                {v}
              </button>
           ))}
        </div>
      </header>

      {activeView === 'overview' && (
        <div className="space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map(s => (
                <div key={s.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50", s.color)}>
                         <s.icon size={20} />
                      </div>
                      <span className="text-[10px] font-black text-green-600">{s.change}</span>
                   </div>
                   <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                   <p className="text-2xl font-black text-gray-900 tracking-tighter">{s.value}</p>
                </div>
              ))}
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-3xl p-8 text-white">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="font-bold flex items-center gap-2">
                       <Activity size={18} className="text-red-500" />
                       Infrastructure Health
                    </h3>
                    <span className="text-[10px] font-bold py-1 px-3 bg-green-500/20 text-green-400 rounded-full">ALL SYSTEMS NOMINAL</span>
                 </div>
                 <div className="space-y-6">
                    {[
                      { name: 'Core API Gateway', load: 45 },
                      { name: 'Database Clusters', load: 12 },
                      { name: 'Paystack Webhooks', load: 88 },
                      { name: 'MTN Distribution Node', load: 32 },
                    ].map(sys => (
                       <div key={sys.name} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold">
                             <span className="text-gray-400">{sys.name}</span>
                             <span>{sys.load}% Load</span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                             <motion.div
                               initial={{ width: 0 }}
                               animate={{ width: `${sys.load}%` }}
                               className={cn(
                                 "h-full rounded-full transition-all duration-1000",
                                 sys.load > 80 ? "bg-red-500" : sys.load > 50 ? "bg-orange-500" : "bg-green-500"
                               )}
                             />
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-8">
                    <Activity size={18} className="text-red-500" />
                    Global Log Stream
                 </h3>
                 <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {[
                      { msg: 'New tenant registered: SwiftData.io', time: '1m ago', type: 'info' },
                      { msg: 'System wide backup completed', time: '12m ago', type: 'success' },
                      { msg: 'API High latency detected on Node #4', time: '34m ago', type: 'warning' },
                      { msg: 'Global margin update processed', time: '1h ago', type: 'info' },
                      { msg: 'Suspicious login attempt blocked in US', time: '2h ago', type: 'danger' },
                    ].map((log, i) => (
                       <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-1.5 shrink-0",
                            log.type === 'success' ? "bg-green-500" : log.type === 'warning' ? "bg-orange-500" : log.type === 'danger' ? "bg-red-500" : "bg-blue-500"
                          )} />
                          <div>
                             <p className="text-xs font-bold text-gray-800">{log.msg}</p>
                             <p className="text-[10px] text-gray-400">{log.time}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeView === 'tenants' && (
        <div className="space-y-6">
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in content-reveal">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Building size={20} className="text-red-500" />
                    Tenant Ecosystem
                 </h3>
                 <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-lg shadow-red-100"
                    >
                      <Plus size={14} /> Create Tenant
                    </button>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search domains..."
                        className="pl-10 pr-4 py-2 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-100 transition-all text-xs w-full md:w-64"
                      />
                    </div>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 {isLoading ? (
                    <div className="p-20 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">Loading tenants...</div>
                 ) : (
                    <table className="w-full text-left">
                      <thead>
                         <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-8 py-5">Platform Name</th>
                            <th className="px-8 py-5">Subdomain</th>
                            <th className="px-8 py-5">Users</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Plan Tier</th>
                            <th className="px-8 py-5 text-right">Actions</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm">
                         {tenants.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-10 text-center text-gray-400 font-bold text-xs uppercase tracking-widest">No tenants found</td></tr>
                         ) : (
                            tenants.map(t => (
                              <tr key={t._id} className="hover:bg-gray-50 border-b border-gray-50 last:border-0 group">
                                 <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                       <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center font-bold text-red-600 text-xs">
                                          {t.name[0]}
                                       </div>
                                       <span className="font-bold text-gray-900">{t.name}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-5 text-gray-500 font-medium font-mono text-xs">{t.slug}</td>
                                 <td className="px-8 py-5 font-black text-gray-900">{t.usersCount?.toLocaleString() || 0}</td>
                                 <td className="px-8 py-5">
                                    <div className={cn(
                                       "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                       t.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                    )}>
                                       {t.status === 'Active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                       {t.status}
                                    </div>
                                 </td>
                                 <td className="px-8 py-5">
                                    <span className={cn(
                                       "px-2 py-0.5 rounded-md text-[10px] font-black tracking-widest uppercase",
                                       t.plan === 'Enterprise' ? "bg-purple-100 text-purple-700" : t.plan === 'Pro' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                                    )}>{t.plan}</span>
                                 </td>
                                 <td className="px-8 py-5 text-right">
                                    <button
                                      onClick={() => setSelectedTenant(t)}
                                      className="px-4 py-2 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black tracking-widest uppercase border border-gray-100 hover:bg-white hover:shadow-sm transition-all shadow-gray-100"
                                    >
                                       Manage
                                    </button>
                                 </td>
                              </tr>
                            ))
                         )}
                      </tbody>
                    </table>
                 )}
              </div>
           </div>
        </div>
      )}

      {activeView === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in content-reveal">
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                       <Server size={20} className="text-red-500" />
                       API Providers
                    </h3>
                    <button className="text-[10px] font-black text-red-600 uppercase tracking-widest hover:underline">+ Add Provider</button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                       { name: 'Sescohubs Core', type: 'Primary', status: 'Online', reliability: '99.9%' },
                       { name: 'MTN Distribution', type: 'Specialized', status: 'Online', reliability: '98.5%' },
                       { name: 'Glo Gateway', type: 'Legacy', status: 'Offline', reliability: '72.0%' },
                       { name: 'Airtime Hub', type: 'Specialized', status: 'Online', reliability: '99.2%' },
                    ].map((provider) => (
                       <div key={provider.name} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col justify-between h-32 hover:border-red-200 transition-all">
                          <div className="flex justify-between items-start">
                             <div>
                                <p className="font-black text-gray-900 text-sm tracking-tight">{provider.name}</p>
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{provider.type}</p>
                             </div>
                             <div className={cn(
                                "w-10 h-5 rounded-full relative p-1 cursor-pointer transition-colors",
                                provider.status === 'Online' ? "bg-green-500" : "bg-gray-300"
                             )}>
                                <div className={cn(
                                   "w-3 h-3 bg-white rounded-full transition-transform",
                                   provider.status === 'Online' ? "translate-x-5" : "translate-x-0"
                                )} />
                             </div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-gray-500">
                             <span>Reliability: {provider.reliability}</span>
                             <span className={provider.status === 'Online' ? 'text-green-600' : 'text-red-600'}>{provider.status}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-8">
                    <DollarSign size={20} className="text-red-500" />
                    Global Pricing Rules
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div>
                          <p className="font-bold text-gray-900 text-sm">Default Profit Margin</p>
                          <p className="text-xs text-gray-400">Applied automatically to all new products across all tenants.</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <input type="text" defaultValue="5.5" className="w-16 px-3 py-2 bg-white border border-gray-100 rounded-xl text-center font-black text-xs outline-none focus:ring-2 focus:ring-red-100" />
                          <span className="font-black text-gray-900">%</span>
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <div>
                          <p className="font-bold text-gray-900 text-sm">System Convenience Fee</p>
                          <p className="text-xs text-gray-400">Fixed platform fee per bill payment transaction.</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <span className="font-black text-gray-900">₦</span>
                          <input type="text" defaultValue="50.00" className="w-20 px-3 py-2 bg-white border border-gray-100 rounded-xl text-center font-black text-xs outline-none focus:ring-2 focus:ring-red-100" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-red-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-between">
              <div className="relative z-10">
                 <Lock size={32} className="text-red-200/50 mb-6" />
                 <h3 className="text-2xl font-black mb-4">Critical Operations</h3>
                 <p className="text-red-100 text-sm mb-8 font-medium">Changes here affect every tenant in the Sescohubs ecosystem. Proceed with absolute caution.</p>
                 <div className="space-y-3">
                    <button className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Clear All System Cache</button>
                    <button className="w-full py-4 bg-white/10 hover:bg-red-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Regenerate Provider Keys</button>
                    <button className="w-full py-4 bg-black/20 text-white/50 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">Reset Revenue Database</button>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
           </div>
        </div>
      )}

      {/* Tenant Management Modal */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <motion.div
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100"
           >
              <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center gap-6">
                 <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-100">
                    {selectedTenant.name[0]}
                 </div>
                 <div className="flex-1">
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedTenant.name}</h3>
                    <p className="text-gray-500 font-mono text-xs">{selectedTenant.slug}</p>
                 </div>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</p>
                       <div className="flex items-center gap-2">
                          <span className={cn(
                             "w-2 h-2 rounded-full",
                             selectedTenant.status === 'Active' ? "bg-green-500" : "bg-red-500"
                          )} />
                          <span className="font-black text-gray-900">{selectedTenant.status}</span>
                       </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subscription Plan</p>
                       <span className="font-black text-gray-900 uppercase tracking-widest text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md">{selectedTenant.plan}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Modify Subscription</h4>
                    <div className="grid grid-cols-3 gap-2">
                       {['Starter', 'Pro', 'Enterprise'].map(plan => (
                          <button
                            key={plan}
                            onClick={() => handleUpdateTenant(selectedTenant._id, { plan })}
                            className={cn(
                               "py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all",
                               selectedTenant.plan === plan ? "border-red-600 bg-red-50 text-red-600" : "border-gray-100 hover:border-red-100"
                            )}
                          >
                             {plan}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="pt-6 flex gap-3">
                    <button
                      onClick={() => setSelectedTenant(null)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                       Close
                    </button>
                    {selectedTenant.status === 'Active' ? (
                       <button
                         onClick={() => handleUpdateTenant(selectedTenant._id, { status: 'Suspended' })}
                         className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                       >
                          <XCircle size={16} /> Suspend Tenant
                       </button>
                    ) : (
                       <button
                         onClick={() => handleUpdateTenant(selectedTenant._id, { status: 'Active' })}
                         className="flex-1 py-4 bg-green-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-100 hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                       >
                          <CheckCircle2 size={16} /> Reactivate Tenant
                       </button>
                    )}
                 </div>
              </div>
           </motion.div>
        </div>
      )}

      {/* Create Tenant Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <motion.div
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
           >
              <div className="p-10 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-gray-900 tracking-tight">Create New Tenant</h3>
                 <button onClick={() => setIsCreateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleCreateTenant} className="p-10 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Platform Name</label>
                    <input
                      type="text"
                      required
                      value={newTenant.name}
                      onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                      placeholder="e.g. SwiftVtu"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm"
                    />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subdomain (Slug)</label>
                    <input
                      type="text"
                      required
                      value={newTenant.slug}
                      onChange={e => setNewTenant({ ...newTenant, slug: e.target.value })}
                      placeholder="e.g. swiftvtu"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-100 transition-all text-sm"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Primary Color</label>
                       <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newTenant.primaryColor}
                            onChange={e => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                          />
                          <input
                            type="text"
                            value={newTenant.primaryColor}
                            onChange={e => setNewTenant({ ...newTenant, primaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-100 transition-all text-xs font-mono"
                          />
                       </div>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Secondary Color</label>
                       <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newTenant.secondaryColor}
                            onChange={e => setNewTenant({ ...newTenant, secondaryColor: e.target.value })}
                            className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                          />
                          <input
                            type="text"
                            value={newTenant.secondaryColor}
                            onChange={e => setNewTenant({ ...newTenant, secondaryColor: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100 outline-none focus:ring-2 focus:ring-red-100 transition-all text-xs font-mono"
                          />
                       </div>
                    </div>
                 </div>
                 <div className="pt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-colors"
                    >
                       Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
                    >
                       Create Tenant
                    </button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}
    </div>
  );
}
