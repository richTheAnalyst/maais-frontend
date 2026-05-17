import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Search, 
  History, 
  Activity, 
  Calendar, 
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowLeft,
  Lock,
  ChevronDown,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';

// Historical Audit Nodes
const auditNodes = [
  { 
    id: 'NODE-SHS3-T2-001', 
    term: 'SHS 3 Term 2', 
    category: 'Academic', 
    event: 'Summative Assessment: Elective Physics', 
    score: '92.4%', 
    status: 'Verified', 
    timestamp: '2026-04-12 14:30', 
    signatory: 'HOD Boateng',
    detail: 'Performance index indicates A1 level mastery in electromagnetism modules.'
  },
  { 
    id: 'NODE-SHS3-T2-002', 
    term: 'SHS 3 Term 2', 
    category: 'Practical', 
    event: 'Workshop Proficiency: Electrical Circuits', 
    score: '88.0%', 
    status: 'Verified', 
    timestamp: '2026-04-10 10:15', 
    signatory: 'Ins. Mensah',
    detail: 'Authorized for high-voltage testing. Safety protocol adherence 100%.'
  },
  { 
    id: 'NODE-SHS3-T1-042', 
    term: 'SHS 3 Term 1', 
    category: 'Compliance', 
    event: 'Internal WAEC Readiness Audit', 
    score: 'PASS', 
    status: 'Verified', 
    timestamp: '2025-12-15 09:00', 
    signatory: 'Admin Central',
    detail: 'Continuous assessment nodes verified against system integrity protocols.'
  },
  { 
    id: 'NODE-SHS2-T3-112', 
    term: 'SHS 2 Term 3', 
    category: 'Intervention', 
    event: 'Math Surgery Resolution', 
    score: 'RESOLVED', 
    status: 'Verified', 
    timestamp: '2025-07-22 16:45', 
    signatory: 'Mrs. Owusu',
    detail: 'Remediation completed for circle geometry. Final success rate: 85%.'
  },
  { 
    id: 'NODE-SHS2-T2-088', 
    term: 'SHS 2 Term 2', 
    category: 'Academic', 
    event: 'Mid-Term Assessment: English Language', 
    score: '75.2%', 
    status: 'Verified', 
    timestamp: '2025-03-05 11:30', 
    signatory: 'Admin Central',
    detail: 'Consistent oral proficiency maintained.'
  },
  { 
    id: 'NODE-SHS1-T1-001', 
    term: 'SHS 1 Term 1', 
    category: 'Identity', 
    event: 'Initial Academic Onboarding', 
    score: 'BASELINE', 
    status: 'Verified', 
    timestamp: '2024-09-15 08:00', 
    signatory: 'System Initializer',
    detail: 'Identity verify and initial diagnostic testing completed.'
  },
];

