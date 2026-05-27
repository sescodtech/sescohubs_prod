import { useState } from 'react';
import { User, Lock, Bell, Wallet, Shield, Smartphone, Globe, ChevronRight, Save, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <header>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 text-sm">Manage your personal information and security settings.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                  : "text-gray-500 hover:bg-white hover:text-gray-900"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content Areas */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {activeTab === 'profile' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8"
              >
                <div className="flex flex-col items-center md:items-start mb-8">
                   <div className="relative group">
                      <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 text-3xl font-black border-4 border-white shadow-lg">
                         {user?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 text-blue-600 hover:scale-110 transition-transform">
                         <Camera size={16} />
                      </button>
                   </div>
                   <div className="mt-4 text-center md:text-left">
                      <h3 className="text-xl font-bold text-gray-900">{user?.name}</h3>
                      <p className="text-gray-500 text-sm">{user?.email}</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                      <input 
                        type="text" 
                        defaultValue={user?.name}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                      <input 
                        type="email" 
                        defaultValue={user?.email}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Phone Number</label>
                      <input 
                        type="tel" 
                        placeholder="080 1234 5678"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Address</label>
                      <input 
                        type="text" 
                        placeholder="123 Street Name"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-bold"
                      />
                   </div>
                </div>

                <div className="mt-10 pt-6 border-t border-gray-50 flex justify-end">
                   <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      <Save size={18} /> Save Changes
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 space-y-8"
              >
                <div>
                   <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Shield size={20} className="text-blue-600" />
                      Two-Factor Authentication
                   </h3>
                   <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between">
                      <div>
                         <p className="text-sm font-bold text-blue-900">Secure your account</p>
                         <p className="text-xs text-blue-700">Add an extra layer of security to your login process.</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Enable</button>
                   </div>
                </div>

                <div className="space-y-6">
                   <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Lock size={20} className="text-blue-600" />
                      Change Password
                   </h3>
                   <div className="space-y-4">
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Current Password</label>
                         <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">New Password</label>
                         <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Confirm Password</label>
                         <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                      </div>
                   </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 flex justify-end">
                   <button className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">
                      Update Password
                   </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 space-y-6"
              >
                <div className="space-y-4">
                   <h3 className="font-bold text-gray-900 border-b border-gray-50 pb-4">Notification Settings</h3>
                   {[
                      { label: 'Email Notifications', desc: 'Receive updates about your transactions via email.' },
                      { label: 'SMS Alerts', desc: 'Get instant alerts for large wallet disbursements.' },
                      { label: 'Marketing Communications', desc: 'Hear about new features and data promo deals.' },
                   ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-2">
                         <div>
                            <p className="text-sm font-bold text-gray-900">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.desc}</p>
                         </div>
                         <div className="w-12 h-6 bg-blue-600 rounded-full relative p-1 cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                         </div>
                      </div>
                   ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-3xl border border-red-100 p-8">
             <h3 className="text-red-900 font-bold mb-2">Danger Zone</h3>
             <p className="text-red-700 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
             <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center gap-2">
                <LogOut size={18} /> Delete Account
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
