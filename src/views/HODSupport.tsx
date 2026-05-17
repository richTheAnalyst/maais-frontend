import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, 
  Activity, 
  MessageSquare, 
  HelpCircle, 
  Camera, 
  Send, 
  CheckCircle2, 
  ChevronRight,
  Shield,
  Zap,
  Terminal,
  Cpu
} from 'lucide-react';
import { cn } from '../lib/utils';

export function HODSupport() {
  const [ticketSubject, setTicketSubject] = React.useState('');
  const [ticketDesc, setTicketDesc] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTicketSubject('');
      setTicketDesc('');
      setTimeout(() => setShowSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic">Executive Support</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Priority technical assistance for departmental oversight</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Managerial Status & FAQ */}
          <div className="space-y-12">
            {/* Command FAQ */}
            <section className="space-y-6">
               <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                  <HelpCircle size={18} className="text-emerald-900" />
                  <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Management FAQ</h2>
               </header>
               <div className="space-y-2">
                  {[
                    "Overriding locked marks",
                    "Bulk report certification",
                    "Teacher audit log access",
                    "Department performance sync"
                  ].map((q, idx) => (
                    <button key={idx} className="w-full p-4 text-left bg-white hover:bg-emerald-50 rounded-2xl transition-all border border-gray-100 hover:border-emerald-100 group flex items-center justify-between shadow-sm">
                       <span className="text-[12px] font-black text-gray-700 italic font-display group-hover:text-emerald-900 leading-tight">{q}</span>
                       <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                  ))}
               </div>
               <button className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-emerald-600 hover:border-emerald-200 transition-all">
                 HOD Training Portal
               </button>
            </section>

            {/* System Command Status */}
            <section className="bg-emerald-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/40">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Terminal size={80} />
               </div>
               <div className="relative z-10">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6">Security Integrity</p>
                  <div className="space-y-5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-lg bg-emerald-900 flex items-center justify-center">
                             <Cpu size={14} className="text-emerald-400" />
                           </div>
                           <span className="text-sm font-black italic font-display tracking-tight">Encryption Hub</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                           <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                        </div>
                     </div>
                     <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-lg bg-emerald-900 flex items-center justify-center">
                             <Zap size={14} />
                           </div>
                           <span className="text-sm font-black italic font-display tracking-tight">Sync Speed</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">0.4ms</span>
                     </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Department Protocols Secure</p>
                  </div>
               </div>
            </section>
          </div>

          {/* Right Column: Priority Support Form */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
               <header className="p-6 border-b border-gray-50 bg-[#F9F9F7]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-white shadow-sm border border-emerald-800">
                      <Zap size={16} />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">Executive Support Desk</h2>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Priority Queue: &lt; 30 Mins</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center gap-2">
                     <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Priority:</span>
                     <span className="text-[11px] font-black text-emerald-900 italic font-display">MANAGERIAL</span>
                  </div>
               </header>

               <form onSubmit={handleSubmit} className="p-8 md:p-10 flex-1 flex flex-col gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Departmental Issue Subject</label>
                    <input 
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g., Bulk certification override needed"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-50 rounded-2xl text-[14px] font-black placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all font-display italic"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Oversight Details</label>
                    <textarea 
                      required
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="Describe the department-wide issue or staff assistance needed..."
                      className="w-full h-40 lg:flex-1 px-6 py-5 bg-gray-50 border border-gray-50 rounded-[2rem] text-[13px] font-bold text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all resize-none italic leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button 
                       type="button"
                       className="p-4 bg-gray-50 text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 flex items-center justify-center gap-3 transition-all hover:bg-gray-100"
                     >
                        <Camera size={16} />
                        Attach Artifact
                     </button>
                     <button 
                       type="submit"
                       disabled={isSubmitting}
                       className={cn(
                         "p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl",
                         isSubmitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-900 text-white hover:bg-black shadow-emerald-900/20"
                       )}
                     >
                        {isSubmitting ? "Initiating Protocol..." : "Sync to Support Command"}
                        {!isSubmitting && <Send size={16} />}
                     </button>
                  </div>
               </form>

               <AnimatePresence>
                  {showSuccess && (
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="m-6 p-6 bg-emerald-950 text-white rounded-3xl border border-emerald-800 shadow-2xl relative overflow-hidden"
                    >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                             <CheckCircle2 size={24} className="text-emerald-400" />
                          </div>
                          <div>
                             <p className="text-[15px] font-black italic font-display tracking-tight">Support Protocol #HOD-942 Active</p>
                             <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mt-0.5">High-priority sync confirmed. Response in &lt; 30m.</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </section>
          </div>
        </div>

        {/* Managerial Support Channels */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 pb-20 lg:pb-0">
           {[
             { label: 'HOD Handbook', icon: Terminal, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Oversight Training', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'Managerial WhatsApp', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Director Support', icon: zap, color: 'text-purple-600', bg: 'bg-purple-50' },
           ].map((link, idx) => (
            <button key={idx} className="flex-1 min-w-[180px] p-5 bg-white border border-gray-50 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all group">
               <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-105", link.bg, link.color)}>
                  <link.icon size={18} />
               </div>
               <span className="text-[9px] font-black text-gray-900 uppercase tracking-widest">{link.label}</span>
            </button>
           ))}
        </div>
      </div>
    </div>
  );
}
const zap = Zap;
