import React, { useState, useMemo } from 'react';
import { 
  Clock, Calendar, Users, Home, 
  AlertCircle, ChevronRight, ChevronLeft,
  Filter, Download, Share2, Plus,
  MoreVertical, Search, GripVertical,
  CheckCircle2, AlertTriangle, Layers,
  Trash2, Copy, Save, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// --- Types ---

interface Lesson {
  id: string;
  subject: string;
  class: string;
  teacher: string;
  color: string;
}

interface TimeSlot {
  id: string;
  start: string;
  end: string;
  label: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { id: '1', start: '08:00', end: '08:40', label: 'Period 1' },
  { id: '2', start: '08:40', end: '09:20', label: 'Period 2' },
  { id: '3', start: '09:20', end: '10:00', label: 'Period 3' },
  { id: 'break1', start: '10:00', end: '10:30', label: 'Snack Break' },
  { id: '4', start: '10:30', end: '11:10', label: 'Period 4' },
  { id: '5', start: '11:10', end: '11:50', label: 'Period 5' },
  { id: '6', start: '11:50', end: '12:30', label: 'Period 6' },
  { id: 'break2', start: '12:30', end: '13:30', label: 'Lunch Break' },
  { id: '7', start: '13:30', end: '14:10', label: 'Period 7' },
  { id: '8', start: '14:10', end: '14:50', label: 'Period 8' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const UNASSIGNED_LESSONS: Lesson[] = [
  { id: 'L1', subject: 'Elective Physics', class: 'SHS 3 Sci 1', teacher: 'Mr. Boateng', color: 'bg-blue-500' },
  { id: 'L2', subject: 'Core Mathematics', class: 'SHS 1 Sci 2', teacher: 'Mrs. Mensah', color: 'bg-emerald-500' },
  { id: 'L3', subject: 'English Language', class: 'SHS 2 Arts 1', teacher: 'Ms. Lamptey', color: 'bg-amber-500' },
  { id: 'L4', subject: 'Integrated Science', class: 'SHS 1 Bus 1', teacher: 'Mrs. Owusu', color: 'bg-rose-500' },
  { id: 'L5', subject: 'Cost Accounting', class: 'SHS 2 Bus 2', teacher: 'Mr. Appiah', color: 'bg-indigo-500' },
];

export const MasterTimetable: React.FC = () => {
  const [activeTrack, setActiveTrack] = useState<'Gold' | 'Green'>('Gold');
  const [selectedClass, setSelectedClass] = useState('SHS 3 Science 1');
  const [schedule, setSchedule] = useState<{ [key: string]: Lesson }>({
    'Monday-1': UNASSIGNED_LESSONS[0],
    'Tuesday-2': UNASSIGNED_LESSONS[1],
    'Wednesday-3': UNASSIGNED_LESSONS[2],
  });
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, lesson: Lesson) => {
    e.dataTransfer.setData('lessonId', lesson.id);
  };

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOverSlot(key);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, key: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const lessonId = e.dataTransfer.getData('lessonId');
    const lesson = UNASSIGNED_LESSONS.find(l => l.id === lessonId);
    if (lesson) {
      setSchedule(prev => ({
        ...prev,
        [key]: lesson
      }));
    }
  };

  const removeLesson = (key: string) => {
    setSchedule(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const conflicts = useMemo(() => {
    const teacherUsage: { [key: string]: string[] } = {};
    const conflictMap: { [key: string]: { type: string, msg: string } } = {};

    (Object.entries(schedule) as [string, Lesson][]).forEach(([key, lesson]) => {
      const teacherSlot = `${lesson.teacher}-${key.split('-')[1]}-${key.split('-')[0]}`;
      if (teacherUsage[teacherSlot]) {
        conflictMap[key] = { type: 'TEACHER', msg: `Teacher Conflict: ${lesson.teacher} already assigned.` };
      }
      teacherUsage[teacherSlot] = [...(teacherUsage[teacherSlot] || []), lesson.class];
    });

    return conflictMap;
  }, [schedule]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-8 space-y-8 flex-1 overflow-y-auto">
        
        {/* controls */}
        <div className="flex flex-col xl:flex-row gap-6 justify-between items-start">
           <div className="flex items-center gap-2 p-1 bg-white border border-slate-200 rounded-2xl shadow-sm">
              <button 
                onClick={() => setActiveTrack('Gold')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTrack === 'Gold' ? "bg-amber-500 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                Gold Track
              </button>
              <button 
                onClick={() => setActiveTrack('Green')}
                className={cn(
                  "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTrack === 'Green' ? "bg-emerald-500 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                )}
              >
                Green Track
              </button>
           </div>

           <div className="flex flex-wrap gap-3">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
              >
                <option>SHS 3 Science 1</option>
                <option>SHS 3 Science 2</option>
                <option>SHS 2 General Arts</option>
                <option>SHS 1 General Science</option>
              </select>
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all font-sans">
                <Share2 size={14} /> Distribute to Apps
              </button>
              <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all">
                <Save size={14} /> Finalize Grid
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Smart Sidebar: Unassigned Lessons */}
          <div className="xl:col-span-3 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm h-full flex flex-col">
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Layers size={18} className="text-brand-teal" />
                Unassigned Logic
              </h3>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-6">Subject Mapping Backlog</p>
              
              <div className="flex-1 space-y-3 overflow-y-auto pr-2 scrollbar-hide">
                {UNASSIGNED_LESSONS.map((lesson) => (
                  <div 
                    key={lesson.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lesson)}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl cursor-grab active:cursor-grabbing hover:border-slate-300 transition-all group relative overflow-hidden"
                  >
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", lesson.color)} />
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[12px] font-black italic font-display text-slate-900">{lesson.subject}</p>
                      <GripVertical size={14} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.class}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Users size={10} className="text-slate-300" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{lesson.teacher}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                  <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Optimization Tip
                  </p>
                  <p className="text-[9px] font-medium text-blue-700 leading-relaxed uppercase tracking-wider italic">
                    Place "Core Mathematics" in early slots for better cognitive load.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Master Grid */}
          <div className="xl:col-span-9">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full border-collapse">
                   <thead>
                     <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-r border-slate-200 sticky left-0 z-10 bg-slate-50">Time Slot</th>
                        {DAYS.map(day => (
                          <th key={day} className="px-6 py-6 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center min-w-[200px]">
                            {day}
                          </th>
                        ))}
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {TIME_SLOTS.map(slot => {
                       const isBreak = slot.id.startsWith('break');
                       return (
                         <tr key={slot.id} className={cn(isBreak ? "bg-slate-50/50" : "")}>
                           <td className="px-6 py-8 border-r border-slate-200 sticky left-0 z-10 bg-white">
                              <p className="text-[12px] font-black text-slate-900 italic font-display leading-none mb-1">{slot.label}</p>
                              <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase">
                                <Clock size={10} /> {slot.start} - {slot.end}
                              </div>
                           </td>
                           {DAYS.map(day => {
                             const key = `${day}-${slot.id}`;
                             const lesson = schedule[key];
                             const conflict = conflicts[key];
                             
                             if (isBreak) {
                               return (
                                 <td key={day} className="px-4 py-4 text-center">
                                    <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] flex items-center justify-center gap-2">
                                       <div className="w-8 h-px bg-slate-100" />
                                       {slot.label}
                                       <div className="w-8 h-px bg-slate-100" />
                                    </div>
                                 </td>
                               );
                             }

                             return (
                               <td 
                                 key={day} 
                                 className="px-3 py-3 relative min-h-[140px]"
                                 onDragOver={(e) => handleDragOver(e, key)}
                                 onDragLeave={handleDragLeave}
                                 onDrop={(e) => handleDrop(e, key)}
                               >
                                  <div 
                                    className={cn(
                                      "w-full h-full min-h-[100px] border-2 border-dashed border-slate-100 rounded-[1.5rem] flex items-center justify-center transition-all group",
                                      lesson ? "border-transparent bg-slate-50 p-4" : "hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer",
                                      conflict ? "bg-rose-50 border-rose-100 ring-4 ring-rose-500/10" : "",
                                      dragOverSlot === key ? "bg-slate-200 border-slate-400 scale-[1.02]" : ""
                                    )}
                                  >
                                    {lesson ? (
                                      <div className="w-full relative">
                                        <div className={cn("absolute -left-4 top-0 bottom-0 w-1", lesson.color)} />
                                        <div className="flex justify-between items-start mb-1">
                                          <p className="text-[13px] font-black italic font-display text-slate-900 leading-tight">{lesson.subject}</p>
                                          <button 
                                            onClick={() => removeLesson(key)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-rose-500"
                                          >
                                            <Trash2 size={12} />
                                          </button>
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{lesson.class}</p>
                                        <div className="flex items-center gap-1.5 mt-2">
                                          <MapPin size={10} className="text-slate-300" />
                                          <span className="text-[8px] font-black text-slate-500 uppercase">Room B3</span>
                                        </div>
                                        
                                        {conflict && (
                                          <div className="mt-3 p-2 bg-rose-500 text-white rounded-lg flex items-center gap-2 animate-pulse" title={conflict.msg}>
                                            <AlertTriangle size={10} />
                                            <span className="text-[8px] font-black uppercase tracking-tighter">Clash Detected</span>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <Plus size={20} className="text-slate-200 group-hover:text-slate-400 transition-colors" />
                                    )}
                                  </div>
                               </td>
                             );
                           })}
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
