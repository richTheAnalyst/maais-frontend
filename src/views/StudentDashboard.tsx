import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, CheckCircle2, Clock,
  BookOpen, ShieldAlert, GraduationCap, Activity,
  AlertTriangle, ArrowRight, ShieldCheck, Calendar,
  FileText, Download, Lock, Loader2, ClipboardCheck,
  ChevronRight, Search, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from 'recharts';
import api from '../lib/api';
import { downloadReportCard } from '../lib/pdf';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GradeEntry {
  id: string;
  subjectId: string;
  subject: { name: string; code: string };
  termId: string;
  term: { termNumber: string; academicYear: { label: string } };
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
}

interface ReportCard {
  id: string;
  averageScore: number;
  classPosition: number;
  classSize: number;
  termId: string;
  systemHash?: string;
  term: { termNumber: string; academicYear: { label: string } };
}

interface StudentProfile {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { name: string; level: string };
  grades: GradeEntry[];
  reportCards: ReportCard[];
  studentProfileId?: string;
}


// ─── Tooltip ──────────────────────────────────────────────────────────────────

const CustomPulseTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl border border-white/10 text-white min-w-[200px] space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">{data.term}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">{data.score?.toFixed(1)}%</span>
          <span className="text-[11px] font-medium text-emerald-400 uppercase">Score</span>
        </div>
        {data.grade && <p className="text-sm font-bold text-slate-300">Grade: {data.grade}</p>}
        {data.position && <p className="text-xs text-slate-400">Position: {data.position}/{data.classSize}</p>}
      </div>
    );
  }
  return null;
};

// ─── Grade color helper ───────────────────────────────────────────────────────

