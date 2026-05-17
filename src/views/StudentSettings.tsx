import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  User, 
  Shield, 
  Lock, 
  Bell, 
  Smartphone, 
  Mail, 
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Fingerprint,
  Users,
  Backpack,
  Key
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

export function StudentSettings() {
  const { user } = useRole();
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [notifications, setNotifications] = React.useState({
    grades: true,
    attendance: true,
    system: false
  });

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[A-Z]/.test(pass)) strength++;
    if (/[0-9]/.test(pass)) strength++;
    if (/[^A-Za-z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic">Vault Settings</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Manage your identity and security protocols</p>
            </div>
          </div>
        </header>

        <div className="grid gap-16">
          {/* Identity & Academic Profile */}
          <section className="space-y-6">
            <header className="flex items-center justify-between border-b border-gray-100 pb-3">
               <div className="flex items-center gap-2.5">
                 <User size={18} className="text-emerald-900" />
                 <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Student Identity Profile</h2>
               </div>
               <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                  <CheckCircle2 size={10} className="text-emerald-600" />
                  <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Verified</span>
               </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Legal Identity</label>
                <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 italic font-display shadow-sm">
                  {user?.name}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Index Number</label>
                <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-emerald-950 font-mono tracking-tighter shadow-sm">
                  {user?.id?.slice(0, 10).toUpperCase() || "MAAIS-001X"}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Current Class</label>
                <div className="px-5 py-4 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-900 italic font-display flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-700">
                    <Backpack size={16} />
                  </div>
                  SHS 3 Science A
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Guardian Link</label>
                <div className="px-5 py-4 bg-emerald-50/20 border border-emerald-100/50 rounded-2xl text-[14px] font-black text-emerald-900 italic font-display flex items-center gap-2.5 shadow-sm">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">
                    <Users size={16} />
                  </div>
                  Eshun, Immanuel
                </div>
              </div>
            </div>
          </section>

          {/* Security & Access */}
          <section className="space-y-6">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Shield size={18} className="text-emerald-900" />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Vault Security Protocols</h2>
            </header>
            
            <div className="space-y-6">
               <div className="flex items-center justify-between gap-6 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                  <div className="flex gap-4">
                     <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-emerald-900 border border-gray-50 shrink-0">
                        <Fingerprint size={28} />
                     </div>
                     <div>
                        <h3 className="text-[13px] font-black text-gray-900 italic font-display">Biometric Authentication</h3>
                        <p className="text-[10px] font-medium text-gray-500 mt-0.5 leading-relaxed">Fingerprint or FaceID identity sync.</p>
                     </div>
                  </div>
                  <button className="w-12 h-6 bg-emerald-600 rounded-full relative p-1 transition-all shrink-0">
                     <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                  </button>
               </div>

               <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                  <div className="flex items-center gap-2">
                     <Lock size={16} className="text-gray-400" />
                     <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Credential Update</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                     <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">New Vault Password</label>
                        <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter characters..."
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-50 rounded-2xl text-[14px] font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/5 focus:bg-white transition-all font-mono"
                          />
                          <button 
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-700"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {/* Strength Meter */}
                        <div className="mt-3 flex gap-1 px-0.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div 
                              key={step}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-all",
                                strength >= step 
                                  ? (strength <= 2 ? "bg-red-400" : strength === 3 ? "bg-amber-400" : "bg-emerald-500")
                                  : "bg-gray-100"
                              )}
                            />
                          ))}
                        </div>
                     </div>
                     <button className="h-[52px] px-6 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-2">
                        <Key size={14} />
                        Sync Credentials
                     </button>
                  </div>
               </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="space-y-6">
            <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
              <Bell size={18} className="text-emerald-900" />
              <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Academic Alert Channels</h2>
            </header>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-6">
               {[
                 { id: 'grades', label: 'Terminal Grade Alerts', desc: 'Real-time sync for verified results.', icon: Mail },
                 { id: 'attendance', label: 'Attendance Digests', desc: 'Daily confirmation of session presence.', icon: Smartphone },
                 { id: 'system', label: 'System Announcements', desc: 'School-wide updates and timetable shifts.', icon: AlertCircle }
               ].map((pref, idx) => (
                 <div key={pref.id} className={cn(
                   "flex items-center justify-between p-4 hover:bg-gray-50/50 rounded-2xl transition-all group",
                   idx !== 2 && "mb-1"
                 )}>
                    <div className="flex gap-4">
                       <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center text-gray-300 border border-gray-50 shadow-sm group-hover:text-emerald-700 transition-colors shrink-0">
                          <pref.icon size={20} />
                       </div>
                       <div>
                          <h4 className="text-[13px] font-black text-gray-900 italic font-display">{pref.label}</h4>
                          <p className="text-[10px] font-medium text-gray-400 mt-0.5">{pref.desc}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setNotifications(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof notifications] }))}
                      className={cn(
                        "w-12 h-6 rounded-full relative p-1 transition-all shrink-0",
                        notifications[pref.id as keyof typeof notifications] ? "bg-emerald-600" : "bg-gray-200"
                      )}
                    >
                      <motion.div 
                        animate={{ x: notifications[pref.id as keyof typeof notifications] ? 24 : 0 }}
                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                 </div>
               ))}
            </div>
          </section>
        </div>

        <footer className="mt-24 text-center border-t border-gray-100 pt-16">
           <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 text-gray-300">
                 <Shield size={16} />
                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Connection Active</p>
              </div>
              <button className="text-xs font-black text-rose-600 uppercase tracking-[0.2em] hover:text-rose-700 transition-colors py-3 px-8 rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100">Sign Out of All Devices</button>
           </div>
        </footer>
      </div>
    </div>
  );
}
