import React from 'react';
import { motion } from 'framer-motion';
import {
  Users, BookOpen, GraduationCap, Loader2,
  ArrowRight, Bell, CheckCircle2, Clock,
  TrendingUp, BarChart3
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { ClassCard } from '../components/ClassCard';
import api from '../lib/api';

interface Assignment {
  id: string;
  subjectId: string;
  classSectionId: string;
  subject: { id: string; name: string; code: string; type: string };
  classSection: { id: string; name: string; level: string; _count?: { students: number } };
}

interface ClassStudent {
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

export function TeacherDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [studentMap, setStudentMap] = React.useState<Record<string, ClassStudent[]>>({});
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [activeTerm, setActiveTerm] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.staffProfileId) return;

    async function load() {
      setIsLoading(true);
      try {
        const [assignRes, yearRes, notifRes] = await Promise.allSettled([
          api.get(`/academic/assignments/teacher/${user!.staffProfileId}`),
          api.get('/academic/years/active'),
          user!.staffProfileId
            ? api.get(`/comms/staff-notifications/${user!.staffProfileId}`, { params: { unreadOnly: true } })
            : Promise.resolve({ data: [] }),
        ]);

        const assignList: Assignment[] = assignRes.status === 'fulfilled' ? assignRes.value.data : [];
        setAssignments(assignList);
        setActiveTerm(yearRes.status === 'fulfilled' ? yearRes.value.data?.terms?.find((t: any) => t.isActive) : null);
        setNotifications(notifRes.status === 'fulfilled' ? (notifRes.value as any).data : []);

        // Fetch students per class
        const uniqueClassIds = [...new Set(assignList.map(a => a.classSectionId))];
        const map: Record<string, ClassStudent[]> = {};
        await Promise.all(
          uniqueClassIds.map(async classId => {
            try {
              const res = await api.get(`/users/students?classId=${classId}`);
              map[classId] = res.data;
            } catch { map[classId] = []; }
          })
        );
        setStudentMap(map);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [user]);

  const allStudents = React.useMemo(() => {
    const seen = new Set<string>();
    return Object.values(studentMap).flat().filter(s => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
  }, [studentMap]);

  const uniqueClasses = React.useMemo(() =>
    [...new Map(assignments.map(a => [a.classSectionId, a.classSection])).values()],
    [assignments]
  );

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <Loader2 size={40} className="text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Teacher Portal</p>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight">
              Welcome, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1">
              {activeTerm ? `${activeTerm.termNumber?.replace('TERM_', 'Term ')} — Active` : 'No active term'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
                <Bell size={14} className="text-amber-500" />
                <span className="text-[11px] font-black text-amber-700">{notifications.length} new</span>
              </div>
            )}
            <button onClick={() => navigate('/grading')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">
              Open Grading Sheet <ArrowRight size={14} />
            </button>
          </div>
        </header>

        {/* Notifications */}
        {notifications.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
            <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell size={14} /> Pending Notifications
            </h3>
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n.id} className="bg-white p-4 rounded-2xl border border-amber-100">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Assignments', value: assignments.length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'My Students', value: allStudents.length, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Classes', value: uniqueClasses.length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', s.bg, s.color)}>
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Assignment cards */}
        <section>
          <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-4">My Teaching Assignments</h2>
          {assignments.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
              <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">No assignments yet</p>
              <p className="text-xs text-slate-300 mt-1">Contact your HOD to get assigned to subjects</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {assignments.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  onClick={() => navigate('/grading')} className="cursor-pointer">
                  <ClassCard
                    subject={`${a.subject?.name} — ${a.classSection?.level?.replace('FORM_', 'Form ')} ${a.classSection?.name}`}
                    className={a.classSection?.name ?? ''}
                    status="Active"
                    progress={0}
                    studentCount={(studentMap[a.classSectionId] ?? []).length || a.classSection?._count?.students || 0}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Students list */}
        {allStudents.length > 0 && (
          <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">My Students</h2>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                {allStudents.length} total
              </span>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allStudents.map(s => (
                <div key={s.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                      <GraduationCap size={16} />
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900">{s.firstName} {s.lastName}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {s.indexNumber} · {s.currentClass?.level?.replace('FORM_', 'F')} {s.currentClass?.name}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => navigate('/grading')}
                    className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Enter Marks
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="grid grid-cols-2 gap-4">
          {[
            { label: 'Performance Analytics', icon: BarChart3, path: '/analytics', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
            { label: 'My Timetable', icon: Clock, path: '/timetable', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          ].map((link, i) => (
            <button key={i} onClick={() => navigate(link.path)}
              className={cn('flex items-center justify-between p-5 rounded-3xl border transition-all hover:shadow-md group', link.color)}>
              <div className="flex items-center gap-3">
                <link.icon size={20} />
                <span className="text-[12px] font-black uppercase tracking-widest">{link.label}</span>
              </div>
              <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </section>
      </motion.div>
    </div>
  );
}