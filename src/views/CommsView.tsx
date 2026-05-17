import React, { useState, useRef } from 'react';
import { 
  Send, MessageSquare, Bell, FileText, Printer, Search, Filter, 
  Mail, Phone, Users, ChevronRight, BarChart3, TrendingUp, 
  PieChart, AlertTriangle, CheckCircle2, QrCode, Share2,
  MoreVertical, Clock, MailWarning, Smartphone, History,
  LayoutDashboard, Megaphone, Settings as SettingsIcon,
  ShieldCheck, ArrowUpRight, GraduationCap, RefreshCw,
  Download, Sparkles, Trash2, X, FileDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { TranscriptPrintTemplate } from '../components/TranscriptPrintTemplate';

type ActiveTab = 'ACADEMIC' | 'TRANSCRIPTS' | 'BROADCAST' | 'AUDIT' | 'ANALYTICS';

// --- Mock Data ---

const TRANSCRIPT_REQUESTS = [
  { id: '1', student: 'Ishmael Mensah', year: '2023 Graduate', destination: 'University of Ghana (Admissions)', status: 'PENDING' },
  { id: '2', student: 'Sarah Addo', year: '2024 Graduate', destination: 'Kwame Nkrumah University', status: 'PROCESSING' },
  { id: '3', student: 'Prince Boateng', year: '2022 Graduate', destination: 'Ashesi University', status: 'COMPLETED' },
];

const COMMUNICATION_LOG = [
  { id: '1', type: 'SMS', title: 'PTA Emergency Meeting', date: '2026-04-12 09:45', delivered: 1240, read: 0, failed: 12, urgent: true },
  { id: '2', type: 'APP', title: 'Term 2 Results Published', date: '2026-04-10 14:20', delivered: 1252, read: 1105, failed: 0, urgent: false },
  { id: '3', type: 'SMS', title: 'WASSCE Fee Deadline Reminder', date: '2026-04-05 10:00', delivered: 420, read: 0, failed: 5, urgent: false },
];

const CLASS_PROGRESS = [
  { id: '1', name: '3 Science 1', progress: 100, status: 'COMPLETE', teacher: 'Mrs. Addo' },
  { id: '2', name: '3 Business A', progress: 85, status: 'PENDING', teacher: 'Mr. Boateng' },
  { id: '3', name: '2 Arts 1', progress: 40, status: 'WARNING', teacher: 'Mr. Mensah' },
  { id: '4', name: '1 Home Ec 2', progress: 95, status: 'PENDING', teacher: 'Ms. Owusu' },
  { id: '5', name: '2 Science 2', progress: 100, status: 'COMPLETE', teacher: 'Dr. Lamptey' },
];

const PERFORMANCE_DATA = [
  { subject: 'Core Maths', score: 72 },
  { subject: 'English', score: 68 },
  { subject: 'Int. Science', score: 64 },
  { subject: 'Social Studies', score: 78 },
  { subject: 'Elect. Maths', score: 55 },
  { subject: 'Physics', score: 58 },
];

const ATTENDANCE_TREND = [
  { day: 'Mon', rate: 94 },
  { day: 'Tue', rate: 96 },
  { day: 'Wed', rate: 92 },
  { day: 'Thu', rate: 88 },
  { day: 'Fri', rate: 75 },
];

const ENROLLMENT_STATS = [
  { name: 'Science', value: 450 },
  { name: 'Arts', value: 380 },
  { name: 'Business', value: 310 },
  { name: 'Vocational', value: 240 },
];

const COLORS = ['#0D9488', '#F59E0B', '#3B82F6', '#8B5CF6'];

export const CommsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ACADEMIC');
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Transcript Workspace State
  const [isCompiling, setIsCompiling] = useState(false);
  const [selectedTranscriptStudent, setSelectedTranscriptStudent] = useState<any | null>(null);
  const [showWasscePortal, setShowWasscePortal] = useState(false);
  const [wassceResults, setWassceResults] = useState<{ subject: string; grade: string }[]>([
    { subject: 'Integrated Science', grade: '' },
    { subject: 'Core Mathematics', grade: '' },
    { subject: 'English Language', grade: '' },
    { subject: 'Social Studies', grade: '' },
  ]);

  const handleCompileTranscript = (studentName: string = 'Emmanuel Eshun') => {
    setIsCompiling(true);
    // Simulate compilation logic
    setTimeout(() => {
      setSelectedTranscriptStudent({
        studentName,
        indexNumber: '0054320121',
        program: 'Visual Arts',
        house: 'Aggrey House',
        enrollmentDate: 'Oct 2023',
        completionDate: 'Aug 2026',
        academicHistory: [
          {
            year: '2023/2024 Academic Year',
            term: 'Term 1 (First Term)',
            subjects: [
              { name: 'Core Mathematics', score: 85, grade: 'A1' },
              { name: 'Integrated Science', score: 78, grade: 'B2' },
              { name: 'Graphic Design', score: 92, grade: 'A1' },
              { name: 'English Language', score: 70, grade: 'B2' },
            ]
          },
          {
            year: '2023/2024 Academic Year',
            term: 'Term 2 (Second Term)',
            subjects: [
              { name: 'Core Mathematics', score: 88, grade: 'A1' },
              { name: 'Integrated Science', score: 82, grade: 'A1' },
              { name: 'Graphic Design', score: 95, grade: 'A1' },
              { name: 'English Language', score: 75, grade: 'B2' },
            ]
          }
        ],
        wassceResults: wassceResults.some(r => r.grade !== '') ? wassceResults : undefined
      });
      setIsCompiling(false);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!transcriptRef.current || !selectedTranscriptStudent) return;
    
    setIsExportingPDF(true);
    try {
      const element = transcriptRef.current;
      
      // Temporary style adjustment for high-quality capture
      const originalStyle = element.style.left;
      element.style.left = '0';
      element.style.position = 'fixed';
      element.style.zIndex = '-999';
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      element.style.left = originalStyle;
      element.style.position = 'fixed';
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Transcript_${selectedTranscriptStudent.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] overflow-hidden">
      {/* Module Header */}
      <div className="px-10 py-8 bg-white border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <LayoutDashboard size={10} />
              <span>Administrative Hub</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Communications & Reports</span>
            </div>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none group cursor-default">
              Command Suite <span className="text-brand-teal group-hover:text-amber-500 transition-colors">V3.1</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 overflow-x-auto no-scrollbar">
             {(['ACADEMIC', 'TRANSCRIPTS', 'BROADCAST', 'AUDIT', 'ANALYTICS'] as ActiveTab[]).map((tab) => (
               <button
                 key={tab}
                 onClick={() => setActiveTab(tab)}
                 className={cn(
                   "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                   activeTab === tab 
                    ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200" 
                    : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {tab.replace('_', ' ')}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-10 print:hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'TRANSCRIPTS' && (
            <motion.div 
              key="transcripts"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Transcript Builder Area */}
                <div className="lg:col-span-8 space-y-8">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                    {isCompiling && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                         <RefreshCw size={40} className="text-brand-teal animate-spin mb-4" />
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 animate-pulse">Compiling Historical Data...</p>
                      </div>
                    )}

                    <h3 className="text-2xl font-black italic font-display text-slate-900 mb-6 font-sans">Transcript Builder</h3>
                    <div className="relative mb-8">
                      <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCompileTranscript((e.target as HTMLInputElement).value);
                        }}
                        placeholder="Search Student (Current or Alumni)..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] py-5 pl-16 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-brand-teal/5 transition-all font-sans"
                      />
                    </div>

                    {!selectedTranscriptStudent ? (
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 border-dashed text-center">
                         <FileText size={40} className="text-slate-200 mx-auto mb-4" />
                         <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">Search for a student to initiate compiler logic</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 rounded-[1.5rem] border border-slate-100 p-8">
                         <div className="flex justify-between items-start mb-8">
                            <div className="flex gap-4 items-center">
                               <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm border border-slate-100 font-black text-xl italic font-display">
                                  {selectedTranscriptStudent.studentName.charAt(0)}
                               </div>
                               <div>
                                  <h4 className="text-xl font-black italic font-display text-slate-900 leading-tight">{selectedTranscriptStudent.studentName}</h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{selectedTranscriptStudent.program} • {selectedTranscriptStudent.completionDate}</p>
                               </div>
                            </div>
                             <div className="flex gap-2">
                                <button 
                                  onClick={() => { setSelectedTranscriptStudent(null); }}
                                  className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-rose-500 hover:border-rose-100 transition-all"
                                >
                                   <Trash2 size={18} />
                                </button>
                                <button 
                                  onClick={handleExportPDF}
                                  disabled={isExportingPDF}
                                  className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-all flex items-center gap-2"
                                >
                                   {isExportingPDF ? (
                                      <RefreshCw size={16} className="animate-spin" />
                                   ) : (
                                      <FileDown size={16} />
                                   )}
                                   Export PDF
                                </button>
                                <button 
                                  onClick={handlePrint}
                                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                                >
                                   <Printer size={16} /> Print Transcript
                                </button>
                             </div>
                         </div>

                         <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Index Number</p>
                               <p className="text-[12px] font-bold text-slate-900">{selectedTranscriptStudent.indexNumber}</p>
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-slate-200">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Semesters</p>
                               <p className="text-[12px] font-bold text-slate-900">{selectedTranscriptStudent.academicHistory.length}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 max-w-fit">
                            <ShieldCheck size={14} /> Academic Record Compiled Successfully
                         </div>
                      </div>
                    )}

                    <div className="mt-10 pt-10 border-t border-slate-100">
                      <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                        <History size={16} className="text-brand-teal" />
                        Recent Compilations
                      </h4>
                      <div className="space-y-4">
                        {['Emmanuel Eshun (2024)', 'Abigail Owusu (Current Form 3)', 'Kwame Mensah (2025)'].map((name, i) => (
                           <div 
                             key={i} 
                             onClick={() => handleCompileTranscript(name.split(' (')[0])}
                             className="flex justify-between items-center px-6 py-4 bg-white border border-slate-100 rounded-2xl hover:border-brand-teal transition-all cursor-pointer group"
                           >
                             <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-teal transition-colors">
                                  <FileText size={18} />
                               </div>
                               <span className="text-[13px] font-black italic font-display text-slate-900 tracking-tight">{name}</span>
                             </div>
                             <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                               <Download size={18} />
                             </button>
                           </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                       <ShieldCheck size={100} className="text-slate-900" />
                    </div>
                    <h3 className="text-xl font-black italic font-display text-slate-900 mb-6 font-sans">WASSCE Results Integration</h3>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-md uppercase tracking-tight mb-8">
                       Manually input or batch-upload official West African Senior School Certificate Examination results to finalize alumni transcripts.
                    </p>
                    <button 
                      onClick={() => setShowWasscePortal(true)}
                      className="px-8 py-4 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2"
                    >
                       <ArrowUpRight size={14} /> Open WASSCE Entry Portal
                    </button>
                  </div>
                </div>

                {/* Request Queue Side Panel */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900 mb-6 flex items-center gap-2">
                      <Bell size={16} className="text-amber-500" />
                      Official Request Queue
                    </h4>
                    <div className="space-y-4">
                       {TRANSCRIPT_REQUESTS.map((req) => (
                         <div key={req.id} className="p-5 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                            <div className="flex justify-between items-start mb-3">
                               <div>
                                  <p className="text-[13px] font-black text-slate-900 italic font-display leading-tight">{req.student}</p>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter uppercase">{req.year}</p>
                               </div>
                               <span className={cn(
                                 "text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter",
                                 req.status === 'PENDING' ? "bg-amber-100 text-amber-600" :
                                 req.status === 'PROCESSING' ? "bg-blue-100 text-blue-600" :
                                 "bg-emerald-100 text-emerald-600"
                               )}>
                                 {req.status}
                               </span>
                            </div>
                            <div className="mb-4">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination</p>
                               <p className="text-[10px] font-bold text-slate-600 leading-tight">{req.destination}</p>
                            </div>
                            <button className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                               Compile & Send
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'AUDIT' && (
            <motion.div 
               key="audit"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-8"
            >
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                 <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <History size={18} className="text-brand-teal" />
                       Communication Sent Box (Audit Log)
                    </h3>
                    <div className="flex gap-2">
                       <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                          <Filter size={16} />
                       </button>
                    </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50">
                             <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Channel / Type</th>
                             <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Content / Title</th>
                             <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date Sent</th>
                             <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Receipts (Delivered)</th>
                             <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Engagement (Read)</th>
                             <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-50">
                          {COMMUNICATION_LOG.map((log) => (
                             <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center border",
                                        log.type === 'SMS' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-purple-50 text-purple-600 border-purple-100"
                                      )}>
                                         {log.type === 'SMS' ? <Smartphone size={14} /> : <Bell size={14} />}
                                      </div>
                                      <span className="text-[11px] font-black text-slate-900 italic font-display">{log.type}</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   <div className="flex flex-col">
                                      <span className="text-[14px] font-black text-slate-900 tracking-tight leading-none mb-1">{log.title}</span>
                                      {log.urgent && (
                                        <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-widest">
                                           <AlertTriangle size={8} /> Urgent Logic Applied
                                        </span>
                                      )}
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-[12px] font-bold text-slate-500">{log.date}</td>
                                <td className="px-10 py-6 text-center">
                                   <div className="flex flex-col items-center">
                                      <span className="text-[13px] font-black text-slate-900">{log.delivered}</span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Devices</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <div className="flex flex-col items-center">
                                      <span className={cn(
                                        "text-[13px] font-black",
                                        log.type === 'SMS' ? "text-slate-200" : "text-emerald-600"
                                      )}>
                                        {log.type === 'SMS' ? 'N/A' : `${log.read}`}
                                      </span>
                                      {log.type !== 'SMS' && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Confirmed</span>}
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-right">
                                   <div className="flex items-center justify-end gap-4">
                                      {log.failed > 0 && (
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                           <AlertTriangle size={10} /> {log.failed} Failed
                                        </div>
                                      )}
                                      <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                         <Search size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ACADEMIC' && (
            <motion.div 
              key="academic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Class Progress Dashboard */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Filters for Class Selection */}
                  <div className="bg-white rounded-[2rem] border border-slate-200 p-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Filter by Form</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all font-sans">
                        <option>All Forms</option>
                        <option>SHS 1</option>
                        <option>SHS 2</option>
                        <option>SHS 3</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[150px] space-y-2">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Filter by House</label>
                      <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:ring-2 focus:ring-brand-teal/20 transition-all font-sans">
                        <option>All Houses</option>
                        <option>Aggrey House</option>
                        <option>Guggisberg House</option>
                        <option>Fraser House</option>
                      </select>
                    </div>
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center gap-2">
                       <Search size={14} /> Scan
                    </button>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-10 py-6 border-b border-slate-100 flex justify-between items-center">
                      <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                        <GraduationCap size={18} className="text-brand-teal" />
                        Report Processing Status
                      </h3>
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all">
                        <Filter size={16} />
                      </button>
                    </div>
                    
                    <div className="divide-y divide-slate-50">
                      {CLASS_PROGRESS.map((cls) => (
                        <div key={cls.id} className="px-10 py-6 hover:bg-slate-50 transition-colors flex items-center gap-8">
                          <div className="w-32">
                            <p className="text-[14px] font-black italic font-display text-slate-900 leading-tight">{cls.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">{cls.teacher}</p>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border",
                                cls.status === 'COMPLETE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                cls.status === 'WARNING' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                "bg-blue-50 text-blue-600 border-blue-100"
                              )}>
                                {cls.status}
                              </span>
                              <span className="text-[11px] font-black text-slate-900">{cls.progress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${cls.progress}%` }}
                                className={cn(
                                  "h-full transition-all",
                                  cls.progress === 100 ? "bg-emerald-500" : "bg-brand-teal"
                                )} 
                              />
                            </div>
                          </div>
                          
                          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 hover:border-slate-900 transition-all">
                            Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Batch Controls */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                      <Printer size={100} />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-xl font-black italic font-display mb-6">Batch Processor</h3>
                      
                      <div className="space-y-4 mb-8">
                         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Selection</p>
                            <p className="text-[13px] font-black text-white italic font-display">All SHS 3 (Final Year)</p>
                         </div>
                         
                         <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Show Position</span>
                            <div className="w-10 h-5 bg-emerald-500 rounded-full flex items-center px-1">
                               <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                            </div>
                         </label>

                         <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Inc. Cumulative GPA</span>
                            <div className="w-10 h-5 bg-white/20 rounded-full flex items-center px-1">
                               <div className="w-3 h-3 bg-white/40 rounded-full" />
                            </div>
                         </label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setShowPrintModal(true)}
                          className="py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                        >
                          Batch Print
                        </button>
                        <button 
                          onClick={() => setIsPublishing(true)}
                          className="py-4 bg-brand-teal text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-brand-teal/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                        >
                          {isPublishing ? <RefreshCw size={14} className="animate-spin" /> : <Share2 size={14} />}
                          Release
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                        <QrCode size={24} className="text-slate-900" />
                      </div>
                      <div>
                        <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-900 leading-tight">Digital Verification</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 uppercase tracking-tighter">Forensic Anti-Forgery Shield</p>
                      </div>
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase tracking-tight italic mb-6">
                      Every published report card includes a unique, cryptographically signed QR code mapped to our core student registry.
                    </p>
                    <div className="aspect-square bg-slate-50 rounded-3xl border border-slate-100 p-6 opacity-30 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <QrCode size={60} className="text-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'BROADCAST' && (
            <motion.div 
              key="broadcast"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-10"
            >
              {/* Virtual Notice Board */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10">
                   <h3 className="text-xl font-black italic font-display text-slate-900 mb-8">Virtual Notice Board</h3>
                   
                   <div className="space-y-6">
                      <div className="relative">
                        <textarea 
                          placeholder="What's the update?"
                          className="w-full h-40 bg-slate-50 border border-slate-100 rounded-3xl p-8 text-[14px] font-bold outline-none focus:ring-4 focus:ring-brand-teal/5 transition-all resize-none"
                        />
                        <div className="absolute bottom-6 right-8 flex gap-4">
                           <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:text-slate-900 transition-all">
                              <FileText size={18} />
                           </button>
                           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20">
                              Post Announcement
                           </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest py-3 pr-2">Audience Tags:</span>
                         {['Staff', 'Parents', 'SHS 3', 'Day Students', 'Aggrey House'].map((tag) => (
                           <button key={tag} className="px-5 py-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:border-brand-teal transition-all">
                             {tag}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] pl-6">Active Bulletins</h4>
                   <div className="space-y-4">
                      {[
                        { title: 'Mid-term Assessment Protocols', target: 'Staff' },
                        { title: 'Independence Day Exeat Notice', target: 'Boarders' },
                        { title: 'School Bus Route Modification', target: 'Day Students' }
                      ].map((n, i) => (
                        <div key={i} className="bg-white px-10 py-6 rounded-[2rem] border border-slate-200 shadow-sm flex justify-between items-center group">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400" icon-id="bulletin-icon">
                                 <Megaphone size={20} />
                              </div>
                              <div>
                                 <h5 className="text-[15px] font-black italic font-display text-slate-900 tracking-tight leading-tight">{n.title}</h5>
                                 <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[9px] font-black text-brand-teal uppercase tracking-widest">Tag: {n.target}</span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Active for 4d</span>
                                 </div>
                              </div>
                           </div>
                           <button className="p-3 text-slate-300 hover:text-slate-900 transition-colors">
                              <MoreVertical size={18} />
                           </button>
                        </div>
                      ))}
                   </div>
                </div>
              </div>

              {/* SMS Gateway */}
              <div className="space-y-8">
                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black italic font-display">SMS Gateway</h3>
                       <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center text-brand-teal border border-white/5">
                          <Smartphone size={20} />
                       </div>
                    </div>

                    <div className="space-y-6 mb-10">
                       <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Available Credits</p>
                          <p className="text-3xl font-black italic font-display">14,205 <span className="text-xs font-black uppercase text-slate-600 not-italic ml-2">Units</span></p>
                       </div>

                       <div 
                         onClick={() => setIsUrgent(!isUrgent)}
                         className={cn(
                           "p-6 rounded-3xl border-2 transition-all cursor-pointer group",
                           isUrgent 
                            ? "bg-rose-500/10 border-rose-500 shadow-lg shadow-rose-900/20" 
                            : "bg-white/5 border-white/5 hover:border-white/20"
                         )}
                       >
                          <div className="flex justify-between items-center mb-3">
                             <p className={cn(
                               "text-[10px] font-black uppercase tracking-widest",
                               isUrgent ? "text-rose-400" : "text-slate-400"
                             )}>Urgent Failover Logic</p>
                             <div className={cn(
                               "w-8 h-4 rounded-full flex items-center px-1 transition-all",
                               isUrgent ? "bg-rose-500" : "bg-slate-600"
                             )}>
                                <div className={cn("w-2 h-2 bg-white rounded-full transition-all", isUrgent ? "ml-auto" : "")} />
                             </div>
                          </div>
                          <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tighter">
                             Auto-SMS if push notification remains unread for 15 minutes. Restricted to emergency channels.
                          </p>
                       </div>
                    </div>

                    <button className="w-full py-5 bg-white text-slate-900 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl shadow-white/5">
                       Recharge Gateway
                    </button>
                 </div>

                 <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Delivery Analytics</h3>
                    <div className="space-y-6">
                       {[
                         { icon: CheckCircle2, label: 'Push Success', value: '98.2%', color: 'text-emerald-500' },
                         { icon: MailWarning, label: 'SMS Failovers', value: '42 today', color: 'text-amber-500' },
                         { icon: History, label: 'Uptime', value: '99.9%', color: 'text-brand-teal' }
                       ].map((stat, i) => (
                         <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <stat.icon size={16} className={stat.color} />
                               <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">{stat.label}</span>
                            </div>
                            <span className="text-[12px] font-black font-mono text-slate-600">{stat.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'ANALYTICS' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden">
                    <div className="absolute top-10 right-10 flex gap-4">
                       <button className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-600 flex items-center gap-2">
                          Core Maths <ChevronRight size={12} />
                       </button>
                       <button className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                          Benchmark All
                       </button>
                    </div>
                    <h3 className="text-xl font-black italic font-display text-slate-900 mb-2">Academic Pulse</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 italic">Core Mathematical Performance (Average %)</p>
                    
                    <div className="h-80 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={PERFORMANCE_DATA}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                             <XAxis 
                               dataKey="subject" 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B', textAnchor: 'middle' }} 
                               dy={10}
                             />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} />
                             <Tooltip 
                               cursor={{ fill: '#F1F5F9' }}
                               contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '1rem' }}
                             />
                             <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                {PERFORMANCE_DATA.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#0D9488' : entry.score < 60 ? '#F43F5E' : '#3B82F6'} />
                                ))}
                             </Bar>
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                    <h3 className="text-xl font-black italic font-display text-slate-900 mb-2">Enrollment Matrix</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-10 italic">Population by Study Group</p>
                    
                    <div className="h-64 w-full mb-8">
                       <ResponsiveContainer width="100%" height="100%">
                          <RePieChart>
                             <Pie
                               data={ENROLLMENT_STATS}
                               cx="50%"
                               cy="50%"
                               innerRadius={60}
                               outerRadius={100}
                               paddingAngle={5}
                               dataKey="value"
                             >
                                {ENROLLMENT_STATS.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="white" strokeWidth={4} />
                                ))}
                             </Pie>
                             <Tooltip />
                          </RePieChart>
                       </ResponsiveContainer>
                    </div>

                    <div className="space-y-3">
                       {ENROLLMENT_STATS.map((stat, i) => (
                         <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                               <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                               <span className="text-[11px] font-black uppercase tracking-widest text-slate-600">{stat.name}</span>
                            </div>
                            <span className="text-[13px] font-black text-slate-900 italic font-display">{stat.value}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
                 <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                    <div className="flex justify-between items-center mb-10">
                       <div>
                          <h3 className="text-xl font-black italic font-display text-slate-900 mb-1">Attendance Trends</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Weekly School Pulse (%)</p>
                       </div>
                       <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <TrendingUp size={14} /> +2.4% vs Last WK
                       </div>
                    </div>
                    <div className="h-64 w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={ATTENDANCE_TREND}>
                             <defs>
                                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#0D9488" stopOpacity={0.2}/>
                                   <stop offset="95%" stopColor="#0D9488" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis 
                               dataKey="day" 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} 
                             />
                             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }} domain={[60, 100]} />
                             <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                             <Area type="monotone" dataKey="rate" stroke="#0D9488" strokeWidth={4} fillOpacity={1} fill="url(#colorRate)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 transition-transform group-hover:scale-175 group-hover:rotate-6">
                       <BarChart3 size={200} />
                    </div>
                    <div className="relative z-10 flex flex-col h-full">
                       <h3 className="text-2xl font-black italic font-display mb-2">GES Compliance Sync</h3>
                       <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-sm">
                          Automated generation of Ghana Education Service terminal census reports. Zero-error population mapping.
                       </p>
                       
                       <div className="grid grid-cols-2 gap-6 mt-auto">
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                             <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Staff/Student Ratio</p>
                             <p className="text-3xl font-black italic font-display">1 : 28</p>
                          </div>
                          <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                             <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-2">Region Disparity</p>
                             <p className="text-3xl font-black italic font-display text-amber-400">Low</p>
                          </div>
                       </div>
                       
                       <button className="w-full mt-10 py-5 bg-brand-teal text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                          <Download size={18} /> Export Official census (PDF)
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transcript Print Template (Hidden in UI, visible in Print) */}
      <TranscriptPrintTemplate ref={transcriptRef} data={selectedTranscriptStudent} />

      {/* WASSCE Entry Modal */}
      <AnimatePresence>
        {showWasscePortal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowWasscePortal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-10 shadow-3xl"
             >
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                      <ShieldCheck size={28} />
                   </div>
                   <button 
                     onClick={() => setShowWasscePortal(false)}
                     className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 transition-all"
                   >
                     <X size={20} />
                   </button>
                </div>
                
                <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">WASSCE Data Integration</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-10">Final Core Subject Grading Portal</p>

                <div className="space-y-4 mb-10">
                   {wassceResults.map((res, i) => (
                     <div key={i} className="flex gap-4 items-center">
                        <div className="flex-1">
                           <input 
                             type="text" 
                             readOnly
                             value={res.subject}
                             className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-black uppercase text-slate-400 font-sans"
                           />
                        </div>
                        <div className="w-24">
                           <input 
                             type="text" 
                             placeholder="Grade"
                             value={res.grade}
                             onChange={(e) => {
                               const newResults = [...wassceResults];
                               newResults[i].grade = e.target.value.toUpperCase();
                               setWassceResults(newResults);
                             }}
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-center text-sm font-black text-slate-900 focus:ring-4 focus:ring-brand-teal/5 outline-none transition-all font-sans"
                           />
                        </div>
                     </div>
                   ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button 
                     onClick={() => setShowWasscePortal(false)}
                     className="py-4 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => setShowWasscePortal(false)}
                     className="py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                   >
                     Sync Results
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Batch Print Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowPrintModal(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-3xl overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-teal" />
                <div className="flex justify-between items-start mb-10">
                   <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center border border-slate-100">
                      <Printer size={32} className="text-slate-900" />
                   </div>
                </div>
                
                <h3 className="text-3xl font-black italic font-display text-slate-900 mb-2">Batch Print Workspace</h3>
                <p className="text-slate-400 font-medium leading-relaxed mb-10">
                   Confirm batch parameters for <span className="text-slate-900 font-black">All students in SHS 3 (Final Year)</span>. Total count: <span className="text-slate-900 font-black">425 documents</span>.
                </p>

                <div className="grid grid-cols-2 gap-8 mb-12">
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <SettingsIcon size={14} /> Components to Include
                      </h4>
                      <div className="space-y-4">
                         {['Subject Positions', 'Housemaster’s Remark', 'Academic Conduct Rating', 'Attendance Summary'].map((item) => (
                           <label key={item} className="flex items-center gap-4 cursor-pointer group">
                              <div className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center bg-slate-50 group-hover:border-brand-teal transition-all">
                                 <CheckCircle2 size={14} className="text-brand-teal" />
                              </div>
                              <span className="text-[12px] font-black text-slate-900 italic font-display uppercase tracking-tight">{item}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                   
                   <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-center items-center text-center">
                      <QrCode size={48} className="text-slate-300 mb-4" />
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-2">Cryptographic Seal</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed tracking-tighter">
                         Unique QR verification will be generated bottom-right for all 425 reports.
                      </p>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={() => setShowPrintModal(false)}
                    className="flex-1 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                   >
                     Abort Batch
                   </button>
                   <button className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/40 hover:bg-black transition-all flex items-center justify-center gap-3">
                     <Printer size={18} /> Initiate Print (425 Cards)
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

