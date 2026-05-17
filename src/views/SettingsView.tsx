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
  Fingerprint,
  Eye,
  EyeOff
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

export function SettingsView() {
  const { user } = useRole();
  const [mfaEnabled, setMfaEnabled] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    system: true,
    email: true,
    sms: false
  });
  const [showPassword, setShowPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');

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
    <div className="flex-1 overflow-y-auto bg-[#F0F4F2] p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <Settings size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
          </div>
          <p className="text-gray-500 font-medium">Manage your identity, security protocols, and notification preferences.</p>
        </header>

        <div className="grid gap-8">
          {/* Profile Management */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <User className="text-emerald-800" size={20} />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Profile Management</h2>
            </div>
            <div className="p-8 grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Staff Name</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold">
                  {user?.name}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Staff ID</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 font-mono font-bold">
                  MAAIS-2024-8842
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Assigned Department</label>
                <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold">
                  Science Department
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Role</label>
                <div className="px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 font-black text-xs uppercase tracking-widest">
                  {user?.role}
                </div>
              </div>
            </div>
          </section>

          {/* Security Control */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <Shield className="text-emerald-800" size={20} />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Security & MFA</h2>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-700 shadow-sm">
                    <Fingerprint size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900">Biometric / MFA Toggle</h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">Enable Multi-Factor Authentication for high-stakes grading.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  className={cn(
                    "w-14 h-8 rounded-full transition-all relative p-1",
                    mfaEnabled ? "bg-emerald-600" : "bg-gray-300"
                  )}
                >
                  <motion.div 
                    animate={{ x: mfaEnabled ? 24 : 0 }}
                    className="w-6 h-6 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Lock className="text-gray-400" size={18} />
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Password Vault</h3>
                </div>
                <div className="grid gap-6">
                  <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">New Password</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter strong password..."
                        className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                      />
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    {/* Strength Meter */}
                    <div className="mt-3 flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div 
                          key={step}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all",
                            strength >= step 
                              ? (strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-amber-500" : "bg-emerald-500")
                              : "bg-gray-200"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 mt-2">
                      Must include 8+ characters, numbers, and special symbols.
                    </p>
                  </div>
                  <button className="py-4 bg-gray-900 text-white font-black rounded-2xl text-sm hover:bg-black transition-all shadow-lg shadow-gray-900/20">
                    Update Security Credentials
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Notification Preferences */}
          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
              <Bell className="text-emerald-800" size={20} />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Notification Preferences</h2>
            </div>
            <div className="p-8 space-y-4">
              {[
                { id: 'system', label: 'System Notifications', desc: 'In-app alerts for HOD revisions and audit status.', icon: Bell },
                { id: 'email', label: 'Email Alerts', desc: 'Detailed summaries sent to your school email.', icon: Mail },
                { id: 'sms', label: 'SMS Notifications', desc: 'Urgent alerts for off-campus audit weeks.', icon: Smartphone },
              ].map((pref) => (
                <div key={pref.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-emerald-600 transition-all">
                      <pref.icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-gray-900">{pref.label}</h4>
                      <p className="text-xs font-bold text-gray-500">{pref.desc}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof typeof notifications] }))}
                    className={cn(
                      "w-12 h-6 rounded-full transition-all relative p-1",
                      notifications[pref.id as keyof typeof notifications] ? "bg-emerald-600" : "bg-gray-300"
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

        <footer className="mt-12 text-center pb-12">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield size={12} />
            MAAIS Security Protocol v4.2.0 • Last Audit: Today 08:45
          </p>
        </footer>
      </div>
    </div>
  );
}
