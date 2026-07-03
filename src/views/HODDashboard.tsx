import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  GraduationCap,
  Loader2,
  ArrowRight,
  Bell,
  Trophy,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Building2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "../lib/utils";
import { useRole } from "../context/RoleContext";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";

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

export function HODDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [roster, setRoster] = React.useState<any>(null);
  const [students, setStudents] = React.useState<any[]>([]);
  const [topStudents, setTopStudents] = React.useState<any[]>([]);
  const [gradeDistribution, setGradeDistribution] = React.useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = React.useState<any[]>([]);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [activeTerm, setActiveTerm] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user?.departmentId || !user?.staffProfileId) return;
    load();
  }, [user]);

  async function load() {
    setIsLoading(true);
    try {
      // Step 1: active year + dept roster + notifications in parallel
      const [yearRes, rosterRes, notifRes] = await Promise.allSettled([
        api.get("/academic/years/active"),
        api.get(`/academic/departments/${user!.departmentId}/roster`),
        user?.staffProfileId
          ? api.get(`/comms/staff-notifications/${user.staffProfileId}`, {
              params: { unreadOnly: true },
            })
          : Promise.resolve({ data: [] }),
      ]);

      const term =
        yearRes.status === "fulfilled"
          ? yearRes.value.data?.terms?.find((t: any) => t.isActive)
          : null;
      setActiveTerm(term);

      const rosterData =
        rosterRes.status === "fulfilled" ? rosterRes.value.data : null;
      setRoster(rosterData);

      setNotifications(
        notifRes.status === "fulfilled" ? (notifRes.value as any).data : [],
      );

      if (!term?.id || !user?.departmentId) {
        setIsLoading(false);
        return;
      }

      // Step 2: load students scoped to HOD's department via
      // GET /users/students — backend scopes to dept classes
      const studentsRes = await api
        .get("/users/students")
        .catch(() => ({ data: [] }));
      setStudents(studentsRes.data);

      // Step 3: analytics — all in parallel
      const [topRes, distRes, perfRes] = await Promise.allSettled([
        api.get(`/grading/top-students/${user!.departmentId}`, {
          params: { termId: term.id, limit: 5 },
        }),
        api.get(`/grading/grade-distribution/${user!.departmentId}`, {
          params: { termId: term.id },
        }),
        api.get("/grading/performance-filtered", {
          params: { departmentId: user!.departmentId },
        }),
      ]);

      setTopStudents(
        topRes.status === "fulfilled" ? (topRes.value as any).data : [],
      );
      setGradeDistribution(
        distRes.status === "fulfilled" ? (distRes.value as any).data : [],
      );
      setSubjectPerformance(
        perfRes.status === "fulfilled"
          ? ((perfRes.value as any).data?.subjects ?? [])
          : [],
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Derived counts — accurate from real data
  const allStaff = roster
    ? [
        ...(roster.headmasters ?? []),
        ...(roster.hods ?? []),
        ...(roster.teachers ?? []),
      ]
    : [];
  const subjectCount = roster?.department?.subjects?.length ?? 0;
  const totalAtRisk = subjectPerformance.reduce(
    (sum: number, s: any) => sum + (s.atRiskCount ?? 0),
    0,
  );
  const overallAvg =
    subjectPerformance.filter((s: any) => s.averageScore != null).length > 0
      ? (
          subjectPerformance
            .filter((s: any) => s.averageScore != null)
            .reduce(
              (sum: number, s: any) => sum + parseFloat(s.averageScore),
              0,
            ) /
          subjectPerformance.filter((s: any) => s.averageScore != null).length
        ).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <Loader2
            size={40}
            className="text-emerald-600 animate-spin mx-auto mb-4"
          />
          <p className="text-sm font-bold text-slate-400">
            Loading departmental data...
          </p>
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
              HOD Portal · {roster?.department?.name}
            </p>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight">
              Departmental Pulse
            </h1>
            <p className="text-xs font-bold text-slate-400 mt-1">
              {activeTerm
                ? `${activeTerm.termNumber?.replace("TERM_", "Term ")} · Active`
                : "No active term"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={load}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
            >
              <RefreshCw size={16} />
            </button>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-100 rounded-2xl">
                <Bell size={14} className="text-amber-500" />
                <span className="text-[11px] font-black text-amber-700">
                  {notifications.length} pending
                </span>
              </div>
            )}
            <button
              onClick={() => navigate("/grading")}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
            >
              Grading Sheet <ArrowRight size={14} />
            </button>
          </div>
        </header>

        {/* Pending submissions */}
        {notifications.length > 0 && (
          <section className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
            <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Bell size={14} /> Grade Submissions Awaiting Review
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-4 rounded-2xl border border-amber-100 flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                  </div>
                  <button
                    onClick={() => navigate("/grading")}
                    className="shrink-0 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Stats — accurate counts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Dept Staff",
              value: allStaff.length,
              sub: `${roster?.teachers?.length ?? 0} teachers · ${roster?.hods?.length ?? 0} HOD`,
              icon: Users,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              label: "Dept Students",
              value: students.length,
              sub: "enrolled this term",
              icon: GraduationCap,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: "Subjects",
              value: subjectCount,
              sub: `${subjectPerformance.filter((s: any) => s.averageScore != null).length} graded`,
              icon: BookOpen,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
            {
              label: "Dept Average",
              value: overallAvg ? `${overallAvg}%` : "—",
              sub: overallAvg
                ? parseFloat(overallAvg) >= 50
                  ? "passing"
                  : "below threshold"
                : "no grades yet",
              icon: TrendingUp,
              color:
                overallAvg && parseFloat(overallAvg) >= 50
                  ? "text-emerald-600"
                  : "text-amber-600",
              bg:
                overallAvg && parseFloat(overallAvg) >= 50
                  ? "bg-emerald-50"
                  : "bg-amber-50",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                  s.bg,
                  s.color,
                )}
              >
                <s.icon size={20} />
              </div>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">
                {s.value}
              </p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {s.label}
              </p>
              <p className="text-[9px] font-bold text-slate-300 mt-0.5">
                {s.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Department Subjects */}
        <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                Department Subjects
              </h2>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                {subjectCount} subjects · performance this term
              </p>
            </div>
            <button
              onClick={() => navigate("/analytics")}
              className="text-[10px] font-black text-emerald-700 uppercase tracking-widest hover:underline"
            >
              Full Analytics
            </button>
          </div>

          {subjectPerformance.length === 0 ? (
            <div className="py-8 text-center">
              <BarChart3 size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-400">
                No grade data yet this term
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjectPerformance.map((s: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[12px] font-black text-slate-800 truncate">
                        {s.subjectName}
                      </p>
                      <span
                        className={cn(
                          "text-[8px] font-black px-1.5 py-0.5 rounded uppercase shrink-0",
                          s.type === "CORE"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-indigo-50 text-indigo-600",
                        )}
                      >
                        {s.type}
                      </span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">
                      {s.studentCount} entries · {s.departmentName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          parseFloat(s.averageScore) >= 75
                            ? "bg-emerald-500"
                            : parseFloat(s.averageScore) >= 50
                              ? "bg-amber-500"
                              : "bg-rose-500",
                        )}
                        style={{
                          width: `${Math.min(100, parseFloat(s.averageScore))}%`,
                        }}
                      />
                    </div>
                    <span className="text-[12px] font-black text-slate-900 w-12 text-right">
                      {parseFloat(s.averageScore).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Staff + Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dept Staff */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
                  Department Staff
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {allStaff.length} members
                </p>
              </div>
              <button
                onClick={() => navigate("/identity/staff")}
                className="text-[10px] font-black text-slate-400 uppercase hover:underline"
              >
                Full Registry
              </button>
            </div>

            {allStaff.length === 0 ? (
              <div className="py-8 text-center">
                <Users size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">
                  No staff assigned
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {/* Headmasters */}
                {(roster?.headmasters ?? []).map((h: any) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-3 bg-purple-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center text-xs font-black">
                        {h.firstName?.[0]}
                        {h.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-slate-900">
                          {h.firstName} {h.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {h.staffId} · Headmaster
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {/* HODs */}
                {(roster?.hods ?? []).map((h: any) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center text-xs font-black">
                        {h.firstName?.[0]}
                        {h.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-slate-900">
                          {h.firstName} {h.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {h.staffId} · HOD
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-amber-600">
                      {h.teachingAssignments?.length ?? 0} classes
                    </span>
                  </div>
                ))}
                {/* Teachers */}
                {(roster?.teachers ?? []).map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center text-xs font-black">
                        {t.firstName?.[0]}
                        {t.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[12px] font-black text-slate-900">
                          {t.firstName} {t.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase">
                          {t.staffId}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      {t.teachingAssignments?.length ?? 0} classes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Students */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" /> Top Performers
                </h3>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                  {students.length} dept students · best this term
                </p>
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                This Term
              </span>
            </div>

            {topStudents.length === 0 ? (
              <div className="py-8 text-center">
                <Trophy size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">
                  No graded students yet
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
                      {i === 0 ? "🏆" : `#${i + 1}`}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-slate-900 truncate">
                        {s.name}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {s.indexNumber} ·{" "}
                        {s.currentClass?.level?.replace("FORM_", "F")}{" "}
                        {s.currentClass?.name}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-black text-emerald-600">
                        {Number(s.averageScore ?? 0).toFixed(1)}%
                      </p>
                      <p className="text-[9px] text-slate-400">
                        {s.subjectsGraded} subjects
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grade Distribution */}
        {gradeDistribution.some((g) => g.count > 0) && (
          <section className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest mb-6">
              Department Grade Distribution
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeDistribution}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="grade"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#cbd5e1" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload?.length) {
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
                    {gradeDistribution.map((e, i) => (
                      <Cell key={i} fill={GRADE_COLORS[e.grade] ?? "#94a3b8"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Grading Sheet",
              icon: ShieldCheck,
              path: "/grading",
              color: "bg-emerald-50 text-emerald-700 border-emerald-100",
            },
            {
              label: "Analytics",
              icon: BarChart3,
              path: "/analytics",
              color: "bg-indigo-50 text-indigo-700 border-indigo-100",
            },
            {
              label: "Academic Setup",
              icon: Building2,
              path: "/academic-setup",
              color: "bg-blue-50 text-blue-700 border-blue-100",
            },
          ].map((link, i) => (
            <button
              key={i}
              onClick={() => navigate(link.path)}
              className={cn(
                "flex items-center justify-between p-5 rounded-3xl border transition-all hover:shadow-md group",
                link.color,
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">
                  {link.label}
                </span>
              </div>
              <ArrowRight
                size={14}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </section>
      </motion.div>
    </div>
  );
}
