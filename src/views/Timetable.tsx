import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Clock, MapPin, ChevronRight,
  LayoutGrid, List, Timer, ShieldAlert,
  AlertTriangle, Plus, X, Loader2,
  RefreshCw, BookOpen, GraduationCap, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import api from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY';

interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  classSection: { id: string; name: string; level: string };
  subject: { id: string; name: string; code: string; department?: { name: string } };
  teacher: { id: string; firstName: string; lastName: string };
}

interface ClassSection { id: string; name: string; level: string }
interface Subject { id: string; name: string; code: string }
interface StaffMember { id: string; firstName: string; lastName: string; staffId: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday', FRIDAY: 'Friday',
};
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7); // 7am–5pm

const TYPE_COLORS: Record<string, string> = {
  Science: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  Business: 'bg-blue-50 border-blue-200 text-blue-800',
  Mathematics: 'bg-purple-50 border-purple-200 text-purple-800',
  default: 'bg-white border-slate-200 text-slate-800',
};

// ─── Add Entry Modal ──────────────────────────────────────────────────────────

const AddEntryModal: React.FC<{
  classes: ClassSection[];
  subjects: Subject[];
  teachers: StaffMember[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ classes, subjects, teachers, onClose, onSuccess }) => {
  const [form, setForm] = React.useState({
    classId: classes[0]?.id ?? '',
    subjectId: subjects[0]?.id ?? '',
    teacherId: teachers[0]?.id ?? '',
    dayOfWeek: 'MONDAY' as DayOfWeek,
    startTime: '08:00',
    endTime: '09:30',
    room: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/timetable', form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create entry');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-black text-slate-900">Add Timetable Entry</h3>
            <p className="text-xs text-slate-400 mt-0.5">Schedule a class session</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Class *</label>
              <select value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500">
                {classes.map(c => <option key={c.id} value={c.id}>{c.level.replace('FORM_', 'Form ')} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Subject *</label>
              <select value={form.subjectId} onChange={e => setForm({ ...form, subjectId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500">
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Teacher *</label>
              <select value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500">
                {teachers.map(t => <option key={t.id} value={t.id}>{t.firstName} {t.lastName} ({t.staffId})</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Day *</label>
              <select value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value as DayOfWeek })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500">
                {DAYS.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Room</label>
              <input value={form.room} onChange={e => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. Room 4, Science Lab"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Start Time *</label>
              <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">End Time *</label>
              <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500" />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-50 rounded-xl text-sm font-black uppercase tracking-widest">Cancel</button>
          <button onClick={handleSubmit as any} disabled={isLoading}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Entry
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function Timetable() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [entries, setEntries] = React.useState<TimetableEntry[]>([]);
  const [classes, setClasses] = React.useState<ClassSection[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [clashes, setClashes] = React.useState<any[]>([]);

  const [view, setView] = React.useState<'daily' | 'weekly'>('weekly');
  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>('MONDAY');
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [selectedEntry, setSelectedEntry] = React.useState<TimetableEntry | null>(null);

  // Live clock
  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Determine what to fetch based on role
      let entriesUrl = '/timetable';
      if (user?.staffProfileId) {
        entriesUrl = `/timetable/teacher/${user.staffProfileId}`;
      }

      const [entriesRes, classesRes, subjectsRes, staffRes] = await Promise.all([
        api.get(entriesUrl),
        api.get('/academic/classes'),
        api.get('/academic/subjects'),
        api.get('/users/staff'),
      ]);

      setEntries(entriesRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(staffRes.data.map((s: any) => ({
        id: s.id,
        firstName: s.firstName,
        lastName: s.lastName,
        staffId: s.staffId,
      })));

      // Detect clashes
      if (user?.staffProfileId) {
        try {
          const clashRes = await api.get(`/timetable/clashes/${user.staffProfileId}`);
          setClashes(clashRes.data);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load timetable', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  // Helpers
  const formatTime = (d: Date) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const getTimePercent = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 7) * 60 + m) / (11 * 60) * 100;
  };

  const getCurrentDay = (): DayOfWeek | null => {
    const idx = currentTime.getDay();
    return idx >= 1 && idx <= 5 ? DAYS[idx - 1] : null;
  };

  const currentDay = getCurrentDay();
  const nowStr = formatTime(currentTime);

  const currentEntry = entries.find(e =>
    e.dayOfWeek === currentDay && nowStr >= e.startTime && nowStr <= e.endTime
  );
  const nextEntry = entries
    .filter(e => e.dayOfWeek === currentDay && e.startTime > nowStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  const canManage = user?.role === 'ADMIN' || user?.role === 'HOD';

  const entryColor = (entry: TimetableEntry) => {
    const dept = entry.subject?.department?.name ?? 'default';
    return TYPE_COLORS[dept] ?? TYPE_COLORS.default;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F0F4F2]">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F2] overflow-hidden">

      {/* Header */}
      <header className="px-8 pt-8 pb-6 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <Calendar size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">Academic Schedule</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {entries.length} sessions · {clashes.length > 0 ? `${clashes.length} clash${clashes.length > 1 ? 'es' : ''}` : 'No clashes'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all">
              <RefreshCw size={16} />
            </button>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setView('daily')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all', view === 'daily' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500')}>
                <List size={15} /> Daily
              </button>
              <button onClick={() => setView('weekly')} className={cn('flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all', view === 'weekly' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-500')}>
                <LayoutGrid size={15} /> Weekly
              </button>
            </div>
            {canManage && (
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20">
                <Plus size={16} /> Add Session
              </button>
            )}
          </div>
        </div>

        {/* Now & Next */}
        <div className="grid grid-cols-2 gap-4">
          <div className={cn('p-4 rounded-2xl border-2 flex items-center justify-between transition-all', currentEntry ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200')}>
            <div className="flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', currentEntry ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-400')}>
                <Timer size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Live Period</p>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {currentEntry ? `${currentEntry.subject.name} · ${currentEntry.classSection.name}` : 'No Active Session'}
                </h3>
                {currentEntry?.room && (
                  <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <MapPin size={9} /> {currentEntry.room}
                  </p>
                )}
              </div>
            </div>
            {currentEntry && (
              <button onClick={() => navigate('/grading')} className="px-3 py-2 bg-emerald-800 text-white rounded-xl font-black text-[10px] hover:bg-emerald-900 transition-all flex items-center gap-1.5">
                Open Sheet <ArrowRight size={12} />
              </button>
            )}
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Up Next</p>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {nextEntry ? `${nextEntry.subject.name} · ${nextEntry.classSection.name}` : 'End of Day'}
                </h3>
                {nextEntry && (
                  <p className="text-[10px] font-bold text-gray-500 mt-0.5">Starts at {nextEntry.startTime}</p>
                )}
              </div>
            </div>
            {clashes.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl">
                <AlertTriangle size={12} className="text-rose-500" />
                <span className="text-[9px] font-black text-rose-600 uppercase">{clashes.length} Clash{clashes.length > 1 ? 'es' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden">

        {/* ── WEEKLY VIEW ── */}
        {view === 'weekly' && (
          <div className="h-full overflow-auto p-6">
            <div className="min-w-[900px]">
              {/* Day headers */}
              <div className="flex mb-2 ml-16">
                {DAYS.map(day => (
                  <div key={day} className={cn('flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all', day === currentDay ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400')}>
                    {DAY_LABELS[day]}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="flex" style={{ height: `${HOURS.length * 64}px` }}>
                {/* Time axis */}
                <div className="w-16 shrink-0 relative">
                  {HOURS.map(h => (
                    <div key={h} className="absolute left-0 right-0 flex items-start" style={{ top: `${((h - 7) / HOURS.length) * 100}%`, height: `${100 / HOURS.length}%` }}>
                      <span className="text-[10px] font-black text-slate-400 leading-none">{h.toString().padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>

                {/* Columns */}
                {DAYS.map(day => {
                  const dayEntries = entries.filter(e => e.dayOfWeek === day);
                  return (
                    <div key={day} className={cn('flex-1 relative border-l border-slate-100', day === currentDay && 'bg-emerald-50/30')}>
                      {/* Hour lines */}
                      {HOURS.map(h => (
                        <div key={h} className="absolute left-0 right-0 border-t border-slate-100" style={{ top: `${((h - 7) / HOURS.length) * 100}%` }} />
                      ))}

                      {/* Current time line */}
                      {day === currentDay && (
                        <div className="absolute left-0 right-0 z-20 flex items-center pointer-events-none" style={{ top: `${getTimePercent(nowStr)}%` }}>
                          <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shrink-0" />
                          <div className="flex-1 border-t-2 border-red-500" />
                        </div>
                      )}

                      {/* Entries */}
                      {dayEntries.map(entry => {
                        const top = getTimePercent(entry.startTime);
                        const height = getTimePercent(entry.endTime) - top;
                        const isClash = clashes.some(c => c.a.id === entry.id || c.b.id === entry.id);
                        const isHovered = hoveredId === entry.id;

                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onMouseEnter={() => setHoveredId(entry.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => setSelectedEntry(entry)}
                            className={cn(
                              'absolute left-1 right-1 rounded-xl p-2 border cursor-pointer overflow-hidden transition-all z-10',
                              entryColor(entry),
                              isClash && 'ring-2 ring-red-400 border-red-300',
                              isHovered && 'z-30 shadow-xl'
                            )}
                            style={{ top: `${top}%`, height: isHovered ? 'auto' : `${Math.max(height, 4)}%`, minHeight: '44px' }}
                          >
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <span className="text-[9px] font-black uppercase tracking-widest truncate">{entry.subject.code}</span>
                              {isClash && <AlertTriangle size={9} className="text-red-500 shrink-0" />}
                            </div>
                            <p className="text-[11px] font-black leading-tight truncate">{entry.subject.name}</p>
                            <p className="text-[9px] font-bold opacity-70 truncate">{entry.classSection.level.replace('FORM_', 'F')} {entry.classSection.name}</p>
                            {entry.room && (
                              <p className="text-[9px] font-bold opacity-60 flex items-center gap-0.5 mt-0.5">
                                <MapPin size={7} /> {entry.room}
                              </p>
                            )}
                            {isHovered && (
                              <div className="mt-2 pt-2 border-t border-current/20">
                                <p className="text-[9px] font-black opacity-60">{entry.startTime} – {entry.endTime}</p>
                                <p className="text-[9px] font-black opacity-60">{entry.teacher.firstName} {entry.teacher.lastName}</p>
                                <div className="flex gap-1 mt-2">
                                  <button onClick={(e) => { e.stopPropagation(); navigate('/grading'); }}
                                    className="flex-1 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg">
                                    Open Sheet
                                  </button>
                                  {canManage && (
                                    <button onClick={async (e) => {
                                      e.stopPropagation();
                                      if (confirm('Delete this entry?')) {
                                        await api.delete(`/timetable/${entry.id}`);
                                        fetchData();
                                      }
                                    }} className="px-2 py-1 bg-rose-100 text-rose-600 text-[9px] font-black rounded-lg">
                                      Del
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── DAILY VIEW ── */}
        {view === 'daily' && (
          <div className="h-full flex flex-col overflow-hidden">
            {/* Day tabs */}
            <div className="flex gap-2 px-8 pt-6 pb-4 shrink-0 overflow-x-auto">
              {DAYS.map(day => (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={cn('px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap flex items-center gap-2',
                    selectedDay === day ? 'bg-emerald-800 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100')}>
                  {DAY_LABELS[day]}
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-black',
                    selectedDay === day ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500')}>
                    {entries.filter(e => e.dayOfWeek === day).length}
                  </span>
                  {day === currentDay && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
                </button>
              ))}
            </div>

            {/* Entry list */}
            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="max-w-3xl space-y-3">
                {entries
                  .filter(e => e.dayOfWeek === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(entry => {
                    const isActive = selectedDay === currentDay && nowStr >= entry.startTime && nowStr <= entry.endTime;
                    const isClash = clashes.some(c => c.a.id === entry.id || c.b.id === entry.id);

                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        onMouseEnter={() => setHoveredId(entry.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        className={cn(
                          'bg-white rounded-2xl border p-5 cursor-pointer transition-all shadow-sm group',
                          isActive ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-emerald-200',
                          isClash && 'border-red-300 bg-red-50/30'
                        )}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="flex items-center gap-5">
                          {/* Time */}
                          <div className="w-20 shrink-0 text-center border-r border-gray-100 pr-5">
                            <p className="text-base font-black text-gray-900">{entry.startTime}</p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">{entry.endTime}</p>
                            {isActive && <div className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mx-auto" />}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-black text-gray-900 truncate">{entry.subject.name}</h4>
                              {isActive && <span className="badge-green shrink-0">Live</span>}
                              {isClash && <span className="badge-red shrink-0 flex items-center gap-1"><AlertTriangle size={10} /> Clash</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <GraduationCap size={12} />
                                {entry.classSection.level.replace('FORM_', 'Form ')} {entry.classSection.name}
                              </span>
                              {entry.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> {entry.room}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} />
                                {entry.teacher.firstName} {entry.teacher.lastName}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={(e) => { e.stopPropagation(); navigate('/grading'); }}
                              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-black hover:bg-emerald-900 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5">
                              Open Sheet <ArrowRight size={12} />
                            </button>
                            {canManage && (
                              <button onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Delete this timetable entry?')) {
                                  await api.delete(`/timetable/${entry.id}`);
                                  fetchData();
                                }
                              }} className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                {entries.filter(e => e.dayOfWeek === selectedDay).length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-lg font-black text-gray-900 mb-1">No Classes Scheduled</h3>
                    <p className="text-sm font-bold text-gray-400">Enjoy your free period!</p>
                    {canManage && (
                      <button onClick={() => setShowAddModal(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mx-auto">
                        <Plus size={14} /> Add Session
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entry Detail Drawer */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
              <div className="p-6 bg-slate-900 text-white shrink-0">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                      {DAY_LABELS[selectedEntry.dayOfWeek]} · {selectedEntry.startTime} – {selectedEntry.endTime}
                    </p>
                    <h3 className="text-2xl font-black">{selectedEntry.subject.name}</h3>
                    <p className="text-white/60 text-sm mt-1">{selectedEntry.subject.code}</p>
                  </div>
                  <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-white/10 rounded-xl">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[
                  { label: 'Class', value: `${selectedEntry.classSection.level.replace('FORM_', 'Form ')} ${selectedEntry.classSection.name}` },
                  { label: 'Teacher', value: `${selectedEntry.teacher.firstName} ${selectedEntry.teacher.lastName}` },
                  { label: 'Room', value: selectedEntry.room ?? 'Not assigned' },
                  { label: 'Day', value: DAY_LABELS[selectedEntry.dayOfWeek] },
                  { label: 'Time', value: `${selectedEntry.startTime} – ${selectedEntry.endTime}` },
                  { label: 'Department', value: selectedEntry.subject.department?.name ?? '—' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-bold text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button onClick={() => navigate('/grading')}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <ArrowRight size={14} /> Open Grading Sheet
                </button>
                {canManage && (
                  <button onClick={async () => {
                    if (confirm('Delete this entry?')) {
                      await api.delete(`/timetable/${selectedEntry.id}`);
                      setSelectedEntry(null);
                      fetchData();
                    }
                  }} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all">
                    <X size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddEntryModal
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}