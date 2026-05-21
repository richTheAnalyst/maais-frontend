import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, GraduationCap, TrendingUp, AlertCircle,
  CheckCircle2, Clock, ShieldAlert, Radio, FileCheck,
  LifeBuoy, StickyNote, Zap, Lock, ArrowUpRight,
  MoreVertical, ThumbsUp, ThumbsDown, ExternalLink,
  Calendar, User, UserPlus, ChevronRight, X, Plus,
  Loader2, RefreshCw
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import api from '../lib/api';



function Sparkline({ color }: { color: string }) {
  return (
    <svg className="w-16 h-8 overflow-visible" viewBox="0 0 100 40">
      <path
        d="M0,35 Q10,10 20,25 T40,15 T60,20 T80,10 T100,5"
        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
      />
    </svg>
  );
}

interface PulseData {
  enrollment: { class: string; count: number; capacity: number }[];
  subjectPerformance: { subjectId: string; averageScore: string; studentCount: number }[];
  attendance: { daysPresent: number | null; totalDays: number | null };
}

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  user?: { email: string };
}

interface HealthData {
  status: string;
  checkedAt: string;
  counts: {
    totalStudents: number;
    activeStudents: number;
    archivedStudents: number;
    totalGrades: number;
    totalReportCards: number;
    totalTranscripts: number;
    pendingObservations: number;
  };
}



