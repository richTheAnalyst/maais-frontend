import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  LayoutGrid,
  List,
  Timer,
  AlertTriangle,
  Plus,
  X,
  Loader2,
  RefreshCw,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Settings2,
  Edit3,
  CheckCircle2,
  Printer,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { printTimetable } from '../lib/timetable';
import { cn } from "../lib/utils";
import { useRole } from "../context/RoleContext";
import api from "../lib/api";

type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY";

interface TimetableEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string;
  classSection: { id: string; name: string; level: string };
  subject: {
    id: string;
    name: string;
    code: string;
    department?: { name: string };
  };
  teacher: { id: string; firstName: string; lastName: string };
}

interface ClassSection {
  id: string;
  name: string;
  level: string;
}
interface Subject {
  id: string;
  name: string;
  code: string;
}
interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  staffId: string;
}
export interface SchoolSettings {
  id: string;
  clashDetectionEnabled: boolean;
  departmentColorsEnabled: boolean;
}

const DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];
const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
};
const HOURS = Array.from({ length: 11 }, (_, i) => i + 7);

const TYPE_COLORS: Record<string, string> = {
  Science: "bg-emerald-50 border-emerald-200 text-emerald-800",
  Business: "bg-blue-50 border-blue-200 text-blue-800",
  Mathematics: "bg-purple-50 border-purple-200 text-purple-800",
  default: "bg-white border-slate-200 text-slate-800",
};

// ─── Entry Form (shared by Add and Edit) ─────────────────────────────────────

