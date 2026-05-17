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
  Search,
  ChevronRight,
  ExternalLink,
  Smartphone,
  BookOpen,
  Mail,
  ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

export function StudentSupport() {
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
              <LifeBuoy size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic">Student Support</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Direct link to ICT assistance and portal status</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Knowledge Base & Status */}
          <div className="space-y-12">
            {/* Rapid FAQ */}
            <section className="space-y-6">
               <header className="flex items-center gap-2.5 border-b border-gray-100 pb-3">
                  <HelpCircle size={18} className="text-emerald-900" />
                  <h2 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.2em]">Common Questions</h2>
               </header>
               <div className="space-y-2">
                  {[
                    "Why is my terminal grade missing?",
                    "How to print my reports?",
                    "Syncing marks with mobile app",
                    "Fixing wrong student info"
                  ].map((q, idx) => (
                    <button key={idx} className="w-full p-4 text-left bg-white hover:bg-emerald-50 rounded-2xl transition-all border border-gray-100 hover:border-emerald-100 group flex items-center justify-between shadow-sm">
                       <span className="text-[12px] font-black text-gray-700 italic font-display group-hover:text-emerald-900 leading-tight">{q}</span>
                       <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                  ))}
               </div>
               <button className="w-full py-3 border-2 border-dashed border-gray-100 rounded-xl text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] hover:text-emerald-600 hover:border-emerald-200 transition-all">
                 Knowledge Base Browser
               </button>
            </section>

            {/* Portal Health */}
            <section className="bg-emerald-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/30">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Activity size={80} />
               </div>
               <div className="relative z-10">
                  <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6">Portal Integrity</p>
                  <div className="space-y-5">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center">
                             <Activity size={14} className="text-emerald-400" />
                           </div>
                           <span className="text-sm font-black italic font-display">Auth Protocol</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                           <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                        </div>
                     </div>
                     <div className="flex items-center justify-between opacity-50">
                        <div className="flex items-center gap-3">
                           <div className="w-7 h-7 rounded-lg bg-emerald-800 flex items-center justify-center">
                             <Activity size={14} />
                           </div>
                           <span className="text-sm font-black italic font-display">Grade Database</span>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest">Syncing</span>
                     </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-white/10 text-center">
                     <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Systems Nominal</p>
                  </div>
               </div>
            </section>
          </div>

          {/* Right Column: Help Request Form */}
          <div className="lg:col-span-2">
            <section className="bg-white rounded-[2rem] border border-gray-100 shadow-sm h-full flex flex-col overflow-hidden">
               <header className="p-6 border-b border-gray-50 bg-[#F9F9F7]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-emerald-900 shadow-sm border border-gray-100">
                      <MessageSquare size={16} />
                    </div>
                    <div>
                        <h2 className="text-[13px] font-black text-gray-900 uppercase tracking-[0.1em]">Student Help Desk</h2>
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Average response: 2 hours</p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
                     <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest">Priority:</span>
                     <span className="text-[11px] font-black text-amber-900 italic font-display">Standard</span>
                  </div>
               </header>

               <form onSubmit={handleSubmit} className="p-8 md:p-10 flex-1 flex flex-col gap-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Case Subject</label>
                    <input 
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g., Spelling error in Math grade"
                      className="w-full px-6 py-4 bg-gray-50 border border-gray-50 rounded-2xl text-[14px] font-black placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all font-display italic"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-0.5">Assistance Details</label>
                    <textarea 
                      required
                      value={ticketDesc}
                      onChange={(e) => setTicketDesc(e.target.value)}
                      placeholder="Include index numbers or term names..."
                      className="w-full h-40 lg:flex-1 px-6 py-5 bg-gray-50 border border-gray-50 rounded-[2rem] text-[13px] font-bold text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:bg-white transition-all resize-none italic leading-relaxed"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button 
                       type="button"
                       className="p-4 bg-emerald-50 text-emerald-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center justify-center gap-3 transition-all hover:bg-emerald-100"
                     >
                        <Camera size={16} />
                        Attach Media
                     </button>
                     <button 
                       type="submit"
                       disabled={isSubmitting}
                       className={cn(
                         "p-4 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl",
                         isSubmitting ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-900 text-white hover:bg-black shadow-emerald-900/20"
                       )}
                     >
                        {isSubmitting ? "Syncing..." : "Submit to Vault"}
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
                      className="m-8 p-8 bg-emerald-950 text-white rounded-[2.5rem] border border-emerald-800 shadow-2xl relative overflow-hidden"
                    >
                       <div className="flex items-center gap-4 relative z-10">
                          <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center shrink-0">
                             <CheckCircle2 size={24} className="text-emerald-400" />
                          </div>
                          <div>
                             <p className="text-[15px] font-black italic font-display tracking-tight">Case #ST-9942 Logged</p>
                             <p className="text-[10px] font-black text-emerald-400/80 uppercase tracking-widest mt-0.5">The ICT Admin has been notified.</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </section>
          </div>
        </div>

        {/* Support Channels */}
        <div className="mt-16 flex flex-wrap justify-center gap-4 pb-20 lg:pb-0">
           {[
             { label: 'Mobile Sync Guide', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Academic Tutorials', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
             { label: 'ICT WhatsApp', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
             { label: 'Official Email', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50' },
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
