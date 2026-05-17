import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, ChevronLeft, 
  ChevronRight, Plus, MoreVertical, ShieldCheck,
  AlertTriangle, Filter, Search, Info,
  Bell, CheckCircle2, Bookmark, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

// --- Types ---

type EventCategory = 'ACADEMIC' | 'HOLIDAY' | 'SOCIAL' | 'ADMIN';

interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  description: string;
  color: string;
  pushTriggered?: boolean;
}

const CATEGORY_COLORS = {
  ACADEMIC: 'bg-blue-500',
  HOLIDAY: 'bg-emerald-500', 
  SOCIAL: 'bg-orange-500',
  ADMIN: 'bg-orange-600'
};

const MOCK_EVENTS: SchoolEvent[] = [
  { id: '1', title: 'WASSCE Registration Start', date: '2026-05-04', category: 'ACADEMIC', description: 'Final year students registration protocols.', color: CATEGORY_COLORS.ACADEMIC },
  { id: '2', title: 'Independence Day', date: '2026-03-06', category: 'HOLIDAY', description: 'Statutory Holiday - Attendance suspended.', color: CATEGORY_COLORS.HOLIDAY },
  { id: '3', title: 'Inter-House Sports', date: '2026-05-15', category: 'SOCIAL', description: 'Competitive athletics day at the stadium.', color: CATEGORY_COLORS.SOCIAL },
  { id: '4', title: 'PTA General Meeting', date: '2026-05-20', category: 'ADMIN', description: 'Discussion on infrastructure updates.', color: CATEGORY_COLORS.ADMIN, pushTriggered: true },
];

