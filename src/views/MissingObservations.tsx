import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  ArrowRight, 
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { MissingObservation } from '../types';
import { ObservationSidebar } from '../components/ObservationSidebar';

const mockStudents = [
  { id: '001', name: 'Angela Owusu', index: '001', auditStatus: 'MISSING' },
  { id: '002', name: 'Kwame Mensah', index: '002', auditStatus: 'MISSING' },
  { id: '003', name: 'Yaw Boateng', index: '003', auditStatus: 'MISSING' },
  { id: '004', name: 'Esi Ansah', index: '004', auditStatus: 'MISSING' },
  { id: '005', name: 'Kofi Appiah', index: '005', auditStatus: 'MISSING' },
];

const mockMissingObservations: MissingObservation[] = [
  {
    id: 'mo1',
    studentId: '001',
    studentName: 'Angela Owusu',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    missingType: 'Lab Safety',
    department: 'Science'
  },
  {
    id: 'mo2',
    studentId: '002',
    studentName: 'Kwame Mensah',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    missingType: 'Behavioral',
    department: 'General'
  },
  {
    id: 'mo3',
    studentId: '003',
    studentName: 'Yaw Boateng',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    missingType: 'Lab Safety',
    department: 'Science'
  },
  {
    id: 'mo4',
    studentId: '004',
    studentName: 'Esi Ansah',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    missingType: 'Hygienic Practices',
    department: 'Home Economics'
  },
  {
    id: 'mo5',
    studentId: '005',
    studentName: 'Kofi Appiah',
    classId: 'agric-1b',
    className: 'SHS 1 Agric B',
    missingType: 'Resource Economy',
    department: 'Home Economics'
  }
];

export function MissingObservations() {
  const navigate = useNavigate();
  const [observations, setObservations] = React.useState(mockMissingObservations);
  const [selectedObs, setSelectedObs] = React.useState<MissingObservation | null>(null);
  const [observationRatings, setObservationRatings] = React.useState<Record<string, number>>({});
  const [observationComment, setObservationComment] = React.useState('');

  const totalStudents = 42;
  const completedCount = totalStudents - observations.length;
  const progress = Math.round((completedCount / totalStudents) * 100);

  const handleCompleteLog = (obs: MissingObservation) => {
    setSelectedObs(obs);
  };

  const handleSaveObservation = () => {
    if (!selectedObs) return;
    setObservations(prev => prev.filter(o => o.id !== selectedObs.id));
    setSelectedObs(null);
    setObservationRatings({});
    setObservationComment('');
  };

  const safetyRubric = [
    { label: 'Equipment Handling', id: 'equipment' },
    { label: 'Safety Protocol Compliance', id: 'safety' },
    { label: 'Tool Maintenance', id: 'maintenance' },
  ];

  if (selectedObs) {
    return (
      <div className="flex-1 flex flex-col bg-[#F0F4F2] overflow-hidden">
        <div className="flex-1 flex overflow-hidden">
          {/* Main Table Subscreen */}
          <div className="flex-1 overflow-y-auto p-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-5xl mx-auto"
            >
              <button 
                onClick={() => setSelectedObs(null)}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-900 mb-6 transition-colors group"
              >
                <div className="p-2 bg-white rounded-xl border border-gray-200 group-hover:border-gray-300 transition-all shadow-sm">
                  <ArrowLeft size={18} />
                </div>
                <span className="text-sm font-black uppercase tracking-widest">Back to Compliance Feed</span>
              </button>

              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-200 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4 border-r border-gray-100">Index</th>
                      <th className="px-6 py-4 border-r border-gray-100">Student Name</th>
                      <th className="px-6 py-4 border-r border-gray-100 text-center">Current Status</th>
                      <th className="px-6 py-4 text-center">Compliance Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockStudents.map((student) => {
                      const isTarget = student.id === selectedObs.studentId;
                      return (
                        <tr key={student.id} className={cn(
                          "transition-all",
                          isTarget ? "bg-amber-50/30" : "opacity-40 grayscale-[0.5]"
                        )}>
                          <td className="px-6 py-4 text-sm font-bold text-gray-500 border-r border-gray-100">{student.index}</td>
                          <td className="px-6 py-4 text-sm font-black text-gray-900 border-r border-gray-100">{student.name}</td>
                          <td className="px-6 py-4 text-sm font-bold text-center border-r border-gray-100">
                            <div className="flex justify-center">
                              {isTarget ? (
                                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg animate-pulse">LOGGING...</span>
                              ) : (
                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg">PENDING</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-black text-center text-gray-900">
                            {isTarget ? selectedObs.missingType : '---'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          <AnimatePresence>
            <ObservationSidebar
              mode="compliance"
              student={{
                id: selectedObs.studentId,
                name: selectedObs.studentName,
                index: mockStudents.find(s => s.id === selectedObs.studentId)?.index || '---'
              }}
              onClose={() => setSelectedObs(null)}
              ratings={observationRatings}
              onRatingChange={(id, num) => setObservationRatings(prev => ({ ...prev, [id]: num }))}
              comment={observationComment}
              onCommentChange={setObservationComment}
              onSave={handleSaveObservation}
            />
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F4F2] p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <header className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <ClipboardCheck size={24} />
              </div>
              <h1 className="text-3xl font-black text-gray-900">Compliance Shield</h1>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
              <ShieldCheck className="text-emerald-600" size={18} />
              <span className="text-sm font-black text-gray-900">Audit Readiness: {progress}%</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Overall Progress</span>
              <span className="text-sm font-black text-emerald-600">{completedCount} / {totalStudents} Students Logged</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  progress > 90 ? "bg-emerald-500" : "bg-amber-500"
                )}
              />
            </div>
            <p className="text-[10px] font-bold text-amber-600 mt-3 flex items-center gap-1">
              <AlertTriangle size={12} />
              Submission to HOD is locked until 100% completion.
            </p>
          </div>
        </header>

        <div className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {observations.map((obs, idx) => (
              <motion.div
                key={obs.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: 100 }}
                className="bg-white rounded-3xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900">{obs.studentName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold text-gray-400">{obs.className}</span>
                      <span className="text-xs font-bold text-gray-300">•</span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider rounded">
                        Missing: {obs.missingType}
                      </span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleCompleteLog(obs)}
                  className="px-6 py-3 bg-amber-600 text-white rounded-2xl text-sm font-black hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
                >
                  Complete Log
                  <ArrowRight size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {observations.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Audit Passed!</h3>
            <p className="text-gray-500 font-medium">All mandatory observations have been logged. Guardrail lifted.</p>
            <button 
              onClick={() => navigate('/grading')}
              className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-2xl font-black hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
            >
              Go to Final Submission
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
