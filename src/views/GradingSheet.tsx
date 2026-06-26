import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Save,
  X,
  ShieldAlert,
  PlusCircle,
  MinusCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ShieldCheck,
  Lock,
  Zap,
  Sparkles,
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { ObservationSidebar } from "../components/ObservationSidebar";
import { useUI } from "../context/UIContext";
import { useRole } from "../context/RoleContext";
import api from "../lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Student {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { id: string; name: string; level: string };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  type: string;
}

interface ClassSection {
  id: string;
  name: string;
  level: string;
}

interface Term {
  id: string;
  termNumber: string;
  isActive: boolean;
  isLocked: boolean;
  academicYear?: { label: string };
}

interface GradeRow {
  studentId: string;
  subjectId: string;
  termId: string;
  classScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  remark: string;
  hasObservation: boolean;
  observationText: string;
  isLocked: boolean;
  isApproved: boolean;
  entryId?: string;
}

const GRADE_COLORS: Record<string, string> = {
  A1: "bg-emerald-50 text-emerald-700",
  B2: "bg-blue-50 text-blue-700",
  B3: "bg-blue-50 text-blue-600",
  C4: "bg-amber-50 text-amber-700",
  C5: "bg-amber-50 text-amber-600",
  C6: "bg-orange-50 text-orange-600",
  D7: "bg-rose-50 text-rose-600",
  E8: "bg-rose-50 text-rose-700",
  F9: "bg-red-100 text-red-700",
};

