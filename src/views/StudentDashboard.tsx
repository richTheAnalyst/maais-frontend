import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, CheckCircle2, Clock,
  BookOpen, GraduationCap, Activity,
  ArrowRight, ShieldCheck, Calendar,
  FileText, Download, Lock, Loader2,
  ChevronRight, Star, Award, Target
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Line, ReferenceLine
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
}

interface PulseChartEntry {
  term: string;
  score: number;
  prevScore?: number;
  grade?: string;
  position?: number;
  classSize?: number;
  isBest?: boolean;
  isWorst?: boolean;
  fullTerm?: string;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const PulseTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  const prevScore = d.prevScore;
  const delta = prevScore != null ? d.score - prevScore : null;

  return (
    <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 text-white min-w-[180px]">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{d.term}</p>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-black">{d.score?.toFixed(1)}%</span>
        {delta != null && (
          <span className={cn('text-[11px] font-black flex items-center gap-0.5', delta >= 0 ? 'text-emerald-400' : 'text-rose-400')}>
            {delta >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
      </div>
      {d.grade && <p className="text-[11px] font-bold text-slate-300">Grade: {d.grade}</p>}
      {d.position && (
        <p className="text-[10px] text-slate-400 mt-1">
          Position: {d.position}/{d.classSize}
        </p>
      )}
      {d.isBest && (
        <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-black text-amber-400 uppercase">
          <Star size={8} /> Best Term
        </span>
      )}
      {d.isWorst && (
        <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-black text-rose-400 uppercase">
          <Target size={8} /> Needs Improvement
        </span>
      )}
    </div>
  );
};

// ─── Grade color ──────────────────────────────────────────────────────────────

function gradeColor(grade: string) {
  if (grade?.startsWith('A')) return 'bg-emerald-50 text-emerald-700';
  if (grade?.startsWith('B')) return 'bg-blue-50 text-blue-700';
  if (grade?.startsWith('C')) return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

function profileHasNoData(profile: StudentProfile | null) {
  return !profile || (profile.grades?.length === 0 && profile.reportCards?.length === 0);
}

// ─── Delta badge ──────────────────────────────────────────────────────────────

function DeltaBadge({ current, previous }: { current: number; previous?: number }) {
  if (previous == null) return null;
  const delta = current - previous;
  return (
    <span className={cn(
      'flex items-center gap-0.5 text-[10px] font-black',
      delta >= 0 ? 'text-emerald-600' : 'text-rose-500'
    )}>
      {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
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
  const [activeTab, setActiveTab] = React.useState<'overview' | 'reports' | 'subjects'>('overview');

  // ─── Profile loading — bugs fixed ───────────────────────────────────────

  React.useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        // Strategy 1: use studentProfileId stored in context (most reliable)
        const studentProfileId = (user as any).studentProfileId;
        if (studentProfileId) {
          const res = await api.get(`/users/students/${studentProfileId}`); // ← backtick fixed
          setProfile(res.data);
          return;
        }

        // Strategy 2: search list and match by email or id
        const listRes = await api.get('/users/students');
        const matched = listRes.data.find(
          (s: any) =>
            s.user?.email === user.username + '@student.mandoshts.edu.gh' ||
            s.user?.email === user.username ||
            s.id === user.id
        );
        if (matched) {
          const fullRes = await api.get(`/users/students/${matched.id}`); // ← backtick fixed
          setProfile(fullRes.data);
          return;
        }

        // Strategy 3: portal endpoint
        try {
          const portalRes = await api.get(`/portal/students/${user.id}/portal-data`); // ← backtick fixed
          setProfile(portalRes.data);
          return;
        } catch {}

        setProfile(null);
      } catch (err) {
        console.error('Error fetching student profile:', err);
        setProfile(null);
      } finally {
        setIsLoading(false); // ← always runs now
      }
    }
    loadProfile();
  }, [user]);

  // ─── Derived data ──────────────────────────────────────────────────────

  const subjectMap = React.useMemo(() => {
    const map: Record<string, { id: string; name: string; grades: GradeEntry[] }> = {};
    profile?.grades?.forEach(g => {
      if (!map[g.subjectId]) map[g.subjectId] = { id: g.subjectId, name: g.subject.name, grades: [] };
      map[g.subjectId].grades.push(g);
    });
    return Object.values(map);
  }, [profile]);

  const selectedSubject = selectedSubjectId
    ? subjectMap.find(s => s.id === selectedSubjectId)
    : null;

  // Sorted report cards
  const sortedReportCards = React.useMemo(() =>
    [...(profile?.reportCards ?? [])].sort((a, b) =>
      a.term.academicYear.label.localeCompare(b.term.academicYear.label)
    ), [profile]);

  // Pulse chart data — includes delta, isBest, isWorst flags
  const pulseData = React.useMemo(() => {
    if (!sortedReportCards.length) return [];
    const scores = sortedReportCards.map(rc => rc.averageScore);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    return sortedReportCards.map((rc, i) => ({
      term: `T${rc.term.termNumber.replace('TERM_', '')} ${rc.term.academicYear.label.split('/')[0]}`,
      fullTerm: `${rc.term.academicYear.label} · Term ${rc.term.termNumber.replace('TERM_', '')}`,
      score: rc.averageScore,
      position: rc.classPosition,
      classSize: rc.classSize,
      prevScore: i > 0 ? sortedReportCards[i - 1].averageScore : undefined,
      isBest: rc.averageScore === maxScore && scores.length > 1,
      isWorst: rc.averageScore === minScore && scores.length > 1,
    }));
  }, [sortedReportCards]);

  // Subject pulse data
  const subjectPulseData = React.useMemo(() => {
    if (!selectedSubject) return [];
    return [...selectedSubject.grades]
      .sort((a, b) => a.term.academicYear.label.localeCompare(b.term.academicYear.label))
      .map((g, i, arr) => ({
        term: `T${g.term.termNumber.replace('TERM_', '')} ${g.term.academicYear.label.split('/')[0]}`,
        score: g.totalScore,
        grade: g.grade,
        prevScore: i > 0 ? arr[i - 1].totalScore : undefined,
      }));
  }, [selectedSubject]);

  const chartData = selectedSubject ? subjectPulseData : pulseData;

  // Key stats
  const latestRC = sortedReportCards[sortedReportCards.length - 1];
  const prevRC = sortedReportCards[sortedReportCards.length - 2];
  const latestAvg = latestRC?.averageScore ?? 0;

  const topSubject = subjectMap.reduce<typeof subjectMap[0] | null>((best, s) => {
    const avg = s.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (s.grades.length || 1);
    const bestAvg = best
      ? best.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (best.grades.length || 1)
      : -1;
    return avg > bestAvg ? s : best;
  }, null);
  const topSubjectAvg = topSubject
    ? topSubject.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (topSubject.grades.length || 1)
    : 0;

  const weakestSubject = subjectMap.reduce<typeof subjectMap[0] | null>((worst, s) => {
    const avg = s.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (s.grades.length || 1);
    const worstAvg = worst
      ? worst.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (worst.grades.length || 1)
      : 999;
    return avg < worstAvg ? s : worst;
  }, null);

  const bestTerm = pulseData.reduce<typeof pulseData[0] | null>(
    (best, d) => (!best || d.score > best.score ? d : best), null
  );
  const overallTrend = pulseData.length >= 2
    ? pulseData[pulseData.length - 1].score - pulseData[0].score
    : null;

  // ─── Download handlers ────────────────────────────────────────────────

  const handleDownloadReport = async (termId: string) => {
    if (!profile) return;
    setDownloadingTermId(termId);
    try {
      await downloadReportCard(profile.id, termId, `${profile.firstName} ${profile.lastName}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate report card.');
    } finally {
      setDownloadingTermId(null);
    }
  };

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
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
      setExportStep(0);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────

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

  // ─── Academic Pulse Chart Section ────────────────────────────────────

  const renderPulseChart = () => {
    const avg = chartData.length
      ? chartData.reduce((sum, d) => sum + d.score, 0) / chartData.length
      : null;

    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
        {/* Chart header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
              {selectedSubject ? selectedSubject.name : 'Academic Pulse'}
            </h3>
            <p className="text-xs font-bold text-gray-400 mt-1">
              {selectedSubject ? 'Subject performance over time' : 'Overall term-by-term performance'}
            </p>
          </div>
          {/* Subject selector buttons */}
          <div className="flex gap-1.5 flex-wrap justify-end max-w-xs">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                selectedSubjectId === null ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              )}
            >
              Overall
            </button>
            {subjectMap.slice(0, 4).map(sub => (
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
              <p className="text-xs text-gray-300 mt-1">Grades will appear here once entered</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key callouts */}
            {!selectedSubject && pulseData.length >= 2 && (
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Best Term
                  </p>
                  <p className="text-base font-black text-amber-600">{bestTerm?.score.toFixed(1)}%</p>
                  <p className="text-[10px] font-bold text-slate-400">{bestTerm?.term}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Overall Trend
                  </p>
                  {overallTrend != null ? (
                    <div className="flex items-center justify-center gap-1">
                      <p className={cn('text-base font-black', overallTrend >= 0 ? 'text-emerald-600' : 'text-rose-500')}>
                        {overallTrend >= 0 ? '+' : ''}{overallTrend.toFixed(1)}%
                      </p>
                      {overallTrend >= 0
                        ? <TrendingUp size={14} className="text-emerald-600" />
                        : <TrendingDown size={14} className="text-rose-500" />}
                    </div>
                  ) : <p className="text-base font-black text-slate-400">—</p>}
                  <p className="text-[10px] font-bold text-slate-400">Since start</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Last Change
                  </p>
                  {latestRC && prevRC ? (
                    <div className="flex items-center justify-center">
                      <DeltaBadge current={latestRC.averageScore} previous={prevRC.averageScore} />
                    </div>
                  ) : <p className="text-base font-black text-slate-400">—</p>}
                  <p className="text-[10px] font-bold text-slate-400">vs prev term</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#047857" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="term"
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis hide domain={[0, 100]} />
                  {/* Average reference line */}
                  {avg != null && (
                    <ReferenceLine
                      y={avg}
                      stroke="#94a3b8"
                      strokeDasharray="4 4"
                      label={{
                        value: `Avg ${avg.toFixed(1)}%`,
                        position: 'insideTopRight',
                        fontSize: 9,
                        fontWeight: 700,
                        fill: '#94a3b8',
                      }}
                    />
                  )}
                  {/* 50% pass line */}
                  <ReferenceLine
                    y={50}
                    stroke="#fca5a5"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Pass 50%',
                      position: 'insideBottomRight',
                      fontSize: 9,
                      fontWeight: 700,
                      fill: '#fca5a5',
                    }}
                  />
                  <Tooltip content={<PulseTooltip />} />
                  <Area
                    type="monotone" dataKey="score"
                    stroke="#059669" strokeWidth={3}
                    fillOpacity={1} fill="url(#pulseGrad)"
                    dot={(props: any) => {
                      const d = props.payload;
                      const isBest = d.isBest;
                      const isWorst = d.isWorst;
                      return (
                        <circle
                          key={props.key}
                          cx={props.cx} cy={props.cy}
                          r={isBest || isWorst ? 6 : 4}
                          fill={isBest ? '#f59e0b' : isWorst ? '#ef4444' : '#047857'}
                          stroke="#fff" strokeWidth={2}
                        />
                      );
                    }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Best Term</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Needs Attention</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 border-t-2 border-dashed border-slate-300" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Average</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col bg-[#F9F9F7] overflow-hidden">

      {/* Export overlay */}
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

      {/* ── DESKTOP ── */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {/* Header */}
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
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'reports', label: 'Report Cards' },
                  { id: 'subjects', label: 'Subjects' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all',
                      activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    )}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {latestRC && (
                <button onClick={handleExportLatest} disabled={isExporting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg disabled:opacity-60">
                  {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                  Latest Report
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-10 py-8 space-y-8">

            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <>
                {/* Stats */}
                <div className="grid grid-cols-4 gap-6">
                  {[
                    {
                      label: 'Term Average',
                      value: latestAvg > 0 ? `${latestAvg.toFixed(1)}%` : '—',
                      sub: latestRC && prevRC
                        ? `${latestAvg > prevRC.averageScore ? '▲' : '▼'} ${Math.abs(latestAvg - prevRC.averageScore).toFixed(1)}% vs last term`
                        : 'Latest term',
                      color: latestAvg >= 50 ? 'text-emerald-600' : 'text-rose-600',
                      bg: latestAvg >= 50 ? 'bg-emerald-50' : 'bg-rose-50',
                      icon: Activity,
                    },
                    {
                      label: 'Class Position',
                      value: latestRC?.classPosition ? `#${latestRC.classPosition}` : '—',
                      sub: `of ${latestRC?.classSize ?? '—'} students`,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                      icon: Award,
                    },
                    {
                      label: 'Best Subject',
                      value: topSubjectAvg ? `${topSubjectAvg.toFixed(1)}%` : '—',
                      sub: topSubject?.name ?? 'No grades yet',
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                      icon: Star,
                    },
                    {
                      label: 'Needs Attention',
                      value: weakestSubject?.name?.split(' ')[0] ?? '—',
                      sub: weakestSubject
                        ? `${(weakestSubject.grades.reduce((s, g) => s + g.totalScore, 0) / (weakestSubject.grades.length || 1)).toFixed(1)}% average`
                        : 'All good',
                      color: 'text-purple-600',
                      bg: 'bg-purple-50',
                      icon: Target,
                    },
                  ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', stat.bg, stat.color)}>
                        <stat.icon size={20} />
                      </div>
                      <p className="text-2xl font-black text-gray-900 tracking-tight truncate">{stat.value}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-0.5 truncate">{stat.sub}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Chart + Subject breakdown */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="col-span-2">{renderPulseChart()}</div>

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
                      <div className="space-y-4">
                        {subjectMap.map(sub => {
                          const avg = sub.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) / (sub.grades.length || 1);
                          const latestGrade = sub.grades[sub.grades.length - 1];
                          const prevGrade = sub.grades[sub.grades.length - 2];
                          return (
                            <div key={sub.id}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] font-black text-gray-700 truncate flex-1 mr-2">{sub.name}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <DeltaBadge current={latestGrade?.totalScore} previous={prevGrade?.totalScore} />
                                  <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', gradeColor(latestGrade?.grade))}>
                                    {latestGrade?.grade ?? '—'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${avg}%` }}
                                    transition={{ duration: 0.8 }}
                                    className={cn('h-full rounded-full', avg >= 75 ? 'bg-emerald-500' : avg >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                                  />
                                </div>
                                <span className="text-[11px] font-black text-gray-500 w-10 text-right shrink-0">
                                  {avg.toFixed(1)}%
                                </span>
                              </div>
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
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-gray-900 italic font-display">Report Cards</h2>
                    <p className="text-xs font-bold text-gray-400 mt-1">Download your terminal report cards as PDF</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                    {profile?.reportCards?.length ?? 0} available
                  </span>
                </div>
                {!sortedReportCards.length ? (
                  <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
                    <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-gray-400">No report cards generated yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedReportCards.map((rc, i) => {
                      const prev = sortedReportCards[i - 1];
                      return (
                        <motion.div key={rc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                              <FileText size={20} />
                            </div>
                            <div className="text-right">
                              <span className={cn(
                                'text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border block mb-1',
                                rc.averageScore >= 75 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                rc.averageScore >= 50 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-rose-50 text-rose-700 border-rose-100'
                              )}>
                                {rc.averageScore >= 75 ? 'Distinction' : rc.averageScore >= 50 ? 'Pass' : 'Needs Work'}
                              </span>
                              <DeltaBadge current={rc.averageScore} previous={prev?.averageScore} />
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                            {rc.term.academicYear.label}
                          </p>
                          <h3 className="text-lg font-black text-gray-900 italic font-display mb-4">
                            Term {rc.term.termNumber.replace('TERM_', '')}
                          </h3>
                          <div className="grid grid-cols-3 gap-2 mb-6">
                            {[
                              { label: 'Average', value: `${rc.averageScore?.toFixed(1)}%` },
                              { label: 'Position', value: rc.classPosition ?? '—' },
                              { label: 'Class', value: rc.classSize ?? '—' },
                            ].map((s, j) => (
                              <div key={j} className="bg-gray-50 p-3 rounded-2xl text-center">
                                <p className="text-base font-black text-gray-900">{s.value}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{s.label}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => handleDownloadReport(rc.termId)}
                            disabled={downloadingTermId === rc.termId}
                            className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-60"
                          >
                            {downloadingTermId === rc.termId
                              ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                              : <><Download size={14} /> Download PDF</>}
                          </button>
                          {rc.systemHash && (
                            <p className="text-[9px] font-mono text-gray-300 mt-3 truncate text-center">
                              {rc.systemHash.substring(0, 20)}...
                            </p>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── SUBJECTS TAB ── */}
            {activeTab === 'subjects' && (
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
                        <motion.div key={sub.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                                <BookOpen size={18} />
                              </div>
                              <div>
                                <h4 className="text-[14px] font-black text-gray-900">{sub.name}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {sub.grades.length} term{sub.grades.length !== 1 ? 's' : ''} recorded
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
                          <div className="space-y-2.5">
                            {sub.grades.map((g, j) => {
                              const prev = sub.grades[j - 1];
                              return (
                                <div key={j} className="flex items-center gap-3">
                                  <span className="text-[9px] font-black text-gray-400 w-20 shrink-0 uppercase tracking-widest">
                                    T{g.term.termNumber.replace('TERM_', '')} {g.term.academicYear.label.split('/')[0]}
                                  </span>
                                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: `${g.totalScore}%` }}
                                      transition={{ duration: 0.6, delay: j * 0.1 }}
                                      className={cn('h-full rounded-full', g.totalScore >= 75 ? 'bg-emerald-500' : g.totalScore >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                                    />
                                  </div>
                                  <span className="text-[11px] font-black text-gray-600 w-9 text-right shrink-0">
                                    {g.totalScore?.toFixed(1)}
                                  </span>
                                  <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md w-7 text-center shrink-0', gradeColor(g.grade))}>
                                    {g.grade}
                                  </span>
                                  <DeltaBadge current={g.totalScore} previous={prev?.totalScore} />
                                </div>
                              );
                            })}
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

      {/* ── MOBILE ── */}
      <div className="flex-1 flex flex-col md:hidden bg-[#F9F9F7] text-gray-900 overflow-hidden">
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 pt-10 pb-4 shrink-0 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">Student Portal</p>
                <h1 className="text-[24px] font-black tracking-tight text-gray-900 leading-tight font-display italic">
                  {user?.name?.split(' ')[0]}
                  <span className="text-gray-300 ml-2 not-italic font-sans text-lg">#{profile?.indexNumber ?? '—'}</span>
                </h1>
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1 mt-1">
                  <Calendar size={11} className="text-emerald-700" />
                  {profile?.currentClass
                    ? `${profile.currentClass.level.replace('FORM_', 'Form ')} ${profile.currentClass.name}`
                    : 'No Class Assigned'}
                </p>
              </div>
              <button onClick={handleExportLatest} disabled={isExporting || !latestRC}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-2xl text-[11px] font-black tracking-tight shadow-lg disabled:opacity-50">
                <Download size={13} />
                Export
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 pb-10">
          {/* Metric cards carousel */}
          <section className="flex gap-4 -mx-6 px-6 overflow-x-auto pb-2 snap-x scrollbar-hide">
            <div className="min-w-[240px] bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm snap-center shrink-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Term Average</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-[28px] font-black text-gray-900 tracking-tighter italic font-display">
                  {latestAvg > 0 ? `${latestAvg.toFixed(1)}%` : '—'}
                </span>
              </div>
              {latestRC && prevRC && (
                <DeltaBadge current={latestRC.averageScore} previous={prevRC.averageScore} />
              )}
              <p className="text-[10px] font-bold text-gray-400 mt-1">Latest term</p>
            </div>

            <div className="min-w-[240px] bg-emerald-700 p-6 rounded-[2rem] snap-center text-white shadow-xl shrink-0">
              <p className="text-[9px] font-black text-emerald-200/60 uppercase tracking-widest mb-3">Best Subject</p>
              <span className="text-[28px] font-black tracking-tighter italic font-display block">
                {topSubjectAvg ? `${topSubjectAvg.toFixed(1)}%` : '—'}
              </span>
              <span className="text-[13px] font-black tracking-tight mt-1 block truncate">
                {topSubject?.name ?? 'No grades yet'}
              </span>
            </div>

            {latestRC && (
              <div className="min-w-[240px] bg-gray-900 p-6 rounded-[2rem] snap-center text-white shrink-0">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3">Class Position</p>
                <span className="text-[28px] font-black tracking-tighter italic font-display">
                  #{latestRC.classPosition}
                  <span className="text-base opacity-40">/{latestRC.classSize}</span>
                </span>
                <p className="text-[10px] text-gray-400 mt-1">Latest term</p>
              </div>
            )}

            {bestTerm && (
              <div className="min-w-[240px] bg-amber-50 border border-amber-100 p-6 rounded-[2rem] snap-center shrink-0">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-1">
                  <Star size={10} /> Best Term
                </p>
                <span className="text-[28px] font-black tracking-tighter italic font-display text-amber-700 block">
                  {bestTerm.score.toFixed(1)}%
                </span>
                <p className="text-[12px] font-black text-amber-600">{bestTerm.fullTerm ?? bestTerm.term}</p>
              </div>
            )}
          </section>

          {/* Mobile pulse chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-6">
              <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-4">Academic Pulse</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData}>
                    <defs>
                      <linearGradient id="mobileGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#047857" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="term" hide />
                    <YAxis hide domain={[0, 100]} />
                    <ReferenceLine y={50} stroke="#fca5a5" strokeDasharray="3 3" />
                    <Tooltip content={<PulseTooltip />} />
                    <Area type="monotone" dataKey="score" stroke="#059669" strokeWidth={3}
                      fillOpacity={1} fill="url(#mobileGrad)"
                      dot={(props: any) => {
                        const d = props.payload;
                        return (
                          <circle key={props.key} cx={props.cx} cy={props.cy}
                            r={d.isBest || d.isWorst ? 6 : 3}
                            fill={d.isBest ? '#f59e0b' : d.isWorst ? '#ef4444' : '#047857'}
                            stroke="#fff" strokeWidth={2} />
                        );
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              {overallTrend != null && (
                <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-50">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Trend</span>
                  <DeltaBadge current={overallTrend} previous={0} />
                </div>
              )}
            </div>
          )}

          {/* Report cards on mobile */}
          {sortedReportCards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[17px] font-black text-gray-900 italic font-display">Report Cards</h3>
              {sortedReportCards.map((rc, i) => {
                const prev = sortedReportCards[i - 1];
                return (
                  <div key={rc.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
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
                        <DeltaBadge current={rc.averageScore} previous={prev?.averageScore} />
                        <p className="text-[10px] font-bold text-gray-400">#{rc.classPosition}/{rc.classSize}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDownloadReport(rc.termId)} disabled={downloadingTermId === rc.termId}
                      className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
                      {downloadingTermId === rc.termId
                        ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
                        : <><Download size={14} /> Download PDF</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subject chips + grades */}
          <div className="space-y-4">
            <h3 className="text-[19px] font-black text-gray-900 italic font-display">Subjects</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              <button onClick={() => setSelectedSubjectId(null)}
                className={cn('px-4 py-2 rounded-2xl text-[11px] font-black whitespace-nowrap border shadow-sm transition-all',
                  selectedSubjectId === null ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-gray-500 border-gray-100')}>
                All
              </button>
              {subjectMap.map(sub => (
                <button key={sub.id} onClick={() => setSelectedSubjectId(sub.id)}
                  className={cn('px-4 py-2 rounded-2xl text-[11px] font-black whitespace-nowrap border shadow-sm transition-all',
                    selectedSubjectId === sub.id ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-white text-gray-500 border-gray-100')}>
                  {sub.name}
                </button>
              ))}
            </div>

            {selectedSubject ? (
              <motion.div key={selectedSubject.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                {selectedSubject.grades.map((g, i) => {
                  const prev = selectedSubject.grades[i - 1];
                  return (
                    <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {g.term.academicYear.label} · T{g.term.termNumber.replace('TERM_', '')}
                        </p>
                        <p className="text-sm font-bold text-gray-600 mt-0.5 italic">{g.remark || '—'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-gray-900 font-display italic">{g.totalScore?.toFixed(1)}</p>
                        <span className={cn('text-[11px] font-black px-2 py-0.5 rounded-lg', gradeColor(g.grade))}>
                          {g.grade}
                        </span>
                        <div className="mt-0.5 flex justify-end">
                          <DeltaBadge current={g.totalScore} previous={prev?.totalScore} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            ) : profileHasNoData(profile) ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-gray-100">
                <BookOpen className="mx-auto text-gray-300 mb-3" size={32} />
                <p className="text-[15px] font-black text-gray-900 italic font-display">No grades yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subjectMap.map(sub => {
                  const avg = sub.grades.reduce((sum, g) => sum + g.totalScore, 0) / (sub.grades.length || 1);
                  const latest = sub.grades[sub.grades.length - 1];
                  const prev = sub.grades[sub.grades.length - 2];
                  return (
                    <div key={sub.id} className="bg-white p-4 rounded-2xl border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[13px] font-black text-gray-900 truncate flex-1 mr-2">{sub.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <DeltaBadge current={latest?.totalScore} previous={prev?.totalScore} />
                          <span className={cn('text-[10px] font-black px-1.5 py-0.5 rounded-md', gradeColor(latest?.grade))}>
                            {latest?.grade ?? '—'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full', avg >= 75 ? 'bg-emerald-500' : avg >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
                            style={{ width: `${avg}%` }} />
                        </div>
                        <span className="text-[11px] font-black text-gray-500 w-10 text-right">{avg.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Progress footer */}
          <div className="bg-emerald-800 p-8 rounded-[2.5rem] text-white space-y-4 relative overflow-hidden shadow-2xl">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest">SHS Progress</p>
                <span className="text-[13px] font-black text-white flex items-center gap-2">
                  {profile?.reportCards?.length ?? 0} / 9 Terms
                  <ShieldCheck size={13} />
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((profile?.reportCards?.length ?? 0) / 9) * 100)}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <p className="text-[10px] text-emerald-300/50">
                {9 - (profile?.reportCards?.length ?? 0)} term{9 - (profile?.reportCards?.length ?? 0) !== 1 ? 's' : ''} remaining in your SHS journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}