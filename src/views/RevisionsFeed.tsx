import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  ArrowRight, 
  MessageSquare, 
  Clock,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  Zap,
  ChevronLeft,
  PlusCircle,
  MinusCircle,
  History,
  Send,
  Paperclip
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Revision } from '../types';
import { useRole } from '../context/RoleContext';

const mockStudents = [
  { id: '001', name: 'Angela Owusu', index: '001', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1' },
  { id: '002', name: 'Kwame Mensah', index: '002', secA: 20, secB: 30, secC: 15, sba: 15.2, exam: 32.5, final: 47.7, grade: 'D7' },
  { id: '003', name: 'Yaw Boateng', index: '003', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1' },
  { id: '004', name: 'Esi Ansah', index: '004', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1' },
  { id: '005', name: 'Kofi Appiah', index: '005', secA: 35, secB: 50, secC: 38, sba: 28.5, exam: 61.5, final: 90.0, grade: 'A1' },
];

const mockRevisions: Revision[] = [
  {
    id: 'rev1',
    studentId: '001',
    studentName: 'Angela Owusu',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    section: 'Section B: Theory',
    hodComment: 'Total exceeds marks on script. Please verify the raw marks.',
    timestamp: new Date().toISOString(),
    oldValue: 85,
    status: 'PENDING'
  },
  {
    id: 'rev2',
    studentId: '002',
    studentName: 'Kwame Mensah',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    section: 'Section A: Objective',
    hodComment: 'Calculation error on page 1. Should be 20 instead of 25.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    oldValue: 25,
    status: 'PENDING'
  },
  {
    id: 'rev3',
    studentId: '005',
    studentName: 'Esi Ansah',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    section: 'SBA (30%)',
    hodComment: 'Missing project score component.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    oldValue: 15,
    status: 'PENDING'
  }
];

export function RevisionsFeed() {
  const navigate = useNavigate();
  const { user } = useRole();
  const [selectedRev, setSelectedRev] = React.useState<Revision | null>(null);
  const [tempMark, setTempMark] = React.useState('');
  const [isExamExpanded, setIsExamExpanded] = React.useState(true);
  const [teacherReply, setTeacherReply] = React.useState('');

  const isHOD = user?.role === 'HOD';

  const handleGoToEntry = (rev: Revision) => {
    setSelectedRev(rev);
    setTempMark(rev.oldValue.toString());
  };

  if (selectedRev) {
    return (
      <div className="flex-1 flex flex-col bg-[#F9F9F7] overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Main Table Subscreen */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={() => setSelectedRev(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-8 transition-colors group"
              >
                <div className="p-2 bg-white rounded-xl border border-gray-100 group-hover:border-gray-200 transition-all shadow-sm">
                  <ChevronLeft size={18} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{isHOD ? 'Back to Audit Feed' : 'Back to Revision Feed'}</span>
              </button>

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/30 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4 border-r border-gray-50">Index</th>
                      <th className="px-6 py-4 border-r border-gray-50">Student Name</th>
                      {isExamExpanded ? (
                        <>
                          <th className="px-4 py-4 border-r border-gray-50 text-center bg-emerald-50/20 text-emerald-800">Sec A</th>
                          <th className="px-4 py-4 border-r border-gray-50 text-center bg-rose-50/30 text-rose-800">Sec B (Target)</th>
                          <th className="px-4 py-4 border-r border-gray-50 text-center bg-emerald-50/20 text-emerald-800">Sec C</th>
                        </>
                      ) : (
                        <th className="px-4 py-4 border-r border-gray-50 text-center">Exam Total</th>
                      )}
                      <th className="px-6 py-4 text-center">Final Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mockStudents.map((student) => {
                      const isTarget = student.id === selectedRev.studentId;
                      return (
                        <tr key={student.id} className={cn(
                          "transition-all",
                          isTarget ? "bg-rose-50/10" : "opacity-30 grayscale-[0.8]"
                        )}>
                          <td className="px-6 py-4 text-sm font-bold text-gray-400 border-r border-gray-50">{student.index}</td>
                          <td className="px-6 py-4 text-sm font-black text-gray-900 border-r border-gray-50">{student.name}</td>
                          {isExamExpanded ? (
                            <>
                              <td className="px-4 py-4 text-sm font-bold text-center border-r border-gray-50 text-emerald-700">{student.secA}</td>
                              <td className={cn(
                                "px-4 py-4 text-sm font-black text-center border-r border-gray-50",
                                isTarget ? "ring-2 ring-inset ring-rose-500 bg-white" : "text-gray-900"
                              )}>
                                {isTarget && !isHOD ? (
                                  <input 
                                    type="text" 
                                    value={tempMark}
                                    onChange={(e) => setTempMark(e.target.value)}
                                    className="w-12 bg-transparent text-center font-black text-rose-700 focus:outline-none"
                                    autoFocus
                                  />
                                ) : isTarget ? (
                                    <span className="text-rose-700 font-black">{student.secB}</span>
                                ) : student.secB}
                              </td>
                              <td className="px-4 py-4 text-sm font-bold text-center border-r border-gray-50 text-emerald-700">{student.secC}</td>
                            </>
                          ) : (
                            <td className="px-4 py-4 text-sm font-bold text-center border-r border-gray-50">{student.exam}</td>
                          )}
                          <td className="px-6 py-4 text-sm font-black text-center text-gray-900">{student.final}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Context Sidebar */}
          <motion.aside 
            initial={{ x: 340 }}
            animate={{ x: 0 }}
            className="w-80 bg-white border-l border-gray-100 p-8 flex flex-col gap-8 shadow-[-10px_0_30px_rgba(0,0,0,0.01)] shrink-0"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[9px] font-black text-rose-600 uppercase tracking-[0.3em]">
                <ShieldCheck size={14} />
                {isHOD ? 'Audit Parameters' : 'HOD Flag'}
              </div>
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex gap-3">
                  <MessageSquare size={16} className="text-gray-400 mt-1 shrink-0" />
                  <p className="text-[13px] text-gray-700 italic leading-relaxed font-medium">
                    {isHOD ? (
                      "Please verify if this 15-point jump in Section B correlates with the physical script evidence."
                    ) : (
                      <span className="group-hover:text-red-900 transition-colors">
                        <span className="font-black text-red-800 not-italic uppercase text-[10px]">HOD: </span>
                        "{selectedRev.hodComment}"
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">
                  <Send size={14} />
                  {isHOD ? 'Dispatch Comment' : 'Justice Response'}
                </div>
              </div>
              <textarea 
                value={teacherReply}
                onChange={(e) => setTeacherReply(e.target.value)}
                placeholder={isHOD ? "Flag this entry for teacher revision..." : "Briefly state reason for change..."}
                className="w-full h-32 bg-gray-50 border border-gray-100 rounded-2xl p-5 text-[13px] font-medium text-gray-600 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all resize-none italic"
              />
            </div>

            <button 
              onClick={() => setSelectedRev(null)}
              className={cn(
                "w-full py-4.5 font-black rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl",
                isHOD ? "bg-rose-600 text-white hover:bg-black shadow-rose-600/10" : "bg-emerald-900 text-white hover:bg-black shadow-emerald-900/10"
              )}
            >
              {isHOD ? 'Dispatch Audit Flag' : 'Verify Fix & Sync'}
            </button>
          </motion.aside>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8 lg:p-12 pb-32 lg:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10",
                isHOD ? "bg-emerald-950" : "bg-rose-600"
            )}>
              {isHOD ? <ShieldCheck size={28} /> : <AlertCircle size={28} />}
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic">
                  {isHOD ? 'Audit Repository' : 'Revision Feed'}
              </h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">
                  {isHOD ? 'Departmental oversight of assessment integrity' : 'Surgical focus on departmental corrections requested by the HOD'}
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-4">
          {mockRevisions.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-3xl border border-gray-50 p-6 shadow-sm hover:shadow-md transition-all group flex items-center justify-between gap-6"
            >
              <div className="flex gap-4">
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors shrink-0">
                  <GraduationCap size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[15px] font-black text-gray-900 tracking-tight">{rev.studentName}</h3>
                    <span className="text-gray-300">•</span>
                    <span className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">{rev.className}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider rounded">
                      {rev.section}
                    </span>
                    <span className="text-[9px] text-gray-300 font-bold flex items-center gap-1 uppercase tracking-widest">
                      <Clock size={10} />
                      {new Date(rev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 font-medium italic mt-2 line-clamp-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    "{rev.hodComment}"
                  </p>
                </div>
              </div>

              <button 
                onClick={() => handleGoToEntry(rev)}
                className="h-11 px-6 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-900/10 flex items-center gap-2 shrink-0"
              >
                {isHOD ? 'Audit Entry' : 'Fix Entry'}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>

        {mockRevisions.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
              <ShieldCheck size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">All Clear!</h3>
            <p className="text-gray-500 font-medium">No pending revisions from the HOD.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