function computeGrade(classScore: number, examScore: number) {
  const total = classScore + examScore;
  if (total >= 80) return { total, grade: "A1" };
  if (total >= 70) return { total, grade: "B2" };
  if (total >= 65) return { total, grade: "B3" };
  if (total >= 60) return { total, grade: "C4" };
  if (total >= 55) return { total, grade: "C5" };
  if (total >= 50) return { total, grade: "C6" };
  if (total >= 45) return { total, grade: "D7" };
  if (total >= 40) return { total, grade: "E8" };
  return { total, grade: "F9" };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function GradingSheet() {
  const { isTermFinalized } = useUI();
  const { user } = useRole();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const revisionId = queryParams.get("revision");
  const missingObsId = queryParams.get("missing");
  const isCorrectionMode = !!revisionId;
  const isMissingObsMode = !!missingObsId;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [classes, setClasses] = React.useState<ClassSection[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [activeTerm, setActiveTerm] = React.useState<Term | null>(null);
  const [smartRemarks, setSmartRemarks] = React.useState<
    Record<string, string[]>
  >({});

  const [selectedClassId, setSelectedClassId] = React.useState("");
  const [selectedSubjectId, setSelectedSubjectId] = React.useState("");
  const [gradeRows, setGradeRows] = React.useState<Record<string, GradeRow>>(
    {},
  );

  const [selectedStudentId, setSelectedStudentId] = React.useState<
    string | null
  >(null);
  const [isExamExpanded, setIsExamExpanded] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [observationComment, setObservationComment] = React.useState("");
  const [teacherReply, setTeacherReply] = React.useState("");
  const [observationRatings, setObservationRatings] = React.useState<
    Record<string, number>
  >({});

  const [isLoadingSetup, setIsLoadingSetup] = React.useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isApproving, setIsApproving] = React.useState(false);
  const [savingStudentId, setSavingStudentId] = React.useState<string | null>(
    null,
  );

  const approveGrade = async (studentId: string) => {
    const row = gradeRows[studentId];
    if (!row?.entryId) return;
    try {
      await api.patch(`/grading/entries/${row.entryId}/approve`);
      setGradeRows((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], isApproved: true },
      }));
      setSuccessMsg("Grade approved");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Approval failed");
      setTimeout(() => setError(null), 4000);
    }
  };
  const unlockGrade = async (studentId: string) => {
    const row = gradeRows[studentId];
    if (!row?.entryId) return;
    try {
      await api.patch(`/grading/entries/${row.entryId}/unlock`);
      setGradeRows((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], isLocked: false },
      }));
      setSuccessMsg("Grade unlocked — editable again");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Unlock failed");
      setTimeout(() => setError(null), 4000);
    }
  };

  const approveAllGrades = async () => {
    const ids = Object.values(gradeRows)
      .map((r) => r.entryId)
      .filter(Boolean) as string[];
    if (ids.length === 0) {
      setError("No grades to approve. Ensure they are saved first.");
      return;
    }
    setIsApproving(true);
    try {
      await api.post("/grading/entries/bulk-approve", { ids });
      setGradeRows((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((sid) => {
          if (next[sid].entryId) next[sid].isApproved = true;
        });
        return next;
      });
      setSuccessMsg("All grades approved");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Bulk approval failed");
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsApproving(false);
    }
  };
  const [showSTPOverlay, setShowSTPOverlay] = React.useState(false);
  const [showAuditToast, setShowAuditToast] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  // ─── Load setup data ────────────────────────────────────────────────────────
  React.useEffect(() => {
    async function loadSetup() {
      setIsLoadingSetup(true);
      try {
        const [classesRes, subjectsRes, yearRes] = await Promise.all([
          api.get("/academic/classes"),
          api.get("/academic/subjects"),
          api.get("/academic/years/active"),
        ]);
        setClasses(classesRes.data);
        setSubjects(subjectsRes.data);

        // Get active term
        const terms: Term[] = yearRes.data?.terms ?? [];
        const active = terms.find((t: Term) => t.isActive);
        if (active) {
          setActiveTerm({
            ...active,
            academicYear: { label: yearRes.data.label },
          });
        }

        // Set defaults
        if (classesRes.data.length > 0)
          setSelectedClassId(classesRes.data[0].id);
        if (subjectsRes.data.length > 0)
          setSelectedSubjectId(subjectsRes.data[0].id);
      } catch {
        setError("Failed to load grading setup");
      } finally {
        setIsLoadingSetup(false);
      }
    }
    loadSetup();
  }, []);

  // ─── Load students when class/subject selected ──────────────────────────────
  React.useEffect(() => {
    if (!selectedClassId || !selectedSubjectId || !activeTerm) return;

    async function loadStudents() {
      setIsLoadingStudents(true);
      try {
        const res = await api.get(`/users/students?classId=${selectedClassId}`);
        const studentList: Student[] = res.data;
        setStudents(studentList);

        // Initialize grade rows
        const rows: Record<string, GradeRow> = {};
        await Promise.all(
          studentList.map(async (s) => {
            try {
              const gradesRes = await api.get(
                `/grading/students/${s.id}/terms/${activeTerm.id}`,
              );
              const existing = gradesRes.data.find(
                (g: any) => g.subjectId === selectedSubjectId,
              );
              if (existing) {
                rows[s.id] = {
                  studentId: s.id,
                  subjectId: selectedSubjectId,
                  termId: activeTerm.id,
                  classScore: existing.classScore ?? 0,
                  examScore: existing.examScore ?? 0,
                  totalScore: existing.totalScore ?? 0,
                  grade: existing.grade ?? "",
                  remark: existing.remark ?? "",
                  hasObservation: existing.hasObservation ?? false,
                  observationText: existing.observationText ?? "",
                  isLocked: existing.isLocked ?? false,
                  isApproved: existing.isApproved ?? false,
                  entryId: existing.id,
                };
              } else {
                rows[s.id] = {
                  studentId: s.id,
                  subjectId: selectedSubjectId,
                  termId: activeTerm.id,
                  classScore: 0,
                  examScore: 0,
                  totalScore: 0,
                  grade: "",
                  remark: "",
                  hasObservation: false,
                  observationText: "",
                  isLocked: false,
                  isApproved: false,
                };
              }
            } catch {
              rows[s.id] = {
                studentId: s.id,
                subjectId: selectedSubjectId,
                termId: activeTerm.id,
                classScore: 0,
                examScore: 0,
                totalScore: 0,
                grade: "",
                remark: "",
                hasObservation: false,
                observationText: "",
                isLocked: false,
                isApproved: false,
              };
            }
          }),
        );
        setGradeRows(rows);

        if (studentList.length > 0) {
          setSelectedStudentId(studentList[0].id);
        }
      } catch {
        setError("Failed to load students");
      } finally {
        setIsLoadingStudents(false);
      }
    }
    loadStudents();
  }, [selectedClassId, selectedSubjectId, activeTerm]);

  // ─── Fetch smart remarks for a grade ───────────────────────────────────────
  const fetchSmartRemarks = React.useCallback(
    async (grade: string) => {
      if (!grade || smartRemarks[grade]) return;
      try {
        const res = await api.get(`/grading/smart-remarks/${grade}`);
        setSmartRemarks((prev) => ({ ...prev, [grade]: res.data.remarks }));
      } catch {}
    },
    [smartRemarks],
  );

  // ─── Update a grade row locally ─────────────────────────────────────────────
  const updateScore = (
    studentId: string,
    field: "classScore" | "examScore",
    value: string,
  ) => {
    if (isTermFinalized) return;
    const num = Math.max(0, parseFloat(value) || 0);
    setGradeRows((prev) => {
      const row = prev[studentId];
      if (!row) return prev;
      const updated = { ...row, [field]: num };
      const { total, grade } = computeGrade(
        updated.classScore,
        updated.examScore,
      );
      fetchSmartRemarks(grade);
      return { ...prev, [studentId]: { ...updated, totalScore: total, grade } };
    });
  };

  const updateRemark = (studentId: string, remark: string) => {
    setGradeRows((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], remark },
    }));
  };

  // ─── Save a single student's grade ──────────────────────────────────────────
  const saveGrade = async (studentId: string) => {
    if (isTermFinalized || !activeTerm) return;
    const row = gradeRows[studentId];
    if (!row) return;

    setSavingStudentId(studentId);
    try {
      const res = await api.post("/grading/entries", {
        studentId: row.studentId,
        subjectId: row.subjectId,
        termId: row.termId,
        classScore: row.classScore,
        examScore: row.examScore,
        remark: row.remark || undefined,
        hasObservation: row.hasObservation,
        observationText: row.observationText || undefined,
      });

      setGradeRows((prev) => ({
        ...prev,
        [studentId]: { ...prev[studentId], entryId: res.data.id },
      }));

      setSuccessMsg(
        `Grade saved for ${students.find((s) => s.id === studentId)?.firstName}`,
      );
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save grade");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSavingStudentId(null);
    }
  };

  // ─── Save all grades (bulk) ─────────────────────────────────────────────────
  const saveAllGrades = async () => {
    if (isTermFinalized || !activeTerm) return;
    setIsSaving(true);
    try {
      const entries = Object.values(gradeRows).map((row) => ({
        studentId: row.studentId,
        subjectId: row.subjectId,
        termId: row.termId,
        classScore: row.classScore,
        examScore: row.examScore,
        remark: row.remark || undefined,
        hasObservation: row.hasObservation,
        observationText: row.observationText || undefined,
      }));
      await api.post("/grading/entries/bulk", { entries });
      setSuccessMsg("All grades saved successfully");
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.log("ERROR RESPONSE: ", err.response?.data);
      console.log("ERROR RESPONSE: ", err.response?.data);
      setError(err.response?.data?.message || "Failed to save grades");
      setTimeout(() => setError(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Save observation for selected student ──────────────────────────────────
  const handleSaveObservation = async () => {
    if (!selectedStudentId || isTermFinalized) return;
    const row = gradeRows[selectedStudentId];
    if (!row) return;

    const updatedRow = {
      ...row,
      hasObservation: true,
      observationText: observationComment,
    };

    // Update local state
    setGradeRows((prev) => ({
      ...prev,
      [selectedStudentId]: updatedRow,
    }));

    // Save directly using the updated values, not stale state
    setSavingStudentId(selectedStudentId);
    try {
      const res = await api.post("/grading/entries", {
        studentId: updatedRow.studentId,
        subjectId: updatedRow.subjectId,
        termId: updatedRow.termId,
        classScore: updatedRow.classScore,
        examScore: updatedRow.examScore,
        remark: updatedRow.remark || undefined,
        hasObservation: true,
        observationText: observationComment || undefined,
      });

      setGradeRows((prev) => ({
        ...prev,
        [selectedStudentId]: {
          ...prev[selectedStudentId],
          entryId: res.data.id,
          hasObservation: true,
        },
      }));

      setSuccessMsg(`Observation saved for ${selectedStudent?.firstName}`);
      setTimeout(() => setSuccessMsg(null), 3000);

      // Check if all students with scores now have observations
      const allWithScoresHaveObs = Object.values(gradeRows).every((r) => {
        if (r.studentId === selectedStudentId) return true; // just saved
        const hasScores = r.classScore > 0 || r.examScore > 0;
        return !hasScores || r.hasObservation;
      });

      if (allWithScoresHaveObs) {
        setShowAuditToast(true);
        setTimeout(() => setShowAuditToast(false), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save observation");
      setTimeout(() => setError(null), 4000);
    } finally {
      setSavingStudentId(null);
    }
  };

  // ─── Submit to HOD ──────────────────────────────────────────────────────────
  const handleSubmitToHOD = async () => {
  if (!selectedClass || !selectedSubject) return;
  setIsSubmitting(true);
  try {
    await saveAllGrades();

    // Find the HOD for this subject's department
    const staffRes = await api.get('/users/staff');
    const hods = staffRes.data.filter((s: any) =>
      s.user?.role === 'HOD' &&
      (s.departmentId === (selectedSubject as any).departmentId ||
       s.department?.id === (selectedSubject as any).departmentId)
    );

    if (hods.length === 0) {
      setSuccessMsg('Grades saved. No HOD found for this department to notify.');
      setTimeout(() => setSuccessMsg(null), 4000);
      return;
    }

    const hodIds = hods.map((h: any) => h.id);
    await api.post('/comms/notify-staff', {
      staffIds: hodIds,
      title: 'Grade Submission for Review',
      body: `${user?.name} submitted grades for ${selectedSubject.name} — ${selectedClass.level.replace('FORM_', 'Form ')} ${selectedClass.name}. ${students.length} students, ${Object.values(gradeRows).filter(r => r.classScore > 0 || r.examScore > 0).length} entries.`,
    });

    setSuccessMsg(`Grades submitted — ${hods.length} HOD${hods.length > 1 ? 's' : ''} notified`);
    setTimeout(() => setSuccessMsg(null), 4000);
  } catch (err: any) {
    setError(err.response?.data?.message || 'Submission failed');
    setTimeout(() => setError(null), 4000);
  } finally {
    setIsSubmitting(false);
  }
};

  // ─── STP Validation ─────────────────────────────────────────────────────────
  const stpErrors = React.useMemo(() => {
    const errors: string[] = [];
    const rows = Object.values(gradeRows);
    if (rows.some((r) => r.classScore > 30))
      errors.push("Class score exceeds 30% limit");
    if (rows.some((r) => r.examScore > 70))
      errors.push("Exam score exceeds 70% limit");
    if (rows.some((r) => !r.hasObservation))
      errors.push("Missing behavioral observations");
    if (isTermFinalized)
      errors.push("CRITICAL: Term is locked. No edits allowed.");
    return errors;
  }, [gradeRows, isTermFinalized]);

  const missingCount = Object.values(gradeRows).filter(
    (r) => !r.hasObservation && (r.classScore > 0 || r.examScore > 0),
  ).length;
  const isSubmissionLocked = missingCount > 0 || isTermFinalized;

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const selectedRow = selectedStudentId ? gradeRows[selectedStudentId] : null;
  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (isLoadingSetup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F0F4F2]">
        <div className="text-center">
          <Loader2
            size={40}
            className="text-emerald-600 animate-spin mx-auto mb-4"
          />
          <p className="text-sm font-bold text-slate-400">
            Loading grading setup...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden bg-[#F0F4F2]">
      {/* ── Main Area ── */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        {/* Term locked banner */}
        {isTermFinalized && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="sticky top-0 z-50 mb-6"
          >
            <div className="bg-rose-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Lock size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest">
                    Final Seal Active
                  </p>
                  <p className="text-[10px] font-bold text-rose-100">
                    Database locked. Contact admin for emergency triage.
                  </p>
                </div>
              </div>
              <div className="px-4 py-2 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/20">
                Terminal State
              </div>
            </div>
          </motion.div>
        )}

        {/* Success / Error toasts */}
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
          {error && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
            >
              <AlertCircle size={16} />
              <span className="text-sm font-bold">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "max-w-full mx-auto",
            isTermFinalized && "opacity-60 grayscale-[0.3]",
          )}
        >
          {/* Header */}
          <header className="mb-6 flex flex-wrap justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                <span>Grading</span>
                <ChevronRight size={10} />
                <span className="text-slate-900">Mark Entry Sheet</span>
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-1">
                {selectedSubject?.name ?? "Select a Subject"} —{" "}
                {selectedClass
                  ? `${selectedClass.level} ${selectedClass.name}`
                  : "Select a Class"}
              </h1>
              {activeTerm && (
                <p className="text-xs font-bold text-slate-400">
                  {activeTerm.academicYear?.label} ·{" "}
                  {activeTerm.termNumber.replace("_", " ")}
                  {activeTerm.isLocked && (
                    <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-600 rounded-full text-[9px] font-black uppercase">
                      Locked
                    </span>
                  )}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Class selector */}
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.level} {c.name}
                  </option>
                ))}
              </select>

              {/* Subject selector */}
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

             {/*  <button
                onClick={() => setShowSTPOverlay(true)}
                className="p-2.5 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest"
              >
                <Zap size={16} />
                STP
              </button> */}

              {!isSidebarOpen && (
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl hover:bg-emerald-200 transition-all flex items-center gap-2 font-bold text-sm"
                >
                  <ChevronLeft size={18} />
                  Observation
                </button>
              )}

              <button
                onClick={saveAllGrades}
                disabled={isSaving || isTermFinalized}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save All
              </button>
            </div>
          </header>

          {/* Grade Table */}
          {isLoadingStudents ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 flex items-center justify-center">
              <Loader2 size={32} className="text-emerald-600 animate-spin" />
            </div>
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
              <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">
                No students in this class
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100">
                      Index
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100">
                      Name
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">
                      Class Score (30)
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">
                      <div className="flex items-center justify-center gap-2">
                        Exam Score (70)
                        <button
                          onClick={() => setIsExamExpanded(!isExamExpanded)}
                          className="text-emerald-600"
                        >
                          {isExamExpanded ? (
                            <MinusCircle size={16} />
                          ) : (
                            <PlusCircle size={16} />
                          )}
                        </button>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">
                      Total
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-900 border-r border-gray-100 text-center">
                      Grade
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">
                      Smart Remark
                    </th>
                    <th className="px-4 py-4 text-xs font-black text-gray-900 text-center">
                      Obs
                    </th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {students.map((student) => {
                    const row = gradeRows[student.id];
                    if (!row) return null;
                    const gradeRemarks = smartRemarks[row.grade] ?? [];
                    const isSavingThis = savingStudentId === student.id;
                    const isSelected = selectedStudentId === student.id;

                    return (
                      <tr
                        key={student.id}
                        className={cn(
                          "transition-all cursor-pointer group",
                          isSelected
                            ? "bg-emerald-50/50"
                            : "hover:bg-gray-50/50",
                          row.isLocked && "opacity-60",
                        )}
                        onClick={() => setSelectedStudentId(student.id)}
                      >
                        <td className="px-4 py-3 text-xs font-bold text-slate-500 border-r border-gray-100">
                          {student.indexNumber}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 border-r border-gray-100">
                          {student.firstName} {student.lastName}
                        </td>

                        {/* Class Score */}
                        <td className="px-4 py-3 border-r border-gray-100 text-center">
                          <input
                            type="number"
                            min={0}
                            max={30}
                            value={row.classScore || ""}
                            readOnly={isTermFinalized || row.isLocked}
                            onChange={(e) =>
                              updateScore(
                                student.id,
                                "classScore",
                                e.target.value,
                              )
                            }
                            onBlur={() => saveGrade(student.id)}
                            className="w-14 bg-transparent text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md text-sm"
                            placeholder="0"
                          />
                        </td>

                        {/* Exam Score */}
                        <td className="px-4 py-3 border-r border-gray-100 text-center">
                          <input
                            type="number"
                            min={0}
                            max={70}
                            value={row.examScore || ""}
                            readOnly={isTermFinalized || row.isLocked}
                            onChange={(e) =>
                              updateScore(
                                student.id,
                                "examScore",
                                e.target.value,
                              )
                            }
                            onBlur={() => saveGrade(student.id)}
                            className="w-14 bg-transparent text-center font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md text-sm"
                            placeholder="0"
                          />
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 border-r border-gray-100 text-center">
                          <span className="text-sm font-black text-slate-900">
                            {row.totalScore.toFixed(1)}
                          </span>
                        </td>

                        {/* Grade */}
                        <td className="px-4 py-3 border-r border-gray-100 text-center">
                          {row.grade ? (
                            <span
                              className={cn(
                                "px-3 py-1 rounded-xl text-[12px] font-black italic",
                                GRADE_COLORS[row.grade] ??
                                  "bg-slate-100 text-slate-600",
                              )}
                            >
                              {row.grade}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Smart Remark */}
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="flex items-center gap-2 group/remark relative">
                            <Sparkles
                              size={12}
                              className="text-amber-400 shrink-0"
                            />
                            <select
                              value={row.remark}
                              onChange={(e) =>
                                updateRemark(student.id, e.target.value)
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                fetchSmartRemarks(row.grade);
                              }}
                              className="text-[10px] font-bold text-slate-500 italic bg-transparent outline-none cursor-pointer w-full"
                            >
                              <option value={row.remark}>
                                {row.remark || "Select remark..."}
                              </option>
                              {gradeRemarks
                                .filter((r) => r !== row.remark)
                                .map((r, i) => (
                                  <option key={i} value={r}>
                                    {r}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </td>

                        {/* Observation status */}
                        <td className="px-4 py-3 text-center border-r border-gray-100">
                          {row.isApproved ? (
                            <ShieldCheck
                              size={16}
                              className="text-blue-500 mx-auto"
                            />
                          ) : row.hasObservation ? (
                            <CheckCircle2
                              size={16}
                              className="text-emerald-500 mx-auto"
                            />
                          ) : (
                            <AlertCircle
                              size={16}
                              className="text-amber-400 mx-auto animate-pulse"
                            />
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                saveGrade(student.id);
                              }}
                              disabled={
                                isSavingThis ||
                                isTermFinalized ||
                                row.isLocked ||
                                row.isApproved
                              }
                              className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 rounded-lg transition-all disabled:opacity-30"
                              title="Save"
                            >
                              {isSavingThis ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Save size={14} />
                              )}
                            </button>
                            {(user?.role === "HOD" ||
                              user?.role === "HEADMASTER" ||
                              user?.role === "SUPER_ADMIN") &&
                              row.entryId &&
                              !row.isApproved && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    approveGrade(student.id);
                                  }}
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {row.isLocked ? (
                              user?.role === "HOD" ||
                              user?.role === "HEADMASTER" ||
                              user?.role === "SUPER_ADMIN" ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unlockGrade(student.id);
                                  }}
                                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all flex items-center gap-1"
                                  title="Unlock for editing"
                                >
                                  <Lock size={14} />
                                </button>
                              ) : (
                                <span
                                  className="p-2 text-slate-300"
                                  title="Locked by HOD — contact your HOD to unlock"
                                >
                                  <Lock size={14} />
                                </span>
                              )
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveGrade(student.id);
                                }}
                                disabled={
                                  isSavingThis ||
                                  isTermFinalized ||
                                  row.isApproved
                                }
                                className="p-2 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 text-slate-400 rounded-lg transition-all disabled:opacity-30"
                                title="Save"
                              >
                                {isSavingThis ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Save size={14} />
                                )}
                              </button>
                            )}
                            {(user?.role === "HOD" ||
                              user?.role === "HEADMASTER" ||
                              user?.role === "SUPER_ADMIN") &&
                              row.entryId &&
                              !row.isApproved &&
                              !row.isLocked && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    approveGrade(student.id);
                                  }}
                                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                                  title="Approve"
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-6 flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  isSubmissionLocked
                    ? "bg-amber-50 text-amber-600"
                    : "bg-emerald-50 text-emerald-600",
                )}
              >
                {isSubmissionLocked ? (
                  <Lock size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </div>
              <div>
                <p className="text-sm font-black text-gray-900">
                  {isSubmissionLocked
                    ? "Submission Locked"
                    : "Audit Readiness Passed"}
                </p>
                <p className="text-xs font-bold text-gray-500">
                  {isSubmissionLocked
                    ? `${missingCount} observations missing`
                    : "All observations logged — ready for HOD review"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.role === "HOD" ||
              user?.role === "HEADMASTER" ||
              user?.role === "SUPER_ADMIN" ? (
                <button
                  onClick={approveAllGrades}
                  disabled={isApproving || isTermFinalized}
                  className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                  {isApproving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  Approve All Grades
                </button>
              ) : (
                <button
                  onClick={handleSubmitToHOD}
                  disabled={isSubmissionLocked || isSubmitting}
                  className={cn(
                    "px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 shadow-lg",
                    isSubmissionLocked
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-900/20",
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : null}
                  Submit to HOD
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </footer>
        </motion.div>
      </div>

      {/* ── Observation Sidebar ── */}
      <AnimatePresence>
        {isSidebarOpen && selectedStudent && (
          <ObservationSidebar
            mode={
              isCorrectionMode
                ? "correction"
                : isMissingObsMode
                  ? "compliance"
                  : "behavioral"
            }
            student={{
              id: selectedStudent.id,
              name: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
              index: selectedStudent.indexNumber,
              grade: selectedRow?.grade ?? "",
              auditStatus: selectedRow?.hasObservation ? "COMPLETE" : "MISSING",
              // Pass enough for sidebar to work
              secA: 0,
              secB: 0,
              secC: 0,
              sba: selectedRow?.classScore ?? 0,
              exam: selectedRow?.examScore ?? 0,
              final: selectedRow?.totalScore ?? 0,
            }}
            onClose={() => setIsSidebarOpen(false)}
            ratings={observationRatings}
            onRatingChange={(id, num) =>
              setObservationRatings((prev) => ({ ...prev, [id]: num }))
            }
            comment={observationComment}
            onCommentChange={setObservationComment}
            onSave={handleSaveObservation}
            hodFeedback={{
              teacherName: user?.name ?? "Teacher",
              message: "Review and confirm all scores before submission.",
              timeAgo: "Now",
            }}
            teacherReply={teacherReply}
            onReplyChange={setTeacherReply}
            onSecondaryAction={() => navigate("/revisions")}
          />
        )}
      </AnimatePresence>

      {/* ── STP Validation Overlay ── */}
      <AnimatePresence>
        {showSTPOverlay && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSTPOverlay(false)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <Zap size={28} />
                  </div>
                  <button
                    onClick={() => setShowSTPOverlay(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  STP Validation Scan
                </h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">
                  Scanning mark sheet for compliance and data integrity.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    {
                      label: "Score Range Validation (30/70)",
                      pass: !stpErrors.some((e) => e.includes("score")),
                    },
                    {
                      label: "Mandatory Observations",
                      pass: !stpErrors.includes(
                        "Missing behavioral observations",
                      ),
                    },
                    { label: "Term Lock Status", pass: !isTermFinalized },
                    { label: "Active Term Loaded", pass: !!activeTerm },
                  ].map((check, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <span className="text-sm font-bold text-gray-700">
                        {check.label}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest",
                          check.pass
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700 animate-pulse",
                        )}
                      >
                        {check.pass ? "PASS" : "FAIL"}
                      </span>
                    </div>
                  ))}
                </div>
                {stpErrors.length > 0 ? (
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">
                    <p className="text-xs font-black text-red-900 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <AlertCircle size={14} /> Critical Errors
                    </p>
                    {stpErrors.map((e, i) => (
                      <p key={i} className="text-xs font-bold text-red-700">
                        • {e}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6">
                    <p className="text-xs font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 size={14} /> All Protocols Verified
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setShowSTPOverlay(false)}
                  className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-sm"
                >
                  Close Validator
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Audit Toast ── */}
      <AnimatePresence>
        {showAuditToast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50"
          >
            <ShieldCheck size={20} />
            <div>
              <p className="font-black text-sm">All Observations Logged</p>
              <p className="text-xs font-bold text-emerald-100">
                Submission unlocked.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
