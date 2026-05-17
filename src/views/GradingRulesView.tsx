import React, { useState } from 'react';
import { 
  Settings2, Hash, BookOpen, Clock, 
  ShieldCheck, AlertTriangle, Save, 
  Plus, Trash2, Edit3, Lock, Unlock,
  HelpCircle, ChevronRight, Gauge,
  Palette, History, Info, ShieldAlert,
  Sparkles, List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { useUI } from '../context/UIContext';

interface GradeBoundary {
  id: string;
  min: number;
  max: number;
  grade: string;
  remark: string;
  suggestionPool?: string[];
}

const DEFAULT_REMARK_POOL = {
  Distinction: ['Exceptional performance.', 'Outstanding academic rigor.', 'A masterclass in the subject.'],
  Credit: ['Good work, stay focused.', 'Solid performance with room for growth.', 'Commendable effort.'],
  Pass: ['Satisfactory, but needs more practice.', 'Meeting minimum requirements.', 'Steady progress.'],
  Fail: ['Requires urgent intervention.', 'Inadequate mastery of concepts.', 'Needs intensive remedial support.']
};

const DEFAULT_BOUNDARIES: GradeBoundary[] = [
  { id: '1', min: 80, max: 100, grade: 'A1', remark: 'Excellent: Exceptional performance in all components.', suggestionPool: DEFAULT_REMARK_POOL.Distinction },
  { id: '2', min: 70, max: 79, grade: 'B2', remark: 'Very Good: Highly commendable effort and focus.', suggestionPool: DEFAULT_REMARK_POOL.Distinction },
  { id: '3', min: 65, max: 69, grade: 'B3', remark: 'Good: Solid understanding of core concepts.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '4', min: 60, max: 64, grade: 'C4', remark: 'Credit: Satisfactory performance with consistent results.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '5', min: 55, max: 59, grade: 'C5', remark: 'Credit: Can do better with more effort.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '6', min: 50, max: 54, grade: 'C6', remark: 'Credit: Average performance; needs steady improvement.', suggestionPool: DEFAULT_REMARK_POOL.Credit },
  { id: '7', min: 45, max: 49, grade: 'D7', remark: 'Pass: Meeting minimum standards for the subject.', suggestionPool: DEFAULT_REMARK_POOL.Pass },
  { id: '8', min: 40, max: 44, grade: 'E8', remark: 'Pass: Weak performance; requires reinforcement.', suggestionPool: DEFAULT_REMARK_POOL.Pass },
  { id: '9', min: 0, max: 39, grade: 'F9', remark: 'Fail: Poor performance; remedial sessions highly recommended.', suggestionPool: DEFAULT_REMARK_POOL.Fail },
];

export const GradingRulesView: React.FC = () => {
  const { isTermFinalized, setIsTermFinalized } = useUI();
  const [caWeight, setCaWeight] = useState(30);
  const [examWeight, setExamWeight] = useState(70);
  const [boundaries, setBoundaries] = useState<GradeBoundary[]>(DEFAULT_BOUNDARIES);
  const [normalizationEnabled, setNormalizationEnabled] = useState(true);
  const [deadlineDate, setDeadlineDate] = useState('2026-05-15');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [showSealConfirm, setShowSealConfirm] = useState(false);

  const handleBoundaryChange = (id: string, field: keyof GradeBoundary, value: any) => {
    if (isTermFinalized) return;
    setBoundaries(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleWeightChange = (newCa: number) => {
    if (isTermFinalized) return;
    setCaWeight(newCa);
    setExamWeight(100 - newCa);
  };

  const getTimeRemaining = () => {
    const deadline = new Date(`${deadlineDate}T${deadlineTime}`);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'DEADLINE PASSED';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto relative">
      {/* Final Seal Confirmation Modal */}
      <AnimatePresence>
        {showSealConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowSealConfirm(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-3xl overflow-hidden border border-slate-100"
             >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600" />
                <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
                   <ShieldAlert size={40} className="text-rose-600" />
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 text-center italic font-display mb-4">Execute Final Seal?</h3>
                <p className="text-gray-500 text-center text-sm font-medium leading-relaxed mb-8">
                  This action will <span className="font-black text-rose-600">permanently freeze</span> all marks and assessments for this term. Publication protocols will trigger immediately.
                </p>

                <div className="space-y-4 mb-10">
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Term</p>
                      <p className="text-sm font-black text-slate-900">Academic Year 2025/26 - Term 2</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Impact Radius</p>
                      <p className="text-sm font-black text-slate-900">2,450 Transcripts & 54 Grad sheets</p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={() => setShowSealConfirm(false)}
                    className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                   >
                     Abort
                   </button>
                   <button 
                    onClick={() => {
                      setIsTermFinalized(true);
                      setShowSealConfirm(false);
                    }}
                    className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all"
                   >
                     Finalize Term
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Grading & Assessment Rules</span>
            </div>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none">
              The Grading Protocol
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
              Standardized Assessment Logic & WAEC Calibration
            </p>
          </div>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                <History size={14} /> Audit Trail
             </button>
             {!isTermFinalized && (
               <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all">
                  <Save size={14} /> Commit Changes
               </button>
             )}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 1. Weighting Toggle (The Split) */}
          <div className={cn(
            "lg:col-span-2 space-y-8 transition-opacity",
            isTermFinalized && "opacity-60 pointer-events-none"
          )}>
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Gauge size={80} className="text-slate-900" />
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Settings2 size={16} className="text-brand-teal" />
                    The Global Weighting Toggle
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest leading-relaxed">
                    Define the Continuous Assessment (CA) vs. Examination Split
                  </p>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Standard WASSCE 30/70
                </div>
              </div>

              <div className="space-y-12 py-6">
                <div className="relative">
                  <div className="flex justify-between mb-8 px-4">
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Continuous Assessment</p>
                      <h4 className="text-5xl font-black italic font-display text-slate-900 tracking-tighter">{caWeight}%</h4>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Final Examination</p>
                      <h4 className="text-5xl font-black italic font-display text-slate-900 tracking-tighter text-right">{examWeight}%</h4>
                    </div>
                  </div>
                  
                  <div className="relative h-4 bg-slate-100 rounded-full cursor-pointer flex items-center group/slider">
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={caWeight}
                      onChange={(e) => handleWeightChange(parseInt(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div 
                      className="absolute left-0 top-0 h-full bg-brand-teal rounded-l-full transition-all duration-300" 
                      style={{ width: `${caWeight}%` }}
                    />
                    <div 
                      className="absolute h-8 w-8 bg-white border-4 border-slate-900 rounded-full shadow-xl transition-all duration-300 cursor-grab active:scale-95 z-20"
                      style={{ left: `calc(${caWeight}% - 16px)` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] pointer-events-none">
                      Dynamic Split
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={cn(
                        "w-5 h-5 rounded-md border-2 border-slate-300 flex items-center justify-center transition-all",
                        normalizationEnabled ? "bg-slate-900 border-slate-900" : ""
                      )}>
                        {normalizationEnabled && <ShieldCheck size={12} className="text-white" />}
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={normalizationEnabled}
                          onChange={(e) => setNormalizationEnabled(e.target.checked)}
                        />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Auto-Normalization</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Scale all raw scores to 100% automatically</p>
                      </div>
                    </label>
                  </div>
                  <div className="p-4 bg-brand-teal/5 rounded-2xl border border-brand-teal/10">
                     <div className="flex items-start gap-3">
                        <Info size={16} className="text-brand-teal mt-0.5" />
                        <div>
                           <p className="text-[11px] font-black text-brand-teal uppercase tracking-widest">Departmental Override</p>
                           <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">Allow Tech/Voc to use 40/60 split.</p>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. Grade Boundary Configuration (The WAEC Scale) */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                  <div>
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                       <Palette size={16} className="text-brand-teal" />
                       WAEC Scale Calibration
                    </h3>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Mapping Percentage Thresholds to Terminal Grades</p>
                  </div>
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-slate-900 transition-colors">
                    <HelpCircle size={18} />
                  </button>
               </div>
               
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score Range (%)</th>
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Grade</th>
                        <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Automated Remark (Smart Logic)</th>
                        <th className="px-10 py-5"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {boundaries.map((b) => (
                       <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                         <td className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <input 
                                type="number" 
                                value={b.min}
                                onChange={(e) => handleBoundaryChange(b.id, 'min', parseInt(e.target.value))}
                                className="w-16 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[12px] font-black font-mono text-center outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all"
                              />
                              <span className="text-slate-300 font-black">—</span>
                              <input 
                                type="number" 
                                value={b.max}
                                onChange={(e) => handleBoundaryChange(b.id, 'max', parseInt(e.target.value))}
                                className="w-16 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-[12px] font-black font-mono text-center outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all"
                              />
                           </div>
                         </td>
                         <td className="px-10 py-6 text-center">
                           <span className={cn(
                             "px-4 py-2 rounded-xl text-[14px] font-black italic font-display border",
                             b.grade.startsWith('A') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             b.grade.startsWith('B') ? "bg-blue-50 text-blue-600 border-blue-100" :
                             b.grade.startsWith('C') ? "bg-amber-50 text-amber-600 border-amber-100" :
                             "bg-rose-50 text-rose-600 border-rose-100"
                           )}>
                             {b.grade}
                           </span>
                         </td>
                         <td className="px-10 py-6">
                           <div className="relative flex items-center gap-2">
                             <div className="relative flex-1">
                               <Edit3 size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-brand-teal transition-colors" />
                               <input 
                                 type="text"
                                 value={b.remark}
                                 onChange={(e) => handleBoundaryChange(b.id, 'remark', e.target.value)}
                                 className="w-full pl-10 pr-4 py-3 bg-transparent border border-transparent hover:border-slate-200 rounded-xl text-[12px] font-bold text-slate-600 outline-none focus:bg-white focus:ring-2 focus:ring-brand-teal/20 transition-all font-sans"
                               />
                             </div>
                             
                             {/* Smart Suggestion Dropdown */}
                             <div className="relative group/suggest">
                               <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-brand-teal hover:text-white transition-all border border-slate-100">
                                 <Sparkles size={14} />
                               </button>
                               <div className="absolute right-0 bottom-full mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 hidden group-hover/suggest:block z-50">
                                  <div className="px-3 py-2 border-b border-slate-50 mb-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Suggestions</p>
                                  </div>
                                  {b.suggestionPool?.map((suggestion, idx) => (
                                    <button 
                                      key={idx}
                                      onClick={() => handleBoundaryChange(b.id, 'remark', suggestion)}
                                      className="w-full text-left px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 rounded-lg transition-colors leading-tight"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                  {(!b.suggestionPool || b.suggestionPool.length === 0) && (
                                    <div className="px-3 py-2 text-[10px] font-medium text-slate-400 italic">No templates for this category.</div>
                                  )}
                               </div>
                             </div>
                           </div>
                         </td>
                         <td className="px-10 py-6 text-right">
                            <button className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                              <Trash2 size={16} />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
               
               <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all">
                    <Plus size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Insert New Threshold</span>
                  </button>
               </div>
            </section>
          </div>

          {/* 3. The "Final Seal" (Validation Lock) */}
          <div className="space-y-8">
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -bottom-10 -right-10 opacity-10">
                 <Lock size={200} />
               </div>
               
               <div className="relative z-10">
                 <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] flex items-center justify-center mb-8">
                   {isTermFinalized ? <Lock className="text-rose-400" size={32} /> : <Unlock className="text-emerald-400" size={32} />}
                 </div>
                 
                 <h3 className="text-2xl font-black text-white italic font-display tracking-tight leading-none mb-3">Terminal Validation Lock</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
                   Encrypt and freeze the database for report generation. Once locked, no teacher can modify marks.
                 </p>
                 
                 <div className="space-y-6 mb-12">
                   <div className="flex justify-between items-end">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-3">Submission Deadline</label>
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md mb-2",
                        getTimeRemaining() === 'DEADLINE PASSED' ? "bg-rose-500 text-white" : "bg-emerald-500 text-white"
                      )}>
                        {getTimeRemaining()}
                      </span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div className="relative">
                        <input 
                          type="date" 
                          value={deadlineDate}
                          readOnly={isTermFinalized}
                          onChange={(e) => setDeadlineDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black italic font-display outline-none focus:ring-2 focus:ring-white/20 transition-all active:bg-white/10"
                        />
                     </div>
                     <div className="relative">
                        <input 
                          type="time" 
                          value={deadlineTime}
                          readOnly={isTermFinalized}
                          onChange={(e) => setDeadlineTime(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black italic font-display outline-none focus:ring-2 focus:ring-white/20 transition-all active:bg-white/10"
                        />
                     </div>
                   </div>
                 </div>

                 <button 
                  onClick={() => isTermFinalized ? setIsTermFinalized(false) : setShowSealConfirm(true)}
                  className={cn(
                    "w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3",
                    isTermFinalized 
                      ? "bg-rose-600 text-white shadow-rose-900/40" 
                      : "bg-emerald-600 text-white shadow-emerald-900/40"
                  )}
                 >
                   {isTermFinalized ? <Unlock size={16} /> : <Lock size={16} />}
                   {isTermFinalized ? 'Emergency Unlock Portal' : 'Apply Final Seal (Lock Term 2)'}
                 </button>
                 
                 {isTermFinalized && (
                   <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center mt-6 animate-pulse">
                     Database is currently Read-Only
                   </p>
                 )}
               </div>
            </section>

            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
               <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                  <AlertTriangle size={18} className="text-amber-500" />
                  System Warnings
               </h3>
               <div className="space-y-4">
                 {[
                   { msg: '7 Subject Classes have unentered CA marks.', severity: 'high' },
                   { msg: 'WASSCE Boundary calibration differs from 2025 standard.', severity: 'low' },
                   { msg: 'Normalisation active for raw marks (Base 100).', severity: 'info' }
                 ].map((w, i) => (
                   <div key={i} className={cn(
                     "p-4 rounded-2xl border flex gap-4 items-start",
                     w.severity === 'high' ? "bg-rose-50 border-rose-100 text-rose-900" :
                     w.severity === 'low' ? "bg-amber-50 border-amber-100 text-amber-900" :
                     "bg-blue-50 border-blue-100 text-blue-900"
                   )}>
                     <div className="mt-1">
                        {w.severity === 'high' ? <ShieldCheck size={14} /> : <Info size={14} />}
                     </div>
                     <p className="text-[11px] font-bold leading-tight">{w.msg}</p>
                   </div>
                 ))}
               </div>
               
               <button className="w-full mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all border border-slate-100">
                 Run Compliance Suite
               </button>
            </section>
          </div>

        </div>
      </div>
    </div>
  );
};
