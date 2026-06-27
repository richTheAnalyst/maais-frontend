import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users, Search, Download, Plus,
  ChevronRight, ArrowRight, TrendingUp,
  Trash2, X, Lock,
  FileText, FileUp,
  MoreVertical, GraduationCap,
  HeartPulse, UserPlus, Fingerprint,
  Phone, MessageSquare, Activity,
  BarChart3, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import { ImportExportModal } from '../components/ImportExportModal';

import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import {
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  LineChart as ReLineChart, Line, CartesianGrid
} from 'recharts';
import api from '../lib/api';

// --- Types ---
interface BackendStudent {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  photoUrl?: string;
  archivedAt?: string;
  currentClassId?: string;
  currentClass?: {
    id: string;
    name: string;
    level: string;
  };
  user?: {
    email: string;
    isActive: boolean;
  };
  grades?: any[];
  reportCards?: any[];
}

interface ClassSection {
  id: string;
  name: string;
  level: string;
  _count?: { students: number };
}

interface EnrolFormData {
  indexNumber: string;
  firstName: string;
  lastName: string;
  middleName: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  email: string;
  password: string;
  currentClassId: string;
  departmentId: string;
  parentFirstName: string;
  parentLastName: string;
  parentPhone: string;
  parentEmail: string;
  parentRelationship: string;
}