export function JourneyHistoryAudit() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [filter, setFilter] = React.useState('all');

  const filteredNodes = filter === 'all' 
    ? auditNodes 
    : auditNodes.filter(n => n.category.toLowerCase() === filter.toLowerCase());

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] font-sans relative pb-[5%]">
      
      {/* Header Profile Section */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm shadow-emerald-950/5">
        <div className="max-w-5xl mx-auto px-4 py-6 md:px-12 md:py-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <button 
              onClick={() => navigate('/journey')}
              className="flex items-center gap-2 text-[12px] md:text-[13px] font-black text-emerald-700 hover:opacity-70 transition-opacity uppercase tracking-widest"
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div className="flex items-center gap-2 bg-[#F9F9F7] px-2.5 py-1 rounded-full border border-gray-200">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
               <span className="text-[9px] md:text-[10px] font-black text-emerald-700 uppercase tracking-widest leading-none">System Integrity: Verified</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 md:gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 md:gap-3">
                <FileText className="text-emerald-700 shrink-0 w-6 h-6 md:w-7 md:h-7" />
                <h1 className="text-[20px] md:text-[32px] font-black tracking-tight text-gray-900 leading-tight font-display italic">Audit Integrity</h1>
              </div>
              <p className="text-gray-400 font-bold text-[10px] md:text-[14px] uppercase tracking-wide">Historical log of all performance nodes.</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-900 text-white rounded-xl md:rounded-2xl text-[11px] md:text-[13px] font-black transition-all hover:bg-emerald-950 shadow-lg shadow-emerald-900/20 uppercase tracking-widest leading-none">
                <Download size={14} /> Export
              </button>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-[#F9F9F7] shrink-0 rounded-xl md:rounded-2xl flex items-center justify-center text-gray-400 border border-gray-200 shadow-inner">
                <Search size={18} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:px-12 md:py-10 space-y-8 md:space-y-10">
        
        {/* Audit Summary Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Audited Nodes', value: auditNodes.length, icon: History },
            { label: 'Integrity Rating', value: '100%', icon: ShieldCheck },
            { label: 'Time Scoped', value: '2.5 Years', icon: Calendar },
            { label: 'Active Signals', value: '42', icon: Activity },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <stat.icon size={18} className="text-emerald-700" />
                <Lock size={12} className="text-gray-200" />
              </div>
              <div>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-[26px] font-black text-gray-900 tracking-tight italic font-display">{stat.value}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Filter Controls */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 md:pb-4 gap-4 overflow-hidden">
           <div className="flex items-center gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth">
             {['all', 'academic', 'practical', 'compliance', 'intervention'].map(tab => (
               <button 
                 key={tab}
                 onClick={() => setFilter(tab)}
                 className={cn(
                   "text-[12px] md:text-[13px] font-black transition-all pb-3 md:pb-4 -mb-3 md:-mb-4 border-b-2 whitespace-nowrap capitalize uppercase tracking-widest",
                   filter === tab ? "border-emerald-700 text-emerald-700" : "border-transparent text-gray-400 hover:text-gray-600"
                 )}
               >
                 {tab === 'all' ? 'All Active Nodes' : tab}
               </button>
             ))}
           </div>
           <button className="hidden md:flex items-center gap-2 text-[12px] font-black text-gray-400 hover:text-gray-600 border px-3 py-1.5 rounded-xl bg-white uppercase tracking-widest leading-none shrink-0">
             <Filter size={14} /> Filter Detail
           </button>
        </div>

        {/* The Audit Timeline */}
        <div className="relative">
          {/* Vertical Rail */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gray-100 border-l border-dashed border-gray-200" />
          
          <div className="space-y-8 md:space-y-12 relative z-10">
            {filteredNodes.map((node, i) => (
              <motion.div 
                key={node.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 md:gap-8 group"
              >
                {/* Node Indicator */}
                <div className="relative pt-1 shrink-0">
                  <div className={cn(
                    "w-12 h-12 md:w-16 md:h-16 rounded-[1.25rem] bg-white border-2 flex items-center justify-center transition-all shadow-sm ring-4 ring-[#F9F9F7]",
                    node.category === 'Academic' ? "border-emerald-600 text-emerald-600 shadow-[0_0_12px_rgba(5,150,105,0.2)]" :
                    node.category === 'Practical' ? "border-emerald-700 text-emerald-700 opacity-60" :
                    node.category === 'Intervention' ? "border-rose-200 text-rose-500" :
                    "border-gray-200 text-gray-400"
                  )}>
                    {node.category === 'Academic' && <TrendingUp size={20} className="md:w-6 md:h-6" />}
                    {node.category === 'Practical' && <Activity size={20} className="md:w-6 md:h-6" />}
                    {node.category === 'Compliance' && <CheckCircle2 size={20} className="md:w-6 md:h-6" />}
                    {node.category === 'Intervention' && <AlertCircle size={20} className="md:w-6 md:h-6" />}
                    {node.category === 'Identity' && <History size={20} className="md:w-6 md:h-6" />}
                  </div>
                </div>

                {/* Node Detail Card */}
                <div className="flex-1 min-w-0 space-y-3 md:space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] md:text-[11px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded tracking-tighter font-bold uppercase">{node.id}</span>
                      <span className="text-[10px] md:text-[12px] font-black text-gray-400 uppercase tracking-widest leading-none">• {node.term}</span>
                    </div>
                    <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">{node.timestamp}</span>
                  </div>

                  <div className="bg-white p-5 md:p-7 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] group-hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6 mb-4 md:mb-6">
                      <div className="space-y-1">
                        <h4 className="text-[15px] md:text-[20px] font-black text-gray-900 tracking-tight font-display italic leading-tight">{node.event}</h4>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={11} className="text-emerald-600" />
                          <span className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">{node.signatory}</span>
                        </div>
                      </div>
                      <div className="flex md:block items-baseline md:text-right gap-2">
                        <p className="text-[19px] md:text-[28px] font-black text-emerald-700 tracking-tighter leading-none italic font-display">{node.score}</p>
                        <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 leading-none">Outcome</p>
                      </div>
                    </div>

                    <div className="p-4 md:p-5 rounded-xl md:rounded-2xl bg-[#F9F9F7] border border-gray-50">
                      <p className="text-[12px] md:text-[14px] font-bold text-gray-500 leading-relaxed italic line-clamp-3 md:line-clamp-none">
                        "{node.detail}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-100">
                       <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-600" />
                         <span className="text-[9px] md:text-[11px] font-black text-emerald-700 uppercase tracking-widest leading-none">Verified</span>
                       </div>
                       <button className="flex items-center gap-1.5 text-[9px] md:text-[12px] font-black text-gray-400 hover:text-emerald-700 transition-colors uppercase tracking-widest leading-none">
                         Trace <ChevronDown size={14} />
                       </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Integrity Quote */}
        <section className="bg-emerald-900 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-6 md:gap-8 relative overflow-hidden shadow-2xl shadow-emerald-950/20">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
           <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 rounded-2xl md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/20">
             <ShieldCheck size={32} className="text-emerald-400 md:w-12 md:h-12" />
           </div>
           <div className="space-y-2 text-center md:text-left">
             <h3 className="text-xl md:text-2xl font-black font-display italic tracking-tight">Technical Multi-Protocol Validation</h3>
             <p className="text-emerald-100/60 font-bold leading-relaxed max-w-xl text-[12px] md:text-sm italic">
               This audit represents the immutable historical record of academic and compliance nodes. Each entry has been cross-referenced with HOD and HOD authorized technical signals.
             </p>
           </div>
        </section>

      </main>
    </div>
  );
}
