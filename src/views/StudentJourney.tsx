import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Download, 
  Calendar, 
  Target, 
  ShieldCheck, 
  BookOpen, 
  Activity,
  History,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Database
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area 
} from 'recharts';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

// Mock data for the longitudinal pulse journey
const terms = ['SHS 1-T1', 'SHS1-T2', 'SHS1-T3', 'SHS2-T1', 'SHS2-T2', 'SHS2-T3'];

const journeyData = [
  { term: 'SHS1 T1', score: 68, classAvg: 62 },
  { term: 'SHS1 T2', score: 72, classAvg: 65 },
  { term: 'SHS1 T3', score: 70, classAvg: 68 },
  { term: 'SHS2 T1', score: 78, classAvg: 67 },
  { term: 'SHS2 T2', score: 75, classAvg: 70 },
  { term: 'SHS2 T3', score: 82.4, classAvg: 72 },
];

const observations = [
  { id: '1', date: 'Oct 14, 2025', type: 'Lab Integrity', comment: 'Exhibited high safety protocol compliance during electrical circuit assembly.', teacher: 'Mr. Mensah' },
  { id: '2', date: 'Jan 22, 2026', type: 'Collaborative Skill', comment: 'Led workshop group effectively, ensuring all members participated in the lathe operation.', teacher: 'Dr. Boateng' },
  { id: '3', date: 'Mar 05, 2026', type: 'Theoretical Growth', comment: 'Demonstrates improved grasp of thermodynamic principles in class discussions.', teacher: 'Mrs. Owusu' },
];

const interventions = [
  { 
    id: 'int1', 
    term: 'SHS 2-T2', 
    reason: 'Theory score decline', 
    action: 'Assigned to Peer-to-Peer Technical Writing workshop.', 
    outcome: 'Theory grades normalized by 12% in subsequent terminal audit.' 
  }
];

const getWAECGrade = (score: number): string => {
  if (score >= 80) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
};

