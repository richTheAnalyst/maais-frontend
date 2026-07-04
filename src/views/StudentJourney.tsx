import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, Download, Calendar, Target,
  ShieldCheck, BookOpen, Activity, History,
  Lock, ArrowRight, User, Database, Loader2,
  AlertCircle, FileText
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { downloadReportCard } from '../lib/pdf';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GradeEntry {
  id: string;
  subjectId: string;
  subject: { name: string; code: string; type: string };
  termId: string;
  term: { termNumber: string; academicYear: { label: string } };
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
  hasObservation: boolean;
  observationText?: string;
  isApproved: boolean;
  isLocked: boolean;
  submittedBy?: { staffProfile?: { firstName: string; lastName: string } };
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
  gender?: string;
  dateOfBirth?: string;
  currentClass?: { name: string; level: string };
  department?: { name: string };
  grades: GradeEntry[];
  reportCards: ReportCard[];
  promotions?: any[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWAECGrade(score: number): string {
  if (score >= 80) return 'A1';
  if (score >= 70) return 'B2';
  if (score >= 65) return 'B3';
  if (score >= 60) return 'C4';
  if (score >= 55) return 'C5';
  if (score >= 50) return 'C6';
  if (score >= 45) return 'D7';
  if (score >= 40) return 'E8';
  return 'F9';
}

function gradeColor(grade: string) {
  if (grade?.startsWith('A')) return 'bg-emerald-100 text-emerald-900';
  if (grade?.startsWith('B')) return 'bg-blue-100 text-blue-900';
  if (grade?.startsWith('C')) return 'bg-amber-100 text-amber-900';
  return 'bg-rose-100 text-rose-900';
}

function termLabel(termNumber: string, yearLabel: string) {
  return `${yearLabel.split('/')[0]} T${termNumber.replace('TERM_', '')}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function StudentJourney() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [profile, setProfile] = React.useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStep, setExportStep] = React.useState(0);
  const [downloadingTermId, setDownloadingTermId] = React.useState<string | null>(null);

  // ─── Load profile ────────────────────────────────────────────────────────

  React.useEffect(() => {
    async function load() {
      if (!user?.id) return;
      setIsLoading(true);
      setError(null);
      try {
        const studentProfileId = (user as any).studentProfileId;
        if (studentProfileId) {
          const res = await api.get(`/users/students/${studentProfileId}`);
          setProfile(res.data);
          return;
        }
        // Fallback: search by email
        const listRes = await api.get('/users/students');
        const matched = listRes.data.find((s: any) =>
          s.user?.email === user.username ||
          s.user?.email === `${user.username}@student.mandoshts.edu.gh`
        );
        if (matched) {
          const fullRes = await api.get(`/users/students/${matched.id}`);
          setProfile(fullRes.data);
          return;
        }
        setError('Could not load your academic profile.');
      } catch (err) {
        setError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  // ─── Derived data ─────────────────────────────────────────────────────────

  // Group grades by term
  const gradesByTerm = React.useMemo(() => {
    if (!profile?.grades) return new Map<string, GradeEntry[]>();
    const map = new Map<string, GradeEntry[]>();
    profile.grades.forEach(g => {
      const key = g.termId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(g);
    });
    return map;
  }, [profile]);

  // Sorted terms for the trajectory chart
  const sortedReportCards = React.useMemo(() =>
    [...(profile?.reportCards ?? [])].sort((a, b) =>
      a.term.academicYear.label.localeCompare(b.term.academicYear.label)
    ), [profile]);

  const trajectoryData = sortedReportCards.map(rc => ({
    term: termLabel(rc.term.termNumber, rc.term.academicYear.label),
    score: rc.averageScore,
    position: rc.classPosition,
    classSize: rc.classSize,
  }));

  // Observations from grade entries
  const observations = React.useMemo(() =>
    profile?.grades
      ?.filter(g => g.hasObservation && g.observationText)
      .map(g => ({
        id: g.id,
        date: termLabel(g.term.termNumber, g.term.academicYear.label),
        subject: g.subject.name,
        comment: g.observationText!,
      })) ?? []
    , [profile]);

  // Cumulative average
  const cumulativeAvg = React.useMemo(() => {
    if (!profile?.grades?.length) return null;
    const scored = profile.grades.filter(g => g.totalScore != null);
    if (!scored.length) return null;
    return scored.reduce((sum, g) => sum + g.totalScore, 0) / scored.length;
  }, [profile]);

  // Overall trend
  const overallTrend = React.useMemo(() => {
    if (sortedReportCards.length < 2) return null;
    return sortedReportCards[sortedReportCards.length - 1].averageScore -
      sortedReportCards[0].averageScore;
  }, [sortedReportCards]);

  // All unique subjects across all terms
  const allSubjects = React.useMemo(() => {
    const map = new Map<string, string>();
    profile?.grades?.forEach(g => map.set(g.subjectId, g.subject.name));
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [profile]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleDownload = async (termId: string) => {
    if (!profile) return;
    setDownloadingTermId(termId);
    try {
      await downloadReportCard(
        profile.id, termId,
        `${profile.firstName} ${profile.lastName}`
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to generate report card');
    } finally {
      setDownloadingTermId(null);
    }
  };

  const handleExportAll = async () => {
    if (!profile || !sortedReportCards.length) return;
    setIsExporting(true);
    for (let i = 0; i < sortedReportCards.length; i++) {
      setExportStep(i + 1);
      try {
        await downloadReportCard(
          profile.id,
          sortedReportCards[i].termId,
          `${profile.firstName} ${profile.lastName}`
        );
      } catch {}
      await new Promise(r => setTimeout(r, 600));
    }
    setIsExporting(false);
    setExportStep(0);
  };

  // ─── Loading / Error ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading your academic portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center max-w-sm">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-900 mb-2">
            {error ?? 'Profile not found'}
          </p>
          <button onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-black">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] font-sans relative">

      {/* Export overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-800/95 backdrop-blur-md flex items-center justify-center p-8 text-white text-center"
          >
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={32} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black font-display italic tracking-tight">
                  Generating Report Card {exportStep} of {sortedReportCards.length}...
                </h2>
                <p className="text-emerald-200/40 text-[11px] font-black uppercase tracking-[0.2em]">
                  DO NOT CLOSE THIS INTERFACE
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col px-6 py-8 md:px-12 md:py-16 space-y-20 max-w-lg mx-auto md:max-w-7xl pb-[10%]">

        {/* ── BIO HEADER ── */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 px-2">
          <div className="flex flex-col items-center md:flex-row md:items-center gap-8">
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.firstName}${profile.lastName}`}
                alt="Student"
                className="w-28 h-28 rounded-3xl bg-gray-50 p-1 border-4 border-white shadow-2xl"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <User size={20} />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-[32px] md:text-[48px] font-black tracking-tighter text-gray-900 leading-[0.9] font-display italic mb-3">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-emerald-800 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                Scholastic Longitudinal Portfolio
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                  ID: {profile.indexNumber}
                </span>
                {profile.currentClass && (
                  <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-[9px] font-black text-gray-400 uppercase tracking-widest">
                    {profile.currentClass.level.replace('FORM_', 'Form ')} {profile.currentClass.name}
                  </span>
                )}
                {profile.department?.name && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest">
                    {profile.department.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full md:w-auto">
            <button
              onClick={handleExportAll}
              disabled={isExporting || sortedReportCards.length === 0}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-900 text-white rounded-[1.5rem] text-[12px] font-black tracking-tight shadow-xl hover:bg-black transition-all disabled:opacity-50"
            >
              <Download size={16} />
              Export All Report Cards ({sortedReportCards.length})
            </button>
            <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
              {profile.grades.length} grade entries · {sortedReportCards.length} report cards
            </p>
          </div>
        </section>

        {/* ── 1. TERMINAL PERFORMANCE BREAKDOWN ── */}
        <section className="space-y-12 px-2">
          <header className="flex items-center gap-3 border-b-2 border-emerald-900 pb-2">
            <Database size={24} className="text-emerald-900" />
            <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">
              1. Terminal Performance Breakdown
            </h3>
          </header>

          {sortedReportCards.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
              <FileText size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-400">No report cards generated yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Grades will appear here once entered and report cards are generated
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {sortedReportCards.map((rc, tIdx) => {
                const termGrades = gradesByTerm.get(rc.termId) ?? [];
                const label = `${rc.term.academicYear.label} — Term ${rc.term.termNumber.replace('TERM_', '')}`;
                return (
                  <div key={rc.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50/80 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">
                          {tIdx + 1}
                        </div>
                        <div>
                          <h4 className="text-[13px] font-black text-gray-900 uppercase tracking-widest italic font-display">
                            {label}
                          </h4>
                          <p className="text-[9px] font-bold text-gray-400 uppercase">
                            Average: {rc.averageScore?.toFixed(1)}% · Position {rc.classPosition}/{rc.classSize}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-4 py-1.5 rounded-full uppercase tracking-widest italic border border-emerald-100">
                          Official Record
                        </span>
                        <button
                          onClick={() => handleDownload(rc.termId)}
                          disabled={downloadingTermId === rc.termId}
                          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase disabled:opacity-60"
                        >
                          {downloadingTermId === rc.termId
                            ? <Loader2 size={12} className="animate-spin" />
                            : <Download size={12} />}
                          PDF
                        </button>
                      </div>
                    </div>

                    {termGrades.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-sm font-bold text-gray-400">No grade entries for this term</p>
                      </div>
                    ) : (
                      <>
                        {/* Mobile card view */}
                        <div className="md:hidden p-4 space-y-3">
                          {termGrades.map(g => (
                            <div key={g.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p className="text-[13px] font-black text-gray-900 italic font-display">{g.subject.name}</p>
                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{g.subject.type}</p>
                                </div>
                                <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black', gradeColor(g.grade))}>
                                  {g.grade}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                                <div className="text-center">
                                  <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Class</p>
                                  <p className="text-[12px] font-bold text-gray-600 font-mono italic">{g.classScore?.toFixed(1) ?? '—'}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Exam</p>
                                  <p className="text-[12px] font-bold text-gray-600 font-mono italic">{g.examScore?.toFixed(1) ?? '—'}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-[8px] font-black text-emerald-700 uppercase mb-1">Total</p>
                                  <p className="text-[16px] font-black text-emerald-950 italic font-display">{g.totalScore?.toFixed(1) ?? '—'}%</p>
                                </div>
                              </div>
                              {g.hasObservation && g.observationText && (
                                <p className="text-[10px] font-bold text-amber-700 italic mt-3 bg-amber-50 p-2 rounded-lg">
                                  "{g.observationText}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block overflow-x-auto p-2">
                          <table className="w-full text-left min-w-[600px]">
                            <thead>
                              <tr className="text-[9.5px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                                <th className="py-5 pl-8">Subject</th>
                                <th className="py-5 text-center">Class (30)</th>
                                <th className="py-5 text-center">Exam (70)</th>
                                <th className="py-5 text-center">Grade</th>
                                <th className="py-5 text-right pr-8 italic text-emerald-900">Total (%)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {termGrades.map(g => (
                                <tr key={g.id} className="group hover:bg-[#F9F9F7] transition-all">
                                  <td className="py-6 pl-8">
                                    <p className="text-[13.3px] font-black text-gray-900 italic font-display">{g.subject.name}</p>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                      {g.subject.type}
                                      {g.hasObservation && (
                                        <span className="ml-2 text-amber-500">· Has Observation</span>
                                      )}
                                    </p>
                                    {g.observationText && (
                                      <p className="text-[10px] font-bold text-amber-700 italic mt-1">
                                        "{g.observationText}"
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-6 text-center">
                                    <span className="text-[14px] font-bold text-gray-600 font-mono italic">
                                      {g.classScore?.toFixed(1) ?? '—'}
                                    </span>
                                  </td>
                                  <td className="py-6 text-center">
                                    <span className="text-[14px] font-bold text-gray-600 font-mono italic">
                                      {g.examScore?.toFixed(1) ?? '—'}
                                    </span>
                                  </td>
                                  <td className="py-6 text-center">
                                    <span className={cn('px-3 py-1 rounded-lg text-[10px] font-black', gradeColor(g.grade))}>
                                      {g.grade}
                                    </span>
                                  </td>
                                  <td className="py-6 text-right pr-8">
                                    <span className="text-[17px] font-black text-emerald-950 italic font-display">
                                      {g.totalScore?.toFixed(1) ?? '—'}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 px-2">
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Cumulative Average</p>
              <p className="text-[24px] font-black text-gray-900 italic tracking-tighter font-display">
                {cumulativeAvg != null ? `${cumulativeAvg.toFixed(1)}%` : '—'}
              </p>
            </div>
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Terms on Record</p>
              <p className="text-[24px] font-black text-gray-900 italic tracking-tighter font-display">
                {sortedReportCards.length} / 9
              </p>
            </div>
            <div className="bg-white p-5 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Overall Trend</p>
              <p className={cn('text-[24px] font-black italic tracking-tighter font-display', overallTrend == null ? 'text-gray-400' : overallTrend >= 0 ? 'text-emerald-700' : 'text-rose-600')}>
                {overallTrend != null
                  ? `${overallTrend >= 0 ? '+' : ''}${overallTrend.toFixed(1)}%`
                  : '—'}
              </p>
            </div>
            <div className="bg-emerald-900 p-5 md:p-8 rounded-2xl md:rounded-3xl border border-emerald-800 text-white shadow-xl">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Vault Registry</p>
              <p className="text-[14px] font-black italic tracking-tighter uppercase font-display">
                {profile.indexNumber}
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. LONGITUDINAL TRAJECTORY CHART ── */}
        <section className="space-y-8 px-2">
          <header className="flex items-center gap-4 border-b-2 border-emerald-900 pb-2">
            <TrendingUp size={24} className="text-emerald-900" />
            <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">
              2. Longitudinal Performance Trajectory
            </h3>
          </header>

          {trajectoryData.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
              <Activity size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-gray-400">No report cards to chart yet</p>
            </div>
          ) : (
            <div className="bg-[#F8FAFB] p-6 md:p-12 rounded-[3rem] border border-gray-200 h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trajectoryData}>
                  <defs>
                    <linearGradient id="trajectoryGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#065F46" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#065F46" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="term" axisLine={false} tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#9ca3af' }} dy={10} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border border-white/10 text-white">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{d.term}</p>
                          <p className="text-2xl font-black">{d.score?.toFixed(1)}%</p>
                          {d.position && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              Position {d.position} of {d.classSize}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#065F46" strokeWidth={5}
                    fillOpacity={1} fill="url(#trajectoryGrad)"
                    dot={{ r: 5, fill: '#047857', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* ── 3. OBSERVATION ARCHIVE ── */}
        {observations.length > 0 && (
          <section className="space-y-8 px-2">
            <header className="flex items-center gap-3 border-b-2 border-emerald-900 pb-2">
              <History size={24} className="text-emerald-900" />
              <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">
                3. Teacher Observations
              </h3>
            </header>
            <div className="space-y-4">
              {observations.map(obs => (
                <div key={obs.id}
                  className="p-5 md:p-6 bg-white border-l-4 border-amber-500 border-y border-r border-gray-100 rounded-r-[1.5rem] shadow-sm hover:bg-gray-50/50 transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-black text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                      {obs.subject}
                    </span>
                    <span className="text-[9px] font-black text-gray-300 italic uppercase">{obs.date}</span>
                  </div>
                  <p className="text-[13px] font-bold text-gray-600 italic leading-relaxed">
                    "{obs.comment}"
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. PROMOTION HISTORY ── */}
        {(profile.promotions?.length ?? 0) > 0 && (
          <section className="space-y-8 px-2">
            <header className="flex items-center gap-3 border-b-2 border-emerald-900 pb-2">
              <ShieldCheck size={24} className="text-emerald-900" />
              <h3 className="text-[15.2px] font-black text-emerald-950 uppercase tracking-[0.1em]">
                4. Promotion History
              </h3>
            </header>
            <div className="space-y-4">
              {profile.promotions!.map((p: any) => (
                <div key={p.id} className="bg-gray-900 p-6 md:p-10 rounded-[2.5rem] text-white shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] font-mono">
                      {p.academicYear?.label} — Promotion Record
                    </p>
                  </div>
                  <p className="text-[14px] font-black font-display italic tracking-tight">
                    {p.fromClass?.replace('FORM_', 'Form ')} →{' '}
                    {p.toClass ? p.toClass.replace('FORM_', 'Form ') : 'Graduated'}
                  </p>
                  <span className={cn(
                    'mt-3 inline-block text-[10px] font-black px-3 py-1 rounded-lg uppercase',
                    p.status === 'GRADUATED' ? 'bg-purple-900/50 text-purple-300' : 'bg-emerald-900/50 text-emerald-300'
                  )}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="px-2 py-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic">
            MAAIS · Mando Senior High Technical School · {new Date().getFullYear()}
          </p>
          <p className="text-[9px] font-bold text-gray-300 font-mono">
            {profile.indexNumber} · Generated {new Date().toLocaleDateString()}
          </p>
        </div>

      </div>
    </div>
  );
}