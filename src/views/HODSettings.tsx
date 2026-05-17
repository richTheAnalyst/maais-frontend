import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Shield, 
  Lock, 
  Bell, 
  CheckCircle2,
  Fingerprint,
  Eye,
  EyeOff,
  Building2,
  ClipboardCheck,
  History,
  Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

export function HODSettings() {
  const { user } = useRole();
  const [mfaEnabled, setMfaEnabled] = React.useState(true);
  const [auditFrequency, setAuditFrequency] = React.useState('Daily');
  const [notifications, setNotifications] = React.useState({
    grading: true,
    certification: true,
    security: true
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');

  const strength = (pass: string) => {
    if (!pass) return 0;
    let s = 0;
    if (pass.length >= 10) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic">Command Settings</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Management identity and departmental audit protocols</p>
            </div>
          </div>
        </header>

        <div className="grid gap-12">
          {/* Managerial Profile */}
          <section className="space-y-6">
            <header className="flex items-center justify-between border-b border-gray-100 pb-3">
               <div className="flex items-center gap-2.5">
                 <User size={18} className="text-emerald-900" />
                 <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Exectuive Identity</h2>
               </div>
               <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <CheckCircle2 size={10} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Authority Verified</span>
               </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Staff Name</label>
                <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 italic font-display shadow-sm">
                  {user?.name}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Manager ID</label>
                <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-emerald-950 font-mono tracking-tighter shadow-sm">
                  {user?.id?.toUpperCase() || "MAAIS-HOD-8842"}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Primary Department</label>
                <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 italic font-display flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
                    <Building2 size={16} />
                  </div>
                  Science Department
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Authority Tier</label>
                <div className="px-5 py-4 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl text-[14px] font-black text-emerald-900 italic font-display flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                    <Shield size={16} />
                  </div>
                  Senior Management (HOD)
                </div>
              </div>
            </div>
          </section>

          {/* Departmental Audit Protocol */}
          <section className="space-y-6">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <ClipboardCheck size={18} className="text-emerald-900" />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Audit & Oversight Config</h2>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                  <div className="flex items-center gap-2">
                     <History size={16} className="text-gray-400" />
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Revision Frequency</h3>
                  </div>
                  <div className="flex gap-2">
                     {['Real-time', 'Daily', 'Weekly'].map(freq => (
                       <button 
                         key={freq}
                         onClick={() => setAuditFrequency(freq)}
                         className={cn(
                           "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           auditFrequency === freq 
                             ? "bg-emerald-900 text-white shadow-xl shadow-emerald-900/20" 
                             : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                         )}
                       >
                         {freq}
                       </button>
                     ))}
                  </div>
               </div>

               <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex gap-4">
                     <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
                        <Fingerprint size={22} />
                     </div>
                     <div>
                        <h3 className="text-[13px] font-black text-gray-900 italic font-display">Biometric Lock</h3>
                        <p className="text-[9px] font-medium text-gray-500 uppercase tracking-widest">Grading Approval MFA</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => setMfaEnabled(!mfaEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full relative p-1 transition-all",
                      mfaEnabled ? "bg-emerald-600" : "bg-gray-200"
                    )}
                  >
                    <motion.div 
                      animate={{ x: mfaEnabled ? 24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
               </div>
            </div>
          </section>

          {/* Advanced Security */}
          <section className="space-y-6">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Shield size={18} className="text-emerald-900" />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Management Security</h2>
            </header>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
               <div className="flex items-center gap-2">
                  <Lock size={16} className="text-gray-400" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Master Credential Sync</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-2">
                     <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">New Executive Password</label>
                     <div className="relative">
                       <input 
                         type={showPassword ? "text" : "password"}
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         placeholder="Min characters..."
                         className="w-full px-5 py-4 bg-gray-50 border border-gray-50 rounded-2xl text-[14px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:bg-white transition-all font-mono"
                       />
                       <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                         {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                       </button>
                     </div>
                     <div className="mt-3 flex gap-1 px-0.5">
                       {[1, 2, 3, 4].map((step) => (
                         <div key={step} className={cn("h-1 flex-1 rounded-full transition-all", strength(password) >= step ? "bg-emerald-500" : "bg-gray-100")} />
                       ))}
                     </div>
                  </div>
                  <button className="h-[52px] px-6 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2">
                     <Key size={14} />
                     Propagate Credentials
                  </button>
               </div>
            </div>
          </section>

          {/* Command Alerts */}
          <section className="space-y-6">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Bell size={18} className="text-emerald-900" />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Managerial Alert Channels</h2>
            </header>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-6">
               {[
                 { id: 'grading', label: 'Department Grading Alerts', desc: 'Notify on unauthorized mark revisions.' },
                 { id: 'certification', label: 'Certification Batch Alerts', desc: 'Sync when report batches are ready for audit.' },
                 { id: 'security', label: 'System Access Audits', desc: 'Alerts for after-hours vault entry.' }
               ].map((pref, idx) => (
                 <div key={pref.id} className={cn("flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl transition-all group", idx !== 2 && "mb-1")}>
                    <div>
                       <h4 className="text-[13px] font-black text-gray-900 italic font-display">{pref.label}</h4>
                       <p className="text-[10px] font-medium text-gray-400 mt-0.5">{pref.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof notifications] }))}
                      className={cn("w-12 h-6 rounded-full relative p-1 transition-all shrink-0", notifications[pref.id as keyof typeof notifications] ? "bg-emerald-600" : "bg-gray-200")}
                    >
                      <motion.div animate={{ x: notifications[pref.id as keyof typeof notifications] ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full shadow-sm" />
                    </button>
                 </div>
               ))}
            </div>
          </section>
        </div>

        <footer className="mt-16 text-center pb-20 lg:pb-0">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield size={12} />
            Command Protocol v4.8 Alpha • Last Override: Yesterday 23:12
          </p>
        </footer>
      </div>
    </div>
  );
}
