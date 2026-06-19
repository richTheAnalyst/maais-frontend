// Add to imports at top
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Trophy, Award } from "lucide-react";
import { ClassCard } from "../components/ClassCard";
import { motion } from "framer-motion";
import { useRole } from "../context/RoleContext";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import {
  CheckCircle2,
  Clock,
  Users,
  ShieldAlert,
  Loader2,
  GraduationCap,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { StudentDashboard } from "./StudentDashboard";
import { AdminHome } from "./AdminHome";
import api from "../lib/api";

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
  const role = user?.role as string | undefined;

  // ─── Teacher state ────────────────────────────────────────────────────────
  const [teacherAssignments, setTeacherAssignments] = React.useState<
    Assignment[]
  >([]);
  const [assignmentStudents, setAssignmentStudents] = React.useState<
    Record<string, ClassStudent[]>
  >({});
  const [isLoadingTeacher, setIsLoadingTeacher] = React.useState(false);

  // ─── HOD state ────────────────────────────────────────────────────────────
  const [hodStats, setHodStats] = React.useState<any>(null);
  const [hodAssignments, setHodAssignments] = React.useState<Assignment[]>([]);
  const [hodStudents, setHodStudents] = React.useState<ClassStudent[]>([]);
  const [hodTeachers, setHodTeachers] = React.useState<any[]>([]);
  const [isLoadingHOD, setIsLoadingHOD] = React.useState(false);
  const [hodNotifications, setHodNotifications] = React.useState<any[]>([]);
  const [topStudents, setTopStudents] = React.useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = React.useState<any[]>([]);
  const [activeTermId, setActiveTermId] = React.useState<string | null>(null);

  // ─── useEffect ───────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!user) return;

    const run = async () => {
      // ─── Teacher ─────────────────────────────────────
      if (user.role === "TEACHER") {
        setIsLoadingTeacher(true);

        try {
          const assignmentsUrl = user.staffProfileId
            ? `/academic/assignments/teacher/${user.staffProfileId}`
            : `/academic/assignments/teacher/${user.id}`;

          const res = await api.get(assignmentsUrl);

          const assignments: Assignment[] = res.data;
          setTeacherAssignments(assignments);

          const uniqueClassIds = [
            ...new Set(assignments.map((a) => a.classSectionId)),
          ];

          const studentMap: Record<string, ClassStudent[]> = {};

          await Promise.all(
            uniqueClassIds.map(async (classId) => {
              try {
                const studentsRes = await api.get(
                  `/users/students?classId=${classId}`,
                );

                studentMap[classId] = studentsRes.data;
              } catch {
                studentMap[classId] = [];
              }
            }),
          );

          setAssignmentStudents(studentMap);
        } catch (error) {
          console.error("Teacher dashboard error:", error);
        } finally {
          setIsLoadingTeacher(false);
        }
      }

      // ─── HOD ─────────────────────────────────────────
      if (user.role === "HOD") {
        setIsLoadingHOD(true);

        try {
          const assignmentsUrl = user.staffProfileId
            ? `/academic/assignments/teacher/${user.staffProfileId}`
            : `/academic/assignments/teacher/${user.id}`;

          if (user.staffProfileId) {
            try {
              const notifRes = await api.get(
                `/comms/staff-notifications/${user.staffProfileId}`,
                {
                  params: { unreadOnly: true },
                },
              );

              setHodNotifications(notifRes.data);
            } catch {}
          }

          const [healthRes, pulseRes, assignRes, staffRes] =
            await Promise.allSettled([
              api.get("/archive/health"),
              api.get("/comms/analytics/pulse"),
              api.get(assignmentsUrl),
              api.get("/users/staff"),
            ]);

          const health =
            healthRes.status === "fulfilled" ? healthRes.value.data : null;

          const pulse =
            pulseRes.status === "fulfilled" ? pulseRes.value.data : null;

          const assignments: Assignment[] =
            assignRes.status === "fulfilled" ? assignRes.value.data : [];

          const allStaff =
            staffRes.status === "fulfilled" ? staffRes.value.data : [];

          console.log("HEALTH:", health);
          console.log("PULSE:", pulse);

          setHodStats({ health, pulse });
          setHodAssignments(assignments);

          let deptTeachers: any[] = [];

          if (user.departmentId) {
            deptTeachers = allStaff.filter(
              (s: any) =>
                s.user?.role === "TEACHER" &&
                (s.departmentId === user.departmentId ||
                  s.department?.id === user.departmentId),
            );
          } else {
            deptTeachers = allStaff.filter(
              (s: any) => s.user?.role === "TEACHER",
            );
          }

          setHodTeachers(deptTeachers);

          const uniqueClassIds = [
            ...new Set(assignments.map((a) => a.classSectionId)),
          ];

          const allStudents: ClassStudent[] = [];

          await Promise.all(
            uniqueClassIds.map(async (classId) => {
              try {
                const res = await api.get(`/users/students?classId=${classId}`);

                allStudents.push(...res.data);
              } catch {}
            }),
          );

          const uniqueStudents = Array.from(
            new Map(allStudents.map((s) => [s.id, s])).values(),
          );

          setHodStudents(uniqueStudents);
        } catch (error) {
          console.error("HOD dashboard error:", error);
        } finally {
          setIsLoadingHOD(false);
        }
        // Get active term and department-specific analytics
        if (user.departmentId) {
          try {
            const yearRes = await api.get("/academic/years/active");
            const term = yearRes.data?.terms?.find((t: any) => t.isActive);
            if (term) {
              setActiveTermId(term.id);
              const [topRes, distRes] = await Promise.allSettled([
                api.get(`/grading/top-students/${user.departmentId}`, {
                  params: { termId: term.id, limit: 5 },
                }),
                api.get(`/grading/grade-distribution/${user.departmentId}`, {
                  params: { termId: term.id },
                }),
              ]);
              if (topRes.status === "fulfilled")
                setTopStudents(topRes.value.data);
              if (distRes.status === "fulfilled")
                setGradeDistribution(distRes.value.data);
            }
          } catch {}
        }
      }
    };

    run();
  }, [user]);

  // ─── Role routing ────────────────────────────────────────────────────────
  if ((user as any)?.role === "STUDENT") return <StudentDashboard />;
  if (
    user?.role === "ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "HEADMASTER"
  )
    return <AdminHome />;

  const renderTeacherDashboard = () => {
    // Flatten all students across the teacher's classes, deduplicated
    const allStudents = React.useMemo(() => {
      const map = new Map<string, ClassStudent>();
      Object.values(assignmentStudents).forEach((list) =>
        list.forEach((s) => map.set(s.id, s)),
      );
      return Array.from(map.values());
    }, [assignmentStudents]);

    return (
      <>
        <div className="flex gap-6 mb-10 flex-wrap">
          <div className="bg-white px-8 py-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-gray-900">
                {teacherAssignments.length}
              </span>
              <span className="text-sm font-bold text-gray-500">
                Active Assignments
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-emerald-700">
                {allStudents.length}
              </span>
              <span className="text-sm font-bold text-gray-500">
                My Students
              </span>
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
            <p className="text-sm font-bold text-slate-400">
              No teaching assignments yet
            </p>
            <p className="text-xs text-slate-300 mt-1">
              Contact your HOD to get assigned to classes
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Class cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teacherAssignments.map((assignment, idx) => {
                const classStudents =
                  assignmentStudents[assignment.classSectionId] ?? [];
                return (
                  <motion.div
                    key={assignment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    onClick={() => navigate("/grading")}
                    className="cursor-pointer"
                  >
                    <ClassCard
                      id={assignment.id}
                      subject={`${assignment.subject?.name} — ${assignment.classSection?.level} ${assignment.classSection?.name}`}
                      className={assignment.classSection?.name ?? ""}
                      status="Active"
                      progress={0}
                      studentCount={
                        classStudents.length ||
                        assignment.classSection?._count?.students ||
                        0
                      }
                      hasRevision={false}
                      hasMissingObservation={false}
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* My Students list */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                  My Students
                </h3>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">
                  {allStudents.length} total
                </span>
              </div>

              {allStudents.length === 0 ? (
                <div className="py-8 text-center">
                  <GraduationCap
                    size={32}
                    className="text-slate-200 mx-auto mb-3"
                  />
                  <p className="text-sm font-bold text-slate-400">
                    No students linked to your classes yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                          <GraduationCap size={16} />
                        </div>
                        <div>
                          <p className="text-[13px] font-black text-gray-900">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            {student.indexNumber} ·{" "}
                            {student.currentClass?.level?.replace("FORM_", "F")}{" "}
                            {student.currentClass?.name}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate("/grading")}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Enter Marks
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderHODDashboard = () => {
    // Filter subject performance to only this department's subjects
    const deptSubjectPerformance = (
      hodStats?.pulse?.subjectPerformance ?? []
    ).filter(
      (s: any) => !user?.departmentId || s.departmentId === user.departmentId,
    );

    const GRADE_COLORS: Record<string, string> = {
      A1: "#059669",
      B2: "#0ea5e9",
      B3: "#3b82f6",
      C4: "#f59e0b",
      C5: "#fbbf24",
      C6: "#fb923c",
      D7: "#f87171",
      E8: "#ef4444",
      F9: "#dc2626",
    };

    return (
      <div className="space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Dept Teachers",
              value: hodTeachers.length,
              icon: Users,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Dept Students",
              value: hodStudents.length,
              icon: GraduationCap,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "My Classes",
              value: new Set(hodAssignments.map((a) => a.classSectionId)).size,
              icon: BookOpen,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Pending Observations",
              value: hodStats?.health?.counts?.pendingObservations ?? "—",
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                  stat.bg,
                  stat.color,
                )}
              >
                <stat.icon size={20} />
              </div>
              <p className="text-[24px] font-black text-gray-900 tracking-tighter">
                {isLoadingHOD ? (
                  <Loader2 size={20} className="animate-spin text-slate-300" />
                ) : (
                  stat.value
                )}
              </p>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Pending submission notifications */}
        {hodNotifications.length > 0 && (
          <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
            <h3 className="text-[12px] font-black text-amber-900 uppercase tracking-widest mb-4">
              Pending Submissions ({hodNotifications.length})
            </h3>
            <div className="space-y-2">
              {hodNotifications.map((n: any) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-2xl border border-amber-100"
                >
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Department Teachers + Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Department Teachers
              </h3>
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100 uppercase tracking-widest">
                {hodTeachers.length} staff
              </span>
            </div>
            {isLoadingHOD ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : hodTeachers.length === 0 ? (
              <div className="py-8 text-center">
                <Users size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">
                  No teachers in your department
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Ensure staff are assigned to your department
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {hodTeachers.map((teacher: any) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors uppercase">
                        {teacher.firstName?.[0]}
                        {teacher.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-900 leading-none mb-0.5">
                          {teacher.firstName} {teacher.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {teacher.staffId}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-black text-slate-500">
                      {teacher.teachingAssignments?.length ?? 0} classes
                    </span>
                  </div>
                ))}
                <button
                  onClick={() => navigate("/identity/staff")}
                  className="w-full py-3 border border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all mt-2"
                >
                  View Full Staff Registry
                </button>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Department Students
              </h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">
                {hodStudents.length} total
              </span>
            </div>
            {isLoadingHOD ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : hodStudents.length === 0 ? (
              <div className="py-8 text-center">
                <GraduationCap
                  size={32}
                  className="text-slate-200 mx-auto mb-3"
                />
                <p className="text-sm font-bold text-slate-400">
                  No students in your department's classes yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {hodStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                        <GraduationCap size={14} />
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-900">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                          {student.indexNumber} ·{" "}
                          {student.currentClass?.level?.replace("FORM_", "F")}{" "}
                          {student.currentClass?.name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/grading")}
                      className="text-[10px] font-black text-emerald-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Marks
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Classes + Subject Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                My Classes
              </h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase tracking-widest">
                Live
              </span>
            </div>
            {isLoadingHOD ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : hodAssignments.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-8">
                No class assignments yet
              </p>
            ) : (
              <div className="space-y-5">
                {Array.from(
                  new Map(
                    hodAssignments.map((a) => [
                      a.classSectionId,
                      a.classSection,
                    ]),
                  ).values(),
                ).map((cls, i) => {
                  const count = hodStudents.filter(
                    (s) => s.currentClass?.id === cls.id,
                  ).length;
                  const subjectsInClass = hodAssignments
                    .filter((a) => a.classSectionId === cls.id)
                    .map((a) => a.subject?.name)
                    .join(" · ");
                  return (
                    <div key={cls.id}>
                      <div className="flex justify-between mb-1 px-1">
                        <div>
                          <span className="text-[13px] font-black text-gray-900">
                            {cls.level?.replace("FORM_", "Form ")} {cls.name}
                          </span>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            {subjectsInClass}
                          </p>
                        </div>
                        <span className="text-[11px] font-black text-gray-400">
                          {count}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${Math.min(100, (count / 40) * 100)}%`,
                          }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest">
                Subject Performance
              </h3>
              <button
                onClick={() => navigate("/audit")}
                className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline"
              >
                Full Log
              </button>
            </div>
            {isLoadingHOD ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : deptSubjectPerformance.length === 0 ? (
              <p className="text-sm text-slate-400 font-bold text-center py-8">
                No grade data yet
              </p>
            ) : (
              <div className="space-y-3">
                {deptSubjectPerformance.slice(0, 6).map((s: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-[12px] font-black text-gray-700 truncate block">
                        {s.subjectName}
                      </span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">
                        {s.studentCount} entries
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="h-1.5 w-20 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, parseFloat(s.averageScore))}%`,
                          }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-gray-900 w-10 text-right">
                        {parseFloat(s.averageScore).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Students + Grade Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" />
                Top Performing Students
              </h3>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100 uppercase tracking-widest">
                This Term
              </span>
            </div>
            {isLoadingHOD ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : topStudents.length === 0 ? (
              <div className="py-8 text-center">
                <Award size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">
                  No graded students yet this term
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topStudents.map((s: any, i: number) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                        i === 0
                          ? "bg-amber-100 text-amber-700"
                          : i === 1
                            ? "bg-slate-100 text-slate-600"
                            : i === 2
                              ? "bg-orange-50 text-orange-600"
                              : "bg-slate-50 text-slate-400",
                      )}
                    >
                      {i === 0 ? <Trophy size={16} /> : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-gray-900 truncate">
                        {s.name}
                      </p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        {s.indexNumber} ·{" "}
                        {s.currentClass?.level?.replace("FORM_", "F")}{" "}
                        {s.currentClass?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-emerald-600">
                        {s.averageScore.toFixed(1)}%
                      </p>
                      <p className="text-[9px] font-bold text-gray-400">
                        {s.subjectsGraded} subjects
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
            <h3 className="text-[13px] font-black text-gray-900 uppercase tracking-widest mb-6">
              Grade Distribution
            </h3>
            {isLoadingHOD ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : gradeDistribution.length === 0 ||
              gradeDistribution.every((g) => g.count === 0) ? (
              <div className="py-8 text-center">
                <p className="text-sm font-bold text-slate-400">
                  No grades recorded yet
                </p>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="grade"
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#cbd5e1" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(241,245,249,0.5)" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-xl">
                              <p className="text-xs font-black text-slate-900">
                                {payload[0].payload.grade}
                              </p>
                              <p className="text-[11px] font-bold text-slate-500">
                                {payload[0].value} students
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {gradeDistribution.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={GRADE_COLORS[entry.grade] ?? "#94a3b8"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  if (user?.role === "STUDENT") return <StudentDashboard />;
  if (
    user?.role === "SUPER_ADMIN" ||
    user?.role === "HEADMASTER" ||
    user?.role === "ADMIN"
  )
    return <AdminHome />;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 mb-2 font-display italic tracking-tight">
            {user?.role === "TEACHER" && `Welcome, ${user.name.split(" ")[0]}!`}
            {user?.role === "HOD" && "Departmental Pulse"}
          </h1>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">
            {user?.role === "TEACHER" && "Your Teaching Assignments"}
            {user?.role === "HOD" && "Integrity monitoring & submission audit"}
          </p>
        </header>

        {user?.role === "TEACHER" && renderTeacherDashboard()}
        {user?.role === "HOD" && renderHODDashboard()}
      </motion.div>
    </div>
  );
}
