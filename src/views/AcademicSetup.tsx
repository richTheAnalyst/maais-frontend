import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  X,
  ChevronRight,
  Loader2,
  UserCheck,
  Search,
  AlertCircle,
  ShieldCheck,
  Layers,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { cn } from "../lib/utils";
import api from "../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  subjectCount: number;
  headmasterCount: number;
  hodCount: number;
  teacherCount: number;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  type: "CORE" | "ELECTIVE";
}

interface ClassSection {
  id: string;
  name: string;
  level: string;
  capacity: number;
  classTeacher?: { id: string; firstName: string; lastName: string };
  _count?: { students: number };
}

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  staffId: string;
  user: { id: string; email: string; role: string };
  teachingAssignments?: any[];
}

interface DepartmentRoster {
  department: {
    id: string;
    name: string;
    code: string;
    description?: string;
    subjects: Subject[];
  };
  headmasters: StaffMember[];
  hods: StaffMember[];
  teachers: StaffMember[];
}

//Assign subjectto teacher modal

const AssignSubjectToTeacherModal: React.FC<{
  department: Department;
  roster: DepartmentRoster;
  allClasses: ClassSection[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ department, roster, allClasses, onClose, onSuccess }) => {
  const [teacherId, setTeacherId] = React.useState("");
  const [subjectId, setSubjectId] = React.useState(
    roster.department.subjects[0]?.id ?? "",
  );
  const [classId, setClassId] = React.useState(allClasses[0]?.id ?? "");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const eligibleStaff = [
    ...roster.hods,
    ...roster.teachers,
    ...roster.headmasters,
  ];

  const handleSubmit = async () => {
    if (!teacherId || !subjectId || !classId) {
      setError("All fields are required");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const yearRes = await api.get("/academic/years/active");
      if (!yearRes.data?.id) {
        setError("No active academic year found. Set one up first.");
        return;
      }
      await api.post("/academic/assignments", {
        teacherId,
        subjectId,
        classSectionId: classId,
        academicYearId: yearRes.data.id,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create assignment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
      >
        <h3 className="text-lg font-black text-slate-900 mb-1">
          Assign Subject to Teacher
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          Subjects shown are from{" "}
          <span className="font-bold text-slate-600">{department.name}</span>{" "}
          department only
        </p>

        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Teacher picker */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Staff Member *
            </label>
            {eligibleStaff.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-700">
                No staff assigned to this department yet. Assign staff first.
              </div>
            ) : (
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              >
                <option value="">Select staff member...</option>
                {eligibleStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.user.role.replace("_", " ")})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Subject picker — only dept subjects */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Subject *
            </label>
            {roster.department.subjects.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-700">
                No subjects in this department yet. Add subjects first.
              </div>
            ) : (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              >
                {roster.department.subjects.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Class picker — all classes */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Class Section *
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            >
              {allClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.level.replace("FORM_", "Form ")} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              eligibleStaff.length === 0 ||
              roster.department.subjects.length === 0
            }
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Assign
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Create Department Modal ───────────────────────────────────────────────────

const CreateDepartmentModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [form, setForm] = React.useState({
    name: "",
    code: "",
    description: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/academic/departments", form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create department");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
      >
        <h3 className="text-lg font-black text-slate-900 mb-6">
          New Department
        </h3>
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Science"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Code *
            </label>
            <input
              required
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g. SCI"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Create Subject Modal ───────────────────────────────────────────────────────

const CreateSubjectModal: React.FC<{
  departmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ departmentId, onClose, onSuccess }) => {
  const [form, setForm] = React.useState({
    name: "",
    code: "",
    type: "CORE" as "CORE" | "ELECTIVE",
    description: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/academic/subjects", { ...form, departmentId });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create subject");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
      >
        <h3 className="text-lg font-black text-slate-900 mb-6">
          New Subject / Course
        </h3>
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Subject Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Elective Physics"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Code *
            </label>
            <input
              required
              value={form.code}
              onChange={(e) =>
                setForm({ ...form, code: e.target.value.toUpperCase() })
              }
              placeholder="e.g. PHY201"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Type *
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(["CORE", "ELECTIVE"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                    form.type === t
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Create Class Modal ─────────────────────────────────────────────────────────

const CreateClassModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [form, setForm] = React.useState({
    name: "",
    level: "FORM_1",
    capacity: 40,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/academic/classes", form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create class");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
      >
        <h3 className="text-lg font-black text-slate-900 mb-6">
          New Class Section
        </h3>
        {error && (
          <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl text-sm mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Class Name *
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 1A, 2B, 3Science"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Form Level *
            </label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            >
              <option value="FORM_1">Form 1 (SHS 1)</option>
              <option value="FORM_2">Form 2 (SHS 2)</option>
              <option value="FORM_3">Form 3 (SHS 3)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
              Capacity
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={form.capacity}
              onChange={(e) =>
                setForm({ ...form, capacity: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Plus size={14} />
              )}{" "}
              Create
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Assign Staff Modal (HOD or Teacher or headmaster) ─────────────────────────

const AssignStaffModal: React.FC<{
  department: Department;
  allStaff: StaffMember[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ department, allStaff, onClose, onSuccess }) => {
  const [staffId, setStaffId] = React.useState("");
  const [role, setRole] = React.useState<"HOD" | "TEACHER" | "HEADMASTER">(
    "TEACHER",
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");

  const filteredStaff = allStaff.filter(
    (s) =>
      `${s.firstName} ${s.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      s.staffId.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSubmit = async () => {
    if (!staffId) return;
    setIsLoading(true);
    setError(null);
    try {
      const selectedStaff = allStaff.find((s) => s.id === staffId)!;
      // Update department
      await api.patch(`/academic/staff/${staffId}/department`, {
        departmentId: department.id,
      });
      // Update role if it differs
      if (selectedStaff.user.role !== role) {
        await api.patch(`/academic/staff/${selectedStaff.user.id}/role`, {
          role,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign staff");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 shrink-0">
          <h3 className="text-lg font-black text-slate-900">
            Assign to {department.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select staff and their role in this department
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Assign as
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {(["TEACHER", "HOD", "HEADMASTER"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all",
                    role === r
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-400",
                  )}
                >
                  {r === "HOD"
                    ? "HOD"
                    : r === "HEADMASTER"
                      ? "Headmaster"
                      : "Teacher"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
              Search Staff
            </label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or staff ID..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {filteredStaff.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No staff found
              </p>
            ) : (
              filteredStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStaffId(s.id)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                    staffId === s.id
                      ? "bg-emerald-50 border-emerald-300"
                      : "bg-white border-slate-100 hover:bg-slate-50",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 text-xs font-bold uppercase">
                      {s.firstName[0]}
                      {s.lastName[0]}
                    </div>
                    <div>
                      <p className="text-[13px] font-black text-slate-900">
                        {s.firstName} {s.lastName}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        {s.staffId} · {s.user.role}
                      </p>
                    </div>
                  </div>
                  {staffId === s.id && (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !staffId}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <UserCheck size={14} />
            )}{" "}
            Assign
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AcademicSetup() {
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [classes, setClasses] = React.useState<ClassSection[]>([]);
  const [allStaff, setAllStaff] = React.useState<StaffMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"departments" | "classes">(
    "departments",
  );

  const [selectedDept, setSelectedDept] = React.useState<Department | null>(
    null,
  );
  const [roster, setRoster] = React.useState<DepartmentRoster | null>(null);
  const [isLoadingRoster, setIsLoadingRoster] = React.useState(false);

  const [showCreateDept, setShowCreateDept] = React.useState(false);
  const [showCreateSubject, setShowCreateSubject] = React.useState(false);
  const [showCreateClass, setShowCreateClass] = React.useState(false);
  const [showAssignStaff, setShowAssignStaff] = React.useState(false);
  const [showAssignSubjectToTeacher, setShowAssignSubjectToTeacher] =
    React.useState(false);
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };
  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [deptRes, classRes, staffRes] = await Promise.all([
        api.get("/academic/departments/overview"),
        api.get("/academic/classes"),
        api.get("/users/staff"),
      ]);
      setDepartments(deptRes.data);
      setClasses(classRes.data);
      setAllStaff(staffRes.data);
    } catch (err) {
      console.error("Failed to load academic setup", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openDeptDetail = React.useCallback(async (dept: Department) => {
    setSelectedDept(dept);
    setIsLoadingRoster(true);
    try {
      const res = await api.get(`/academic/departments/${dept.id}/roster`);
      setRoster(res.data);
    } catch {
      setRoster(null);
    } finally {
      setIsLoadingRoster(false);
    }
  }, []);

  const refreshRoster = React.useCallback(async () => {
    if (selectedDept) {
      await openDeptDetail(selectedDept);
    }
    await fetchData();
  }, [selectedDept, openDeptDetail, fetchData]);

  const handleAssignClassTeacher = async (classId: string, staffId: string) => {
    try {
      await api.patch(`/academic/classes/${classId}/teacher`, { staffId });
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to assign class teacher");
    }
  };

  // ─── Delete handlers ────────────────────────────────────────────────────────

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/academic/departments/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete department");
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await api.delete(`/academic/classes/${id}`);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete class");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm("Delete this subject?")) return;
    try {
      await api.delete(`/academic/subjects/${id}`);
      await refreshRoster();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete subject");
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <Loader2 size={40} className="text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight">
              Academic Setup
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Create courses, departments, classes — assign HODs and teachers
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "departments" && (
              <button
                onClick={() => setShowCreateDept(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <Building2 size={16} /> New Department
              </button>
            )}
            {activeTab === "classes" && (
              <button
                onClick={() => setShowCreateClass(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                <Layers size={16} /> New Class
              </button>
            )}
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          {[
            {
              id: "departments",
              label: "Departments & Courses",
              icon: Building2,
            },
            { id: "classes", label: "Class Sections", icon: Layers },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                activeTab === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400",
              )}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
        {/* ── DEPARTMENTS TAB ── */}
        {activeTab === "departments" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border-2 border-dashed border-slate-200 p-16 text-center">
                <Building2 size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 mb-4">
                  No departments yet
                </p>
                <button
                  onClick={() => setShowCreateDept(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mx-auto"
                >
                  Create First Department
                </button>
              </div>
            ) : (
              departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => openDeptDetail(dept)}
                  className="relative bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left group"
                >
                  {/* ✨ Delete button – appears on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDepartment(dept.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                    title="Delete department"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Building2 size={22} />
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      {dept.code}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">
                    {dept.name}
                  </h3>

                  {dept.description && (
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-slate-300" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {dept.subjectCount} subjects
                      </span>
                    </div>
                    {dept.headmasterCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={12} className="text-purple-400" />
                        <span className="text-[11px] font-bold text-slate-500">
                          {dept.headmasterCount} headmaster
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck size={12} className="text-amber-400" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {dept.hodCount} HOD
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-blue-400" />
                      <span className="text-[11px] font-bold text-slate-500">
                        {dept.teacherCount} teachers
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* ── CLASSES TAB ── */}
        {activeTab === "classes" && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Class
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Level
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Students
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Class Teacher
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-black text-slate-900">
                      {cls.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-600 uppercase">
                        {cls.level.replace("FORM_", "Form ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-600">
                      {cls._count?.students ?? 0} / {cls.capacity}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={cls.classTeacher?.id ?? ""}
                        onChange={(e) =>
                          handleAssignClassTeacher(cls.id, e.target.value)
                        }
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                      >
                        <option value="">Unassigned</option>
                        {allStaff
                          .filter(
                            (s) =>
                              s.user.role === "TEACHER" ||
                              s.user.role === "HOD",
                          )
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.firstName} {s.lastName}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* ✨ Delete button */}
                        <button
                          onClick={() => handleDeleteClass(cls.id)}
                          className="p-2 rounded-xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
                          title="Delete class"
                        >
                          <Trash2 size={16} />
                        </button>
                        <ChevronRight size={16} className="text-slate-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {classes.length === 0 && (
              <div className="p-16 text-center">
                <Layers size={40} className="text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400">
                  No class sections yet
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Department Detail Drawer */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedDept(null);
                setRoster(null);
              }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-slate-900 text-white shrink-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                      {selectedDept.code}
                    </p>
                    <h3 className="text-2xl font-black">{selectedDept.name}</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedDept(null);
                      setRoster(null);
                    }}
                    className="p-2 hover:bg-white/10 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {isLoadingRoster ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2
                    size={32}
                    className="text-emerald-600 animate-spin"
                  />
                </div>
              ) : roster ? (
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Subjects */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                        Courses / Subjects
                      </h4>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShowAssignSubjectToTeacher(true)}
                          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                        >
                          + Assign to Teacher
                        </button>
                        <button
                          onClick={() => setShowCreateSubject(true)}
                          className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                        >
                          + Add Subject
                        </button>
                      </div>
                    </div>
                    {roster.department.subjects.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">
                        No subjects yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {roster.department.subjects.map((s: any) => (
                          <div
                            key={s.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl group"
                          >
                            <span className="text-sm font-bold text-slate-900">
                              {s.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "text-[9px] font-black px-2 py-1 rounded-md uppercase",
                                  s.type === "CORE"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-indigo-100 text-indigo-700",
                                )}
                              >
                                {s.type}
                              </span>
                              {/* ✨ Delete subject button */}
                              <button
                                onClick={() => handleDeleteSubject(s.id)}
                                className="p-1.5 rounded-lg text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all opacity-0 group-hover:opacity-100"
                                title="Delete subject"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                  {/* Current teaching assignments */}
                  {roster.teachers.length > 0 || roster.hods.length > 0 ? (
                    <section>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                          Subject Assignments
                        </h4>
                      </div>
                      <div className="space-y-2">
                        {[...roster.hods, ...roster.teachers].flatMap(
                          (staffMember) =>
                            (staffMember.teachingAssignments ?? [])
                              .filter((a: any) =>
                                roster.department.subjects.some(
                                  (s: any) => s.id === a.subject?.id,
                                ),
                              )
                              .map((a: any) => (
                                <div
                                  key={a.id}
                                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                                >
                                  <div>
                                    <p className="text-[12px] font-black text-slate-900">
                                      {a.subject?.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">
                                      {staffMember.firstName}{" "}
                                      {staffMember.lastName} ·{" "}
                                      {a.classSection?.level?.replace(
                                        "FORM_",
                                        "Form ",
                                      )}{" "}
                                      {a.classSection?.name}
                                    </p>
                                  </div>
                                  <button
                                    onClick={async () => {
                                      if (
                                        !window.confirm(
                                          "Remove this assignment?",
                                        )
                                      )
                                        return;
                                      try {
                                        await api.delete(
                                          `/academic/assignments/${a.id}`,
                                        );
                                        showToast("Assignment removed");
                                        await refreshRoster();
                                      } catch (err: any) {
                                        alert(
                                          err.response?.data?.message ||
                                            "Failed to remove",
                                        );
                                      }
                                    }}
                                    className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              )),
                        )}
                        {[...roster.hods, ...roster.teachers].flatMap(
                          (s) => s.teachingAssignments ?? [],
                        ).length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4 bg-slate-50 rounded-2xl">
                            No subject assignments yet in this department
                          </p>
                        )}
                      </div>
                    </section>
                  ) : null}

                  {/* Headmasters */}
                  {roster.headmasters.length > 0 && (
                    <section>
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
                        Headmaster / Admin
                      </h4>
                      <div className="space-y-2">
                        {roster.headmasters.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl"
                          >
                            <div className="w-9 h-9 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xs font-black">
                              {h.firstName[0]}
                              {h.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {h.firstName} {h.lastName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                {h.staffId} · {h.user.role.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* HODs */}
                  <section>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                        Heads of Department
                      </h4>
                      <button
                        onClick={() => setShowAssignStaff(true)}
                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline"
                      >
                        + Assign Staff
                      </button>
                    </div>
                    {roster.hods.length === 0 ? (
                      <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-amber-500" />
                        <p className="text-xs font-bold text-amber-700">
                          No HOD assigned to this department yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {roster.hods.map((h) => (
                          <div
                            key={h.id}
                            className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl"
                          >
                            <div className="w-9 h-9 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xs font-black">
                              {h.firstName[0]}
                              {h.lastName[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                {h.firstName} {h.lastName}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                {h.staffId}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Teachers */}
                  <section>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-4">
                      Teachers ({roster.teachers.length})
                    </h4>
                    {roster.teachers.length === 0 ? (
                      <p className="text-sm text-slate-400 text-center py-6 bg-slate-50 rounded-2xl">
                        No teachers assigned yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {roster.teachers.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between p-3 bg-slate-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs font-black">
                                {t.firstName[0]}
                                {t.lastName[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900">
                                  {t.firstName} {t.lastName}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  {t.staffId}
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">
                              {t.teachingAssignments?.length ?? 0} classes
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-[400] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-bold">{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assign Subject to Teacher modal */}
      <AnimatePresence>
        {showAssignSubjectToTeacher && selectedDept && roster && (
          <AssignSubjectToTeacherModal
            department={selectedDept}
            roster={roster}
            allClasses={classes}
            onClose={() => setShowAssignSubjectToTeacher(false)}
            onSuccess={() => {
              showToast("Subject assigned successfully");
              refreshRoster();
            }}
          />
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showCreateDept && (
          <CreateDepartmentModal
            onClose={() => setShowCreateDept(false)}
            onSuccess={fetchData}
          />
        )}
        {showCreateSubject && selectedDept && (
          <CreateSubjectModal
            departmentId={selectedDept.id}
            onClose={() => setShowCreateSubject(false)}
            onSuccess={refreshRoster}
          />
        )}
        {showCreateClass && (
          <CreateClassModal
            onClose={() => setShowCreateClass(false)}
            onSuccess={fetchData}
          />
        )}
        {showAssignStaff && selectedDept && (
          <AssignStaffModal
            department={selectedDept}
            allStaff={allStaff}
            onClose={() => setShowAssignStaff(false)}
            onSuccess={refreshRoster}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