export function StudentJourney() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStep, setExportStep] = React.useState(0);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStep(1);
    await new Promise(r => setTimeout(r, 800));
    setExportStep(2);
    await new Promise(r => setTimeout(r, 1200));
    setExportStep(3);
    await new Promise(r => setTimeout(r, 1000));
    setIsExporting(false);
    setExportStep(0);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] font-sans relative">
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-800/95 backdrop-blur-md flex items-center justify-center p-8 text-white text-center"
          >
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={32} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-display italic tracking-tight">
                  {exportStep === 1 && "Verifying Security Nodes..."}
                  {exportStep === 2 && "Collating Historical Data..."}
                  {exportStep === 3 && "Packaging Scholastical PDF..."}
                </h2>
                <p className="text-emerald-200/40 text-[11px] font-black uppercase tracking-[0.2em]">DO NOT CLOSE THIS INTERFACE</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col px-6 py-8 md:px-12 md:py-16 space-y-24 max-w-lg mx-auto md:max-w-7xl pb-[10%]">
        
        {/* Bio Header: Perfect Mirror from ArchiveView */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 px-2">
          <div className="flex flex-col items-center md:flex-row md:items-center gap-8">
            <div className="relative">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || "Student"}`} 
                alt="Student Bio" 
                className="w-28 h-28 rounded-3xl bg-gray-50 p-1 border-4 border-white shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-900/20">
                <User size={20} />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-[32px] md:text-[48px] font-black tracking-tighter text-gray-900 leading-[0.9] font-display italic mb-3">
                {user?.name || "Student"}
              </h1>
              <p className="text-emerald-800 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">Scholastic Longitudinal Portfolio</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">ID: {user?.id?.slice(0,8) || "88GH-001"}</span>
                <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">Technical Dept.</span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">Consistent Performer</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full md:w-auto">
             <button 
                onClick={handleExport}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-900 text-white rounded-[1.5rem] text-[12px] font-black tracking-tight shadow-xl shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <Download size={16} />
                Export Portfolio Transcript
              </button>
              <div className="flex items-center justify-center gap-4">
                <button 
                  onClick={() => navigate('/journey-audit')}
                  className="text-[10px] font-black text-gray-400 hover:text-emerald-700 transition-colors uppercase tracking-[0.2em]"
                >
                  System Audit
                </button>
                <div className="w-1 h-1 rounded-full bg-gray-200" />
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">A-Ranked Portfolio</span>
              </div>
          </div>
        </section>

        {/* Configuration Header (Like Vault Selectors) */}
        <section className="bg-white/40 backdrop-blur-xl p-6 rounded-[2rem] border border-gray-200 shadow-sm flex flex-wrap gap-6 items-center">
           <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
             <Calendar size={14} className="text-emerald-700" />
             <select className="bg-transparent text-[11px] font-black text-gray-900 focus:outline-none cursor-pointer pr-2 uppercase tracking-widest font-mono">
                <option>Active Range: 2024 - 2026</option>
                <option>Phase 1: 2024/25</option>
                <option>Phase 2: 2025/26</option>
             </select>
           </div>
           <div className="flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm italic">
             <ShieldCheck size={14} className="text-emerald-700" />
             <span className="text-[11px] font-black text-emerald-900 uppercase tracking-widest">Audit ID: {user?.id?.slice(0,6) || "99X"}-MAAIS</span>
           </div>
           <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-2 text-gray-400">
                <p className="text-[10px] font-black uppercase tracking-widest">Report View:</p>
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded">Subject-Specific</span>
              </div>
           </div>
        </section>

        {/* 1. TERMINAL PERFORMANCE BREAKDOWN */}
        <section className="space-y-12 px-2">
          <header className="flex items-center gap-3 mb-10 border-b-2 border-emerald-900 pb-2">
            <Database size={24} className="text-emerald-900" />
            <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">1. Terminal Performance Breakdown</h3>
          </header>

          <div className="grid grid-cols-1 gap-12">
            {terms.map((term, tIdx) => (
              <div key={term} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 shadow-[0_12px_40px_rgb(0,0,0,0.03)] overflow-hidden">
                <div className="bg-[#F9F9F7]/80 px-5 py-4 md:px-8 md:py-6 border-b border-gray-100 flex justify-between items-center">
                   <div className="flex items-center gap-3 md:gap-4">
                      <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-900 rounded-lg md:rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">
                         {tIdx + 1}
                      </div>
                      <div>
                        <h4 className="text-[12px] md:text-[13.3px] font-black text-gray-900 uppercase tracking-widest italic font-display">{term} Academic Journal</h4>
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase">Cycle {tIdx + 1}</p>
                      </div>
                   </div>
                   <span className="text-[9px] md:text-[11px] font-black text-emerald-800 bg-emerald-50 px-3 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-widest italic border border-emerald-100 shrink-0">Official</span>
                </div>

                {/* Mobile Tablet View: Card Grid (No Scroll) */}
                <div className="md:hidden p-4 space-y-3">
                   {['Core Math', 'Eng. Language', 'Int. Science', 'Elective Physics', 'Social Studies'].map((subj, sIdx) => {
                      const studentBase = [82, 75, 88, 92, 70][sIdx] || 75;
                      const termVariance = tIdx * 2;
                      const finalTotal = Math.min(100, studentBase + (sIdx % 2 === 0 ? termVariance : -termVariance/2));
                      const sba = Math.round(finalTotal * 0.3);
                      const exam = finalTotal - sba;
                      const letterGrade = getWAECGrade(finalTotal);

                      return (
                        <div key={subj} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                           <div className="flex justify-between items-start mb-3">
                              <div>
                                 <p className="text-[13.3px] font-black text-gray-900 italic font-display">{subj}</p>
                                 <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Academic Dept.</p>
                              </div>
                              <div className={cn(
                                "px-2 py-0.5 rounded-md text-[9px] font-black",
                                finalTotal >= 70 ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-600"
                              )}>
                                {letterGrade}
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                              <div className="text-center">
                                 <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Class</p>
                                 <p className="text-[12px] font-bold text-gray-600 font-mono italic">{sba}</p>
                              </div>
                              <div className="text-center">
                                 <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Exam</p>
                                 <p className="text-[12px] font-bold text-gray-600 font-mono italic">{exam}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">Total</p>
                                 <p className="text-[16px] font-black text-emerald-950 italic font-display">{finalTotal.toFixed(1)}%</p>
                              </div>
                           </div>
                        </div>
                      );
                   })}
                </div>

                {/* Desktop View: Archival Table */}
                <div className="hidden md:block overflow-x-auto no-scrollbar p-2">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="text-[9.5px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                        <th className="py-5 pl-8">Subject Title</th>
                        <th className="py-5 text-center">Class (30)</th>
                        <th className="py-5 text-center">Exam (70)</th>
                        <th className="py-5 text-center">Grade</th>
                        <th className="py-5 text-right pr-8 italic text-emerald-900">Total (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {['Core Math', 'Eng. Language', 'Int. Science', 'Elective Physics', 'Social Studies'].map((subj, sIdx) => {
                         const studentBase = [82, 75, 88, 92, 70][sIdx] || 75;
                         const termVariance = tIdx * 2;
                         const finalTotal = Math.min(100, studentBase + (sIdx % 2 === 0 ? termVariance : -termVariance/2));
                         const sba = Math.round(finalTotal * 0.3);
                         const exam = finalTotal - sba;
                         const letterGrade = getWAECGrade(finalTotal);

                         return (
                           <tr key={subj} className="group hover:bg-[#F9F9F7] transition-all">
                              <td className="py-6 pl-8">
                                 <p className="text-[13.3px] font-black text-gray-900 italic font-display">{subj}</p>
                                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Academic Dept.</p>
                              </td>
                              <td className="py-6 text-center">
                                 <span className="text-[14.2px] font-bold text-gray-600 font-mono tracking-tighter italic">{sba}</span>
                              </td>
                              <td className="py-6 text-center">
                                 <span className="text-[14.2px] font-bold text-gray-600 font-mono tracking-tighter italic">{exam}</span>
                              </td>
                              <td className="py-6 text-center">
                                 <span className={cn(
                                   "px-3 py-1 rounded-lg text-[10px] font-black",
                                   finalTotal >= 70 ? "bg-emerald-100 text-emerald-900" : "bg-gray-100 text-gray-600"
                                 )}>
                                   {letterGrade}
                                 </span>
                              </td>
                              <td className="py-6 text-right pr-8">
                                 <span className="text-[17.1px] font-black text-emerald-950 italic font-display">{finalTotal.toFixed(1)}%</span>
                              </td>
                           </tr>
                         );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Weights Grid: Mirror from Vault */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-16 px-2">
             <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[8px] md:text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Cumulative Pulse</p>
                <p className="text-[22px] md:text-[27px] font-black text-gray-900 italic tracking-tighter font-display italic">78.5%</p>
             </div>
             <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[8px] md:text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Consistency</p>
                <p className="text-[22px] md:text-[27px] font-black text-gray-900 italic tracking-tighter font-display italic">Steady</p>
             </div>
             <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
                <p className="text-[8px] md:text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Percentile</p>
                <p className="text-[22px] md:text-[27px] font-black text-gray-900 italic tracking-tighter font-display italic">Top 12%</p>
             </div>
             <div className="bg-emerald-900 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-emerald-800 text-white shadow-xl">
                <p className="text-[8px] md:text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Vault Registry</p>
                <p className="text-[14px] md:text-[17px] font-black italic tracking-tighter uppercase font-display italic">Verified-V5</p>
             </div>
          </div>
        </section>

        {/* 2. LONGITUDINAL PERFORMANCE TRAJECTORY */}
        <section className="space-y-12 px-2">
          <header className="flex items-center gap-4 mb-8 border-b-2 border-emerald-900 pb-2">
            <TrendingUp size={24} className="text-emerald-900" />
            <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">2. Longitudinal Performance Trajectory</h3>
          </header>

          <div className="bg-[#F8FAFB] p-4 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-gray-200 h-[350px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={journeyData}>
                <defs>
                  <linearGradient id="studentVaultTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#065F46" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#065F46" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '24px', border: 'none', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#065F46" 
                  strokeWidth={6} 
                  fillOpacity={1} 
                  fill="url(#studentVaultTrend)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* 3. FINAL PROFESSIONAL ASSESSMENT */}
        <section className="space-y-12 px-2">
          <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
            <User size={24} className="text-emerald-900" />
            <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">3. Final Professional Assessment</h3>
          </header>

          <div className="bg-[#F8FAFB] p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] border border-gray-200 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-8 opacity-5">
                <Database size={120} className="text-emerald-900" />
             </div>
             <div className="max-w-3xl mx-auto space-y-8 md:space-y-12">
                <blockquote className="text-[18px] md:text-[28px] font-black text-gray-900 italic font-display leading-[1.3] text-center md:text-left">
                   "A terminal powerhouse with a distinct leaning towards workshop proficiency. Theoretical engagement remains the primary hurdle for absolute mastery. Student exhibits high resilience and compliance."
                </blockquote>
                
                <div className="pt-10 md:pt-16 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-32">
                   <div className="text-center md:text-left">
                      <div className="h-px w-full bg-gray-200 mb-4" />
                      <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">HOD Academic Sign-off</p>
                      <p className="text-[11px] md:text-[11.4px] font-black text-emerald-900 mt-1 italic">Dr. Stephen Addo, Ph.D.</p>
                   </div>
                   <div className="text-center md:text-right">
                      <div className="h-px w-full bg-gray-200 mb-4" />
                      <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest">Registrar Vault Stamp</p>
                      <p className="text-[11px] md:text-[11.4px] font-black text-emerald-900 mt-1 italic tracking-widest uppercase">VAULT.VERIFIED.2026</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-12 px-2">
          {/* 4. OBSERVATION ARCHIVE */}
          <section className="space-y-8 md:space-y-10">
            <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
              <History size={24} className="text-emerald-900" />
              <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">4. Observation Archive</h3>
            </header>

            <div className="space-y-4">
              {observations.map((obs) => (
                <div key={obs.id} className="p-4 md:p-6 bg-white border-l-4 border-amber-500 border-y border-r border-gray-100 rounded-r-[1rem] md:rounded-r-[1.5rem] shadow-sm transition-all hover:bg-gray-50/50">
                   <div className="flex justify-between items-center mb-3">
                      <span className="text-[8.5px] font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest leading-none">{obs.type}</span>
                      <span className="text-[8.5px] md:text-[9px] font-black text-gray-300 italic uppercase">{obs.date}</span>
                   </div>
                   <p className="text-[12.3px] md:text-[13.3px] font-bold text-gray-600 italic leading-relaxed">"{obs.comment}"</p>
                   <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">— Witnessed by {obs.teacher}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 5. INTERVENTION HISTORY */}
          <section className="space-y-8 md:space-y-10">
            <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
              <ShieldCheck size={24} className="text-emerald-900" />
              <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">5. Intervention History</h3>
            </header>

            <div className="space-y-6">
              {interventions.map((int) => (
                <div key={int.id} className="bg-gray-900 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-2xl shadow-gray-950/20 relative overflow-hidden">
                   <div className="absolute top-4 right-6 text-[7px] md:text-[8px] font-black text-emerald-400 bg-emerald-900/50 px-2 py-1 rounded">AUDIT VERIFIED</div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400 animate-pulse" />
                      <p className="text-[8.5px] md:text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] font-mono">{int.term} System Flag</p>
                   </div>
                   <div className="space-y-5 md:space-y-6">
                      <div>
                        <p className="text-[8px] md:text-[8.5px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Action Protocol</p>
                        <p className="text-[13px] md:text-[14.2px] font-black font-display italic tracking-tight">{int.action}</p>
                      </div>
                      <div className="p-4 md:p-5 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 backdrop-blur-sm">
                        <p className="text-[8px] md:text-[8.5px] font-black text-emerald-400 uppercase tracking-widest mb-1.5 italic">Observed Yield</p>
                        <p className="text-[11.4px] md:text-[12.3px] font-bold italic text-emerald-100/90 leading-relaxed">"{int.outcome}"</p>
                      </div>
                   </div>
                </div>
              ))}
              <div className="p-6 md:p-8 border-2 border-dashed border-gray-100 rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-50/50 flex flex-col items-center justify-center text-center">
                 <Activity size={24} className="text-gray-300 mb-4" />
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">No active flags at this time</p>
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
