import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, AlertTriangle, Trophy,
  BookOpen, Users, ChevronRight, Loader2,
  BarChart3, RefreshCw, GraduationCap, UserCheck,
  ShieldAlert, X, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import api from '../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudentStat {
  id: string;
  name: string;
  indexNumber: string;
  score: number;
  grade: string | null;
  class?: { name: string; level: string } | null;
}

interface TeacherRef {
  id: string;
  name: string;
  staffId: string;
  classSection: { id: string; name: string; level: string };
}

interface SubjectAnalytics {
  subjectId?: string;
  assignmentId?: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
  classSection?: { id: string; name: string; level: string };
  teachers?: TeacherRef[];
  averageScore: number | null;
  studentCount: number;
  topStudents: StudentStat[];
  atRiskStudents: StudentStat[];
  gradeDistribution: Record<string, number>;
}

const GRADE_COLORS: Record<string, string> = {
  A1: '#059669', B2: '#0ea5e9', B3: '#3b82f6',
  C4: '#f59e0b', C5: '#fbbf24', C6: '#fb923c',
  D7: '#f87171', E8: '#ef4444', F9: '#dc2626',
};

function gradeColor(grade: string | null) {
  if (!grade) return 'bg-slate-100 text-slate-500';
  if (grade.startsWith('A')) return 'bg-emerald-50 text-emerald-700';
  if (grade.startsWith('B')) return 'bg-blue-50 text-blue-700';
  if (grade.startsWith('C')) return 'bg-amber-50 text-amber-700';
  return 'bg-rose-50 text-rose-700';
}

// ─── Helper for initials ────────────────────────────────────────────────────
function getInitials(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getShortName(name: string | undefined): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  return parts[0] || '?';
}

// ─── Subject Detail Drawer ────────────────────────────────────────────────────

