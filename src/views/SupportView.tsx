import React from 'react';
import { motion } from 'framer-motion';
import { 
  LifeBuoy, 
  Activity, 
  MessageSquare, 
  HelpCircle, 
  Camera, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Wifi,
  Server,
  ChevronRight,
  Search,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

export function SupportView() {
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
    <div className="flex-1 overflow-y-auto bg-[#F0F4F2] p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <LifeBuoy size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">ICT Bridge</h1>
          </div>
          <p className="text-gray-500 font-medium">Direct link to school ICT support, system status, and knowledge base.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Status & FAQ */}
          <div className="space-y-8 col-span-1">
            {/* System Status Dashboard */}
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <Activity className="text-emerald-800" size={20} />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">System Health</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <Server className="text-emerald-700" size={20} />
                    <span className="text-sm font-black text-emerald-900">Local Server</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="flex items-center gap-3">
                    <Wifi className="text-amber-700" size={20} />
                    <span className="text-sm font-black text-amber-900">Internet Link</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Unstable</span>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 text-center mt-2 italic">
                  Last ping: 2 seconds ago
                </p>
              </div>
            </section>

            {/* FAQ / Knowledge Base */}
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <HelpCircle className="text-emerald-800" size={20} />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Knowledge Base</h2>
              </div>
              <div className="p-4 space-y-2">
                {[
                  "How to handle mid-term transfers?",
                  "Fixing 'PostgreSQL Sync' errors",
                  "MFA setup for new staff",
                  "Exporting for WAEC STP"
                ].map((q, idx) => (
                  <button key={idx} className="w-full p-3 text-left hover:bg-gray-50 rounded-xl transition-colors flex items-center justify-between group">
                    <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-800">{q}</span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-600" />
                  </button>
                ))}
                <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-emerald-200 hover:text-emerald-600 transition-all">
                  View All Guides
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Support Ticket */}
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-emerald-800" size={20} />
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Open Support Ticket</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Priority:</span>
                  <select className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded border-none focus:ring-0">
                    <option>Standard</option>
                    <option>Urgent</option>
                    <option>System Down</option>
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-8 flex-1 flex flex-col gap-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Issue Subject</label>
                  <input 
                    type="text"
                    required
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="e.g., Upload Error in SHS 1 Grading Sheet"
                    className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Detailed Description</label>
                  <textarea 
                    required
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    placeholder="Describe what happened. Include any error codes shown..."
                    className="w-full h-32 md:flex-1 px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    type="button"
                    className="flex items-center justify-center gap-2 py-4 bg-emerald-50 text-emerald-800 font-black rounded-2xl text-sm hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    <Camera size={18} />
                    Auto-Snapshot
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "flex items-center justify-center gap-2 py-4 font-black rounded-2xl text-sm transition-all shadow-lg",
                      isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-emerald-800 text-white hover:bg-emerald-900 shadow-emerald-900/20"
                    )}
                  >
                    {isSubmitting ? "Transmitting..." : "Send to ICT Admin"}
                    {!isSubmitting && <Send size={18} />}
                  </button>
                </div>
              </form>

              {showSuccess && (
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="mx-8 mb-8 p-4 bg-emerald-600 text-white rounded-2xl flex items-center gap-3 shadow-xl"
                >
                  <CheckCircle2 size={24} />
                  <div>
                    <p className="text-sm font-black">Ticket #MAAIS-9928 Created</p>
                    <p className="text-[10px] font-bold text-emerald-100">ICT Admin has been notified. Tracking active.</p>
                  </div>
                </motion.div>
              )}
            </section>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 pb-20 md:pb-0">
          {[
            { label: 'ICT WhatsApp Link', icon: MessageSquare, color: 'text-emerald-600' },
            { label: 'System Documentation', icon: HelpCircle, color: 'text-blue-600' },
            { label: 'Server Logs', icon: Activity, color: 'text-purple-600' },
            { label: 'MAAIS Portal Home', icon: ExternalLink, color: 'text-gray-600' },
          ].map((link, idx) => (
            <button key={idx} className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center gap-3 hover:shadow-md transition-all group">
              <div className={cn("w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center", link.color)}>
                <link.icon size={18} />
              </div>
              <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{link.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