const EntryForm: React.FC<{
  initial: {
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string;
  };
  classes: ClassSection[];
  subjects: Subject[];
  teachers: StaffMember[];
  onSubmit: (form: any) => Promise<void>;
  onClose: () => void;
  title: string;
  submitLabel: string;
}> = ({
  initial,
  classes,
  subjects,
  teachers,
  onSubmit,
  onClose,
  title,
  submitLabel,
}) => {
  const [form, setForm] = React.useState(initial);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.classId || !form.subjectId || !form.teacherId) {
      setError("Class, subject, and teacher are required");
      return;
    }
    if (form.startTime >= form.endTime) {
      setError("End time must be after start time");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-black text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle size={14} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                Class *
              </label>
              <select
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.level.replace("FORM_", "Form ")} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                Subject *
              </label>
              <select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                Teacher *
              </label>
              <select
                value={form.teacherId}
                onChange={(e) =>
                  setForm({ ...form, teacherId: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.staffId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                Day *
              </label>
              <select
                value={form.dayOfWeek}
                onChange={(e) =>
                  setForm({ ...form, dayOfWeek: e.target.value as DayOfWeek })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {DAY_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                Room
              </label>
              <input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="e.g. Room 4, Science Lab"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                Start Time *
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">
                End Time *
              </label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-50 rounded-xl text-sm font-black uppercase tracking-widest"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={isLoading}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <CheckCircle2 size={14} />
            )}
            {submitLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Settings Modal ───────────────────────────────────────────────────────────

const SettingsModal: React.FC<{
  settings: SchoolSettings;
  onClose: () => void;
  onToggle: (key: "clashDetectionEnabled" | "departmentColorsEnabled") => void;
  isSaving: boolean;
}> = ({ settings, onClose, onToggle, isSaving }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
    <div
      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      onClick={onClose}
    />
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-slate-900">
          Timetable Settings
        </h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
          <X size={20} />
        </button>
      </div>
      <div className="space-y-4">
        {[
          {
            key: "clashDetectionEnabled" as const,
            label: "Clash Detection",
            sub: "Highlight overlapping teacher schedules",
          },
          {
            key: "departmentColorsEnabled" as const,
            label: "Department Colors",
            sub: "Color-code sessions by department",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100"
          >
            <div className="pr-4">
              <p className="text-sm font-bold text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{item.sub}</p>
            </div>
            <button
              onClick={() => onToggle(item.key)}
              disabled={isSaving}
              className={cn(
                "w-12 h-7 rounded-full relative transition-colors shrink-0",
                settings[item.key] ? "bg-emerald-600" : "bg-slate-200",
              )}
            >
              <motion.div
                className="w-5 h-5 bg-white rounded-full absolute top-1 shadow-sm"
                animate={{ left: settings[item.key] ? "26px" : "4px" }}
              />
            </button>
          </div>
        ))}
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6 text-center">
        Applies school-wide for all users
      </p>
    </motion.div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export function Timetable() {
  const { user } = useRole();
  const navigate = useNavigate();

  const [entries, setEntries] = React.useState<TimetableEntry[]>([]);
  const [classes, setClasses] = React.useState<ClassSection[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [teachers, setTeachers] = React.useState<StaffMember[]>([]);
  const [settings, setSettings] = React.useState<SchoolSettings | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [clashes, setClashes] = React.useState<any[]>([]);
  const [toast, setToast] = React.useState<string | null>(null);

  const [view, setView] = React.useState<"daily" | "weekly">("weekly");
  const [selectedDay, setSelectedDay] = React.useState<DayOfWeek>("MONDAY");
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<TimetableEntry | null>(
    null,
  );
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const [isSavingSettings, setIsSavingSettings] = React.useState(false);
  const [selectedEntry, setSelectedEntry] =
    React.useState<TimetableEntry | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Teachers see only their schedule; everyone else sees all
      const isTeacher = user?.role === "TEACHER";
      const entriesUrl =
        isTeacher && user?.staffProfileId
          ? `/timetable/teacher/${user.staffProfileId}`
          : "/timetable";

      const [entriesRes, classesRes, subjectsRes, staffRes, settingsRes] =
        await Promise.all([
          api.get(entriesUrl),
          api.get("/academic/classes"),
          api.get("/academic/subjects"),
          api.get("/users/staff"),
          api.get("/settings"),
        ]);

      setEntries(entriesRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setSettings(settingsRes.data);

      // Map staffProfile id correctly for timetable teacher field
      setTeachers(
        staffRes.data.map((s: any) => ({
          id: s.id, // staffProfile.id — what timetable.teacherId references
          firstName: s.firstName,
          lastName: s.lastName,
          staffId: s.staffId,
        })),
      );

      // Clash detection — use staffProfileId for teachers, fetch all for admins/HODs
      if (settingsRes.data.clashDetectionEnabled) {
        try {
          if (user?.staffProfileId) {
            const clashRes = await api.get(
              `/timetable/clashes/${user.staffProfileId}`,
            );
            setClashes(clashRes.data);
          } else {
            // Admin: aggregate clashes across all teachers
            const allClashes: any[] = [];
            const uniqueTeacherIds = [
              ...new Set(entriesRes.data.map((e: any) => e.teacherId)),
            ];
            await Promise.allSettled(
              uniqueTeacherIds.map(async (tid: any) => {
                const res = await api.get(`/timetable/clashes/${tid}`);
                allClashes.push(...res.data);
              }),
            );
            // Deduplicate by pair
            const seen = new Set<string>();
            const deduped = allClashes.filter((c) => {
              const key = [c.a.id, c.b.id].sort().join("|");
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
            setClashes(deduped);
          }
        } catch {
          setClashes([]);
        }
      } else {
        setClashes([]);
      }
    } catch (err) {
      console.error("Failed to load timetable", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  //print timetable handler
const handlePrint = () => {
  printTimetable({
    entries,
    clashes,
    settings,
    activeTerm: null,
    userName: user?.name,
    userRole: user?.role,
  });
};

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  const handleToggleSetting = async (
    key: "clashDetectionEnabled" | "departmentColorsEnabled",
  ) => {
    if (!settings) return;
    setIsSavingSettings(true);
    try {
      const res = await api.patch("/settings", { [key]: !settings[key] });
      setSettings(res.data);
      if (key === "clashDetectionEnabled") {
        if (!res.data.clashDetectionEnabled) setClashes([]);
        else await fetchData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  const getTimePercent = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return (((h - 7) * 60 + m) / (11 * 60)) * 100;
  };
  const getCurrentDay = (): DayOfWeek | null => {
    const idx = currentTime.getDay();
    return idx >= 1 && idx <= 5 ? DAYS[idx - 1] : null;
  };

  const currentDay = getCurrentDay();
  const nowStr = formatTime(currentTime);

  const currentEntry = entries.find(
    (e) =>
      e.dayOfWeek === currentDay &&
      nowStr >= e.startTime &&
      nowStr <= e.endTime,
  );
  const nextEntry = entries
    .filter((e) => e.dayOfWeek === currentDay && e.startTime > nowStr)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))[0];

  const canManage =
    user?.role === "ADMIN" ||
    user?.role === "HOD" ||
    user?.role === "SUPER_ADMIN" ||
    user?.role === "HEADMASTER";
  const entryColor = (entry: TimetableEntry) => {
    if (!settings?.departmentColorsEnabled)
      return "bg-white border-slate-200 text-slate-800";
    const dept = entry.subject?.department?.name ?? "default";
    return TYPE_COLORS[dept] ?? TYPE_COLORS.default;
  };

  const isEntryClashing = (entryId: string) =>
    settings?.clashDetectionEnabled
      ? clashes.some((c) => c.a.id === entryId || c.b.id === entryId)
      : false;

  const handleAdd = async (form: any) => {
    await api.post("/timetable", form);
    showToast("Session added successfully");
    setShowAddModal(false);
    await fetchData();
  };

  const handleEdit = async (form: any) => {
    if (!editingEntry) return;
    await api.put(`/timetable/${editingEntry.id}`, form);
    showToast("Session updated successfully");
    setEditingEntry(null);
    setSelectedEntry(null);
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this timetable entry?")) return;
    await api.delete(`/timetable/${id}`);
    showToast("Session deleted");
    setSelectedEntry(null);
    await fetchData();
  };

  const emptyForm = {
    classId: classes[0]?.id ?? "",
    subjectId: subjects[0]?.id ?? "",
    teacherId: teachers[0]?.id ?? "",
    dayOfWeek: "MONDAY" as DayOfWeek,
    startTime: "08:00",
    endTime: "09:30",
    room: "",
  };



  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#F0F4F2]">
        <div className="text-center">
          <Loader2
            size={40}
            className="text-emerald-600 animate-spin mx-auto mb-4"
          />
          <p className="text-sm font-bold text-slate-400">
            Loading timetable...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#F0F4F2] overflow-hidden">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-[300] bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-bold">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-8 pt-8 pb-6 bg-white border-b border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <Calendar size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900 tracking-tight">
                Academic Schedule
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {entries.length} sessions
                  {settings?.clashDetectionEnabled && clashes.length > 0 && (
                    <span className="text-rose-500">
                      {" "}
                      · {clashes.length} clash{clashes.length > 1 ? "es" : ""}
                    </span>
                  )}
                  {settings?.clashDetectionEnabled &&
                    clashes.length === 0 &&
                    " · No clashes"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
            >
              <RefreshCw size={16} />
            </button>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {[
                { id: "daily", icon: List, label: "Daily" },
                { id: "weekly", icon: LayoutGrid, label: "Weekly" },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setView(v.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all",
                    view === v.id
                      ? "bg-white text-emerald-800 shadow-sm"
                      : "text-gray-500",
                  )}
                >
                  <v.icon size={15} /> {v.label}
                </button>
              ))}
            </div>
            <button
  onClick={handlePrint}
  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
  title="Print timetable"
>
  <Printer size={16} />
</button>
            {canManage && (
              <>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
                  title="Timetable settings"
                >
                  <Settings2 size={16} />
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
                >
                  <Plus size={16} /> Add Session
                </button>
              </>
            )}
          </div>
        </div>

        {/* Now & Next */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className={cn(
              "p-4 rounded-2xl border-2 flex items-center justify-between transition-all",
              currentEntry
                ? "bg-emerald-50 border-emerald-200"
                : "bg-gray-50 border-gray-200",
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  currentEntry
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-200 text-gray-400",
                )}
              >
                <Timer size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                  Live Period
                </p>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {currentEntry
                    ? `${currentEntry.subject.name} · ${currentEntry.classSection.name}`
                    : "No Active Session"}
                </h3>
                {currentEntry?.room && (
                  <p className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                    <MapPin size={9} /> {currentEntry.room}
                  </p>
                )}
              </div>
            </div>
            {currentEntry && (
              <button
                onClick={() => navigate("/grading")}
                className="px-3 py-2 bg-emerald-800 text-white rounded-xl font-black text-[10px] hover:bg-emerald-900 transition-all flex items-center gap-1.5"
              >
                Open Sheet <ArrowRight size={12} />
              </button>
            )}
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                  Up Next
                </p>
                <h3 className="text-sm font-black text-gray-900 leading-tight">
                  {nextEntry
                    ? `${nextEntry.subject.name} · ${nextEntry.classSection.name}`
                    : "End of Day"}
                </h3>
                {nextEntry && (
                  <p className="text-[10px] font-bold text-gray-500 mt-0.5">
                    Starts at {nextEntry.startTime}
                  </p>
                )}
              </div>
            </div>
            {settings?.clashDetectionEnabled && clashes.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl">
                <AlertTriangle size={12} className="text-rose-500" />
                <span className="text-[9px] font-black text-rose-600 uppercase">
                  {clashes.length} Clash{clashes.length > 1 ? "es" : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {/* ── WEEKLY VIEW ── */}
        {view === "weekly" && (
          <div className="h-full overflow-auto p-6">
            <div className="min-w-[900px]">
              <div className="flex mb-2 ml-16">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className={cn(
                      "flex-1 text-center py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                      day === currentDay
                        ? "bg-emerald-100 text-emerald-800"
                        : "text-slate-400",
                    )}
                  >
                    {DAY_LABELS[day]}
                  </div>
                ))}
              </div>

              <div
                className="flex"
                style={{ height: `${HOURS.length * 64}px` }}
              >
                <div className="w-16 shrink-0 relative">
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      className="absolute left-0 right-0 flex items-start"
                      style={{
                        top: `${((h - 7) / HOURS.length) * 100}%`,
                        height: `${100 / HOURS.length}%`,
                      }}
                    >
                      <span className="text-[10px] font-black text-slate-400 leading-none">
                        {h.toString().padStart(2, "0")}:00
                      </span>
                    </div>
                  ))}
                </div>

                {DAYS.map((day) => {
                  const dayEntries = entries.filter((e) => e.dayOfWeek === day);
                  return (
                    <div
                      key={day}
                      className={cn(
                        "flex-1 relative border-l border-slate-100",
                        day === currentDay && "bg-emerald-50/30",
                      )}
                    >
                      {HOURS.map((h) => (
                        <div
                          key={h}
                          className="absolute left-0 right-0 border-t border-slate-100"
                          style={{ top: `${((h - 7) / HOURS.length) * 100}%` }}
                        />
                      ))}

                      {day === currentDay && (
                        <div
                          className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                          style={{ top: `${getTimePercent(nowStr)}%` }}
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full -ml-1 shrink-0" />
                          <div className="flex-1 border-t-2 border-red-500" />
                        </div>
                      )}

                      {dayEntries.map((entry) => {
                        const top = getTimePercent(entry.startTime);
                        const height = getTimePercent(entry.endTime) - top;
                        const isClash = isEntryClashing(entry.id);
                        const isHovered = hoveredId === entry.id;

                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onMouseEnter={() => setHoveredId(entry.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => setSelectedEntry(entry)}
                            className={cn(
                              "absolute left-1 right-1 rounded-xl p-2 border cursor-pointer overflow-hidden transition-all z-10",
                              entryColor(entry),
                              isClash && "ring-2 ring-red-400 border-red-300",
                              isHovered && "z-30 shadow-xl",
                            )}
                            style={{
                              top: `${top}%`,
                              height: isHovered
                                ? "auto"
                                : `${Math.max(height, 4)}%`,
                              minHeight: "44px",
                            }}
                          >
                            <div className="flex items-start justify-between gap-1 mb-0.5">
                              <span className="text-[9px] font-black uppercase tracking-widest truncate">
                                {entry.subject.code}
                              </span>
                              {isClash && (
                                <AlertTriangle
                                  size={9}
                                  className="text-red-500 shrink-0"
                                />
                              )}
                            </div>
                            <p className="text-[11px] font-black leading-tight truncate">
                              {entry.subject.name}
                            </p>
                            <p className="text-[9px] font-bold opacity-70 truncate">
                              {entry.classSection.level.replace("FORM_", "F")}{" "}
                              {entry.classSection.name}
                            </p>
                            {entry.room && (
                              <p className="text-[9px] font-bold opacity-60 flex items-center gap-0.5 mt-0.5">
                                <MapPin size={7} /> {entry.room}
                              </p>
                            )}
                            {isHovered && canManage && (
                              <div className="mt-2 pt-2 border-t border-current/20">
                                <p className="text-[9px] font-black opacity-60">
                                  {entry.startTime} – {entry.endTime}
                                </p>
                                <p className="text-[9px] font-black opacity-60">
                                  {entry.teacher.firstName}{" "}
                                  {entry.teacher.lastName}
                                </p>
                                <div className="flex gap-1 mt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingEntry(entry);
                                    }}
                                    className="flex-1 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg flex items-center justify-center gap-1"
                                  >
                                    <Edit3 size={9} /> Edit
                                  </button>
                                  <button
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      await handleDelete(entry.id);
                                    }}
                                    className="px-2 py-1 bg-rose-100 text-rose-600 text-[9px] font-black rounded-lg"
                                  >
                                    Del
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── DAILY VIEW ── */}
        {view === "daily" && (
          <div className="h-full flex flex-col overflow-hidden">
            <div className="flex gap-2 px-8 pt-6 pb-4 shrink-0 overflow-x-auto">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "px-5 py-2.5 rounded-2xl text-sm font-black transition-all whitespace-nowrap flex items-center gap-2",
                    selectedDay === day
                      ? "bg-emerald-800 text-white shadow-lg"
                      : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100",
                  )}
                >
                  {DAY_LABELS[day]}
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-full font-black",
                      selectedDay === day
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {entries.filter((e) => e.dayOfWeek === day).length}
                  </span>
                  {day === currentDay && (
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8">
              <div className="max-w-3xl space-y-3">
                {entries
                  .filter((e) => e.dayOfWeek === selectedDay)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((entry) => {
                    const isActive =
                      selectedDay === currentDay &&
                      nowStr >= entry.startTime &&
                      nowStr <= entry.endTime;
                    const isClash = isEntryClashing(entry.id);

                    return (
                      <motion.div
                        key={entry.id}
                        layout
                        className={cn(
                          "bg-white rounded-2xl border p-5 cursor-pointer transition-all shadow-sm group",
                          isActive
                            ? "border-emerald-400 ring-2 ring-emerald-100"
                            : "border-gray-200 hover:border-emerald-200",
                          isClash && "border-red-300 bg-red-50/30",
                        )}
                        onClick={() => setSelectedEntry(entry)}
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-20 shrink-0 text-center border-r border-gray-100 pr-5">
                            <p className="text-base font-black text-gray-900">
                              {entry.startTime}
                            </p>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">
                              {entry.endTime}
                            </p>
                            {isActive && (
                              <div className="mt-1 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mx-auto" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-base font-black text-gray-900 truncate">
                                {entry.subject.name}
                              </h4>
                              {isActive && (
                                <span className="shrink-0 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[9px] font-black rounded-full uppercase">
                                  Live
                                </span>
                              )}
                              {isClash && (
                                <span className="shrink-0 px-2 py-0.5 bg-rose-100 text-rose-600 text-[9px] font-black rounded-full uppercase flex items-center gap-1">
                                  <AlertTriangle size={9} /> Clash
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <GraduationCap size={12} />
                                {entry.classSection.level.replace(
                                  "FORM_",
                                  "Form ",
                                )}{" "}
                                {entry.classSection.name}
                              </span>
                              {entry.room && (
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} /> {entry.room}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <BookOpen size={12} />
                                {entry.teacher.firstName}{" "}
                                {entry.teacher.lastName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate("/grading");
                              }}
                              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-black hover:bg-emerald-900 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                            >
                              Open Sheet <ArrowRight size={12} />
                            </button>
                            {canManage && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingEntry(entry);
                                  }}
                                  className="p-2 text-slate-300 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    await handleDelete(entry.id);
                                  }}
                                  className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                {entries.filter((e) => e.dayOfWeek === selectedDay).length ===
                  0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <Calendar
                      className="mx-auto text-gray-300 mb-4"
                      size={48}
                    />
                    <h3 className="text-lg font-black text-gray-900 mb-1">
                      No Classes Scheduled
                    </h3>
                    <p className="text-sm font-bold text-gray-400">
                      Nothing scheduled for this day
                    </p>
                    {canManage && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold mx-auto"
                      >
                        <Plus size={14} /> Add Session
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entry Detail Drawer */}
      <AnimatePresence>
        {selectedEntry && !editingEntry && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntry(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
            >
              <div className="p-6 bg-slate-900 text-white shrink-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">
                      {DAY_LABELS[selectedEntry.dayOfWeek]} ·{" "}
                      {selectedEntry.startTime} – {selectedEntry.endTime}
                    </p>
                    <h3 className="text-2xl font-black">
                      {selectedEntry.subject.name}
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      {selectedEntry.subject.code}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="p-2 hover:bg-white/10 rounded-xl"
                  >
                    <X size={20} />
                  </button>
                </div>
                {isEntryClashing(selectedEntry.id) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/20 border border-rose-400/30 rounded-xl">
                    <AlertTriangle size={14} className="text-rose-400" />
                    <span className="text-[10px] font-black text-rose-300 uppercase tracking-widest">
                      Scheduling Clash Detected
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {[
                  {
                    label: "Class",
                    value: `${selectedEntry.classSection.level.replace("FORM_", "Form ")} ${selectedEntry.classSection.name}`,
                  },
                  {
                    label: "Teacher",
                    value: `${selectedEntry.teacher.firstName} ${selectedEntry.teacher.lastName}`,
                  },
                  {
                    label: "Room",
                    value: selectedEntry.room ?? "Not assigned",
                  },
                  { label: "Day", value: DAY_LABELS[selectedEntry.dayOfWeek] },
                  {
                    label: "Time",
                    value: `${selectedEntry.startTime} – ${selectedEntry.endTime}`,
                  },
                  {
                    label: "Department",
                    value: selectedEntry.subject.department?.name ?? "—",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center py-3 border-b border-slate-50"
                  >
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {item.label}
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => navigate("/grading")}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ArrowRight size={14} /> Open Grading Sheet
                </button>
                {canManage && (
                  <>
                    <button
                      onClick={() => setEditingEntry(selectedEntry)}
                      className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                      title="Edit"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEntry.id)}
                      className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all"
                      title="Delete"
                    >
                      <X size={18} />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <EntryForm
            title="Add Timetable Entry"
            submitLabel="Add Entry"
            initial={emptyForm}
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            onClose={() => setShowAddModal(false)}
            onSubmit={handleAdd}
          />
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingEntry && (
          <EntryForm
            title="Edit Timetable Entry"
            submitLabel="Save Changes"
            initial={{
              classId: editingEntry.classSection.id,
              subjectId: editingEntry.subjectId,
              teacherId: editingEntry.teacherId,
              dayOfWeek: editingEntry.dayOfWeek,
              startTime: editingEntry.startTime,
              endTime: editingEntry.endTime,
              room: editingEntry.room ?? "",
            }}
            classes={classes}
            subjects={subjects}
            teachers={teachers}
            onClose={() => setEditingEntry(null)}
            onSubmit={handleEdit}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && settings && (
          <SettingsModal
            settings={settings}
            onClose={() => setShowSettingsModal(false)}
            onToggle={handleToggleSetting}
            isSaving={isSavingSettings}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