function gradeColor(grade: string) {
  if (grade?.startsWith('A')) return 'bg-emerald-50 text-emerald-700';
  if (grade?.startsWith('B')) return 'bg-blue-50 text-blue-700';
  if (grade?.startsWith('C')) return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function profileHasNoData(profile: StudentProfile | null): boolean {
  return !profile || (profile.grades?.length === 0 && profile.reportCards?.length === 0);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StudentDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [profile, setProfile] = React.useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<string | null>(null);
  const [downloadingTermId, setDownloadingTermId] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStep, setExportStep] = React.useState(0);
  const [activeDesktopTab, setActiveDesktopTab] = React.useState<'overview' | 'reports' | 'subjects'>('overview');

  React.useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        //try one
        const studentProfileId = (user as any).studentProfileId;
        if (studentProfileId) {
                  const res = await api.get(`/users/students/${studentProfileId}`);
                  setProfile(res.data)
                  return;
        }
        //try two
        const listRes = await api.get('/users/students');
        const matched = listRes.data.find(
          (s: any) => 
            s.user?.email === user.username + '@student.mandoshts.edu.gh' ||
          s.user?.email === user.username ||
          s.id === user.id
        )
        if (matched) {
          //getting full profile with grades and reportcards
          const fullRes = await api.get('/users/students/${matched.id}');
          setProfile(fullRes.data);
          return;
        }

        //try three"portal endpoint"
        try {
          const portalRes = await api.get('/portal/students/${user.id}/portal-data');
          setProfile(portalRes.data)
          return;
        } catch {}

        setProfile(null)
      } 
      catch (err) {
        console.error('Error fetching student profile:', err);
        setProfile(null);
      }
      finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  const subjectMap = React.useMemo(() => {
    const map: Record<string, { id: string; name: string; grades: GradeEntry[] }> = {};
    profile?.grades?.forEach(g => {
      if (!map[g.subjectId]) map[g.subjectId] = { id: g.subjectId, name: g.subject.name, grades: [] };
      map[g.subjectId].grades.push(g);
    });
    return Object.values(map);
  }, [profile]);

  const selectedSubject = selectedSubjectId ? subjectMap.find(s => s.id === selectedSubjectId) : null;

  const pulseData = React.useMemo(() => {
    if (!profile?.reportCards?.length) return [];
    return [...profile.reportCards]
      .sort((a, b) => a.term.academicYear.label.localeCompare(b.term.academicYear.label))
      .map(rc => ({
        term: `${rc.term.academicYear.label} T${rc.term.termNumber.replace('TERM_', '')}`,
        score: rc.averageScore,
        position: rc.classPosition,
        classSize: rc.classSize,
      }));
  }, [profile]);

  const subjectPulseData = React.useMemo(() => {
    if (!selectedSubject) return [];
    return [...selectedSubject.grades]
      .sort((a, b) => a.term.academicYear.label.localeCompare(b.term.academicYear.label))
      .map(g => ({
        term: `${g.term.academicYear.label} T${g.term.termNumber.replace('TERM_', '')}`,
        score: g.totalScore,
        grade: g.grade,
      }));
  }, [selectedSubject]);

  const chartData = selectedSubject ? subjectPulseData : pulseData;
  const latestRC = profile?.reportCards?.[profile.reportCards.length - 1];
  const latestAvg = latestRC?.averageScore ?? 0;

  const topSubject = subjectMap.reduce((best, s) => {
    const avg = s.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (s.grades.length || 1);
    const bestAvg = best?.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (best?.grades.length || 1);
    return avg > (bestAvg ?? 0) ? s : best;
  }, subjectMap[0]);

  const topSubjectAvg = topSubject?.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (topSubject?.grades.length || 1);

  // ─── Download report card ─────────────────────────────────────────────────

  const handleDownloadReport = async (termId: string) => {
    if (!profile) return;
    setDownloadingTermId(termId);
    try {
      await downloadReportCard(
        profile.id,
        termId,
        `${profile.firstName} ${profile.lastName}`
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate report card. Ensure grades are entered.');
    } finally {
      setDownloadingTermId(null);
    }
  };

  // ─── Export all (latest term) ─────────────────────────────────────────────

  const handleExportLatest = async () => {
    if (!latestRC || !profile) return;
    setIsExporting(true);
    setExportStep(1);
    await new Promise(r => setTimeout(r, 600));
    setExportStep(2);
    await new Promise(r => setTimeout(r, 800));
    setExportStep(3);
    try {
      await downloadReportCard(profile.id, latestRC.termId, `${profile.firstName} ${profile.lastName}`);
    } catch (err) {
      console.error('Error exporting latest report card.', err);
    }
    setIsExporting(false);
    setExportStep(0);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading your academic profile...</p>
        </div>
      </div>
    );
  }

  // ─── DESKTOP VIEW ─────────────────────────────────────────────────────────

  const renderDesktop = () => (
    <div className="hidden md:flex flex-col flex-1 bg-[#F9F9F7] overflow-hidden">
      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-100 px-10 py-6 shrink-0">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Student Portal</p>
            <h1 className="text-2xl font-black text-gray-900 italic font-display tracking-tight">
              {user?.name}
              <span className="text-gray-300 ml-3 not-italic font-sans text-base font-bold">
                #{profile?.indexNumber ?? '—'}
              </span>
            </h1>
            <p className="text-xs font-bold text-gray-400 mt-1">
              {profile?.currentClass
                ? `${profile.currentClass.level.replace('FORM_', 'Form ')} ${profile.currentClass.name}`
                : 'No class assigned'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'reports', label: 'Report Cards' },
                { id: 'subjects', label: 'Subjects' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDesktopTab(tab.id as any)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all',
                    activeDesktopTab === tab.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            {latestRC && (
              <button
                onClick={handleExportLatest}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-emerald-900/20 disabled:opacity-60"
              >
                {isExporting
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Download size={14} />}
                Download Latest
              </button>
            )}
          </div>
        </div>

        {/* Tab nav underline */}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-10 py-8 space-y-8">

          {/* ── OVERVIEW TAB ── */}
          {activeDesktopTab === 'overview' && (
            <>
              {/* Stats row */}
              <div className="grid grid-cols-4 gap-6">
                {[
                  {
                    label: 'Average Score',
                    value: latestAvg > 0 ? `${latestAvg.toFixed(1)}%` : '—',
                    sub: 'Latest term',
                    color: 'text-emerald-600',
                    bg: 'bg-emerald-50',
                    icon: Activity,
                  },
                  {
                    label: 'Class Position',
                    value: latestRC?.classPosition ?? '—',
                    sub: `of ${latestRC?.classSize ?? '—'} students`,
                    color: 'text-blue-600',
                    bg: 'bg-blue-50',
                    icon: ShieldCheck,
                  },
                  {
                    label: 'Top Subject',
                    value: topSubjectAvg ? `${topSubjectAvg.toFixed(1)}%` : '—',
                    sub: topSubject?.name ?? 'No grades yet',
                    color: 'text-purple-600',
                    bg: 'bg-purple-50',
                    icon: BookOpen,
                  },
                  {
                    label: 'Report Cards',
                    value: profile?.reportCards?.length ?? 0,
                    sub: 'of 9 terms',
                    color: 'text-amber-600',
                    bg: 'bg-amber-50',
                    icon: FileText,
                  },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm"
                  >
                    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', stat.bg, stat.color)}>
                      <stat.icon size={20} />
                    </div>
                    <p className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                    <p className="text-xs font-bold text-gray-400 mt-0.5">{stat.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart + Subjects */}
              <div className="grid grid-cols-3 gap-8">
                {/* Performance Chart */}
                <div className="col-span-2 bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                        {selectedSubject ? selectedSubject.name : 'Academic Pulse'}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 mt-1">Term-by-term performance</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedSubjectId(null)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                          selectedSubjectId === null ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        )}
                      >
                        Overall
                      </button>
                      {subjectMap.slice(0, 3).map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setSelectedSubjectId(sub.id)}
                          className={cn(
                            'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                            selectedSubjectId === sub.id ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          )}
                        >
                          {sub.name.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                  {chartData.length === 0 ? (
                    <div className="h-48 flex items-center justify-center">
                      <div className="text-center">
                        <Activity size={32} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400">No data yet</p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="desktopGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
                              <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis dataKey="term" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis hide domain={[0, 100]} />
                          <Tooltip content={<CustomPulseTooltip />} />
                          <Area
                            type="monotone" dataKey="score" stroke="#059669" strokeWidth={3}
                            fillOpacity={1} fill="url(#desktopGradient)"
                            dot={{ r: 4, fill: '#047857', strokeWidth: 2, stroke: '#fff' }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Subject Breakdown */}
                <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                  <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-6">
                    Subject Scores
                  </h3>
                  {subjectMap.length === 0 ? (
                    <div className="py-8 text-center">
                      <BookOpen size={32} className="text-gray-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-gray-400">No grades yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {subjectMap.map(sub => {
                        const avg = sub.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (sub.grades.length || 1);
                        const latestGrade = sub.grades[sub.grades.length - 1]?.grade;
                        return (
                          <div key={sub.id} className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[12px] font-black text-gray-700 truncate">{sub.name}</span>
                                <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md ml-2 shrink-0', gradeColor(latestGrade))}>
                                  {latestGrade ?? '—'}
                                </span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${avg}%` }}
                                  transition={{ duration: 0.8 }}
                                  className={cn(
                                    'h-full rounded-full',
                                    avg >= 75 ? 'bg-emerald-500' : avg >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                                  )}
                                />
                              </div>
                            </div>
                            <span className="text-[12px] font-black text-gray-500 w-10 text-right shrink-0">
                              {avg.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── REPORT CARDS TAB ── */}
          {activeDesktopTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900 italic font-display">Report Cards</h2>
                  <p className="text-xs font-bold text-gray-400 mt-1">
                    Download your terminal report cards as PDF
                  </p>
                </div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">
                  {profile?.reportCards?.length ?? 0} reports available
                </span>
              </div>

              {!profile?.reportCards?.length ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                  <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-400 mb-2">No report cards generated yet</p>
                  <p className="text-xs text-gray-300">Reports will appear here once the school generates them</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...profile.reportCards]
                    .sort((a, b) => a.term.academicYear.label.localeCompare(b.term.academicYear.label))
                    .map((rc, i) => (
                      <motion.div
                        key={rc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group"
                      >
                        {/* Card header */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                            <FileText size={20} />
                          </div>
                          <span className={cn(
                            'text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border',
                            rc.averageScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            rc.averageScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100'
                          )}>
                            {rc.averageScore >= 75 ? 'Distinction' : rc.averageScore >= 50 ? 'Pass' : 'Needs Work'}
                          </span>
                        </div>

                        {/* Term info */}
                        <div className="mb-4">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            {rc.term.academicYear.label}
                          </p>
                          <h3 className="text-lg font-black text-gray-900 italic font-display">
                            Term {rc.term.termNumber.replace('TERM_', '')}
                          </h3>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                          <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <p className="text-lg font-black text-gray-900">{rc.averageScore?.toFixed(1)}%</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Average</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <p className="text-lg font-black text-gray-900">{rc.classPosition ?? '—'}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Position</p>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-2xl text-center">
                            <p className="text-lg font-black text-gray-900">{rc.classSize ?? '—'}</p>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Class</p>
                          </div>
                        </div>

                        {/* Download button */}
                        <button
                          onClick={() => handleDownloadReport(rc.termId)}
                          disabled={downloadingTermId === rc.termId}
                          className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-60"
                        >
                          {downloadingTermId === rc.termId
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Download size={14} />}
                          {downloadingTermId === rc.termId ? 'Generating...' : 'Download PDF'}
                        </button>

                        {/* Hash */}
                        {rc.systemHash && (
                          <p className="text-[9px] font-mono text-gray-300 mt-3 truncate text-center">
                            {rc.systemHash.substring(0, 20)}...
                          </p>
                        )}
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* ── SUBJECTS TAB ── */}
          {activeDesktopTab === 'subjects' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-gray-900 italic font-display">Subject Performance</h2>

              {subjectMap.length === 0 ? (
                <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                  <BookOpen size={48} className="text-gray-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-gray-400">No grades recorded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {subjectMap.map((sub, i) => {
                    const avg = sub.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (sub.grades.length || 1);
                    const latestGrade = sub.grades[sub.grades.length - 1];

                    return (
                      <motion.div
                        key={sub.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                              <BookOpen size={18} />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black text-gray-900">{sub.name}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {sub.grades.length} term{sub.grades.length !== 1 ? 's' : ''} of data
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-black text-gray-900 italic font-display">{avg.toFixed(1)}%</p>
                            {latestGrade && (
                              <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg', gradeColor(latestGrade.grade))}>
                                {latestGrade.grade}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Term breakdown */}
                        <div className="space-y-2">
                          {sub.grades.map((g, j) => (
                            <div key={j} className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-gray-400 w-24 shrink-0 uppercase tracking-widest">
                                T{g.term.termNumber.replace('TERM_', '')} {g.term.academicYear.label.split('/')[0]}
                              </span>
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={cn('h-full rounded-full', g.totalScore >= 75 ? 'bg-emerald-500' : g.totalScore >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                                  style={{ width: `${g.totalScore}%` }}
                                />
                              </div>
                              <span className="text-[11px] font-black text-gray-600 w-10 text-right">{g.totalScore?.toFixed(1)}</span>
                              <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md w-8 text-center', gradeColor(g.grade))}>
                                {g.grade}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ─── MOBILE VIEW ──────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col bg-[#F9F9F7] font-sans relative overflow-hidden">

      {/* Export Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-700/95 backdrop-blur-md flex items-center justify-center p-8 text-white text-center"
          >
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={32} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium tracking-tight">
                  {exportStep === 1 && 'Authenticating Identity...'}
                  {exportStep === 2 && 'Securing Academic Nodes...'}
                  {exportStep === 3 && 'Generating Report Card...'}
                </h2>
                <p className="text-emerald-200/40 text-[11px] font-medium uppercase tracking-[0.2em]">
                  Technical Protocol Active
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop */}
      {renderDesktop()}

      {/* Mobile */}
      <div className="flex-1 flex flex-col md:hidden bg-[#F9F9F7] text-gray-900 overflow-hidden">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 pt-10 pb-4 shrink-0 shadow-sm">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Student Portal</p>
                <h1 className="text-[24px] font-black tracking-tight text-gray-900 leading-tight font-display italic">
                  {user?.name?.split(' ')[0]}
                  <span className="text-gray-300 ml-2 not-italic font-sans text-lg">#{profile?.indexNumber ?? '—'}</span>
                </h1>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                <Calendar size={13} className="text-emerald-700" />
                {profile?.currentClass
                  ? `${profile.currentClass.level.replace('FORM_', 'Form ')} ${profile.currentClass.name}`
                  : 'No Class Assigned'}
              </div>
              <button
                onClick={handleExportLatest}
                disabled={isExporting || !latestRC}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 text-white rounded-2xl text-[11px] font-black tracking-tight shadow-lg disabled:opacity-50"
              >
                <Download size={13} />
                Export Rep
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 pb-[5%]">

          {/* Metric Cards */}
          <section className="relative -mx-6 px-6 overflow-x-auto pb-4 scrollbar-hide snap-x flex gap-4">
            <div className="min-w-[260px] bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm snap-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Academic Pulse</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[30px] font-black text-gray-900 tracking-tighter italic font-display">
                  {latestAvg > 0 ? `${latestAvg.toFixed(1)}%` : '—'}
                </span>
                {pulseData.length >= 2 && (
                  <span className={cn('text-[12px] font-black flex items-center', pulseData[pulseData.length - 1].score >= pulseData[pulseData.length - 2].score ? 'text-emerald-600' : 'text-rose-500')}>
                    {pulseData[pulseData.length - 1].score >= pulseData[pulseData.length - 2].score ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-black text-gray-400 mt-2">Weighted Average</p>
              <div className="absolute top-7 right-7 w-12 h-12 bg-[#F9F9F7] text-emerald-700 rounded-2xl flex items-center justify-center border border-gray-100">
                <Activity size={20} />
              </div>
            </div>

            <div className="min-w-[260px] bg-emerald-700 p-7 rounded-[2rem] snap-center text-white shadow-xl">
              <p className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest mb-4">Top Subject</p>
              <span className="text-[30px] font-black tracking-tighter italic font-display block">
                {topSubjectAvg ? `${topSubjectAvg.toFixed(1)}%` : '—'}
              </span>
              <span className="text-[14px] font-black tracking-tight mt-1 block">{topSubject?.name ?? 'No grades yet'}</span>
            </div>

            {latestRC && (
              <div className="min-w-[260px] bg-gray-900 p-7 rounded-[2rem] snap-center text-white">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Class Position</p>
                <span className="text-[30px] font-black tracking-tighter italic font-display">
                  {latestRC.classPosition}<span className="text-lg opacity-40">/{latestRC.classSize}</span>
                </span>
              </div>
            )}
          </section>

          {/* Report Cards on mobile */}
          {(profile?.reportCards?.length ?? 0) > 0 && (
            <div className="space-y-4">
              <h3 className="text-[17px] font-black text-gray-900 italic font-display">Report Cards</h3>
              {[...profile!.reportCards]
                .sort((a, b) => a.term.academicYear.label.localeCompare(b.term.academicYear.label))
                .map(rc => (
                  <div key={rc.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {rc.term.academicYear.label}
                        </p>
                        <h4 className="text-[16px] font-black text-gray-900 italic font-display">
                          Term {rc.term.termNumber.replace('TERM_', '')}
                        </h4>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-gray-900 italic font-display">{rc.averageScore?.toFixed(1)}%</p>
                        <p className="text-[10px] font-bold text-gray-400">Pos: {rc.classPosition}/{rc.classSize}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadReport(rc.termId)}
                      disabled={downloadingTermId === rc.termId}
                      className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {downloadingTermId === rc.termId
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Download size={14} />}
                      {downloadingTermId === rc.termId ? 'Generating...' : 'Download PDF'}
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* Subject chips + grades */}
          <div className="space-y-4">
            <h3 className="text-[19px] font-black text-gray-900 italic font-display">Analytics</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              <button
                onClick={() => setSelectedSubjectId(null)}
                className={cn('px-5 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border shadow-sm', selectedSubjectId === null ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg' : 'bg-[#F9F9F7] text-gray-500 border-gray-100')}
              >
                Overall
              </button>
              {subjectMap.map(sub => (
                <button key={sub.id} onClick={() => setSelectedSubjectId(sub.id)}
                  className={cn('px-5 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border shadow-sm', selectedSubjectId === sub.id ? 'bg-emerald-700 text-white border-emerald-700 shadow-lg' : 'bg-[#F9F9F7] text-gray-500 border-gray-100')}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {selectedSubject ? (
              <motion.div key={selectedSubject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                {selectedSubject.grades.map((g, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {g.term.academicYear.label} · T{g.term.termNumber.replace('TERM_', '')}
                      </p>
                      <p className="text-sm font-bold text-gray-600 mt-1 italic">{g.remark || '—'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 font-display italic">{g.totalScore?.toFixed(1)}</p>
                      <span className={cn('text-[11px] font-black px-2 py-0.5 rounded-lg', gradeColor(g.grade))}>
                        {g.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : profileHasNoData(profile) ? (
              <div className="py-12 text-center bg-[#F9F9F7] rounded-3xl border border-gray-100">
                <BookOpen className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-[15px] font-black text-gray-900 italic font-display">No grades yet</p>
              </div>
            ) : (
              chartData.length > 0 && (
                <div className="h-48 bg-white rounded-3xl border border-gray-100 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="mobileGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#047857" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="term" hide />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip content={<CustomPulseTooltip />} />
                      <Area type="monotone" dataKey="score" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#mobileGradient)" dot={{ r: 4, fill: '#047857', strokeWidth: 2, stroke: '#fff' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )
            )}
          </div>

          {/* Compliance footer */}
          <div className="bg-emerald-800 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest">Progress</p>
                <span className="text-[14px] font-black text-white flex items-center gap-2 italic">
                  {profile?.reportCards?.length ?? 0} / 9 Terms <ShieldCheck size={14} />
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((profile?.reportCards?.length ?? 0) / 9) * 100)}%` }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
            <button onClick={() => navigate('/journey-audit')} className="flex items-center gap-2 text-[11px] font-black text-white hover:text-emerald-200 transition-colors py-2 tracking-tight">
              Request Comprehensive Audit <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}