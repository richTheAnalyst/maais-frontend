import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Terminal, 
  Database,
  LifeBuoy, 
  MessageSquare, 
  Phone, 
  FileText, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Zap,
  Server,
  Code
} from 'lucide-react';
import { cn } from '../lib/utils';

export function AdminSupport() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12 pb-32 lg:pb-24">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-emerald-950 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-950/20">
              <LifeBuoy size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic uppercase">Executive Engineering Desk</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Direct priority engineering & protocol documentation hub</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
               <Zap size={14} className="text-amber-500" />
               Critical Escalation Nodes
             </div>
             {[
               { label: 'Core Engineering (Direct)', sub: 'Bypass internal desk for system outages', icon: Server, color: 'text-purple-600', bg: 'bg-purple-50' },
               { label: 'Security Response Alpha', icon: ShieldAlert, sub: 'Immediate intervention for data breaches', color: 'text-rose-600', bg: 'bg-rose-50' },
             ].map((channel, i) => (
               <button key={i} className="w-full text-left p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl transition-all group flex items-center gap-6">
                 <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", channel.bg, channel.color)}>
                   <channel.icon size={28} />
                 </div>
                 <div className="flex-1">
                   <p className="text-[14px] font-black text-gray-900 tracking-tight leading-none mb-1.5">{channel.label}</p>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{channel.sub}</p>
                 </div>
                 <ChevronRight size={18} className="text-gray-200 group-hover:text-gray-900 transition-colors" />
               </button>
             ))}
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
             <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">
               <Terminal size={14} />
               Architectural Documentation
             </div>
             <div className="space-y-3">
               {[
                 { label: 'API Integration Registry', icon: Code },
                 { label: 'System Recovery Protocol', icon: Database },
                 { label: 'Admin Procedural Manual', icon: FileText },
                 { label: 'Database Schema Audit', icon: ShieldCheck },
               ].map((doc, i) => (
                 <button key={i} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-all group">
                   <div className="flex items-center gap-4">
                     <doc.icon size={18} className="text-emerald-950 opacity-40 group-hover:opacity-100 transition-opacity" />
                     <span className="text-[12px] font-black text-gray-900 tracking-tight">{doc.label}</span>
                   </div>
                   <ExternalLink size={14} className="text-gray-200" />
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-gray-900/20 relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                 <ShieldCheck size={24} />
               </div>
               <h3 className="text-[18px] font-black tracking-tight italic">Global Infrastructure Guard</h3>
             </div>
             <p className="text-[12px] text-gray-400 font-medium leading-relaxed max-w-xl mb-8">
               Your authority tier grants access to real-time engineering logs and the nuclear maintenance mode. 
               Interactions with core infrastructure are logged at the kernel level. Only proceed under verified protocol compliance.
             </p>
             <button className="px-8 py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all">
                Access Core Logs
             </button>
           </div>
           {/* Abstract pattern decoration */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
        </div>
      </div>
    </div>
  );
}
