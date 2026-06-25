import React, { useState, useEffect, useCallback } from "react";
import {
  Settings2,
  BookOpen,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Gauge,
  Palette,
  History,
  Info,
  ShieldAlert,
  Sparkles,
  Lock,
  Unlock,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Users,
  FileCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../lib/utils";
import api from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GradeBoundary {
  id: string;
  grade: string;
  min: number;
  max: number;
  remark: string;
  smartRemarks: string[];
}

interface Term {
  id: string;
  termNumber: string;
  isActive: boolean;
  isLocked: boolean;
  academicYear: { label: string };
}

interface ClassSummaryItem {
  id: string;
  name: string;
  indexNumber: string;
  progress: number;
  isFullyApproved: boolean;
  isFullyLocked: boolean;
  hasAnyLocked: boolean;
  gradesCount: number;
  gradeEntryIds: string[];
}

interface ClassSection {
  id: string;
  name: string;
  level: string;
}

const REMARK_LABELS: Record<string, string> = {
  EXCELLENT: "Excellent",
  VERY_GOOD: "Very Good",
  GOOD: "Good",
  CREDIT: "Credit",
  PASS: "Pass",
  WEAK_PASS: "Weak Pass",
  FAILURE: "Failure",
};

export const GradingRulesView: React.FC = () => {
  const [boundaries, setBoundaries] = useState<GradeBoundary[]>([]);
  const [activeTerm, setActiveTerm] = useState<Term | null>(null);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [classSummary, setClassSummary] = useState<ClassSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showSealConfirm, setShowSealConfirm] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isBulkApproving, setIsBulkApproving] = useState(false);
  const [isBulkLocking, setIsBulkLocking] = useState(false);
  const [isBulkUnlocking, setIsBulkUnlocking] = useState(false);
  const [lockingStudentId, setLockingStudentId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ─── Load static data ────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [boundariesRes, yearRes, classesRes] = await Promise.all([
        api.get("/grading/boundaries"),
        api.get("/academic/years/active"),
        api.get("/academic/classes"),
      ]);

      setBoundaries(boundariesRes.data);
      setClasses(classesRes.data);

      const term = yearRes.data?.terms?.find((t: any) => t.isActive);
      if (term) {
        setActiveTerm({ ...term, academicYear: { label: yearRes.data.label } });
      }

      if (classesRes.data.length > 0) {
        setSelectedClassId(classesRes.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load grading rules", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Load class summary when class or term changes ────────────────────────
  useEffect(() => {
    async function loadSummary() {
      if (!selectedClassId || !activeTerm) return;
      setIsLoadingSummary(true);
      try {
        const res = await api.get(`/grading/class-summary/${selectedClassId}`, {
          params: { termId: activeTerm.id },
        });
        setClassSummary(res.data);
      } catch {
        setClassSummary([]);
      } finally {
        setIsLoadingSummary(false);
      }
    }
    loadSummary();
  }, [selectedClassId, activeTerm]);

  // ─── Lock/unlock a single student's grades ─────────────────────────────────
  const toggleStudentLock = async (student: ClassSummaryItem) => {
    if (student.gradeEntryIds.length === 0) return;
    setLockingStudentId(student.id);
    try {
      if (student.hasAnyLocked) {
        await api.post("/grading/entries/bulk-unlock", {
          ids: student.gradeEntryIds,
        });
        showToast(`Unlocked grades for ${student.name}`);
      } else {
        await Promise.all(
          student.gradeEntryIds.map((id) =>
            api.patch(`/grading/entries/${id}/lock`),
          ),
        );
        showToast(`Locked grades for ${student.name}`);
      }
      // Refresh summary
      const res = await api.get(`/grading/class-summary/${selectedClassId}`, {
        params: { termId: activeTerm!.id },
      });
      setClassSummary(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Lock/unlock failed");
    } finally {
      setLockingStudentId(null);
    }
  };

  // ─── Bulk lock all grades in selected class ─────────────────────────────────
  const handleBulkLockClass = async () => {
    if (
      !window.confirm(
        "Lock ALL grade entries for this class? Teachers will be unable to edit any of them.",
      )
    )
      return;
    setIsBulkLocking(true);
    try {
      const allIds = classSummary.flatMap((s) => s.gradeEntryIds);
      if (allIds.length === 0) {
        showToast("No grade entries to lock");
        return;
      }
      await Promise.all(
        allIds.map((id) => api.patch(`/grading/entries/${id}/lock`)),
      );
      showToast(`Locked ${allIds.length} grade entries`);
      const res = await api.get(`/grading/class-summary/${selectedClassId}`, {
        params: { termId: activeTerm!.id },
      });
      setClassSummary(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Bulk lock failed");
    } finally {
      setIsBulkLocking(false);
    }
  };

  // ─── Bulk unlock all grades in selected class ───────────────────────────────
  const handleBulkUnlockClass = async () => {
    if (!window.confirm("Unlock ALL grade entries for this class?")) return;
    setIsBulkUnlocking(true);
    try {
      const allIds = classSummary.flatMap((s) => s.gradeEntryIds);
      if (allIds.length === 0) {
        showToast("No grade entries to unlock");
        return;
      }
      await api.post("/grading/entries/bulk-unlock", { ids: allIds });
      showToast(`Unlocked ${allIds.length} grade entries`);
      const res = await api.get(`/grading/class-summary/${selectedClassId}`, {
        params: { termId: activeTerm!.id },
      });
      setClassSummary(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Bulk unlock failed");
    } finally {
      setIsBulkUnlocking(false);
    }
  };

  // ─── Lock term (Final Seal) ────────────────────────────────────────────────
  const handleLockTerm = async () => {
    if (!activeTerm) return;
    setIsLocking(true);
    try {
      await api.patch(`/archive/terms/${activeTerm.id}/lock`);
      setActiveTerm({ ...activeTerm, isLocked: true });
      showToast("Term locked successfully. Grades are now frozen.");
      setShowSealConfirm(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to lock term");
    } finally {
      setIsLocking(false);
    }
  };
  const totalLocked = classSummary.filter((s) => s.hasAnyLocked).length;
  // ─── Bulk approve all pending grades for selected class ────────────────────
  const handleBulkApproveClass = async () => {
    if (!activeTerm || !selectedClassId) return;
    if (!window.confirm("Approve all pending grades for this class?")) return;

    setIsBulkApproving(true);
    try {
      // Fetch all unapproved entries for students in this class for this term
      const studentsInClass = classSummary.filter((s) => !s.isFullyApproved);

      // Get grade entry IDs for each unapproved student
      const allIds: string[] = [];
      for (const student of studentsInClass) {
        try {
          const res = await api.get(
            `/grading/students/${student.id}/terms/${activeTerm.id}`,
          );
          const unapproved = res.data
            .filter((g: any) => !g.isApproved)
            .map((g: any) => g.id);
          allIds.push(...unapproved);
        } catch {}
      }

      if (allIds.length === 0) {
        showToast("No pending grades to approve");
        setIsBulkApproving(false);
        return;
      }

      await api.post("/grading/entries/bulk-approve", { ids: allIds });
      showToast(`Approved ${allIds.length} grade entries`);

      // Refresh summary
      const res = await api.get(`/grading/class-summary/${selectedClassId}`, {
        params: { termId: activeTerm.id },
      });
      setClassSummary(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || "Bulk approval failed");
    } finally {
      setIsBulkApproving(false);
    }
  };

  const getTimeUntilLocked = () => {
    if (!activeTerm) return "";
    if (activeTerm.isLocked) return "TERM LOCKED";
    const endDate = new Date((activeTerm as any).endDate ?? Date.now());
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    if (diff <= 0) return "Term end date passed";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days}d remaining until term end`;
  };

  const totalStudents = classSummary.length;
  const fullyApproved = classSummary.filter((s) => s.isFullyApproved).length;
  const avgProgress =
    totalStudents > 0
      ? classSummary.reduce((sum, s) => sum + s.progress, 0) / totalStudents
      : 0;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2
            size={40}
            className="text-emerald-600 animate-spin mx-auto mb-4"
          />
          <p className="text-sm font-bold text-slate-400">
            Loading grading protocol...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto relative">
      {/* Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-bold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Seal Confirmation Modal */}
      <AnimatePresence>
        {showSealConfirm && activeTerm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSealConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-600" />
              <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-8 mx-auto">
                <ShieldAlert size={40} className="text-rose-600" />
              </div>

              <h3 className="text-2xl font-black text-slate-900 text-center italic font-display mb-4">
                Execute Final Seal?
              </h3>
              <p className="text-gray-500 text-center text-sm font-medium leading-relaxed mb-8">
                This will{" "}
                <span className="font-black text-rose-600">
                  permanently freeze
                </span>{" "}
                all marks and assessments for this term. Teachers will no longer
                be able to edit grades.
              </p>

              <div className="space-y-4 mb-10">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Target Term
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {activeTerm.academicYear.label} —{" "}
                    {activeTerm.termNumber.replace("TERM_", "Term ")}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Approval Status
                  </p>
                  <p className="text-sm font-black text-slate-900">
                    {fullyApproved} of {totalStudents} students fully approved (
                    {selectedClassId
                      ? classes.find((c) => c.id === selectedClassId)?.name
                      : ""}
                    )
                  </p>
                </div>
              </div>

              {fullyApproved < totalStudents && totalStudents > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
                  <AlertTriangle
                    size={16}
                    className="text-amber-500 mt-0.5 shrink-0"
                  />
                  <p className="text-xs font-bold text-amber-700">
                    Some students in the selected class still have unapproved
                    grades. Locking the term anyway will freeze them as-is.
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowSealConfirm(false)}
                  className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  Abort
                </button>
                <button
                  onClick={handleLockTerm}
                  disabled={isLocking}
                  className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:bg-rose-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isLocking ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Lock size={14} />
                  )}
                  Finalize Term
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Grading & Assessment Rules</span>
            </div>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none">
              The Grading Protocol
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
              {activeTerm
                ? `${activeTerm.academicYear.label} · ${activeTerm.termNumber.replace("TERM_", "Term ")}`
                : "No active term"}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Boundaries + Class Approval */}
          <div className="lg:col-span-2 space-y-8">
            {/* WAEC Scale (read-only) */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Palette size={16} className="text-emerald-600" />
                    WAEC Scale (Standard)
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Fixed grading thresholds — Ghana SHS standard
                  </p>
                </div>
                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  CA 30 / Exam 70
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Score Range (%)
                      </th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                        Grade
                      </th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Remark Category
                      </th>
                      <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Smart Remarks Pool
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {boundaries.map((b) => (
                      <tr
                        key={b.id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-10 py-5">
                          <span className="text-[13px] font-black font-mono text-slate-700">
                            {b.min}–{b.max}
                          </span>
                        </td>
                        <td className="px-10 py-5 text-center">
                          <span
                            className={cn(
                              "px-4 py-2 rounded-xl text-[13px] font-black italic font-display border",
                              b.grade.startsWith("A")
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : b.grade.startsWith("B")
                                  ? "bg-blue-50 text-blue-600 border-blue-100"
                                  : b.grade.startsWith("C")
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : "bg-rose-50 text-rose-600 border-rose-100",
                            )}
                          >
                            {b.grade}
                          </span>
                        </td>
                        <td className="px-10 py-5">
                          <span className="text-[11px] font-bold text-slate-600">
                            {REMARK_LABELS[b.remark] ?? b.remark}
                          </span>
                        </td>
                        <td className="px-10 py-5">
                          <div className="flex flex-wrap gap-1.5 max-w-md">
                            {b.smartRemarks.slice(0, 2).map((r, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-medium text-slate-500 italic"
                              >
                                {r}
                              </span>
                            ))}
                            {b.smartRemarks.length > 2 && (
                              <span className="px-2 py-1 text-[10px] font-bold text-slate-400">
                                +{b.smartRemarks.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                <Info size={14} className="text-slate-400" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  This scale is fixed system-wide and cannot be edited per term
                </p>
              </div>
            </section>

            {/* Class Approval Tray */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileCheck size={16} className="text-emerald-600" />
                    Approval Tray
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    Review and bulk-approve grade entries by class
                  </p>
                </div>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.level.replace("FORM_", "Form ")} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Progress summary */}
              <div className="p-8 bg-slate-50 border-b border-slate-100 grid grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">
                    {totalStudents}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Students
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-2xl font-black text-emerald-600">
                    {fullyApproved}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Approved
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-2xl font-black text-rose-600">
                    {totalLocked}
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Locked
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 text-center">
                  <p className="text-2xl font-black text-slate-900">
                    {avgProgress.toFixed(0)}%
                  </p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Progress
                  </p>
                </div>
              </div>

              {/* Student rows */}
              <div className="max-h-96 overflow-y-auto">
                {isLoadingSummary ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2
                      size={28}
                      className="animate-spin text-slate-300"
                    />
                  </div>
                ) : classSummary.length === 0 ? (
                  <div className="py-16 text-center">
                    <Users size={32} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">
                      No students or grades found for this class
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {classSummary.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                              s.isFullyApproved
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-600",
                            )}
                          >
                            {s.isFullyApproved ? (
                              <ShieldCheck size={16} />
                            ) : (
                              <Clock size={16} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-black text-slate-900 truncate">
                                {s.name}
                              </p>
                              {s.hasAnyLocked && (
                                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-rose-100 text-rose-600 rounded-md text-[8px] font-black uppercase tracking-widest shrink-0">
                                  <Lock size={8} />{" "}
                                  {s.isFullyLocked ? "Locked" : "Partial"}
                                </span>
                              )}
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {s.indexNumber}
                            </p>
                          </div>
                          <div className="w-32 shrink-0">
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full",
                                  s.isFullyApproved
                                    ? "bg-emerald-500"
                                    : "bg-amber-400",
                                )}
                                style={{ width: `${s.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                          <span className="text-[10px] font-black text-slate-400">
                            {s.gradesCount} subjects
                          </span>
                          <button
                            onClick={() => toggleStudentLock(s)}
                            disabled={
                              lockingStudentId === s.id ||
                              s.gradeEntryIds.length === 0
                            }
                            className={cn(
                              "p-2 rounded-lg transition-all disabled:opacity-40",
                              s.hasAnyLocked
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                : "bg-slate-50 text-slate-400 hover:bg-slate-100",
                            )}
                            title={
                              s.hasAnyLocked ? "Unlock grades" : "Lock grades"
                            }
                          >
                            {lockingStudentId === s.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : s.hasAnyLocked ? (
                              <Lock size={14} />
                            ) : (
                              <Unlock size={14} />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-3">
                <button
                  onClick={handleBulkApproveClass}
                  disabled={
                    isBulkApproving ||
                    activeTerm?.isLocked ||
                    fullyApproved === totalStudents
                  }
                  className="w-full py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isBulkApproving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  {fullyApproved === totalStudents && totalStudents > 0
                    ? "All Grades Approved"
                    : "Bulk Approve Pending Grades"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleBulkLockClass}
                    disabled={isBulkLocking || totalLocked === totalStudents}
                    className="py-3 bg-rose-50 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-100 transition-all disabled:opacity-50"
                  >
                    {isBulkLocking ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Lock size={14} />
                    )}
                    Lock All Grades
                  </button>
                  <button
                    onClick={handleBulkUnlockClass}
                    disabled={isBulkUnlocking || totalLocked === 0}
                    className="py-3 bg-slate-100 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all disabled:opacity-50"
                  >
                    {isBulkUnlocking ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Unlock size={14} />
                    )}
                    Unlock All Grades
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Term Lock + Warnings */}
          <div className="space-y-8">
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -bottom-10 -right-10 opacity-10">
                <Lock size={200} />
              </div>

              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[1.5rem] flex items-center justify-center mb-8">
                  {activeTerm?.isLocked ? (
                    <Lock className="text-rose-400" size={32} />
                  ) : (
                    <Unlock className="text-emerald-400" size={32} />
                  )}
                </div>

                <h3 className="text-2xl font-black text-white italic font-display tracking-tight leading-none mb-3">
                  Terminal Validation Lock
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10">
                  Freeze the database for report generation. Once locked, no
                  teacher can modify marks.
                </p>

                {activeTerm ? (
                  <>
                    <div className="space-y-4 mb-10">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Current Term
                        </p>
                        <p className="text-sm font-black text-white">
                          {activeTerm.academicYear.label} —{" "}
                          {activeTerm.termNumber.replace("TERM_", "Term ")}
                        </p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                          Status
                        </p>
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                            activeTerm.isLocked
                              ? "bg-rose-500 text-white"
                              : "bg-emerald-500 text-white",
                          )}
                        >
                          {activeTerm.isLocked ? "LOCKED" : "OPEN FOR GRADING"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        activeTerm.isLocked ? null : setShowSealConfirm(true)
                      }
                      disabled={activeTerm.isLocked}
                      className={cn(
                        "w-full py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3",
                        activeTerm.isLocked
                          ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                          : "bg-emerald-600 text-white shadow-emerald-900/40 hover:bg-emerald-700",
                      )}
                    >
                      <Lock size={16} />
                      {activeTerm.isLocked
                        ? "Term Already Locked"
                        : "Apply Final Seal"}
                    </button>

                    {activeTerm.isLocked && (
                      <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest text-center mt-6">
                        Database is currently Read-Only for this term
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm font-bold text-slate-400">
                    No active term configured
                  </p>
                )}
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                <AlertTriangle size={18} className="text-amber-500" />
                System Status
              </h3>
              <div className="space-y-4">
                {[
                  {
                    msg:
                      totalStudents - fullyApproved > 0
                        ? `${totalStudents - fullyApproved} students in this class have unapproved grades.`
                        : "All grades in this class are fully approved.",
                    severity:
                      totalStudents - fullyApproved > 0 ? "high" : "info",
                  },
                  {
                    msg: "WAEC scale fixed at standard 9-point grading (A1–F9).",
                    severity: "info",
                  },
                  {
                    msg: activeTerm?.isLocked
                      ? "Term is locked — all grade modifications are blocked."
                      : "Term is open — teachers can submit and edit grades.",
                    severity: activeTerm?.isLocked ? "low" : "info",
                  },
                ].map((w, i) => (
                  <div
                    key={i}
                    className={cn(
                      "p-4 rounded-2xl border flex gap-4 items-start",
                      w.severity === "high"
                        ? "bg-rose-50 border-rose-100 text-rose-900"
                        : w.severity === "low"
                          ? "bg-amber-50 border-amber-100 text-amber-900"
                          : "bg-blue-50 border-blue-100 text-blue-900",
                    )}
                  >
                    <div className="mt-1">
                      {w.severity === "high" ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <Info size={14} />
                      )}
                    </div>
                    <p className="text-[11px] font-bold leading-tight">
                      {w.msg}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
