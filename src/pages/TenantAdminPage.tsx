import { useState } from 'react';
import { Users, CreditCard, LayoutDashboard, Settings, DollarSign, TrendingUp, UserCheck, AlertTriangle, Building2, Package, Search, Mail, ExternalLink, MoreVertical, Smartphone, Tv, Zap, ShieldCheck, UserPlus, CheckCircle2, XCircle, MoreHorizontal, UserCog } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export default function TenantAdminPage() {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'PRICING'>('OVERVIEW');

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteRole, setInviteRole] = useState('User');

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleAllUsers = () => {
    if (selectedUsers.length === recentUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(recentUsers.map(u => u.id));
    }
  };

  const stats = [
    { label: 'Total Users', value: '1,248', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Daily Revenue', value: '₦84,500', change: '+18.5%', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Active Plans', value: '42', change: '0%', icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'System Health', value: '99.9%', change: 'Stable', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  const recentUsers = [
    { id: 1, name: 'Tobi Ahmed', email: 'tobi@gmail.com', balance: 5400, lastSeen: '2 mins ago', status: 'Active', role: 'User' },
    { id: 2, name: 'Gift Nwosu', email: 'nwosugift@yahoo.com', balance: 120, lastSeen: '15 mins ago', status: 'Active', role: 'Support' },
    { id: 3, name: 'Chinedu Okeke', email: 'okeke.c@service.com', balance: 12500, lastSeen: '1 hour ago', status: 'Suspended', role: 'Manager' },
    { id: 4, name: 'Sarah Alabi', email: 'alabi.s@outlook.com', balance: 0, lastSeen: '3 hours ago', status: 'Active', role: 'User' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                 <Building2 size={16} className="text-white" />
              </div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Tenant Admin: SwiftVtu</h1>
           </div>
           <p className="text-gray-500 text-sm">Monitor your white-label platform and manage consumers.</p>
        </div>
        <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
           {['OVERVIEW', 'USERS', 'PRICING'].map((tab) => (
              <button
                 key={tab}
                 onClick={() => setActiveTab(tab as any)}
                 className={cn(
                    "px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                    activeTab === tab ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "text-gray-500 hover:bg-gray-50"
                 )}
              >
                 {tab}
              </button>
           ))}
        </div>
      </header>

      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 animate-in content-reveal">
           {/* Stats Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => (
                 <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                       <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                          <stat.icon size={24} />
                       </div>
                       <span className={cn(
                          "text-[10px] font-black px-2 py-1 rounded-md",
                          stat.change.startsWith('+') ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                       )}>{stat.change}</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</p>
                 </div>
              ))}
           </div>

           {/* Charts & Monitoring */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 h-80 flex flex-col">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                       <TrendingUp size={18} className="text-blue-600" />
                       Transaction Volume (30D)
                    </h3>
                    <select className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none">
                       <option>Revenue</option>
                       <option>Orders</option>
                    </select>
                 </div>
                 <div className="flex-1 flex items-end gap-2 group">
                    {[30, 45, 25, 60, 42, 70, 55, 32, 65, 50, 45, 80, 75, 40, 90, 85, 30, 45, 25, 60, 42, 70, 55, 32, 65, 50, 45, 80, 75, 100].map((h, i) => (
                       <div key={i} className="flex-1 bg-gray-100 hover:bg-blue-500 rounded-t-sm transition-all" style={{ height: `${h}%` }}>
                          <div className="hidden group-hover:block absolute bottom-full mb-2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100">
                             ₦{h * 100}
                          </div>
                       </div>
                    ))}
                 </div>
                 <div className="flex justify-between mt-4 text-[8px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    <span>1 Apr</span>
                    <span>15 Apr</span>
                    <span>30 Apr</span>
                 </div>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col justify-between overflow-hidden relative shadow-2xl">
                 <div className="relative z-10">
                    <Package size={32} className="text-blue-400 mb-6" />
                    <h3 className="text-2xl font-black mb-2">API Provider</h3>
                    <p className="text-gray-400 text-sm mb-10">You are currently using Sescohubs Core as your upstream provider.</p>
                    <div className="space-y-3">
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-bold">API Status</span>
                          <span className="text-green-400 font-black">ACTIVE</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-gray-500 font-bold">Latency</span>
                          <span className="text-gray-300 font-black">1.2s</span>
                       </div>
                    </div>
                 </div>
                 <button className="mt-8 w-full py-3 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all relative z-10 shadow-lg shadow-blue-900/50">
                    Manage Integration <ExternalLink size={14} />
                 </button>
                 <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              </div>
           </div>

           {/* User Management Section (Preview) */}
           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2">
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                    <Users size={20} className="text-blue-600" />
                    Consumers
                 </h3>
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                       type="text" 
                       placeholder="Search users..." 
                       className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-xs border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <th className="px-8 py-4">User</th>
                          <th className="px-8 py-4">Wallet Balance</th>
                          <th className="px-8 py-4">Current Status</th>
                          <th className="px-8 py-4">Last Seen</th>
                          <th className="px-8 py-4 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {recentUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                   </div>
                                   <div>
                                      <p className="font-bold text-gray-900">{user.name}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5 font-black text-gray-900">₦{user.balance.toLocaleString()}</td>
                             <td className="px-8 py-5">
                                <span className={cn(
                                   "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                                   user.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>{user.status}</span>
                             </td>
                             <td className="px-8 py-5 text-gray-400 font-medium text-xs">{user.lastSeen}</td>
                             <td className="px-8 py-5 text-right">
                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-white group-hover:bg-white">
                                   <MoreVertical size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'USERS' && (
        <div className="space-y-6 animate-in content-reveal">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <input 
                   type="text" 
                   placeholder="Search names, emails, or roles..." 
                   className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-blue-100 transition-all font-medium text-sm shadow-sm"
                 />
              </div>
              <div className="flex gap-3">
                 <button 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                 >
                    <UserPlus size={18} /> Invite User
                 </button>
              </div>
           </div>

           {/* Bulk Actions Bar */}
           {selectedUsers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-gray-900 rounded-2xl flex items-center justify-between shadow-2xl"
              >
                 <div className="flex items-center gap-3">
                    <span className="text-white text-xs font-black uppercase tracking-widest px-3 py-1 bg-white/10 rounded-lg">
                       {selectedUsers.length} Selected
                    </span>
                 </div>
                 <div className="flex gap-2">
                    <button className="px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-green-600">
                       <CheckCircle2 size={14} /> Activate
                    </button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-red-600">
                       <XCircle size={14} /> Suspend
                    </button>
                    <button 
                      onClick={() => setSelectedUsers([])}
                      className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/20"
                    >
                       Cancel
                    </button>
                 </div>
              </motion.div>
           )}

           <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                          <th className="px-8 py-5">
                             <input 
                               type="checkbox" 
                               className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                               onChange={toggleAllUsers}
                               checked={selectedUsers.length === recentUsers.length && recentUsers.length > 0}
                             />
                          </th>
                          <th className="px-4 py-5">Consumer</th>
                          <th className="px-8 py-5">Role</th>
                          <th className="px-8 py-5">Wallet Balance</th>
                          <th className="px-8 py-5">Status</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody className="text-sm">
                       {recentUsers.map((user) => (
                          <tr key={user.id} className={cn(
                            "hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group",
                            selectedUsers.includes(user.id) && "bg-blue-50/30"
                          )}>
                             <td className="px-8 py-5">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  checked={selectedUsers.includes(user.id)}
                                  onChange={() => toggleUserSelection(user.id)}
                                />
                             </td>
                             <td className="px-4 py-5">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs">
                                      {user.name.split(' ').map(n => n[0]).join('')}
                                   </div>
                                   <div>
                                      <p className="font-bold text-gray-900">{user.name}</p>
                                      <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-8 py-5">
                                <div className="flex items-center gap-2">
                                   <UserCog size={14} className="text-gray-400" />
                                   <select className="bg-transparent border-none text-xs font-bold text-gray-700 outline-none cursor-pointer hover:text-blue-600 focus:ring-0 appearance-none">
                                      <option selected={user.role === 'User'}>User</option>
                                      <option selected={user.role === 'Support'}>Support</option>
                                      <option selected={user.role === 'Manager'}>Manager</option>
                                   </select>
                                </div>
                             </td>
                             <td className="px-8 py-5 font-black text-gray-900">₦{user.balance.toLocaleString()}</td>
                             <td className="px-8 py-5">
                                <span className={cn(
                                   "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-tighter",
                                   user.status === 'Active' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>{user.status}</span>
                             </td>
                             <td className="px-8 py-5 text-right">
                                <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg hover:bg-white">
                                   <MoreHorizontal size={18} />
                                </button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'PRICING' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                 <DollarSign size={20} className="text-blue-600" />
                 Markup Controls
              </h3>
              <p className="text-sm text-gray-500 mb-8">Adjust your profit percentage across all service providers globally.</p>
              
              <div className="space-y-6">
                 {[
                    { service: 'MTN Data', current: '5%', icon: Smartphone },
                    { service: 'Airtel CG', current: '7.5%', icon: Smartphone },
                    { service: 'Cable TV', current: '₦100 fixed', icon: Tv },
                    { service: 'Electricity', current: '₦50 fixed', icon: Zap },
                 ].map((p) => (
                    <div key={p.service} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-all">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-gray-400 shadow-sm">
                             <p.icon size={18} />
                          </div>
                          <span className="font-bold text-gray-800">{p.service}</span>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-xs font-black text-blue-600 text-right">{p.current}</span>
                          <button className="text-[10px] font-black text-gray-400 hover:text-blue-600 uppercase tracking-widest">Update</button>
                       </div>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-blue-600 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-center items-center text-center">
              <AlertTriangle size={48} className="mb-6 text-blue-200/50" />
              <h3 className="text-3xl font-black mb-4">Risk Warning</h3>
              <p className="text-blue-100 mb-10 leading-relaxed font-medium">Over-marking your profit margins might reduce your platform's competitiveness. Always monitor your resellers' feedback.</p>
              <button className="w-full max-w-xs py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-700 transition-transform active:scale-95">Set Promo Pricing</button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32" />
           </div>
        </div>
      )}

      {/* Invite Modal Overlay */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
           <motion.div 
             initial={{ scale: 0.95, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100"
           >
              <div className="p-8 border-b border-gray-50 bg-gray-50/50">
                 <h3 className="text-xl font-black text-gray-900 tracking-tight">Invite New User</h3>
                 <p className="text-gray-500 text-xs mt-1">Send an invitation to join your VTU network.</p>
              </div>
              <div className="p-8 space-y-6 text-left">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="e.g. user@gmail.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Assign Role</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['User', 'Support', 'Manager'].map(role => (
                          <button 
                            key={role} 
                            onClick={() => setInviteRole(role)}
                            className={cn(
                              "py-2 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all font-bold",
                              inviteRole === role ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm shadow-blue-100" : "border-gray-100 hover:border-blue-100 text-gray-500"
                            )}
                          >
                             {role}
                          </button>
                       ))}
                    </div>
                 </div>
                 <div className="pt-4 flex gap-3">
                    <button 
                      onClick={() => setIsInviteModalOpen(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                    >
                       Cancel
                    </button>
                    <button 
                      onClick={() => setIsInviteModalOpen(false)}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                    >
                       Send Invitation
                    </button>
                 </div>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  );
}