export function AdminHome() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [fabOpen, setFabOpen] = React.useState(false);
  const [notepadContent, setNotepadContent] = React.useState(
    localStorage.getItem('admin_notepad') || 'Check SHS 1 enrollment by 2 PM'
  );
  const [activeAction, setActiveAction] = React.useState<string | null>(null);
  const [isFreezeActive, setIsFreezeActive] = React.useState(false);

  // ─── Real data ─────────────────────────────────────────────────────────────
  const [pulse, setPulse] = React.useState<PulseData | null>(null);
  const [health, setHealth] = React.useState<HealthData | null>(null);
  const [auditLogs, setAuditLogs] = React.useState<AuditLog[]>([]);
  const [activeYear, setActiveYear] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('admin_notepad', notepadContent);
  }, [notepadContent]);

  React.useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [pulseRes, healthRes, yearRes] = await Promise.all([
          api.get('/comms/analytics/pulse'),
          api.get('/archive/health'),
          api.get('/academic/years/active'),
        ]);
        setPulse(pulseRes.data);
        setHealth(healthRes.data);
        setActiveYear(yearRes.data);
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const executeAction = (action: string) => {
    if (action === 'Emergency Freeze') setActiveAction('freeze');
    else if (action === 'Register Node') setActiveAction('register');
    else if (action === 'Broadcast Pulse') setActiveAction('broadcast');
    setFabOpen(false);
  };

  // ─── Derived stats ──────────────────────────────────────────────────────────
  const totalStudents = health?.counts.activeStudents ?? 0;
  const totalGrades = health?.counts.totalGrades ?? 0;
  const totalReportCards = health?.counts.totalReportCards ?? 0;
  const pendingObservations = health?.counts.pendingObservations ?? 0;

  const gradingProgress = totalGrades > 0
    ? Math.min(100, Math.round((totalGrades / Math.max(totalGrades + pendingObservations, 1)) * 100))
    : 0;

  // Build performance chart from pulse data
  const performanceData = pulse?.subjectPerformance
    ?.filter(s => s.averageScore !== null)
    .slice(0, 6)
    .map((s, i) => ({
      name: `Subject ${i + 1}`,
      score: parseFloat(s.averageScore ?? '0'),
      color: ['#059669', '#0284c7', '#7c3aed', '#db2777', '#ea580c', '#65a30d'][i % 6],
    })) ?? [];

  const vitalCards = [
    {
      label: 'Student Census',
      value: isLoading ? '...' : totalStudents.toLocaleString(),
      subtext: `${health?.counts.archivedStudents ?? 0} Archived / Alumni`,
      icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '#2563eb',
    },
    {
      label: 'Total Grades Entered',
      value: isLoading ? '...' : totalGrades.toLocaleString(),
      subtext: `${totalReportCards} report cards generated`,
      icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: '#4f46e5',
    },
    {
      label: 'Grading Progress',
      value: isLoading ? '...' : `${gradingProgress}%`,
      subtext: `${pendingObservations} observations pending`,
      icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '#059669',
      progress: gradingProgress,
    },
    {
      label: 'Pending Observations',
      value: isLoading ? '...' : `${pendingObservations} Flags`,
      subtext: 'Missing behavioral observations',
      icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', trend: '#e11d48',
    },
  ];

  // Build activity log from enrollment data
  const activityLog = pulse?.enrollment?.slice(0, 5).map((e, i) => ({
    id: String(i),
    time: `${e.class}`,
    event: `${e.count} students enrolled — capacity ${e.capacity}`,
    type: e.count >= e.capacity ? 'alert' : e.count > 0 ? 'academic' : 'system',
  })) ?? [];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 relative p-8">
      <div className="max-w-7xl mx-auto space-y-8 pb-20">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03]">
            <Radio size={160} />
          </div>
          <div className="relative">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight italic font-display">
              Good morning, {user?.name?.split(' ')[0] ?? 'Admin'}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{formatDate(currentTime)}</p>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <p className="text-sm font-black text-slate-900 font-mono tracking-tighter tabular-nums">{formatTime(currentTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isLoading ? 'Loading...' : health?.status === 'healthy' ? 'System Live' : 'Checking...'}
              </span>
            </div>
            <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-lg shadow-slate-900/10">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-[11px] font-black tracking-widest uppercase">
                {activeYear?.label ?? '—'} | {activeYear?.terms?.find((t: any) => t.isActive)?.termNumber?.replace('_', ' ') ?? '—'}
              </span>
            </div>
          </div>
        </header>


        {/* Vital Signs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {vitalCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-[2rem] border border-slate-200/50 shadow-sm hover:shadow-md transition-all relative group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn('w-12 h-12 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110', card.bg, card.color)}>
                  <card.icon size={22} />
                </div>
                <Sparkline color={card.trend} />
              </div>
              <p className="text-[28px] font-black text-slate-900 tracking-tighter leading-none mb-2">
                {isLoading ? <Loader2 size={24} className="animate-spin text-slate-300" /> : card.value}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{card.label}</p>
              {card.progress !== undefined ? (
                <div className="space-y-2">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progress}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      className={cn('h-full rounded-full', card.progress < 40 ? 'bg-rose-500' : card.progress < 75 ? 'bg-amber-500' : 'bg-emerald-500')}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 flex justify-between">
                    <span>Progress</span>
                    <span>{card.progress}% Complete</span>
                  </p>
                </div>
              ) : (
                <p className="text-[11px] font-bold text-slate-500/80 leading-snug">{card.subtext}</p>
              )}
            </motion.div>
          ))}
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left 8 columns */}
          <div className="lg:col-span-8 space-y-8">


             {/* Performance Chart */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8">
                <Radio className="text-slate-100" size={100} />
              </div>
              <div className="flex items-center justify-between mb-8 relative">
                <div>
                  <h3 className="text-[14px] font-black text-slate-900 uppercase tracking-[0.25em]">
                    Subject Performance Heatmap
                  </h3>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
                    Average scores across all subjects
                  </p>
                </div>
                {isLoading && <Loader2 size={20} className="animate-spin text-slate-300" />}
              </div>

              {performanceData.length === 0 && !isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">No grade data yet</p>
                    <p className="text-xs text-slate-300 mt-1">Enter grades to see performance analytics</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} domain={[0, 100]} />
                        <Tooltip
                          cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xl">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{payload[0].payload.name}</p>
                                  <p className="text-xl font-black text-slate-900">{Number(payload[0].value).toFixed(1)}%</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="score" radius={[12, 12, 4, 4]} barSize={50}>
                          {performanceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.85} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6 pt-6 border-t border-slate-50">
                    {performanceData.map((dept, i) => (
                      <div key={i} className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{dept.name}</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-slate-900 tabular-nums">{dept.score.toFixed(1)}%</span>
                          {dept.score > 75 && <ArrowUpRight size={12} className="text-emerald-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>

            {/* Class Enrollment Feed */}
            <section className="bg-slate-900 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
              <div className="absolute bottom-0 right-0 p-10 opacity-[0.03]">
                <Clock size={160} className="text-white" />
              </div>
              <div className="flex items-center justify-between mb-8 relative">
                <div>
                  <h3 className="text-[14px] font-black text-white uppercase tracking-[0.25em]">Class Enrollment Feed</h3>
                  <p className="text-[10px] font-medium text-slate-500 mt-1 uppercase tracking-widest">
                    Live student distribution by class
                  </p>
                </div>
                <Link to="/identity/students" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-all">
                  View All Students
                </Link>
              </div>
              <div className="space-y-2 relative">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="text-slate-600 animate-spin" />
                  </div>
                ) : pulse?.enrollment?.length === 0 ? (
                  <p className="text-slate-600 text-sm font-bold text-center py-8">No enrollment data yet</p>
                ) : (
                  pulse?.enrollment?.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-6 py-4 px-4 hover:bg-slate-800/50 rounded-2xl transition-all group"
                    >
                      <span className="text-[11px] font-black text-slate-600 font-mono w-24 group-hover:text-amber-500 transition-colors truncate">
                        {item.class}
                      </span>
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, (item.count / item.capacity) * 100)}%` }}
                          transition={{ duration: 0.8, delay: i * 0.05 }}
                          className={cn(
                            'h-full rounded-full',
                            item.count >= item.capacity ? 'bg-rose-500' : 'bg-emerald-500'
                          )}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-400 w-16 text-right">
                        {item.count}/{item.capacity}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>

          

          {/* Action Center: Right 4 Columns */}
          <aside className="lg:col-span-4 space-y-8">
            
            {/* 4. Action Center (Right Side Sidebar) */}
            
            {/* DB Health */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-sm">
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6">
                System Health
              </h3>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={24} className="animate-spin text-slate-300" />
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: 'Total Students', value: health?.counts.totalStudents ?? 0 },
                    { label: 'Active Students', value: health?.counts.activeStudents ?? 0 },
                    { label: 'Archived / Alumni', value: health?.counts.archivedStudents ?? 0 },
                    { label: 'Grade Entries', value: health?.counts.totalGrades ?? 0 },
                    { label: 'Report Cards', value: health?.counts.totalReportCards ?? 0 },
                    { label: 'Transcripts', value: health?.counts.totalTranscripts ?? 0 },
                    { label: 'Pending Observations', value: health?.counts.pendingObservations ?? 0, highlight: true },
                  ].map((item, i) => (
                    <div key={i} className={cn(
                      'flex justify-between items-center py-2 border-b border-slate-50',
                      item.highlight && item.value > 0 ? 'text-rose-600' : ''
                    )}>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                      <span className={cn('text-sm font-black', item.highlight && item.value > 0 ? 'text-rose-600' : 'text-slate-900')}>
                        {item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">Status</span>
                    <span className={cn(
                      'text-[10px] font-black uppercase px-2 py-1 rounded-lg',
                      health?.status === 'healthy' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    )}>
                      {health?.status ?? 'Unknown'}
                    </span>
                  </div>
                </div>
              )}
            </div>


           {/* Admin Notepad */}
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200 shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.05]">
                <Zap size={60} />
              </div>
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center">
                  <StickyNote size={16} />
                </div>
                <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.25em]">Strategic Memo</h3>
              </div>
              <textarea
                value={notepadContent}
                onChange={e => setNotepadContent(e.target.value)}
                className="w-full h-40 bg-transparent text-[13px] font-bold text-slate-600 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed border-none focus:ring-0 p-0"
                placeholder="Commit strategic reminders here..."
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Auto-saved locally</p>
                <CheckCircle2 size={14} className="text-emerald-400" />
              </div>
            </div>

          </aside>
        </div>
      </div>

{/* FAB */}
      <div className="fixed bottom-10 right-10 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen && (
            <div className="flex flex-col gap-3 items-end mb-3">
              {[
                { label: 'Register Node', icon: UserPlus, color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
                { label: 'Broadcast Pulse', icon: Radio, color: 'bg-white text-slate-900', hover: 'hover:bg-slate-100' },
                { label: 'Emergency Freeze', icon: Lock, color: 'bg-rose-600 text-white', hover: 'hover:bg-rose-700' },
              ].map((action, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.8, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.8, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn('flex items-center gap-4 px-6 py-4 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all', action.color, action.hover)}
                  onClick={() => executeAction(action.label)}
                >
                  <span className="text-[11px] font-black uppercase tracking-[0.25em]">{action.label}</span>
                  <action.icon size={18} />
                </motion.button>
              ))}
            </div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            'w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all shadow-[0_20px_60px_rgba(0,0,0,0.2)] transform active:scale-90',
            fabOpen ? 'bg-slate-900 text-white rotate-45' :
            isFreezeActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-900 text-white hover:bg-black'
          )}
        >
          {isFreezeActive && !fabOpen ? <Lock size={32} /> : <Plus size={32} />}
        </button>
      </div>


     {/* Modals — kept exactly as original */}
      <AnimatePresence>
        {activeAction === 'register' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveAction(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden p-10">
              <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">Register New Node</h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8">Institutional Identity Provisioning</p>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Student Protocol', desc: 'Initialize academic and residential profile', icon: GraduationCap, path: '/identity/students' },
                  { label: 'Faculty Protocol', desc: 'Provision instructional and access rights', icon: UserPlus, path: '/identity/staff' },
                  { label: 'Guardian Protocol', desc: 'Link household and digital delivery', icon: Users, path: '/identity/parents' },
                ].map((p, i) => (
                  <button key={i} onClick={() => { setActiveAction(null); navigate(p.path); }}
                    className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-slate-100 transition-all text-left">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-sm">
                        <p.icon size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black italic font-display text-slate-900">{p.label}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeAction === 'broadcast' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveAction(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-black italic font-display">Broadcast Pulse</h3>
                  <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mt-2">Omni-Channel Institutional Message Delivery</p>
                </div>
                <X className="cursor-pointer hover:text-rose-500 transition-all" onClick={() => setActiveAction(null)} />
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Broadcast Channels</label>
                  <div className="flex gap-3">
                    {['In-App Push', 'Bulk SMS', 'Academic Email'].map(c => (
                      <button key={c} className="flex-1 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">{c}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Message Payload</label>
                  <textarea className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none font-medium italic resize-none" placeholder="Enter the official communication core..." />
                </div>
                <button onClick={() => { navigate('/comms'); setActiveAction(null); }} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                  <Radio size={18} className="animate-pulse" />
                  Go to Comms Module
                </button>
              </div>
            </motion.div>
          </div>
        )}



        {activeAction === 'freeze' && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setActiveAction(null)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl text-center p-12">
              <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-rose-200">
                <Lock size={40} />
              </div>
              <h3 className="text-2xl font-black italic font-display text-slate-900 mb-4">
                {isFreezeActive ? 'Lift Institutional Freeze?' : 'Initiate Emergency Freeze?'}
              </h3>
              <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-10">
                {isFreezeActive
                  ? 'This will restore write-authority across all faculty nodes.'
                  : 'This instantly suspends grade entry across all departments.'}
              </p>
              <div className="flex gap-4">
                <button onClick={() => setActiveAction(null)} className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest">Abort</button>
                <button
                  onClick={() => { setIsFreezeActive(!isFreezeActive); setActiveAction(null); navigate('/grading'); }}
                  className={cn('flex-1 py-4 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl', isFreezeActive ? 'bg-emerald-600' : 'bg-rose-600')}
                >
                  {isFreezeActive ? 'Restore System' : 'Execute Freeze'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}