// --- Student Dossier Panel ---
const StudentDossier: React.FC<{
  student: BackendStudent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onTranscript: (id: string) => void;
  isDeleting: boolean;
  isGeneratingTranscript: boolean;
}> = ({ student, onClose, onDelete, onTranscript, isDeleting, isGeneratingTranscript }) => {
  const [activeTab, setActiveTab] = useState<'Academic' | 'BioData' | 'Guardian'>('Academic');
  const [grades, setGrades] = useState<any[]>([]);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);


  const fullName = `${student.firstName} ${student.middleName ? student.middleName + ' ' : ''}${student.lastName}`;

  const performanceData = useMemo(() => {
    if (!student.reportCards?.length) return [];
    return student.reportCards.map((rc: any) => ({
      term: `${rc.term?.academicYear?.label ?? ''} T${rc.term?.termNumber?.replace('TERM_', '') ?? ''}`,
      grade: rc.averageScore ?? 0,
    }));
  }, [student.reportCards]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 bg-slate-900 text-white shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white ring-1 ring-white/20">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic font-display">{fullName}</h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{student.indexNumber}</p>
              {student.currentClass && (
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mt-1">
                  {student.currentClass.level} — {student.currentClass.name}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'Academic', label: 'Academic', icon: BarChart3 },
            { id: 'BioData', label: 'Bio-Data', icon: Fingerprint },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-xl' : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
        {activeTab === 'Academic' && (
          <div className="space-y-6">
            {performanceData.length > 0 ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                  Longitudinal Performance
                </h4>
                <div className="h-40 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReLineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="term" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="grade" stroke="#0f172a" strokeWidth={3} dot={{ r: 4, fill: '#0f172a' }} />
                    </ReLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center">
                <BarChart3 size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">No academic records yet</p>
                <p className="text-xs text-slate-300 mt-1">Grades will appear here once entered</p>
              </div>
            )}

            {/* Report Cards */}
            {student.reportCards && student.reportCards.length > 0 && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Terminal Report Cards
                </h4>
                <div className="space-y-2">
                  {student.reportCards.map((rc: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-2xl border border-transparent hover:border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                          <FileText size={14} />
                        </div>
                        <div>
                          <span className="text-[12px] font-bold text-slate-700">
                            {rc.term?.academicYear?.label} — Term {rc.term?.termNumber?.replace('TERM_', '')}
                          </span>
                          {rc.classPosition && (
                            <p className="text-[10px] text-slate-400">Position: {rc.classPosition} of {rc.classSize}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[11px] font-black italic font-display text-slate-400">
                          {rc.averageScore?.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'BioData' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                Institutional Identity
              </p>
              <div className="space-y-4">
                {[
                  { label: 'Index Number', value: student.indexNumber },
                  { label: 'First Name', value: student.firstName },
                  { label: 'Last Name', value: student.lastName },
                  { label: 'Middle Name', value: student.middleName || '—' },
                  { label: 'Gender', value: student.gender },
                  { label: 'Date of Birth', value: student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '—' },
                  { label: 'Email', value: student.user?.email || '—' },
                  { label: 'Current Class', value: student.currentClass ? `${student.currentClass.level} — ${student.currentClass.name}` : '—' },
                  { label: 'Account Status', value: student.user?.isActive ? 'Active' : 'Inactive' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">{item.label}</span>
                    <span className="text-[12px] font-black text-slate-900 italic font-display">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100 flex gap-3 shrink-0">
        <button
          onClick={() => onDelete(student.id)}
          disabled={isDeleting}
          className="p-4 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-all disabled:opacity-50"
        >
          {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
        </button>
        <button
          onClick={() => onTranscript(student.id)}
          disabled={isGeneratingTranscript}
          className="flex-1 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all disabled:opacity-50"
        >
          {isGeneratingTranscript ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Transcript
        </button>
      </div>
    </div>
  );
};

// --- Enrol Student Modal ---
const EnrolModal: React.FC<{
  classes: ClassSection[];
  departments: any[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ classes, departments, onClose, onSuccess }) => {
  const [form, setForm] = useState<EnrolFormData>({
    indexNumber: '',
    firstName: '',
    lastName: '',
    middleName: '',
    gender: 'MALE',
    dateOfBirth: '',
    email: '',
    password: 'Student@2024!',
    currentClassId: classes[0]?.id ?? '',
    departmentId: '',
    parentFirstName: '',
    parentLastName: '',
    parentPhone: '',
    parentEmail: '',
    parentRelationship: 'Father',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImportExport, setShowImportExport] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/users/students', {
        ...form,
        email: form.email || undefined,
        middleName: form.middleName || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        currentClassId: form.currentClassId || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enrol student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900">Enrol New Student</h3>
            <p className="text-xs text-slate-400 mt-1">Add a student to the registry</p>
          </div>
         
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <section>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Academic & Bio-Data
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Index Number *
                </label>
                <input
                  required
                  value={form.indexNumber}
                  onChange={e => setForm({ ...form, indexNumber: e.target.value })}
                  placeholder="MSHTS/2024/001"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Department
                </label>
                <select
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Class
                </label>
                <select
                  value={form.currentClassId}
                  onChange={e => setForm({ ...form, currentClassId: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                >
                  <option value="">No class assigned</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.level} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Gender *
                </label>
                <select
                  value={form.gender}
                  onChange={e => setForm({ ...form, gender: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  First Name *
                </label>
                <input
                  required
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  placeholder="Kwame"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Last Name *
                </label>
                <input
                  required
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  placeholder="Mensah"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Initial Password *
                </label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Guardian Information
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Guardian First Name
                </label>
                <input
                  value={form.parentFirstName}
                  onChange={e => setForm({ ...form, parentFirstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Guardian Last Name
                </label>
                <input
                  value={form.parentLastName}
                  onChange={e => setForm({ ...form, parentLastName: e.target.value })}
                  placeholder="Mensah"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Guardian Phone
                </label>
                <input
                  value={form.parentPhone}
                  onChange={e => setForm({ ...form, parentPhone: e.target.value })}
                  placeholder="0241234567"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Relationship
                </label>
                <select
                  value={form.parentRelationship}
                  onChange={e => setForm({ ...form, parentRelationship: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  Guardian Email
                </label>
                <input
                  type="email"
                  value={form.parentEmail}
                  onChange={e => setForm({ ...form, parentEmail: e.target.value })}
                  placeholder="john.mensah@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </section>
        </form>
        <div className="p-8 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest">
            Cancel
          </button>
          <button
            onClick={handleSubmit as any}
            disabled={isLoading}
            className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Enrol Student
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// --- Main Component ---
export const StudentRegistry: React.FC = () => {
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showEnrolModal, setShowEnrolModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingTranscript, setIsGeneratingTranscript] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [isRunningPromotion, setIsRunningPromotion] = useState(false);
  const [promotionResult, setPromotionResult] = useState<any>(null);
  const [showImportExport, setShowImportExport] = useState(false);


  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [studentsRes, classesRes, deptsRes] = await Promise.all([
        api.get('/users/students'),
        api.get('/academic/classes'),
        api.get('/academic/departments'),
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
      setDepartments(deptsRes.data);
    } catch (err: any) {
      setError('Failed to load student registry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Fetch academic years for promotion
    api.get('/academic/years/active').then(res => {
      if (res.data) {
        setAcademicYears([res.data]);
        setSelectedAcademicYearId(res.data.id);
      }
    }).catch(() => {});
  }, [fetchData]);

  const selectedStudent = useMemo(
    () => students.find(s => s.id === selectedStudentId),
    [students, selectedStudentId]
  );

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.indexNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = selectedClassId === 'All' || s.currentClassId === selectedClassId;
      const matchesGender = selectedGender === 'All' || s.gender === selectedGender;
      return matchesSearch && matchesClass && matchesGender;
    });
  }, [students, searchQuery, selectedClassId, selectedGender]);

  const genderData = useMemo(() => [
    { name: 'Male', value: students.filter(s => s.gender === 'MALE').length },
    { name: 'Female', value: students.filter(s => s.gender === 'FEMALE').length },
  ], [students]);

  const handleDelete = async (studentId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this student account?')) return;
    setIsDeleting(true);
    try {
      const student = students.find(s => s.id === studentId);
      if (student?.user) {
        await api.delete(`/users/${student.id}/deactivate`);
      }
      setSelectedStudentId(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate student');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateTranscript = async (studentId: string) => {
    setIsGeneratingTranscript(true);
    try {
      const res = await api.post('/reports/transcripts/generate', {
        studentIdOrIndex: studentId,
      });
      const { transcript } = res.data;
      alert(`Transcript generated!\nVerification URL: ${transcript.verificationUrl}\nHash: ${transcript.systemHash}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate transcript');
    } finally {
      setIsGeneratingTranscript(false);
    }
  };

  const handleRunPromotion = async () => {
    if (!selectedAcademicYearId) return;
    if (!window.confirm('This will promote all students to the next class. F3 students will be graduated. This cannot be undone. Continue?')) return;
    setIsRunningPromotion(true);
    try {
      const res = await api.post('/archive/promote', { academicYearId: selectedAcademicYearId });
      setPromotionResult(res.data);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Promotion failed. Ensure all terms are locked first.');
    } finally {
      setIsRunningPromotion(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading student registry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-900 mb-2">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mx-auto">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Registry</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Student Dynamic Ledger</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              STUDENT ENROLLMENT
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {students.length} active students
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
            >
              <RefreshCw size={16} />
            </button>
           {/*  <button
              onClick={() => setIsPromoting(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
            >
              <TrendingUp size={16} /> Promotion Engine
            </button> */}
             <button
            onClick={() => setShowImportExport(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
          >
            <FileUp size={16} /> Import / Export
          </button>

          <AnimatePresence>
            {showImportExport && (
              <ImportExportModal
                entity="students"
                onClose={() => setShowImportExport(false)}
                onImportSuccess={fetchData}
              />
            )}
          </AnimatePresence>
            <button
              onClick={() => setShowEnrolModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20"
            >
              <UserPlus size={16} /> Enrol Student
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="h-16 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value">
                    <Cell fill="#0f172a" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Gender Split</p>
              <p className="text-xl font-black italic font-display text-slate-900">
                {genderData[0].value}M / {genderData[1].value}F
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 flex items-center justify-between">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Users size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total</p>
              <p className="text-xl font-black italic font-display text-emerald-900">{students.length} Students</p>
            </div>
          </div>

          <div className="md:col-span-1 xl:col-span-2 bg-slate-50 p-5 rounded-[2rem] border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Class Distribution</p>
            <div className="flex flex-wrap gap-2">
              {classes.map(c => (
                <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-black text-slate-600">{c.level} {c.name}</span>
                  <span className="text-[10px] font-black text-emerald-600">{c._count?.students ?? 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="px-8 py-5 bg-white border-b border-slate-200/60 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or index number..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none"
        >
          <option value="All">All Classes</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.level} — {c.name}</option>
          ))}
        </select>
        <select
          value={selectedGender}
          onChange={e => setSelectedGender(e.target.value)}
          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none"
        >
          <option value="All">All Genders</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
        </select>
        <p className="text-[11px] font-bold text-slate-400 ml-auto">
          {filteredStudents.length} of {students.length} shown
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-8">
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-[2.5rem] border border-slate-200">
            <GraduationCap size={40} className="text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-400">No students found</p>
            <button
              onClick={() => setShowEnrolModal(true)}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              <UserPlus size={14} /> Enrol First Student
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Index / Name</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Reports</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredStudents.map(stu => (
                  <tr
                    key={stu.id}
                    className="group hover:bg-slate-50 cursor-pointer transition-all"
                    onClick={() => setSelectedStudentId(stu.id)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                          <GraduationCap size={18} />
                        </div>
                        <div>
                          <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1.5">
                            {stu.firstName} {stu.lastName}
                          </p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {stu.indexNumber}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[12px] font-black text-slate-900">
                        {stu.currentClass ? `${stu.currentClass.level} ${stu.currentClass.name}` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest',
                        stu.gender === 'MALE' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'
                      )}>
                        {stu.gender}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-[12px] font-black text-slate-400">
                        {stu.reportCards?.length ?? 0} reports
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Dossier Slide-in */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStudentId(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-w-xl bg-white h-full shadow-2xl"
            >
              <StudentDossier
                student={selectedStudent}
                onClose={() => setSelectedStudentId(null)}
                onDelete={handleDelete}
                onTranscript={handleGenerateTranscript}
                isDeleting={isDeleting}
                isGeneratingTranscript={isGeneratingTranscript}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Promotion Modal */}
      <AnimatePresence>
        {isPromoting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => { setIsPromoting(false); setPromotionResult(null); }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-12"
            >
              {promotionResult ? (
                <div className="text-center">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp size={40} />
                  </div>
                  <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">
                    Promotion Complete
                  </h3>
                  <p className="text-slate-400 text-sm mb-8">{promotionResult.academicYear}</p>
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-2xl font-black text-slate-900">{promotionResult.totalProcessed}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Processed</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl">
                      <p className="text-2xl font-black text-blue-600">{promotionResult.promoted}</p>
                      <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Promoted</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl">
                      <p className="text-2xl font-black text-emerald-600">{promotionResult.graduated}</p>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Graduated</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setIsPromoting(false); setPromotionResult(null); }}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
                    <TrendingUp size={32} />
                  </div>
                  <h3 className="text-3xl font-black italic font-display text-slate-900 mb-2">
                    Promotion Engine
                  </h3>
                  <p className="text-sm text-slate-400 mb-8">
                    This will advance all students to their next class. Form 3 students will be graduated and archived.
                    Ensure all terms are locked before proceeding.
                  </p>
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-amber-700">
                      This action is irreversible. All terms must be locked before running promotion.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setIsPromoting(false)}
                      className="flex-1 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest"
                    >
                      Abort
                    </button>
                    <button
                      onClick={handleRunPromotion}
                      disabled={isRunningPromotion}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isRunningPromotion ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                      Execute
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enrol Modal */}
      <AnimatePresence>
        {showEnrolModal && (
          <EnrolModal
            classes={classes}
            departments={departments}
            onClose={() => setShowEnrolModal(false)}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
};