// Add to imports at top
import React from 'react';
import { ClassCard } from '../components/ClassCard';
import { motion } from 'framer-motion';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import {
  CheckCircle2, Clock, Users, ShieldAlert,
  Loader2, GraduationCap, BookOpen, AlertCircle
} from 'lucide-react';
import { StudentDashboard } from './StudentDashboard';
import { AdminHome } from './AdminHome';
import api from '../lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────
interface Assignment {
  id: string;
  subjectId: string;
  classSectionId: string;
  subject: { id: string; name: string; code: string; type: string };
  classSection: {
    id: string;
    name: string;
    level: string;
    _count?: { students: number };
  };
}

interface ClassStudent {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { id: string; name: string; level: string };
  grades?: any[];
  reportCards?: any[];
}

export function Dashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  // ─── Teacher state ────────────────────────────────────────────────────────
  const [teacherAssignments, setTeacherAssignments] = React.useState<Assignment[]>([]);
  const [assignmentStudents, setAssignmentStudents] = 
   React.useState<Record<string, ClassStudent[]>>({})
  const [isLoadingTeacher, setIsLoadingTeacher] = React.useState(false);

  // ─── HOD state ────────────────────────────────────────────────────────────
  const [hodStats, setHodStats] = React.useState<any>(null);
  const [hodAssignments, setHodAssignments] = React.useState<Assignment[]>([]);
  const [hodStudents, setHodStudents] = React.useState<ClassStudent[]>([]);
  const [hodTeachers, setHodTeachers] = React.useState<any[]>([]);
  const [isLoadingHOD, setIsLoadingHOD] = React.useState(false);

  // ─── useEffect ───────────────────────────────────────────────────────────
  React.useEffect(() => {
  if (!user) return;

  const run = async () => {

    // ─── Teacher ─────────────────────────────────────
    if (user.role === 'TEACHER') {
      setIsLoadingTeacher(true);

      try {
        const assignmentsUrl = user.staffProfileId
          ? `/academic/assignments/teacher/${user.staffProfileId}`
          : `/academic/assignments/teacher/${user.id}`;

        const res = await api.get(assignmentsUrl);

        const assignments: Assignment[] = res.data;
        setTeacherAssignments(assignments);

        const uniqueClassIds = [
          ...new Set(assignments.map(a => a.classSectionId))
        ];

        const studentMap: Record<string, ClassStudent[]> = {};

        await Promise.all(
          uniqueClassIds.map(async classId => {
            try {
              const studentsRes = await api.get(
                `/users/students?classId=${classId}`
              );

              studentMap[classId] = studentsRes.data;
            } catch {
              studentMap[classId] = [];
            }
          })
        );

        setAssignmentStudents(studentMap);

      } catch (error) {
        console.error('Teacher dashboard error:', error);
      } finally {
        setIsLoadingTeacher(false);
      }
    }

    // ─── HOD ─────────────────────────────────────────
    if (user.role === 'HOD') {
      setIsLoadingHOD(true);

      try {
        const assignmentsUrl = user.staffProfileId
          ? `/academic/assignments/teacher/${user.staffProfileId}`
          : `/academic/assignments/teacher/${user.id}`;

        const [healthRes, pulseRes, assignRes, staffRes] =
          await Promise.allSettled([
            api.get('/archive/health'),
            api.get('/comms/analytics/pulse'),
            api.get(assignmentsUrl),
            api.get('/users/staff'),
          ]);

        const health =
          healthRes.status === 'fulfilled'
            ? healthRes.value.data
            : null;

        const pulse =
          pulseRes.status === 'fulfilled'
            ? pulseRes.value.data
            : null;

        const assignments: Assignment[] =
          assignRes.status === 'fulfilled'
            ? assignRes.value.data
            : [];

        const allStaff =
          staffRes.status === 'fulfilled'
            ? staffRes.value.data
            : [];

        console.log('HEALTH:', health);
        console.log('PULSE:', pulse);

        setHodStats({ health, pulse });
        setHodAssignments(assignments);

        let deptTeachers: any[] = [];

        if (user.departmentId) {
          deptTeachers = allStaff.filter(
            (s: any) =>
              s.user?.role === 'TEACHER' &&
              (
                s.departmentId === user.departmentId ||
                s.department?.id === user.departmentId
              )
          );
        } else {
          deptTeachers = allStaff.filter(
            (s: any) => s.user?.role === 'TEACHER'
          );
        }

        setHodTeachers(deptTeachers);

        const uniqueClassIds = [
          ...new Set(assignments.map(a => a.classSectionId))
        ];

        const allStudents: ClassStudent[] = [];

        await Promise.all(
          uniqueClassIds.map(async classId => {
            try {
              const res = await api.get(
                `/users/students?classId=${classId}`
              );

              allStudents.push(...res.data);
            } catch {}
          })
        );

        const uniqueStudents = Array.from(
          new Map(allStudents.map(s => [s.id, s])).values()
        );

        setHodStudents(uniqueStudents);

      } catch (error) {
        console.error('HOD dashboard error:', error);
      } finally {
        setIsLoadingHOD(false);
      }
    }
  };

  run();

}, [user]);

  // ─── Role routing ────────────────────────────────────────────────────────
  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'HEADMASTER'
  ) return <AdminHome />;


  const renderTeacherDashboard = () => (
    <>
      <div className="flex gap-6 mb-10 flex-wrap">
        <div className="bg-white px-8 py-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-gray-900">{teacherAssignments.length}</span>
            <span className="text-sm font-bold text-gray-500">Active Assignments</span>
          </div>
          <div className="w-px h-8 bg-gray-200" />
          <div className="flex items-center gap-3">
            <span className="text-3xl font-black text-emerald-700">
              {teacherAssignments.reduce((sum, a) => sum + (a.classSection?._count?.students ?? 0), 0)}
            </span>
            <span className="text-sm font-bold text-gray-500">Total Students</span>
          </div>
        </div>
      </div>

      {isLoadingTeacher ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-emerald-600 animate-spin" />
        </div>
      ) : teacherAssignments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center">
          <Users size={40} className="text-slate-200 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">No teaching assignments yet</p>
          <p className="text-xs text-slate-300 mt-1">Contact your HOD to get assigned to classes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teacherAssignments.map((assignment, idx) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate('/grading')}
              className="cursor-pointer"
            >
              <ClassCard
                id={assignment.id}
                subject={`${assignment.subject?.name} — ${assignment.classSection?.level} ${assignment.classSection?.name}`}
                className={assignment.classSection?.name ?? ''}
                status="Active"
                progress={0}
                studentCount={assignment.classSection?._count?.students ?? 0}
                hasRevision={false}
                hasMissingObservation={false}
              />
            </motion.div>
          ))}
        </div>
      )}
    </>
  );

