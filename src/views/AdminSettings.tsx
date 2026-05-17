import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Lock, 
  Fingerprint, 
  Globe, 
  Database,
  Cpu,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

export function AdminSettings() {
  const { user } = useRole();
  const [mfaEnabled, setMfaEnabled] = React.useState(true);
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic uppercase">Executive Identity</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">High-level institutional security & protocol management</p>
            </div>
          </div>
          <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Authority Tier: ALPHA</span>
          </div>
        </header>

        <div className="grid gap-8">
          {/* Admin Identity */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <User className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">System Administrator Profile</h2>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Executive Name</label>
                <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 tracking-tight">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Executive ID (Static)</label>
                <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-300 tracking-tight">
                  ADM-CRYPT-001
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Primary Focus</label>
                <div className="px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 tracking-tight">
                  Global Infrastructure & Security Node
                </div>
              </div>
              <div>
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block">Assigned Role</label>
                <div className="px-5 py-3.5 bg-purple-50 border border-purple-100 rounded-2xl text-[11px] font-black text-purple-700 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} />
                  {user?.role}
                </div>
              </div>
            </div>
          </section>

          {/* Global Protocols */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Zap className="text-amber-500" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Global Protocol Management</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-6 bg-rose-50/30 rounded-3xl border border-rose-100 group transition-all hover:bg-rose-50/50">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm ring-1 ring-inset ring-rose-100">
                    <ShieldAlert size={28} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Maintenance Mode (Global Interruption)</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 max-w-sm">Divert all biological nodes to maintenance sub-page. Restricted to system technicians.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMaintenanceMode(!maintenanceMode)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative p-1.5",
                    maintenanceMode ? "bg-rose-600 shadow-lg shadow-rose-900/20" : "bg-gray-200"
                  )}
                >
                  <motion.div 
                    animate={{ x: maintenanceMode ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100 group transition-all hover:bg-emerald-50/50">
                <div className="flex gap-5">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm ring-1 ring-inset ring-emerald-100">
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-black text-gray-900 tracking-tight">Alpha-Level Biometrics</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 max-w-sm">Enforce cryptographic verification for all certification locks institution-wide.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative p-1.5",
                    mfaEnabled ? "bg-emerald-600 shadow-lg shadow-emerald-900/20" : "bg-gray-200"
                  )}
                >
                  <motion.div 
                    animate={{ x: mfaEnabled ? 24 : 0 }}
                    className="w-5 h-5 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Security Node Audit */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-3">
              <Lock className="text-gray-900" size={20} />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Administrative Vault</h2>
            </div>
            <div className="p-8">
               <div className="mb-6">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 block">New Administrative Password</label>
                 <div className="relative">
                   <input 
                     type={showPassword ? "text" : "password"}
                     placeholder="Enter high-entropy credential..."
                     className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-6 text-[14px] font-black text-gray-700 tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all"
                   />
                   <button 
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-900 transition-colors"
                   >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                   </button>
                 </div>
               </div>
               <button className="w-full h-14 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-900/20">
                 Synchronize Alpha Credentials
               </button>
            </div>
          </section>
        </div>

        <footer className="mt-16 text-center pb-20">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] flex items-center justify-center gap-3">
            <ShieldCheck size={14} className="text-emerald-500" />
            MAAIS Core Protocol 8.4.2 • Admin Auth Node 001
          </p>
        </footer>
      </div>
    </div>
  );
}

const ShieldAlert = (props: any) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield-alert">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);
