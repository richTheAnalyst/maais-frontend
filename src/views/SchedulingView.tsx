import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, Grid3X3, 
  ChevronRight, LayoutDashboard, Settings2,
  Lock, Share2, Filter, Info, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { MasterTimetable } from './MasterTimetable';
import { EventCalendarView } from './EventCalendarView';

export const SchedulingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Timetable' | 'Calendar'>('Timetable');

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="px-8 pt-8 pb-4 bg-white border-b border-slate-100 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="mb-4">
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900 uppercase">Scheduling & Registry</span>
            </div>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none">
              The Heartbeat Control
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
              Conflict-Free Timetables & Global Term Planning
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner mb-4">
            {[
              { id: 'Timetable', label: 'Master Timetable', icon: Grid3X3 },
              { id: 'Calendar', label: 'Event Planner', icon: CalendarIcon },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id ? "bg-white text-slate-900 shadow-md ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'Timetable' ? <MasterTimetable /> : <EventCalendarView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <footer className="px-8 py-4 bg-slate-900 shrink-0 hidden xl:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Real-time Conflict Analysis Active</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                 <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">Double Track (Gold) Context</span>
              </div>
           </div>
           <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.25em]">Institutional Intelligence v2.0</p>
        </div>
      </footer>
    </div>
  );
};