const renderHODDashboard = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Pending Observations',
            value: hodStats?.health?.counts?.pendingObservations ?? '...',
            icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50'
          },
          {
            label: 'Report Cards',
            value: hodStats?.health?.counts?.totalReportCards ?? '...',
            icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50'
          },
          {
            label: 'Active Students',
            value: hodStats?.health?.counts?.activeStudents ?? '...',
            icon: Users, color: 'text-blue-600', bg: 'bg-blue-50'
          },
          {
            label: 'Grade Entries',
            value: hodStats?.health?.counts?.totalGrades ?? '...',
            icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform', stat.bg, stat.color)}>
              <stat.icon size={20} />
            </div>
            <p className="text-[24px] font-black text-gray-900 tracking-tighter">
              {isLoadingHOD ? <Loader2 size={20} className="animate-spin text-slate-300" /> : stat.value}
            </p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Class Distribution */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Class Enrollment</h3>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">Live</span>
          </div>
          {isLoadingHOD ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="space-y-4">
              {hodStats?.pulse?.enrollment?.map((item: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2 px-1">
                    <span className="text-[13px] font-black text-gray-900">{item.class}</span>
                    <span className="text-[11px] font-black text-gray-400">{item.count}/{item.capacity}</span>
                  </div>
                  <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (item.count / item.capacity) * 100)}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className={cn('h-full rounded-full', item.count >= item.capacity ? 'bg-rose-500' : 'bg-emerald-500')}
                    />
                  </div>
                </div>
              )) ?? (
                <p className="text-sm text-slate-400 font-bold text-center py-4">No enrollment data</p>
              )}
            </div>
          )}
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">Subject Performance</h3>
            <button onClick={() => navigate('/audit')} className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline">
              Full Log
            </button>
          </div>
          {isLoadingHOD ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-300" />
            </div>
          ) : (
            <div className="space-y-3">
              {hodStats?.pulse?.subjectPerformance?.slice(0, 5).map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-[12px] font-black text-gray-600 truncate max-w-[60%]">Subject {i + 1}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.averageScore}%` }} />
                    </div>
                    <span className="text-[11px] font-black text-gray-900 w-10 text-right">
                      {parseFloat(s.averageScore).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )) ?? (
                <p className="text-sm text-slate-400 font-bold text-center py-4">No grade data yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (user?.role === 'STUDENT') return <StudentDashboard />;
  if (user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER' || user?.role === 'ADMIN') return <AdminHome />;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2 font-display italic tracking-tight">
            {user?.role === 'TEACHER' && `Welcome, ${user.name.split(' ')[0]}!`}
            {user?.role === 'HOD' && 'Departmental Pulse'}
          </h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {user?.role === 'TEACHER' && 'Your Teaching Assignments'}
            {user?.role === 'HOD' && 'Integrity monitoring & submission audit'}
          </p>
        </header>

        {user?.role === 'TEACHER' && renderTeacherDashboard()}
        {user?.role === 'HOD' && renderHODDashboard()}
      </motion.div>
    </div>
  );
}