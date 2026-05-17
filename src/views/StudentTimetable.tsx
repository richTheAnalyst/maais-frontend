import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  MapPin, 
  Activity, 
  Filter,
  Timer,
  Navigation,
  ArrowRight,
  Coffee,
  Utensils,
  Moon,
  GraduationCap,
  BookOpen,
  ChevronRight,
  CheckCircle2,
  FileText,
  Link as LinkIcon,
  ExternalLink,
  Archive,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ResourceMaterial } from '../types';

interface TimetablePeriod {
  id: string;
  subject: string;
  time: string;
  room: string;
  teacher: string;
  teacherInitials: string;
  type: 'Theory' | 'Practical' | 'Assessment' | 'Prep';
  category: 'Academic';
  status?: string;
  startTime: string; 
  endTime: string;
  prepNote?: string;
  materials?: ResourceMaterial[];
}

const MOCK_PERIODS: Record<string, TimetablePeriod[]> = {
  'Mon': [
    { 
      id: '1', 
      subject: 'Elective Physics', 
      time: '08:00 - 09:30', 
      startTime: '08:00', 
      endTime: '09:30', 
      room: 'Science Lab B', 
      teacher: 'Samuel Kojo', 
      teacherInitials: 'SK', 
      type: 'Theory', 
      category: 'Academic', 
      prepNote: 'Bring Lab Coat',
      materials: [
        { id: 'm1', title: 'Physics Week 1 Notes', type: 'PDF', url: '#', addedAt: '2026-04-10' },
        { id: 'm2', title: 'Virtual Lab Simulator', type: 'LINK', url: 'https://phet.colorado.edu', addedAt: '2026-04-12' }
      ]
    },
    { id: '2', subject: 'Core Mathematics', time: '10:00 - 11:30', startTime: '10:00', endTime: '11:30', room: 'Block C - R4', teacher: 'Ama Serwaa', teacherInitials: 'AS', type: 'Theory', status: 'Assessment', category: 'Academic' },
    { id: '3', subject: 'Chemistry Practical', time: '13:30 - 15:00', startTime: '13:30', endTime: '15:00', room: 'Chemistry Lab A', teacher: 'John Mensah', teacherInitials: 'JM', type: 'Practical', category: 'Academic' },
    { id: '4', subject: 'Evening Prep', time: '19:00 - 21:00', startTime: '19:00', endTime: '21:00', room: 'Main Library', teacher: 'Supervised', teacherInitials: 'SP', type: 'Prep', category: 'Academic' },
  ],
  'Tue': [
    { id: '5', subject: 'Biology', time: '08:00 - 09:30', startTime: '08:00', endTime: '09:30', room: 'Science Lab C', teacher: 'Sarah Boateng', teacherInitials: 'SB', type: 'Theory', category: 'Academic' },
    { id: '6', subject: 'English Language', time: '10:00 - 11:30', startTime: '10:00', endTime: '11:30', room: 'Block A - R2', teacher: 'Kofi Asante', teacherInitials: 'KA', type: 'Theory', category: 'Academic' },
    { id: '7', subject: 'Integrated Science', time: '13:30 - 15:00', startTime: '13:30', endTime: '15:00', room: 'Block D - R1', teacher: 'Elizabeth Osei', teacherInitials: 'EO', type: 'Theory', category: 'Academic' },
    { id: '8', subject: 'Evening Prep', time: '19:00 - 21:00', startTime: '19:00', endTime: '21:00', room: 'Main Library', teacher: 'Supervised', teacherInitials: 'SP', type: 'Prep', category: 'Academic' },
  ],
  'Wed': [
    { id: '9', subject: 'Elective Physics', time: '08:30 - 10:00', startTime: '08:30', endTime: '10:00', room: 'Science Lab B', teacher: 'Samuel Kojo', teacherInitials: 'SK', type: 'Practical', category: 'Academic' },
    { id: '10', subject: 'Further Mathematics', time: '10:30 - 12:00', startTime: '10:30', endTime: '12:00', room: 'Block C - R4', teacher: 'Ama Serwaa', teacherInitials: 'AS', type: 'Theory', category: 'Academic' },
    { id: '11', subject: 'Social Studies', time: '13:30 - 15:00', startTime: '13:30', endTime: '15:00', room: 'Block B - R1', teacher: 'Kwame Owusu', teacherInitials: 'KO', type: 'Theory', category: 'Academic' },
    { id: '12', subject: 'Evening Prep', time: '19:00 - 21:00', startTime: '19:00', endTime: '21:00', room: 'Main Library', teacher: 'Supervised', teacherInitials: 'SP', type: 'Prep', category: 'Academic' },
  ],
  'Thu': [
    { id: '13', subject: 'Integrated Science', time: '08:00 - 09:30', startTime: '08:00', endTime: '09:30', room: 'Block D - R1', teacher: 'Elizabeth Osei', teacherInitials: 'EO', type: 'Theory', category: 'Academic' },
    { id: '14', subject: 'Core Mathematics', time: '10:00 - 11:30', startTime: '10:00', endTime: '11:30', room: 'Block C - R4', teacher: 'Ama Serwaa', teacherInitials: 'AS', type: 'Theory', category: 'Academic' },
    { id: '15', subject: 'English Language', time: '13:00 - 14:30', startTime: '13:00', endTime: '14:30', room: 'Block A - R2', teacher: 'Kofi Asante', teacherInitials: 'KA', type: 'Theory', category: 'Academic' },
    { id: '16', subject: 'Evening Prep', time: '19:00 - 21:00', startTime: '19:00', endTime: '21:00', room: 'Main Library', teacher: 'Supervised', teacherInitials: 'SP', type: 'Prep', category: 'Academic' },
  ],
  'Fri': [
    { id: '17', subject: 'Elective Chemistry', time: '08:00 - 09:30', startTime: '08:00', endTime: '09:30', room: 'Chemistry Lab A', teacher: 'John Mensah', teacherInitials: 'JM', type: 'Assessment', category: 'Academic' },
    { id: '18', subject: 'Elective Biology', time: '10:00 - 11:30', startTime: '10:00', endTime: '11:30', room: 'Science Lab C', teacher: 'Sarah Boateng', teacherInitials: 'SB', type: 'Practical', category: 'Academic' },
    { id: '19', subject: 'Free Period', time: '13:30 - 15:00', startTime: '13:30', endTime: '15:00', room: 'Common Room', teacher: 'Self Study', teacherInitials: 'SS', type: 'Theory', category: 'Academic' },
    { id: '20', subject: 'Evening Prep', time: '19:00 - 21:00', startTime: '19:00', endTime: '21:00', room: 'Main Library', teacher: 'Supervised', teacherInitials: 'SP', type: 'Prep', category: 'Academic' },
  ],
  'Sat': [],
  'Sun': []
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function StudentTimetable() {
  const [selectedDay, setSelectedDay] = React.useState<typeof DAYS[number]>('Wed');
  const [currentTime] = React.useState('09:15'); // Fixed for demo
  const [viewingMaterialsFor, setViewingMaterialsFor] = React.useState<TimetablePeriod | null>(null);

  const filteredPeriods = MOCK_PERIODS[selectedDay] || [];

  const activePeriod = MOCK_PERIODS[selectedDay]?.find(p => 
    currentTime >= p.startTime && currentTime <= p.endTime
  );

  const nextPeriod = MOCK_PERIODS[selectedDay]
    ?.filter(p => p.startTime > currentTime)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  const getProgress = () => {
    if (!activePeriod) return 0;
    const [startH, startM] = activePeriod.startTime.split(':').map(Number);
    const [endH, endM] = activePeriod.endTime.split(':').map(Number);
    const [nowH, nowM] = currentTime.split(':').map(Number);
    
    const start = startH * 60 + startM;
    const end = endH * 60 + endM;
    const now = nowH * 60 + nowM;
    
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  const getDayInitial = (day: string) => day[0];

  return (
    <div className="flex-1 flex flex-col font-sans overflow-hidden relative">
      {/* --- MOBILE VIEW: Light Mode Vertical Feed --- */}
      <div className="flex-1 flex flex-col md:hidden bg-[#F9F9F7] text-gray-900 overflow-hidden">
        {/* 1. Page Header (Sticky) */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 pt-6 pb-4 shrink-0 shadow-sm shadow-slate-100/50">
          {/* Day Scroller - Better spacing and handling overflow */}
          <div className="bg-[#F9F9F7] p-1.5 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar shadow-inner">
            <div className="flex items-center justify-between min-w-max gap-1">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all relative shrink-0",
                    selectedDay === day 
                      ? "bg-emerald-700 text-white shadow-lg shadow-emerald-900/20" 
                      : "text-gray-400 hover:bg-white"
                  )}
                >
                  {getDayInitial(day)}
                  {day === 'Wed' && selectedDay !== day && (
                     <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-[5%]">
          {/* 2. Active Period Spotlight (Hero Card) */}
          {activePeriod && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 relative group"
            >
              <div className="bg-white p-7 rounded-[2rem] border border-gray-100 shadow-[0_24px_60px_rgba(0,0,0,0.04)] relative overflow-hidden">
                <div className="flex justify-between items-start gap-4 mb-8">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1 h-1 rounded-full bg-emerald-600 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Active Now</p>
                    </div>
                    <h2 className="text-[24px] font-black tracking-tight text-gray-900 leading-tight break-words font-display italic">
                      {activePeriod.subject}
                    </h2>
                  </div>
                  
                  {/* Circular Progress Gauge */}
                  <div className="relative w-20 h-20 shrink-0 mt-1">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="transparent"
                        stroke="rgba(5,150,105,0.05)"
                        strokeWidth="8"
                      />
                      <motion.circle
                        cx="40"
                        cy="40"
                        r="34"
                        fill="transparent"
                        stroke="#059669"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 34}
                        initial={{ strokeDashoffset: 2 * Math.PI * 34 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 34 * (1 - getProgress() / 100) }}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[12px] font-black text-gray-900 leading-none">{100 - Math.round(getProgress())}m</span>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">left</span>
                    </div>
                  </div>
                </div>

                {/* Horizontal Text Info - Better vertical separation and alignment */}
                <div className="flex items-center gap-4 text-[11px] font-black text-gray-500 uppercase tracking-wider overflow-hidden">
                  <div className="flex items-center gap-2 shrink-0">
                    <MapPin size={12} className="text-emerald-700" />
                    <span className="truncate max-w-[120px]">{activePeriod.room}</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-200 shrink-0" />
                  <div className="flex items-center gap-2 truncate">
                    <CheckCircle2 size={12} className="text-emerald-700 shrink-0" />
                    <span className="truncate">{activePeriod.teacher}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. The Vertical Schedule Feed */}
          <div className="relative pl-14 space-y-6">
            {/* Timeline Rail - Positioned well to the left of the card edge */}
            <div className="absolute left-6 top-0 bottom-0 w-[1.5px] bg-gray-100" />

            {filteredPeriods.map((period, idx) => {
              const isCurrent = activePeriod?.id === period.id;
              const isPast = !isCurrent && period.endTime < currentTime;

              return (
                <motion.div
                  key={period.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={cn(
                    "relative group",
                    isPast && "opacity-50"
                  )}
                >
                  {/* Time Label - Aligned with the left of the screen */}
                  <div className="absolute -left-14 top-5 w-12 text-center">
                    <p className="text-[10px] font-black text-gray-400 tracking-tighter leading-none">{period.startTime}</p>
                  </div>

                  {/* Node Connector - Aligned perfectly with the rail (left-6) */}
                  <div className={cn(
                    "absolute -left-9 top-8 w-3 h-3 rounded-full border-2 border-white z-20 transition-all duration-500",
                    isCurrent ? "bg-emerald-600 ring-4 ring-emerald-500/10 scale-125 shadow-[0_0_8px_rgba(5,150,105,0.4)]" : (isPast ? "bg-emerald-200" : "bg-[#F9F9F7] border-gray-200 shadow-inner")
                  )} />

                  {/* Card Body - Flex layout with sufficient gap to prevent overlap */}
                  <div className={cn(
                    "p-5 rounded-[1.75rem] border transition-all duration-300 flex items-center justify-between gap-4 shadow-sm hover:shadow-md",
                    isCurrent 
                      ? "bg-white border-emerald-600/30" 
                      : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"
                  )}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={cn(
                          "text-[16px] font-black tracking-tight break-words flex-1 italic font-display",
                          isCurrent ? "text-gray-900" : "text-gray-700"
                        )}>
                          {period.subject}
                        </h3>
                        {period.status === 'Assessment' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                           <span className="text-[12px] font-black text-gray-400 flex items-center gap-1.5 shrink-0">
                            <Clock size={12} className="text-emerald-700" /> {period.time.split(' - ')[1]}
                          </span>
                          <span className="text-[12px] font-black text-gray-400 flex items-center gap-1.5 shrink-0">
                            <MapPin size={12} className="text-emerald-700" /> {period.room.split(' - ').pop()}
                          </span>
                        </div>

                      {period.prepNote && (
                        <div className="mt-3 bg-[#F9F9F7] p-2.5 rounded-xl border border-gray-50">
                          <p className="text-[12px] font-bold text-gray-500 leading-normal italic line-clamp-2">
                            {period.prepNote}
                          </p>
                        </div>
                      )}

                      {period.materials && period.materials.length > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingMaterialsFor(period);
                          }}
                          className="mt-3 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all w-fit"
                        >
                          <BookOpen size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">{period.materials.length} Materials Linked</span>
                        </button>
                      )}
                    </div>

                    {isPast && (
                      <div className="shrink-0">
                        <CheckCircle2 size={20} className="text-emerald-600" />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 4. Utility Footer: Next Up - Fixed position and padding */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-50 bg-gradient-to-t from-[#F9F9F7] via-[#F9F9F7]/95 to-transparent pt-12">
          <div className="max-w-md mx-auto">
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/90 backdrop-blur-2xl p-4 rounded-[2rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-900/20">
                  <Timer size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Next Engagement</p>
                  <p className="text-[13px] font-black text-gray-900 tracking-tighter truncate italic font-display">
                    {nextPeriod ? `${nextPeriod.subject} @ ${nextPeriod.startTime}` : 'End of Schedule'}
                  </p>
                </div>
              </div>
              {nextPeriod && (
                <div className="bg-[#F9F9F7] px-3 py-2 rounded-lg border border-gray-100 shrink-0">
                  <span className="text-[11px] font-black text-gray-900">{nextPeriod.room.split(' ').pop()}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* --- DESKTOP VIEW: Legacy Grid Updated to Professional Light Mode --- */}
      <div className="hidden md:flex flex-1 flex-col bg-[#F9F9F7] text-gray-900 p-10 overflow-auto">
        <div className="max-w-[1600px] mx-auto w-full">
          <div className="flex items-center justify-end mb-8">
            <div className="bg-white border border-gray-100 px-8 py-4 rounded-3xl flex items-center gap-4 shadow-sm shadow-emerald-900/5">
              <Clock size={24} className="text-emerald-700" />
              <span className="text-[28px] font-black tracking-tighter italic font-display">{currentTime}</span>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-6 min-w-[1200px]">
            {DAYS.map(day => (
              <div key={day} className="flex flex-col gap-6">
                <div className={cn(
                  "p-6 rounded-3xl border transition-all text-center",
                  selectedDay === day ? "bg-white border-emerald-700 shadow-xl shadow-emerald-900/5 ring-2 ring-emerald-700/10" : "bg-white border-gray-100 shadow-sm"
                )}>
                  <p className={cn(
                    "text-[12px] font-black uppercase tracking-[0.2em] mb-2",
                    selectedDay === day ? "text-emerald-700" : "text-gray-400"
                  )}>{day}</p>
                  <p className={cn(
                    "text-[20px] font-black font-display italic",
                    selectedDay === day ? "text-gray-900" : "text-gray-500"
                  )}>{day.slice(0,3)}</p>
                </div>

                <div className="flex-1 space-y-4">
                  {MOCK_PERIODS[day]?.map(period => (
                    <div 
                      key={period.id}
                      className="bg-white border border-gray-100 p-5 rounded-[2rem] hover:shadow-lg hover:border-emerald-600/30 transition-all group cursor-default group shadow-sm"
                    >
                      <p className="text-[11px] text-emerald-600 font-black uppercase tracking-widest mb-2 italic">{period.startTime} — {period.endTime}</p>
                      <h4 className="text-[15px] font-black mb-3 text-gray-900 italic font-display break-words">
                        {period.subject}
                      </h4>
                      <div className="flex items-center gap-3 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                        <MapPin size={12} className="shrink-0 text-emerald-700" />
                        <span className="truncate">{period.room}</span>
                      </div>

                      {period.materials && period.materials.length > 0 && (
                        <button 
                          onClick={() => setViewingMaterialsFor(period)}
                          className="mt-4 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-all w-fit"
                        >
                          <BookOpen size={12} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Resources</span>
                        </button>
                      )}
                    </div>
                  ))}
                  {(!MOCK_PERIODS[day] || MOCK_PERIODS[day].length === 0) && (
                    <div className="py-20 text-center opacity-40 border border-dashed border-gray-200 rounded-[2rem] bg-white/50">
                      <BookOpen size={32} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-[10px] uppercase font-black tracking-[0.2em] text-gray-400">Reserved Period</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Materials Overlay Drawer */}
      <AnimatePresence>
        {viewingMaterialsFor && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingMaterialsFor(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative bg-[#F9F9F7] rounded-t-[2.5rem] p-8 pb-12 shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Handle */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-8 shrink-0" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-[20px] font-black text-gray-900 tracking-tight leading-none italic font-display">
                    Learning Materials
                  </h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                    {viewingMaterialsFor.subject} Session
                  </p>
                </div>
                <button 
                  onClick={() => setViewingMaterialsFor(null)}
                  className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 pb-6">
                {viewingMaterialsFor.materials?.map(material => (
                  <a 
                    key={material.id}
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-[1.75rem] shadow-sm active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        material.type === 'PDF' ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {material.type === 'PDF' ? <FileText size={24} /> : <LinkIcon size={24} />}
                      </div>
                      <div>
                        <p className="text-[15px] font-black text-gray-900 tracking-tight leading-tight">{material.title}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{material.type} Resource</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 bg-[#F9F9F7] rounded-xl flex items-center justify-center text-emerald-700">
                      <ExternalLink size={18} />
                    </div>
                  </a>
                ))}
              </div>

              <button 
                onClick={() => setViewingMaterialsFor(null)}
                className="w-full py-5 bg-emerald-900 text-white rounded-[1.5rem] text-[13px] font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 mt-4"
              >
                Return to Schedule
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
