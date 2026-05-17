import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  BookOpen,
  ShieldAlert,
  GraduationCap,
  Activity,
  History,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  FileText,
  Download,
  Lock,
  Loader2,
  ClipboardCheck,
  ChevronRight,
  Search,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useRole } from "../context/RoleContext";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import api from "../lib/api";

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

/* const mockGlobalHistory = [
  { term: 'SHS 1 T1', score: 62, feedback: "Solid start. Foundations are being built across core subjects.", intervention: null },
  { term: 'SHS 1 T2', score: 65, feedback: "Progressing well. Minor gaps in Electives identified.", intervention: "Introductory Lab Orientation" },
  { term: 'SHS 1 T3', score: 68, feedback: "Year 1 complete. Consistent effort shown in all quadrants.", intervention: "Year-End Academic Reflection" },
  { term: 'SHS 2 T1', score: 72, feedback: "Specialization phase active. Excellent transition to advanced labs.", intervention: "Safety Proficiency Certification" },
  { term: 'SHS 2 T2', score: 70, feedback: "Slight dip due to advanced math complexity. Practical works are a savior.", intervention: "Bilateral Math Surgery session" },
  { term: 'SHS 2 T3', score: 76.4, feedback: "Weighted average rising. SHS 3 transition ready.", intervention: "MAAIS Honors Roll nomination" },
];

const subjectAnalysisData = [
  { 
    id: '1', 
    name: 'Integrated Science', 
    scores: { a: 55, b: 30, c: 15 }, 
    insight: "75% of Practical tasks completed correctly. Focus on Theory (Section A) to boost overall grade.",
    segments: { a: 15, b: 13, c: 12 },
    history: [
      { term: 'SHS 1 T1', score: 58, feedback: "Struggling with basic biology terms.", intervention: null },
      { term: 'SHS 1 T2', score: 60, feedback: "Improved in Chem labs.", intervention: null },
      { term: 'SHS 1 T3', score: 65, feedback: "Final exam performance boosted by Practical.", intervention: "Science Blitz Week" },
      { term: 'SHS 2 T1', score: 75, feedback: "Excellent grasp of Physics concepts.", intervention: null },
      { term: 'SHS 2 T2', score: 72, feedback: "Theory remains a bottleneck.", intervention: "Theory Boot Camp" },
      { term: 'SHS 2 T3', score: 82, feedback: "Practical mastery achieved.", intervention: "Senior Lab Lead role" },
    ]
  },
  { 
    id: '2', 
    name: 'Core Math', 
    scores: { a: 40, b: 50, c: 10 }, 
    insight: "Written proficiency is strong. Objective logic (Section A) needs reinforcement through practice drills.",
    segments: { a: 10, b: 20, c: 10 },
    history: [
      { term: 'SHS 1 T1', score: 70, feedback: "Strong logic.", intervention: null },
      { term: 'SHS 1 T2', score: 68, feedback: "Slight plateau in algebra.", intervention: null },
      { term: 'SHS 1 T3', score: 65, feedback: "Geometry proves difficult.", intervention: "Circle Geometry Workshop" },
      { term: 'SHS 2 T1', score: 70, feedback: "Revival in calculus.", intervention: null },
      { term: 'SHS 2 T2', score: 75, feedback: "Strong mid-term performance.", intervention: null },
      { term: 'SHS 2 T3', score: 75, feedback: "Consistent and reliable.", intervention: null },
    ]
  },
  { 
    id: '3', 
    name: 'English', 
    scores: { a: 60, b: 35, c: 5 }, 
    insight: "Exceptional oral and objective performance. Focus on structured essay writing (Section B) for the final aggregate.",
    segments: { a: 18, b: 15, c: 7 },
    history: [
      { term: 'SHS 1 T1', score: 85, feedback: "Excellent vocabulary.", intervention: null },
      { term: 'SHS 1 T2', score: 82, feedback: "Grammar is near perfect.", intervention: null },
      { term: 'SHS 1 T3', score: 88, feedback: "Public speaking lead.", intervention: "Debate Team Lead" },
      { term: 'SHS 2 T1', score: 80, feedback: "Literature needs more focus.", intervention: null },
      { term: 'SHS 2 T2', score: 85, feedback: "Resilient performance.", intervention: null },
      { term: 'SHS 2 T3', score: 88, feedback: "Top of the class.", intervention: null },
    ]
  },
  { 
    id: '4', 
    name: 'Physics', 
    scores: { a: 45, b: 25, c: 30 }, 
    insight: "Highest practical performance in the class. Balancing theoretic foundations will secure an A1 standing.",
    segments: { a: 12, b: 10, c: 18 },
    history: [
      { term: 'SHS 1 T1', score: 55, feedback: "Weak foundations in mechanics.", intervention: "Mechanics 101 Remedial" },
      { term: 'SHS 1 T2', score: 58, feedback: "Slight improvement.", intervention: null },
      { term: 'SHS 1 T3', score: 62, feedback: "Practical work is saving the grade.", intervention: null },
      { term: 'SHS 2 T1', score: 85, feedback: "Massive growth in Electromagnetism.", intervention: "Advanced Circuits Elective" },
      { term: 'SHS 2 T2', score: 78, feedback: "Mid-term dip.", intervention: null },
      { term: 'SHS 2 T3', score: 92, feedback: "Mastery achieved. Potential A1 candidate.", intervention: "Innovation Fair Project Lead" },
    ]
  },
]; */

const CustomPulseTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="bg-slate-900 p-6 rounded-[2rem] shadow-2xl border border-white/10 text-white min-w-[240px] space-y-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-slate-400 mb-1">
            {data.term}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-medium tracking-tight">
              {data.score?.toFixed(1)}%
            </span>
            <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-widest">
              Score
            </span>
          </div>
        </div>
        {data.grade && <div className="h-px w-full bg-white/5" />}
        {data.grade && (
          <p className="text-sm font-bold text-slate-300">
            Grade: {data.grade}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function StudentDashboard() {
  const { user } = useRole();
  const navigate = useNavigate();
  const [isExporting, setIsExporting] = React.useState(false);
  const [exportStep, setExportStep] = React.useState(0);
  const [selectedSubjectId, setSelectedSubjectId] = React.useState<
    string | null
  >(null);

  // ─── Real data ──────────────────────────────────────────────────────────────
  const [profile, setProfile] = React.useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadProfile() {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/users/students/${user.id}`);
        setProfile(res.data);
      } catch {
        // If student profile not found by user.id, try by index
        try {
          const studentsRes = await api.get("/users/students");
          const found = studentsRes.data.find(
            (s: any) =>
              s.user?.email === user.username + "@student.mandoshts.edu.gh" ||
              s.id === user.id,
          );
          if (found) setProfile(found);
        } catch {}
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  // ─── Derived data ───────────────────────────────────────────────────────────

  // Build subject list from grades
  const subjectMap = React.useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; grades: GradeEntry[] }
    > = {};
    profile?.grades?.forEach((g) => {
      if (!map[g.subjectId]) {
        map[g.subjectId] = {
          id: g.subjectId,
          name: g.subject.name,
          grades: [],
        };
      }
      map[g.subjectId].grades.push(g);
    });
    return Object.values(map);
  }, [profile]);

  const selectedSubject = selectedSubjectId
    ? subjectMap.find((s) => s.id === selectedSubjectId)
    : null;

  // Build pulse data from report cards (sorted by term)
  const pulseData = React.useMemo(() => {
    if (!profile?.reportCards?.length) return [];
    return [...profile.reportCards]
      .sort((a, b) =>
        a.term.academicYear.label.localeCompare(b.term.academicYear.label),
      )
      .map((rc) => ({
        term: `${rc.term.academicYear.label} T${rc.term.termNumber.replace("TERM_", "")}`,
        score: rc.averageScore,
        position: rc.classPosition,
        classSize: rc.classSize,
      }));
  }, [profile]);

  // Subject pulse data
  const subjectPulseData = React.useMemo(() => {
    if (!selectedSubject) return [];
    return [...selectedSubject.grades]
      .sort((a, b) =>
        a.term.academicYear.label.localeCompare(b.term.academicYear.label),
      )
      .map((g) => ({
        term: `${g.term.academicYear.label} T${g.term.termNumber.replace("TERM_", "")}`,
        score: g.totalScore,
        grade: g.grade,
      }));
  }, [selectedSubject]);

  const chartData = selectedSubject ? subjectPulseData : pulseData;

  // Latest average
  const latestRC = profile?.reportCards?.[profile.reportCards.length - 1];
  const latestAvg = latestRC?.averageScore ?? 0;

  // Top subject
  const topSubject = subjectMap.reduce((best, s) => {
    const avg =
      s.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) /
      (s.grades.length || 1);
    const bestAvg =
      best?.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) /
      (best?.grades.length || 1);
    return avg > (bestAvg ?? 0) ? s : best;
  }, subjectMap[0]);

  const topSubjectAvg =
    topSubject?.grades.reduce((sum, g) => sum + (g.totalScore ?? 0), 0) /
    (topSubject?.grades.length || 1);

  const handleExport = async () => {
    setIsExporting(true);
    setExportStep(1);
    await new Promise((r) => setTimeout(r, 800));
    setExportStep(2);
    await new Promise((r) => setTimeout(r, 1200));
    setExportStep(3);
    await new Promise((r) => setTimeout(r, 1000));
    // Trigger transcript generation
    try {
      if (profile?.id) {
        await api.post("/reports/transcripts/generate", {
          studentIdOrIndex: profile.id,
        });
      }
    } catch {}
    setIsExporting(false);
    setExportStep(0);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F9F9F7]">
        <div className="text-center">
          <Loader2
            size={40}
            className="text-emerald-600 animate-spin mx-auto mb-4"
          />
          <p className="text-sm font-bold text-slate-400">
            Loading your academic profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F9F9F7] font-sans relative overflow-hidden">
      {/* Export Overlay */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-emerald-700/95 backdrop-blur-md flex items-center justify-center p-8 text-white text-center"
          >
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-white/10 border-t-white rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock size={32} className="text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium tracking-tight">
                  {exportStep === 1 && "Authenticating Identity..."}
                  {exportStep === 2 && "Securing Academic Nodes..."}
                  {exportStep === 3 && "Generating Transcript..."}
                </h2>
                <p className="text-emerald-200/40 text-[11px] font-medium uppercase tracking-[0.2em]">
                  Technical Protocol Active
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE VIEW ── */}
      <div className="flex-1 flex flex-col md:hidden bg-[#F9F9F7] text-gray-900 overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-6 pt-10 pb-4 shrink-0 shadow-sm">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                  Student Identity
                </p>
                <h1 className="text-[26px] font-black tracking-tight text-gray-900 leading-tight font-display italic">
                  {user?.name?.split(" ")[0]}
                  <span className="text-gray-300 ml-2 not-italic font-sans text-lg">
                    #{profile?.indexNumber ?? "—"}
                  </span>
                </h1>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400">
                <Calendar size={13} className="text-emerald-700" />
                {profile?.currentClass
                  ? `${profile.currentClass.level} ${profile.currentClass.name}`
                  : "No Class Assigned"}
              </div>
              <button
                onClick={handleExport}
                className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 text-white rounded-2xl text-[11px] font-black tracking-tight shadow-lg shadow-emerald-900/20 active:scale-95 transition-all"
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
            {/* Academic Pulse */}
            <div className="min-w-[260px] bg-white p-7 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden snap-center">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                  Academic Pulse
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[30px] font-black text-gray-900 tracking-tighter italic font-display">
                    {latestAvg > 0 ? `${latestAvg.toFixed(1)}%` : "—"}
                  </span>
                  {pulseData.length >= 2 && (
                    <span
                      className={cn(
                        "text-[12px] font-black flex items-center gap-0.5 whitespace-nowrap",
                        pulseData[pulseData.length - 1].score >=
                          pulseData[pulseData.length - 2].score
                          ? "text-emerald-600"
                          : "text-rose-500",
                      )}
                    >
                      {pulseData[pulseData.length - 1].score >=
                      pulseData[pulseData.length - 2].score ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-black text-gray-400 mt-2">
                  Weighted Average
                </p>
              </div>
              <div className="absolute top-7 right-7 w-12 h-12 bg-[#F9F9F7] text-emerald-700 rounded-2xl flex items-center justify-center border border-gray-100 shadow-inner">
                <Activity size={20} />
              </div>
            </div>

            {/* Top Subject */}
            <div className="min-w-[260px] bg-emerald-700 p-7 rounded-[2rem] relative overflow-hidden snap-center text-white shadow-xl">
              <div className="relative z-10">
                <p className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest mb-4">
                  Top Subject
                </p>
                <div className="flex flex-col">
                  <span className="text-[30px] font-black tracking-tighter italic font-display">
                    {topSubjectAvg ? `${topSubjectAvg.toFixed(1)}%` : "—"}
                  </span>
                  <span className="text-[14px] font-black tracking-tight mt-1">
                    {topSubject?.name ?? "No grades yet"}
                  </span>
                </div>
                <p className="text-[10px] font-black text-emerald-200/40 mt-3">
                  Highest Achieved
                </p>
              </div>
              <div className="absolute top-7 right-7 w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
            </div>

            {/* Position */}
            {latestRC && (
              <div className="min-w-[260px] bg-gray-900 p-7 rounded-[2rem] relative overflow-hidden snap-center text-white">
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
                    Class Position
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-[30px] font-black tracking-tighter italic font-display">
                      {latestRC.classPosition}
                      <span className="text-lg opacity-40">
                        /{latestRC.classSize}
                      </span>
                    </span>
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                  </div>
                  <p className="text-[10px] font-black text-gray-500 mt-3 tracking-tight">
                    {latestRC.term.academicYear.label} T
                    {latestRC.term.termNumber.replace("TERM_", "")}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Subject Analysis */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-[19px] font-black text-gray-900 tracking-tight italic font-display">
                Analytics
              </h3>
            </div>

            {/* Subject chips */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
              <button
                onClick={() => setSelectedSubjectId(null)}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border shadow-sm",
                  selectedSubjectId === null
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-emerald-900/20 shadow-lg"
                    : "bg-[#F9F9F7] text-gray-500 border-gray-100 hover:bg-white",
                )}
              >
                Overall
              </button>
              {subjectMap.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-[11px] font-black whitespace-nowrap transition-all border shadow-sm",
                    selectedSubjectId === sub.id
                      ? "bg-emerald-700 text-white border-emerald-700 shadow-emerald-900/20 shadow-lg"
                      : "bg-[#F9F9F7] text-gray-500 border-gray-100 hover:bg-white",
                  )}
                >
                  {sub.name}
                </button>
              ))}
            </div>

            {/* Subject grades table */}
            {selectedSubject ? (
              <motion.div
                key={selectedSubject.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {selectedSubject.grades.map((g, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                        {g.term.academicYear.label} · T
                        {g.term.termNumber.replace("TERM_", "")}
                      </p>
                      <p className="text-sm font-bold text-gray-600 mt-1 italic">
                        {g.remark || "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-gray-900 font-display italic">
                        {g.totalScore?.toFixed(1)}
                      </p>
                      <span
                        className={cn(
                          "text-[11px] font-black px-2 py-0.5 rounded-lg",
                          g.grade === "A1"
                            ? "bg-emerald-50 text-emerald-700"
                            : g.grade?.startsWith("B")
                              ? "bg-blue-50 text-blue-700"
                              : g.grade?.startsWith("C")
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700",
                        )}
                      >
                        {g.grade}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="p-5 rounded-2xl bg-[#F9F9F7] border border-gray-100">
                  <p className="text-[12px] font-bold text-gray-600 leading-relaxed italic">
                    <span className="text-emerald-700 font-black uppercase text-[9px] block mb-2 tracking-widest not-italic">
                      Latest Remark
                    </span>
                    "
                    {selectedSubject.grades[selectedSubject.grades.length - 1]
                      ?.remark || "No remark recorded yet"}
                    "
                  </p>
                </div>
                <div className="bg-white p-5 rounded-[1.75rem] border border-gray-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center">
                      <ClipboardCheck size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                        Full Journey
                      </p>
                      <p className="text-[12px] font-black text-gray-900 font-display italic">
                        View Academic Timeline
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/journey")}
                    className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-emerald-700 transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </motion.div>
            ) : profileHasNoData(profile) ? (
              <div className="py-12 text-center space-y-3 bg-[#F9F9F7] rounded-3xl border border-gray-100 shadow-inner">
                <BookOpen className="mx-auto text-gray-300" size={32} />
                <p className="text-[15px] font-black text-gray-900 italic font-display tracking-tight">
                  No grades recorded yet
                </p>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                  Grades will appear here once entered by teachers
                </p>
              </div>
            ) : (
              <div className="py-12 text-center space-y-3 bg-[#F9F9F7] rounded-3xl border border-gray-100 shadow-inner">
                <BookOpen className="mx-auto text-gray-300" size={32} />
                <p className="text-[15px] font-black text-gray-900 italic font-display tracking-tight">
                  Select a subject above
                </p>
                <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                  Tap a chip to drill into subject data
                </p>
              </div>
            )}
          </div>

          {/* Journey Pulse Chart */}
          {chartData.length > 0 && (
            <div className="space-y-6">
              <header className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Academic Timeline
                  </p>
                  <h4 className="text-[17px] font-black text-gray-900 tracking-tight italic font-display">
                    {selectedSubject
                      ? selectedSubject.name
                      : "Overall Progress"}
                  </h4>
                </div>
                <div className="flex items-center gap-2 bg-[#F9F9F7] px-3 py-1.5 rounded-full border border-gray-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">
                    Live
                  </span>
                </div>
              </header>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="scoreGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#047857"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="95%"
                          stopColor="#047857"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis dataKey="term" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip
                      content={<CustomPulseTooltip />}
                      cursor={{
                        stroke: "#059669",
                        strokeWidth: 2,
                        strokeDasharray: "4 4",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#059669"
                      strokeWidth={4}
                      fillOpacity={1}
                      fill="url(#scoreGradient)"
                      dot={{
                        r: 5,
                        fill: "#047857",
                        strokeWidth: 2,
                        stroke: "#fff",
                      }}
                      activeDot={{ r: 7, fill: "#047857", strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Compliance footer */}
          <div className="bg-emerald-800 p-8 rounded-[2.5rem] text-white space-y-8 relative overflow-hidden shadow-2xl shadow-emerald-900/20">
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-black text-emerald-200/60 uppercase tracking-widest">
                  Report Cards
                </p>
                <span className="text-[14px] font-black text-white flex items-center gap-2 italic">
                  {profile?.reportCards?.length ?? 0} Terms{" "}
                  <ShieldCheck size={14} />
                </span>
              </div>
              <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, ((profile?.reportCards?.length ?? 0) / 9) * 100)}%`,
                  }}
                  className="h-full bg-white rounded-full"
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[11px] font-bold text-emerald-100/80 leading-snug">
                  {profile?.reportCards?.length
                    ? `${profile.reportCards.length} of 9 terms completed`
                    : "Academic records will appear once reports are generated"}
                </p>
              </div>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex flex-col items-center gap-4 text-center relative z-10">
              <button
                onClick={() => navigate("/journey-audit")}
                className="flex items-center gap-2 text-[11px] font-black text-white hover:text-emerald-200 transition-colors py-2 tracking-tight"
              >
                Request Comprehensive Audit <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop placeholder */}
      <div className="hidden md:flex flex-col items-center justify-center flex-1 bg-[#F9F9F7] p-20 text-center">
        <div className="max-w-md space-y-6">
          <Activity size={64} className="text-emerald-700 mx-auto mb-8" />
          <h1 className="text-[32px] font-black tracking-tight text-gray-900 italic font-display">
            Your Academic Dashboard
          </h1>
          <p className="text-gray-500 font-bold">
            Welcome, {user?.name}. Your full academic profile is available on
            mobile. The desktop view is coming soon.
          </p>
          <button
            onClick={() => navigate("/journey")}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-2xl font-bold mx-auto"
          >
            View Journey <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper
function profileHasNoData(profile: StudentProfile | null): boolean {
  return (
    !profile ||
    (profile.grades?.length === 0 && profile.reportCards?.length === 0)
  );
}
