import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, GraduationCap, Loader2,
  ArrowRight, Bell, Clock, BarChart3,
  ShieldCheck, TrendingUp, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Assignment {
  id: string;
  subjectId: string;
  classSectionId: string;
  subject: { id: string; name: string; code: string; type: string };
  classSection: {
    id: string; name: string; level: string;
    _count?: { students: number };
  };
}

interface Student {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { id: string; name: string; level: string };
}

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface SubjectSummary {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  subjectType: string;
  classSection: { id: string; name: string; level: string };
  averageScore: number | null;
  studentCount: number;
  atRiskStudents: any[];
}

export function TeacherDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [studentsByClass, setStudentsByClass] = React.useState<Record<string, Student[]>>({});
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [analytics, setAnalytics] = React.useState<SubjectSummary[]>([]);
  const [activeTerm, setActiveTerm] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.staffProfileId) return;
    load();
  }, [user]);

  async function load() {
    setIsLoading(true);
    try {
      // Step 1: get assignments + active term + notifications in parallel
      const [assignRes, yearRes, notifRes] = await Promise.allSettled([
        api.get(`/academic/assignments/teacher/${user!.staffProfileId}`),
        api.get('/academic/years/active'),
        api.get(`/comms/staff-notifications/${user!.staffProfileId}`, {
          params: { unreadOnly: true },
        }),
      ]);

      const assignList: Assignment[] =
        assignRes.status === 'fulfilled' ? assignRes.value.data : [];
      setAssignments(assignList);

      const term =
        yearRes.status === 'fulfilled'
          ? yearRes.value.data?.terms?.find((t: any) => t.isActive)
          : null;
      setActiveTerm(term);

      setNotifications(
        notifRes.status === 'fulfilled' ? (notifRes.value as any).data : []
      );

      // Step 2: load students for each unique class the teacher is assigned to
      const uniqueClassIds = [
        ...new Set(assignList.map((a) => a.classSectionId)),
      ];

      const classStudentMap: Record<string, Student[]> = {};
      await Promise.all(
        uniqueClassIds.map(async (classId) => {
          try {
            const res = await api.get('/users/students', {
              params: { classId },
            });
            classStudentMap[classId] = res.data;
          } catch {
            classStudentMap[classId] = [];
          }
        })
      );
      setStudentsByClass(classStudentMap);

      // Step 3: load analytics if active term exists
      if (term?.id) {
        try {
          const analyticsRes = await api.get(
            `/grading/analytics/teacher/${user!.staffProfileId}`,
            { params: { termId: term.id } }
          );
          setAnalytics(analyticsRes.data);
        } catch {
          setAnalytics([]);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Deduplicated student list across all classes
  const allStudents = React.useMemo(() => {
    const seen = new Set<string>();
    return Object.values(studentsByClass)
      .flat()
      .filter((s) => {
        if (seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
  }, [studentsByClass]);

  // Unique subjects taught
  const uniqueSubjects = React.useMemo(() => {
    const seen = new Set<string>();
    return assignments
      .filter((a) => {
        if (seen.has(a.subjectId)) return false;
        seen.add(a.subjectId);
        return true;
      })
      .map((a) => a.subject);
  }, [assignments]);

  // Unique classes
  const uniqueClasses = React.useMemo(() => {
    const seen = new Set<string>();
    return assignments
      .filter((a) => {
        if (seen.has(a.classSectionId)) return false;
        seen.add(a.classSectionId);
        return true;
      })
      .map((a) => a.classSection);
  }, [assignments]);

  // At-risk count across all subjects
  const totalAtRisk = analytics.reduce(
    (sum, s) => sum + s.atRiskStudents.length,
    0
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">
              Teacher Portal
            </p>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1">
              {activeTerm
                ? `${activeTerm.termNumber?.replace('TERM_', 'Term ')} · Active`
                : 'No active term configured'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
                <Bell size={14} className="text-amber-500" />
                <span className="text-[11px] font-black text-amber-700">
                  {notifications.length} new
                </span>
              </div>
            )}
            <button
              onClick={() => navigate('/grading')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
            >
              Open Grading Sheet <ArrowRight size={14} />
            </button>
          </div>
        </header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
            <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell size={14} /> Notifications
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-2xl border border-amber-100"
                >
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats — now accurate */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'My Students',
              value: allStudents.length,
              sub: `across ${uniqueClasses.length} class${uniqueClasses.length !== 1 ? 'es' : ''}`,
              icon: GraduationCap,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
            {
              label: 'Subjects',
              value: uniqueSubjects.length,
              sub: `${assignments.length} assignment${assignments.length !== 1 ? 's' : ''}`,
              icon: BookOpen,
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
            },
            {
              label: 'Classes',
              value: uniqueClasses.length,
              sub: uniqueClasses.map(c => `${c.level?.replace('FORM_', 'F')} ${c.name}`).join(', ') || '—',
              icon: Users,
              color: 'text-purple-600',
              bg: 'bg-purple-50',
            },
            {
              label: 'At-Risk Students',
              value: totalAtRisk,
              sub: totalAtRisk > 0 ? 'below 50% this term' : 'none failing',
              icon: AlertTriangle,
              color: totalAtRisk > 0 ? 'text-rose-600' : 'text-emerald-600',
              bg: totalAtRisk > 0 ? 'bg-rose-50' : 'bg-emerald-50',
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center mb-4',
                  s.bg, s.color
                )}
              >
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {s.label}
              </p>
              <p className="text-[9px] font-bold text-slate-300 mt-0.5 truncate">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* My Assignments — grouped by class */}
        <section>
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4">
            My Assignments
          </h2>
          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
              <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">No assignments yet</p>
              <p className="text-xs text-slate-300 mt-1">
                Contact your HOD to get assigned to subjects
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((a, i) => {
                const classStudents = studentsByClass[a.classSectionId] ?? [];
                const subjectAnalytics = analytics.find(
                  (s) =>
                    s.subjectId === a.subjectId &&
                    s.classSection?.id === a.classSectionId
                );
                return (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => navigate('/grading')}
                    className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center',
                        a.subject?.type === 'CORE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                      )}>
                        <BookOpen size={18} />
                      </div>
                      <span className={cn(
                        'text-[9px] font-black px-2 py-1 rounded-lg uppercase',
                        a.subject?.type === 'CORE' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
                      )}>
                        {a.subject?.type}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mb-1">
                      {a.subject?.name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-4">
                      {a.classSection?.level?.replace('FORM_', 'Form ')} {a.classSection?.name}
                    </p>

                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <GraduationCap size={12} />
                        {classStudents.length} students
                      </span>
                      {subjectAnalytics?.averageScore != null && (
                        <span className="flex items-center gap-1">
                          <TrendingUp size={12} />
                          avg {subjectAnalytics.averageScore}%
                        </span>
                      )}
                      {(subjectAnalytics?.atRiskStudents?.length ?? 0) > 0 && (
                        <span className="flex items-center gap-1 text-rose-500">
                          <AlertTriangle size={12} />
                          {subjectAnalytics!.atRiskStudents.length} at risk
                        </span>
                      )}
                    </div>

                    {/* Average score bar */}
                    {subjectAnalytics?.averageScore != null && (
                      <div className="mt-4">
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              subjectAnalytics.averageScore >= 75
                                ? 'bg-emerald-500'
                                : subjectAnalytics.averageScore >= 50
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            )}
                            style={{ width: `${subjectAnalytics.averageScore}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {a.subject?.code}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Enter Marks <ArrowRight size={10} />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* My Students */}
        {allStudents.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                  My Students
                </h2>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  All students across your assigned classes
                </p>
              </div>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                {allStudents.length} total
              </span>
            </div>

            {/* Grouped by class */}
            <div className="space-y-6">
              {uniqueClasses.map((cls) => {
                const classStudents = studentsByClass[cls.id] ?? [];
                if (classStudents.length === 0) return null;
                const classSubjects = assignments
                  .filter((a) => a.classSectionId === cls.id)
                  .map((a) => a.subject?.name)
                  .join(', ');
                return (
                  <div key={cls.id}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-slate-100" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {cls.level?.replace('FORM_', 'Form ')} {cls.name} · {classStudents.length} students
                      </span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </div>
                    {classSubjects && (
                      <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-3 text-center">
                        Teaching: {classSubjects}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {classStudents.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors text-xs font-black">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <div>
                              <p className="text-[12px] font-black text-slate-900">
                                {s.firstName} {s.lastName}
                              </p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                {s.indexNumber}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => navigate('/grading')}
                            className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Marks
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: 'Performance Analytics', icon: BarChart3, path: '/analytics', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { label: 'My Timetable', icon: Clock, path: '/timetable', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
            { label: 'Grading Rules', icon: ShieldCheck, path: '/audit/grading', color: 'bg-slate-50 text-slate-700 border-slate-200' },
          ].map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className={cn(
                'flex items-center justify-between p-5 rounded-3xl border transition-all hover:shadow-md group',
                link.color
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">{link.label}</span>
              </div>
              <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </section>
      </motion.div>
    </div>
  );
}