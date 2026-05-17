import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Unlock, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { useRole } from '../context/RoleContext';

interface ClassPerformanceSummary {
  id: string;
  name: string;
  indexNumber: string;
  progress: number;
  isFullyApproved: boolean;
  gradesCount: number;
}

export function HODCertification() {
  const { user } = useRole();
  const [classes, setClasses] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<Record<string, ClassPerformanceSummary[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTerm, setActiveTerm] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [termRes, classesRes] = await Promise.all([
        api.get('/academic/terms/active'),
        api.get('/academic/classes')
      ]);
      
      setActiveTerm(termRes.data);
      setClasses(classesRes.data);

      // Fetch summaries for each class
      const summaryPromises = classesRes.data.map((c: any) => 
        api.get(`/grading/class-summary/${c.id}?termId=${termRes.data.id}`)
          .then(res => ({ classId: c.id, data: res.data }))
      );
      
      const results = await Promise.all(summaryPromises);
      const summaryMap: Record<string, ClassPerformanceSummary[]> = {};
      results.forEach(r => summaryMap[r.classId] = r.data);
      setSummaries(summaryMap);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" size={40} /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-10 flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-900/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display">Certification Command</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Surgical verification & departmental batch export</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {classes.map((cls, idx) => {
            const classSummary = summaries[cls.id] ?? [];
            const approvedCount = classSummary.filter(s => s.isFullyApproved).length;
            const totalStudents = classSummary.length;
            const progress = totalStudents > 0 ? (approvedCount / totalStudents) * 100 : 0;
            const isFullyApproved = totalStudents > 0 && approvedCount === totalStudents;

            return (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all"
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                  isFullyApproved ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                )}>
                  {isFullyApproved ? <ShieldCheck size={24} /> : <FileSpreadsheet size={24} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-[15px] font-black text-gray-900 tracking-tight">{cls.level} {cls.name}</h3>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{totalStudents} Students</span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    {approvedCount} of {totalStudents} Students Certified
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 px-6 border-x border-gray-50 h-10 justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Approval</span>
                    <span className="text-[11px] font-black text-gray-900">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-24 h-1 bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-2">
                  <button 
                    disabled={!isFullyApproved}
                    className={cn(
                      "h-10 px-4 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest",
                      isFullyApproved 
                        ? "bg-emerald-900 text-white hover:bg-black shadow-lg shadow-emerald-900/10" 
                        : "bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100"
                    )}
                  >
                    <Download size={14} />
                    WAEC Export
                  </button>

                  <button className="w-10 h-10 flex items-center justify-center text-gray-300 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
