import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  LayoutGrid, 
  List, 
  GraduationCap, 
  ClipboardCheck, 
  AlertTriangle, 
  UserPlus, 
  ArrowRight,
  Timer,
  ShieldAlert,
  FilePlus,
  Link as LinkIcon,
  FileText as FileIcon,
  ExternalLink,
  Plus,
  Trash2,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { TimetableEntry, ResourceMaterial } from '../types';
import { useRole } from '../context/RoleContext';

const mockTimetable: TimetableEntry[] = [
  {
    id: '1',
    day: 'Monday',
    startTime: '08:00',
    endTime: '09:30',
    subjectName: 'General Agric',
    className: 'SHS 1 Agric B',
    venue: 'Classroom 4',
    type: 'REGULAR',
    tasks: ['Check attendance', 'Distribute textbooks'],
    materials: [
      { id: 'm1', title: 'Agric Syllabus 2026', type: 'PDF', url: '#', addedAt: '2026-04-10' },
      { id: 'm2', title: 'Intro to Farming (Video)', type: 'LINK', url: 'https://youtube.com', addedAt: '2026-04-12' }
    ]
  },
  {
    id: '2',
    day: 'Monday',
    startTime: '10:00',
    endTime: '11:30',
    subjectName: 'Soil Science',
    className: 'SHS 2 Science A',
    venue: 'Science Lab 1',
    type: 'LAB',
    missingObservations: 5,
    tasks: ['Soil pH test', 'Safety briefing', 'Equipment cleanup']
  },
  {
    id: '3',
    day: 'Monday',
    startTime: '12:00',
    endTime: '13:30',
    subjectName: 'Animal Husbandry',
    className: 'SHS 3 Agric A',
    venue: 'Farm Block',
    type: 'SUBSTITUTION',
    tasks: ['Feed livestock', 'Record weight']
  },
  {
    id: '4',
    day: 'Tuesday',
    startTime: '08:00',
    endTime: '09:30',
    subjectName: 'Crop Science',
    className: 'SHS 2 Science B',
    venue: 'Science Lab 2',
    type: 'LAB',
    isClash: true,
    tasks: ['Irrigation check']
  },
  {
    id: '5',
    day: 'Wednesday',
    startTime: '09:00',
    endTime: '10:30',
    subjectName: 'General Agric',
    className: 'SHS 1 Agric B',
    venue: 'Classroom 4',
    type: 'REGULAR'
  }
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const HOURS = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

export function Timetable() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [view, setView] = React.useState<'daily' | 'weekly'>('weekly');
  const [selectedDay, setSelectedDay] = React.useState<typeof DAYS[number]>('Monday');
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  
  // Resource Management State
  const [selectedEntry, setSelectedEntry] = React.useState<TimetableEntry | null>(null);
  const [isResourceModalOpen, setIsResourceModalOpen] = React.useState(false);
  const [newMaterial, setNewMaterial] = React.useState({ title: '', url: '', type: 'LINK' as const });

  // Update current time every minute
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getCurrentPeriod = () => {
    const now = formatTime(currentTime);
    const day = DAYS[currentTime.getDay() - 1] || 'Monday';
    
    return mockTimetable.find(entry => 
      entry.day === day && 
      now >= entry.startTime && 
      now <= entry.endTime
    );
  };

  const getNextPeriod = () => {
    const now = formatTime(currentTime);
    const day = DAYS[currentTime.getDay() - 1] || 'Monday';
    
    const todayClasses = mockTimetable
      .filter(e => e.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
      
    return todayClasses.find(e => e.startTime > now);
  };

  const currentPeriod = getCurrentPeriod();
  const nextPeriod = getNextPeriod();

  const getTimePosition = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (hours - 8) * 60 + minutes;
    return (totalMinutes / (10 * 60)) * 100;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F2] overflow-hidden">
      {/* Now & Next Header */}
      <header className="px-8 pt-8 pb-6 bg-white border-b border-gray-200 shadow-sm z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <Calendar size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Academic Schedule</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Sync Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setView('daily')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                  view === 'daily' ? "bg-white text-emerald-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <List size={16} />
                Daily Agenda
              </button>
              <button 
                onClick={() => setView('weekly')}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                  view === 'weekly' ? "bg-white text-emerald-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LayoutGrid size={16} />
                Weekly Grid
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Current Period */}
          <div className={cn(
            "p-5 rounded-2xl border-2 flex items-center justify-between transition-all",
            currentPeriod ? "bg-emerald-50 border-emerald-200" : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                currentPeriod ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-400"
              )}>
                <Timer size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Live Period</p>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  {currentPeriod ? `${currentPeriod.subjectName} - ${currentPeriod.className}` : 'No Active Session'}
                </h3>
                {currentPeriod && (
                  <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} /> {currentPeriod.venue}
                  </p>
                )}
              </div>
            </div>
            {currentPeriod && (
              <button 
                onClick={() => navigate('/grading')}
                className="px-4 py-2 bg-emerald-800 text-white rounded-xl font-black text-[10px] hover:bg-emerald-900 transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-2"
              >
                Open Sheet
                <ArrowRight size={14} />
              </button>
            )}
          </div>

          {/* Next Period */}
          <div className="p-5 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Coming Up Next</p>
                <h3 className="text-base font-black text-gray-900 leading-tight">
                  {nextPeriod ? `${nextPeriod.subjectName} - ${nextPeriod.className}` : 'End of Day'}
                </h3>
                {nextPeriod && (
                  <p className="text-[10px] font-bold text-gray-500 mt-0.5">Starts at {nextPeriod.startTime}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">PostgreSQL Lock</p>
              <p className="text-xs font-black text-red-600">4 Days Remaining</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {view === 'weekly' ? (
          <div className="h-full flex flex-col p-6 overflow-auto">
            <div className="min-w-[1000px] flex-1 flex flex-col">
              {/* Days Header */}
              <div className="flex border-b border-gray-200 pb-4">
                <div className="w-20" />
                {DAYS.map(day => (
                  <div key={day} className="flex-1 text-center">
                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">{day}</span>
                  </div>
                ))}
              </div>

              {/* Grid Body */}
              <div className="flex-1 relative mt-4">
                {/* Time Indicators */}
                <div className="absolute inset-0 flex flex-col">
                  {HOURS.map(hour => (
                    <div key={hour} className="flex-1 border-t border-gray-100 relative">
                      <span className="absolute -left-16 -top-2.5 text-[10px] font-black text-gray-400">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  ))}
                </div>

                {/* Smart Indicator (Current Time Line) */}
                {currentTime.getDay() >= 1 && currentTime.getDay() <= 5 && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-500 z-20 pointer-events-none flex items-center"
                    style={{ top: `${getTimePosition(formatTime(currentTime))}%` }}
                  >
                    <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
                    <div className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full ml-2">
                      {formatTime(currentTime)}
                    </div>
                  </div>
                )}

                {/* Entries */}
                <div className="absolute inset-0 flex">
                  <div className="w-20" />
                  {DAYS.map(day => (
                    <div key={day} className="flex-1 relative border-r border-gray-100 last:border-r-0">
                      {mockTimetable.filter(e => e.day === day).map(entry => (
                        <motion.div
                          key={entry.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onMouseEnter={() => setHoveredId(entry.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          className={cn(
                            "absolute left-1 right-1 rounded-xl p-2 border shadow-sm cursor-pointer group transition-all z-10 overflow-hidden flex flex-col",
                            entry.type === 'LAB' ? "bg-emerald-50 border-emerald-200" :
                            entry.type === 'SUBSTITUTION' ? "bg-blue-50 border-blue-200" :
                            "bg-white border-gray-200",
                            entry.isClash && "border-red-500 ring-2 ring-red-100",
                            hoveredId === entry.id && "z-30 h-auto min-h-[120px] shadow-xl ring-2 ring-emerald-500/20"
                          )}
                          style={{
                            top: `${getTimePosition(entry.startTime)}%`,
                            height: hoveredId === entry.id ? 'auto' : `${getTimePosition(entry.endTime) - getTimePosition(entry.startTime)}%`
                          }}
                        >
                          <div className="flex justify-between items-start mb-1 shrink-0">
                            <span className={cn(
                              "text-[7px] font-black uppercase tracking-wider px-1 py-0.5 rounded",
                              entry.type === 'LAB' ? "bg-emerald-200 text-emerald-800" :
                              entry.type === 'SUBSTITUTION' ? "bg-blue-200 text-blue-800" :
                              "bg-gray-100 text-gray-600"
                            )}>
                              {entry.type}
                            </span>
                            <div className="flex gap-1">
                              {entry.missingObservations && (
                                <div className="w-3.5 h-3.5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[8px] font-black">
                                  !
                                </div>
                              )}
                              {entry.isClash && (
                                <AlertTriangle size={10} className="text-red-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-h-0">
                            <h4 className="text-[10px] font-black text-gray-900 leading-tight truncate group-hover:whitespace-normal">{entry.subjectName}</h4>
                            <p className="text-[8px] font-bold text-gray-500 truncate group-hover:whitespace-normal">{entry.className}</p>
                          </div>

                          <div className="mt-1 flex items-center gap-1 text-[7px] font-black text-gray-400 uppercase shrink-0">
                            <MapPin size={8} /> <span className="truncate">{entry.venue}</span>
                          </div>

                          {/* Expanded Content on Hover */}
                          <AnimatePresence>
                            {hoveredId === entry.id && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-2 pt-2 border-t border-gray-100 space-y-2"
                              >
                                {entry.tasks && (
                                  <div className="space-y-1">
                                    {entry.tasks.slice(0, 2).map((task, i) => (
                                      <div key={i} className="flex items-center gap-1">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                        <span className="text-[8px] font-bold text-gray-600 truncate">{task}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-1">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); navigate('/grading'); }}
                                    className="flex-1 py-1 bg-emerald-800 text-white text-[8px] font-black rounded-lg hover:bg-emerald-900 transition-all"
                                  >
                                    Open Sheet
                                  </button>
                                  <button 
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      setSelectedEntry(entry);
                                      setIsResourceModalOpen(true);
                                    }}
                                    className="flex-1 py-1 bg-white border border-emerald-800 text-emerald-800 text-[8px] font-black rounded-lg hover:bg-emerald-50 transition-all flex items-center justify-center gap-1"
                                  >
                                    <LinkIcon size={8} />
                                    Materials
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full">
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap",
                      selectedDay === day ? "bg-emerald-800 text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-50"
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {mockTimetable.filter(e => e.day === selectedDay).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                  <motion.div
                    key={entry.id}
                    layout
                    onMouseEnter={() => setHoveredId(entry.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "bg-white rounded-2xl p-5 border border-gray-200 flex flex-col group hover:border-emerald-200 transition-all shadow-sm overflow-hidden",
                      entry.isClash && "border-red-200 bg-red-50/30"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 text-center border-r border-gray-100 pr-6 shrink-0">
                        <p className="text-base font-black text-gray-900">{entry.startTime}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">{entry.endTime}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="text-lg font-black text-gray-900 truncate">{entry.subjectName}</h4>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0",
                            entry.type === 'LAB' ? "bg-emerald-100 text-emerald-700" :
                            entry.type === 'SUBSTITUTION' ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-600"
                          )}>
                            {entry.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xs font-bold text-gray-500 truncate">{entry.className}</p>
                          <span className="text-gray-300 shrink-0">•</span>
                          <p className="text-xs font-bold text-gray-500 flex items-center gap-1 truncate">
                            <MapPin size={12} /> {entry.venue}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {entry.missingObservations && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                            <ShieldAlert size={14} />
                            <span className="text-[9px] font-black uppercase">{entry.missingObservations} Missing</span>
                          </div>
                        )}
                        <button 
                          onClick={() => navigate('/grading')}
                          className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-emerald-800 group-hover:text-white transition-all shadow-sm"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {hoveredId === entry.id && entry.tasks && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100"
                        >
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Session Tasks</p>
                          <div className="grid grid-cols-2 gap-3">
                            {entry.tasks.map((task, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] font-bold text-gray-700">{task}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4 flex gap-3">
                            <button 
                              onClick={() => navigate('/grading')}
                              className="flex-1 py-2 bg-emerald-800 text-white text-xs font-black rounded-xl hover:bg-emerald-900 transition-all"
                            >
                              Open Grading Sheet
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntry(entry);
                                setIsResourceModalOpen(true);
                              }}
                              className="flex-1 py-2 bg-white border border-emerald-800 text-emerald-800 text-xs font-black rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
                            >
                              <FilePlus size={14} />
                              Attach Materials
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
                
                {mockTimetable.filter(e => e.day === selectedDay).length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-black text-gray-900">No Classes Scheduled</h3>
                    <p className="text-sm font-bold text-gray-500">Enjoy your free period!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resource Management Modal */}
      <AnimatePresence>
        {isResourceModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsResourceModalOpen(false)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-[#F9F9F7] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">Learning Materials</h3>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{selectedEntry.subjectName} — {selectedEntry.className}</p>
                  </div>
                </div>
                <button onClick={() => setIsResourceModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Current Materials */}
                <div>
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Linked Resources</h4>
                  <div className="space-y-3">
                    {selectedEntry.materials?.length ? selectedEntry.materials.map(material => (
                      <div key={material.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group hover:border-emerald-200 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            material.type === 'PDF' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {material.type === 'PDF' ? <FileIcon size={20} /> : <LinkIcon size={20} />}
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-gray-900 tracking-tight leading-none mb-1">{material.title}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Added on {material.addedAt}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <a href={material.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
                            <ExternalLink size={18} />
                          </a>
                          <button className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-3xl">
                        <FileIcon className="mx-auto text-gray-200 mb-2" size={32} />
                        <p className="text-xs font-bold text-gray-400 italic">No resources attached to this session.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Add New Material Form: Only visible to teachers/HOD */}
                {user?.role !== 'STUDENT' && (
                  <div className="pt-8 border-t border-gray-100">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Attach New Material</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g., Week 4 Practical Guide" 
                            value={newMaterial.title}
                            onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Resource Type</label>
                          <div className="flex p-1 bg-gray-100 rounded-xl">
                            {(['LINK', 'PDF'] as const).map(t => (
                              <button
                                key={t}
                                onClick={() => setNewMaterial(prev => ({ ...prev, type: t }))}
                                className={cn(
                                  "flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                  newMaterial.type === t ? "bg-white text-emerald-800 shadow-sm" : "text-gray-400"
                                )}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Link URL (or PDF storage path)</label>
                        <div className="relative">
                          <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                          <input 
                            type="text" 
                            placeholder="https://..." 
                            value={newMaterial.url}
                            onChange={(e) => setNewMaterial(prev => ({ ...prev, url: e.target.value }))}
                            className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                          />
                        </div>
                      </div>
                      <button className="w-full py-4 bg-emerald-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-900/10 flex items-center justify-center gap-3">
                        <Plus size={16} />
                        Append to Session Registry
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