export const EventCalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<SchoolEvent[]>(MOCK_EVENTS);
  const [termDates, setTermDates] = useState({ start: '2026-01-12', end: '2026-04-15' });
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    title: '', 
    category: 'ACADEMIC' as EventCategory, 
    date: '',
    pushNotification: true 
  });

  const addEvent = () => {
    if (!newEvent.title || !newEvent.date) return;
    
    const e: SchoolEvent = {
      id: Math.random().toString(),
      title: newEvent.title,
      date: newEvent.date,
      category: newEvent.category,
      description: newEvent.category === 'HOLIDAY' 
        ? 'School Closed - Attendance Tracking Suspended.' 
        : 'Newly scheduled event with automated reminders.',
      color: CATEGORY_COLORS[newEvent.category],
      pushTriggered: newEvent.pushNotification
    };
    
    setEvents([...events, e]);
    setShowAddEvent(false);
    setNewEvent({ title: '', category: 'ACADEMIC', date: '', pushNotification: true });
  };

  // Simple calendar math
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddEvent(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-900" />
              <h3 className="text-xl font-black italic font-display text-slate-900 mb-8">Schedule Operational Event</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Event Nomenclature</label>
                  <input 
                    type="text" 
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder="e.g. Mid-term Assessment"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Category Logic</label>
                    <select 
                      value={newEvent.category}
                      onChange={(e) => setNewEvent({...newEvent, category: e.target.value as EventCategory})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none transition-all"
                    >
                      <option value="ACADEMIC">Academic</option>
                      <option value="HOLIDAY">Holiday</option>
                      <option value="SOCIAL">Social</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Date</label>
                    <input 
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer group hover:bg-slate-100 transition-all">
                     <div className={cn(
                       "w-6 h-6 rounded-lg border-2 border-slate-300 flex items-center justify-center transition-all",
                       newEvent.pushNotification ? "bg-slate-900 border-slate-900" : ""
                     )}>
                        {newEvent.pushNotification && <Bell size={14} className="text-white" />}
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={newEvent.pushNotification}
                          onChange={(e) => setNewEvent({...newEvent, pushNotification: e.target.checked})}
                        />
                     </div>
                     <div className="flex-1">
                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Push Alert Trigger</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Broadcast to all parents exactly 48 hours before</p>
                     </div>
                  </label>

                  {newEvent.category === 'HOLIDAY' && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <ShieldCheck size={12} /> Holiday Auto-Logic
                      </p>
                      <p className="text-[9px] font-medium text-amber-700 uppercase tracking-tight italic">
                        Biometric attendance modules will be suspended for this date.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setShowAddEvent(false)}
                    className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={addEvent}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all"
                  >
                    Commit Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="p-8 space-y-10 flex-1 overflow-y-auto">
        
        {/* Header with Term Boundaries */}
        <div className="flex flex-col xl:flex-row gap-8 justify-between items-start">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <button onClick={prevMonth} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                   <ChevronLeft size={20} className="text-slate-600" />
                 </button>
                 <div className="text-center min-w-[200px]">
                    <h2 className="text-2xl font-black italic font-display text-slate-900 tracking-tight leading-none">{monthName} {year}</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Academic Term 2</p>
                 </div>
                 <button onClick={nextMonth} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                   <ChevronRight size={20} className="text-slate-600" />
                 </button>
              </div>
           </div>

           <div className="flex flex-wrap gap-4">
              <div className="flex bg-white px-6 py-3 rounded-2xl border border-slate-200 divide-x divide-slate-100 shadow-sm font-sans">
                 <div className="pr-6">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Term Start</p>
                    <p className="text-[11px] font-black italic font-display text-slate-900 uppercase">{new Date(termDates.start).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                 </div>
                 <div className="pl-6">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Vacation Date</p>
                    <p className="text-[11px] font-black italic font-display text-slate-900 uppercase">{new Date(termDates.end).toLocaleDateString('default', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                 </div>
              </div>
              <button 
                onClick={() => setShowAddEvent(true)}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all"
              >
                <Plus size={16} /> Schedule Event
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Calendar Grid */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8">
               <div className="grid grid-cols-7 mb-6">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">
                      {day}
                    </div>
                  ))}
               </div>
               
               <div className="grid grid-cols-7 gap-3">
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square bg-slate-50/30 rounded-2xl" />
                  ))}
                  
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayEvents = events.filter(e => e.date === dateStr);
                    const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth();

                    return (
                      <div 
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={cn(
                          "aspect-square p-3 border border-slate-100 rounded-3xl cursor-pointer hover:bg-slate-50/50 transition-all flex flex-col group",
                          isToday ? "bg-slate-900 border-slate-900 text-white shadow-xl" : "bg-white",
                          selectedDate === dateStr ? "ring-4 ring-slate-900/5 border-slate-900/20" : ""
                        )}
                      >
                        <span className={cn(
                          "text-[14px] font-black italic font-display leading-none mb-2",
                          isToday ? "text-white" : "text-slate-400 group-hover:text-slate-900 transition-colors"
                        )}>
                          {day}
                        </span>
                        
                        <div className="space-y-1 overflow-hidden">
                           {dayEvents.map(event => (
                             <div 
                               key={event.id}
                               className={cn(
                                 "h-1.5 w-full rounded-full",
                                 event.color
                               )}
                               title={event.title}
                             />
                           ))}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
          </div>

          {/* Agenda Sidebar */}
          <div className="xl:col-span-4 space-y-8">
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                   <Bookmark size={18} className="text-brand-teal" />
                   Monthly Agenda
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-8">Selected Calendar Layer</p>
                
                <div className="space-y-6">
                   {events.filter(e => {
                     const d = new Date(e.date);
                     return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
                   }).map(event => (
                     <div key={event.id} className="group cursor-pointer">
                        <div className="flex gap-4">
                           <div className="flex flex-col items-center">
                              <div className={cn("w-1.5 h-16 rounded-full font-sans", event.color)} />
                           </div>
                           <div className="flex-1 pt-1">
                              <div className="flex justify-between items-start mb-1">
                                 <h4 className="text-[14px] font-black italic font-display text-slate-900 leading-none group-hover:text-brand-teal transition-colors">{event.title}</h4>
                                 <MoreVertical size={14} className="text-slate-300" />
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                {new Date(event.date).toLocaleDateString('default', { day: 'numeric', month: 'short' })}
                              </p>
                              <p className="text-[11px] font-medium text-slate-500 leading-relaxed uppercase tracking-tighter">
                                {event.description}
                              </p>
                              
                              {event.category === 'HOLIDAY' && (
                                <div className="mt-3 flex items-center gap-2 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit border border-emerald-100">
                                   <Flame size={10} /> Attendance Suspended
                                </div>
                              )}
                              
                              {event.pushTriggered && (
                                <div className="mt-3 flex items-center gap-2 px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest w-fit border border-blue-100">
                                   <CheckCircle2 size={10} /> Push Sent
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                   <Bell size={80} />
                </div>
                <div className="relative z-10">
                   <h3 className="text-[12px] font-black text-white uppercase tracking-widest mb-8 flex items-center gap-2">
                     <Flame size={16} className="text-orange-500" />
                     Push Notification Engine
                   </h3>
                   <div className="space-y-4 mb-10">
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Default Trigger</p>
                         <p className="text-[12px] font-black italic font-display text-white italic">48 Hours Before Event</p>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Active Audience</p>
                         <p className="text-[12px] font-black italic font-display text-white italic">642 Parent Profiles</p>
                      </div>
                   </div>
                   <button className="w-full py-4 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/20 transition-all">
                     Configure Delivery Logic
                   </button>
                </div>
             </div>

             <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 p-8">
                <div className="flex items-center gap-4 mb-4 text-amber-900">
                   <AlertTriangle size={18} className="text-amber-500" />
                   <span className="text-[11px] font-black uppercase tracking-[0.2em]">Holiday Suspension</span>
                </div>
                <p className="text-[10px] font-medium text-amber-800 leading-relaxed uppercase tracking-wider italic">
                   Marking a day as a "Holiday" will automatically suspend biometric attendance checks for that period.
                </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