const SubjectDrawer: React.FC<{
  subject: SubjectAnalytics;
  onClose: () => void;
  showTeachers: boolean;
}> = ({ subject, onClose, showTeachers }) => {
  const distData = Object.entries(subject.gradeDistribution)
    .filter(([, count]) => count > 0)
    .map(([grade, count]) => ({ grade, count }));

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                {subject.subjectCode} · {subject.subjectType}
              </p>
              <h3 className="text-2xl font-black">{subject.subjectName}</h3>
              {subject.classSection && (
                <p className="text-white/60 text-sm mt-1">
                  {subject.classSection.level.replace('FORM_', 'Form ')} {subject.classSection.name}
                </p>
              )}
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
              <X size={20} />
            </button>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/5 p-3 rounded-xl text-center">
              <p className="text-xl font-black text-white">
                {subject.averageScore != null ? `${subject.averageScore}%` : '—'}
              </p>
              <p className="text-[9px] font-black text-white/40 uppercase mt-1">Average</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl text-center">
              <p className="text-xl font-black text-emerald-400">{subject.topStudents.length}</p>
              <p className="text-[9px] font-black text-white/40 uppercase mt-1">Top Students</p>
            </div>
            <div className="bg-white/5 p-3 rounded-xl text-center">
              <p className="text-xl font-black text-rose-400">{subject.atRiskStudents.length}</p>
              <p className="text-[9px] font-black text-white/40 uppercase mt-1">At Risk</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">

          {/* Grade distribution chart */}
          {distData.length > 0 && (
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Grade Distribution</h4>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#cbd5e1' }} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
                              <p className="text-xs font-black text-slate-900">{payload[0].payload.grade}</p>
                              <p className="text-[11px] font-bold text-slate-500">{payload[0].value} students</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {distData.map((entry, i) => (
                        <Cell key={i} fill={GRADE_COLORS[entry.grade] ?? '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {/* Teachers (HOD view only) */}
          {showTeachers && subject.teachers && subject.teachers.length > 0 && (
            <section>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Teaching Staff</h4>
              <div className="space-y-2">
                {subject.teachers.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xs font-black">
                        {getInitials(t.name)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{t.name || 'Unknown Teacher'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{t.staffId}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">
                      {t.classSection.level.replace('FORM_', 'F')} {t.classSection.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Top Students */}
          <section>
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Trophy size={12} /> Top Performing Students
            </h4>
            {subject.topStudents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-xl">No data yet</p>
            ) : (
              <div className="space-y-2">
                {subject.topStudents.map((s, i) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-50">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black',
                        i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                      )}>
                        {i === 0 ? '🏆' : `#${i + 1}`}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{s.indexNumber}
                          {s.class && ` · ${s.class.level.replace('FORM_', 'F')} ${s.class.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-emerald-700">{s.score.toFixed(1)}%</span>
                      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-md', gradeColor(s.grade))}>
                        {s.grade ?? '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* At-Risk Students */}
          <section>
            <h4 className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-3 flex items-center gap-2">
              <AlertTriangle size={12} /> At-Risk Students (Below 50%)
            </h4>
            {subject.atRiskStudents.length === 0 ? (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-sm font-bold text-emerald-700">No failing students — great work!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {subject.atRiskStudents.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-rose-50/50 rounded-xl border border-rose-100">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center">
                        <AlertTriangle size={12} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{s.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{s.indexNumber}
                          {s.class && ` · ${s.class.level.replace('FORM_', 'F')} ${s.class.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-rose-600">{s.score.toFixed(1)}%</span>
                      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-md', gradeColor(s.grade))}>
                        {s.grade ?? '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Subject Card ─────────────────────────────────────────────────────────────

const SubjectCard: React.FC<{
  subject: SubjectAnalytics;
  index: number;
  onClick: () => void;
  showTeachers: boolean;
}> = ({ subject, index, onClick, showTeachers }) => {
  const hasRisk = subject.atRiskStudents.length > 0;
  const avg = subject.averageScore;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={cn(
        'bg-white rounded-3xl border p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden',
        hasRisk ? 'border-rose-100' : 'border-slate-200'
      )}
    >
      {hasRisk && (
        <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-400 rounded-r-3xl" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            subject.subjectType === 'CORE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
          )}>
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">{subject.subjectName}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn(
                'text-[9px] font-black px-1.5 py-0.5 rounded uppercase',
                subject.subjectType === 'CORE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
              )}>
                {subject.subjectType}
              </span>
              {subject.classSection && (
                <span className="text-[9px] font-bold text-slate-400 uppercase">
                  {subject.classSection.level.replace('FORM_', 'F')} {subject.classSection.name}
                </span>
              )}
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
      </div>

      {/* Average score bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Class Average</span>
          <span className="text-lg font-black text-slate-900">
            {avg != null ? `${avg}%` : '—'}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', avg == null ? '' : avg >= 75 ? 'bg-emerald-500' : avg >= 50 ? 'bg-amber-500' : 'bg-rose-500')}
            style={{ width: `${avg ?? 0}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Users size={12} className="text-slate-400" />
          <span className="text-[11px] font-bold text-slate-500">{subject.studentCount} students</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Trophy size={12} className="text-emerald-500" />
          <span className="text-[11px] font-bold text-slate-500">{subject.topStudents.length} top</span>
        </div>
        {hasRisk && (
          <div className="flex items-center gap-1.5">
            <AlertTriangle size={12} className="text-rose-500" />
            <span className="text-[11px] font-bold text-rose-600">{subject.atRiskStudents.length} at risk</span>
          </div>
        )}
      </div>

      {/* Teachers (HOD view) */}
      {showTeachers && subject.teachers && subject.teachers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Teachers</p>
          <div className="flex flex-wrap gap-1.5">
            {subject.teachers.slice(0, 3).map(t => (
              <span key={t.id} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-bold">
                {getShortName(t.name)}
              </span>
            ))}
            {subject.teachers.length > 3 && (
              <span className="px-2 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-bold">
                +{subject.teachers.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function PerformanceAnalytics() {
  const { user } = useRole();
  const [analytics, setAnalytics] = useState<SubjectAnalytics[]>([]);
  const [activeTerm, setActiveTerm] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<SubjectAnalytics | null>(null);

  const isHOD = user?.role === 'HOD';
  const isTeacher = user?.role === 'TEACHER';

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const yearRes = await api.get('/academic/years/active');
      const term = yearRes.data?.terms?.find((t: any) => t.isActive);
      setActiveTerm(term ? { ...term, academicYear: { label: yearRes.data.label } } : null);

      if (!term) { setIsLoading(false); return; }

      if (isHOD && user?.departmentId) {
        const res = await api.get(`/grading/analytics/department/${user.departmentId}`, {
          params: { termId: term.id },
        });
        setAnalytics(res.data);
      } else if (isTeacher && user?.staffProfileId) {
        const res = await api.get(`/grading/analytics/teacher/${user.staffProfileId}`, {
          params: { termId: term.id },
        });
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  // Derived stats
  const totalAtRisk = analytics.reduce((sum, s) => sum + s.atRiskStudents.length, 0);
  const totalStudents = analytics.reduce((sum, s) => sum + s.studentCount, 0);
  const overallAvg = analytics.filter(s => s.averageScore != null).length > 0
    ? analytics.filter(s => s.averageScore != null).reduce((sum, s) => sum + (s.averageScore ?? 0), 0) /
      analytics.filter(s => s.averageScore != null).length
    : null;
  const worstSubject = analytics.filter(s => s.averageScore != null).sort((a, b) => (a.averageScore ?? 100) - (b.averageScore ?? 100))[0];
  const bestSubject = analytics.filter(s => s.averageScore != null).sort((a, b) => (b.averageScore ?? 0) - (a.averageScore ?? 0))[0];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>{isHOD ? 'Department' : 'My Subjects'}</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Performance Analytics</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight">
              {isHOD ? 'Department Analytics' : 'Subject Performance'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeTerm ? `${activeTerm.academicYear.label} · ${activeTerm.termNumber.replace('TERM_', 'Term ')}` : 'No active term'}
            </p>
          </div>
          <button onClick={fetchAnalytics} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            {
              label: 'Subjects',
              value: analytics.length,
              icon: BookOpen,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Overall Average',
              value: overallAvg != null ? `${overallAvg.toFixed(1)}%` : '—',
              icon: TrendingUp,
              color: overallAvg != null && overallAvg >= 50 ? 'text-blue-600' : 'text-rose-600',
              bg: overallAvg != null && overallAvg >= 50 ? 'bg-blue-50' : 'bg-rose-50',
            },
            {
              label: 'Best Subject',
              value: bestSubject?.subjectName ? bestSubject.subjectName.split(' ')[0] : '—',
              sub: bestSubject ? `${bestSubject.averageScore}%` : '',
              icon: Trophy,
              color: 'text-amber-600',
              bg: 'bg-amber-50',
            },
            {
              label: 'At-Risk Students',
              value: totalAtRisk,
              icon: AlertTriangle,
              color: totalAtRisk > 0 ? 'text-rose-600' : 'text-emerald-600',
              bg: totalAtRisk > 0 ? 'bg-rose-50' : 'bg-emerald-50',
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', stat.bg, stat.color)}>
                <stat.icon size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-black text-slate-900 truncate">{stat.value}</p>
                {(stat as any).sub && <p className="text-[10px] font-bold text-slate-400">{(stat as any).sub}</p>}
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {!activeTerm ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
            <BarChart3 size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">No active term configured</p>
          </div>
        ) : analytics.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
            <BarChart3 size={40} className="text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">
              {isTeacher ? 'No assignments or grade data found for this term' : 'No subjects in your department yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* At-risk alert banner */}
            {totalAtRisk > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center shrink-0">
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-rose-900">
                    {totalAtRisk} student{totalAtRisk > 1 ? 's' : ''} scoring below 50% across your subjects
                  </p>
                  <p className="text-xs font-bold text-rose-500 mt-0.5">
                    Click on any subject card to see which students need intervention
                  </p>
                </div>
              </motion.div>
            )}

            {/* Subject cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {analytics.map((subject, i) => (
                <SubjectCard
                  key={subject.subjectId ?? subject.assignmentId}
                  subject={subject}
                  index={i}
                  showTeachers={isHOD}
                  onClick={() => setSelectedSubject(subject)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Subject detail drawer */}
      <AnimatePresence>
        {selectedSubject && (
          <SubjectDrawer
            subject={selectedSubject}
            onClose={() => setSelectedSubject(null)}
            showTeachers={isHOD}
          />
        )}
      </AnimatePresence>
    </div>
  );
}