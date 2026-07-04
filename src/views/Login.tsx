import React, { useState } from 'react';
import { useRole } from '../context/RoleContext';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, Loader2, AlertCircle, Shield, BookOpen } from 'lucide-react';

export default function Login() {
  const { login } = useRole() as any;
  const [email, setEmail] = useState('admin@mandoshts.edu.gh');
  const [password, setPassword] = useState('Admin@2024!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] flex">
      {/* Left Panel - Branding & Hero */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-900 to-emerald-800 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Decorative shapes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <GraduationCap className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">MAAIS</h1>
              <p className="text-emerald-200/80 text-sm font-medium -mt-1">Academic Audit & Intervention System</p>
            </div>
          </div>
          <div className="mt-20 max-w-md">
            <h2 className="text-4xl font-black text-white leading-tight">
              Welcome back to the best <br />
              <span className="text-emerald-300">Academic Audit & Intervention System</span>
            </h2>
            <p className="mt-4 text-emerald-100/70 text-lg font-medium leading-relaxed">
              Securely access your academic dashboard, manage grades, and oversee institutional performance.
            </p>
          </div>
        </div>

        <div className="relative z-10 text-emerald-200/50 text-sm font-medium border-t border-white/10 pt-6">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-emerald-300" />
{/*             <span>Protected by Mando SHTS Security Protocol</span>
 */}          </div>
          <p className="mt-1 text-xs opacity-60">© 2026 Mando Senior High Technical School</p>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-10"
      >
        <div className="w-full max-w-md">
          {/* Mobile brand (visible only on small screens) */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-emerald-200">
              <GraduationCap className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-black text-gray-900">MAAIS Portal</h1>
            <p className="text-gray-500 font-medium">Academic Audit & Intervention System</p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/80 p-8 md:p-10">
            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">Sign In</h2>
              <p className="text-gray-500 font-medium text-sm mt-1">Enter your institutional credentials</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium"
                >
                  <AlertCircle size={18} className="shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-gray-400"
                    placeholder="name@mandoshts.edu.gh"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium placeholder:text-gray-400"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-base"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
                <BookOpen size={14} />
                Mando SHTS Academic System
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}