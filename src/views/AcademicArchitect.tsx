import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Building2, School, BookOpen, Layers,
  ChevronRight, ChevronDown, Plus, MoreVertical,
  CheckCircle2, XCircle, Users, Settings2, Hash,
  Clock, ShieldCheck, AlertTriangle, Search,
  Download, Map, BookMarked, Gauge, Loader2,
  RefreshCw, AlertCircle, Calendar, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { GradingRulesView } from './GradingRulesView';
import api from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassSection {
  id: string;
  name: string;
  level: string;
  capacity: number;
  classTeacher?: { firstName: string; lastName: string };
  _count?: { students: number };
}

interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'CORE' | 'ELECTIVE';
  department?: { name: string };
}

interface Department {
  id: string;
  name: string;
  code: string;
  subjects: Subject[];
  _count?: { staff: number };
}

interface AcademicYear {
  id: string;
  label: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  terms: Term[];
}

interface Term {
  id: string;
  termNumber: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isLocked: boolean;
}

// ─── Add Class Modal ──────────────────────────────────────────────────────────

const AddClassModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', level: 'FORM_1', capacity: 40 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/academic/classes', form);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create class');
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
        className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10"
      >
        <h3 className="text-xl font-black text-slate-900 mb-6">Add Class Section</h3>
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-2xl text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Class Name *</label>
            <input
              required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. 1A, 2B, 3Science"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Form Level *</label>
            <select
              value={form.level}
              onChange={e => setForm({ ...form, level: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
            >
              <option value="FORM_1">Form 1 (SHS 1)</option>
              <option value="FORM_2">Form 2 (SHS 2)</option>
              <option value="FORM_3">Form 3 (SHS 3)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Capacity</label>
            <input
              type="number" min={1} max={100}
              value={form.capacity}
              onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create Class
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Add Subject Modal ────────────────────────────────────────────────────────

const AddSubjectModal: React.FC<{
  departments: Department[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ departments, onClose, onSuccess }) => {
  const [form, setForm] = useState({ name: '', code: '', type: 'CORE', departmentId: departments[0]?.id ?? '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/academic/subjects', { ...form, departmentId: form.departmentId || undefined });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create subject');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10">
        <h3 className="text-xl font-black text-slate-900 mb-6">Add Subject</h3>
        {error && (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-3 rounded-2xl text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Subject Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Core Mathematics" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Subject Code *</label>
            <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. CMATH" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500" />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500">
              <option value="CORE">Core</option>
              <option value="ELECTIVE">Elective</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Department</label>
            <select value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500">
              <option value="">No Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-50 rounded-2xl text-[11px] font-black uppercase tracking-widest">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add Subject
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function AcademicArchitect() {
  const [activeTab, setActiveTab] = useState<'Blueprint' | 'Curriculum' | 'Grading'>('Blueprint');

  // ─── Data ─────────────────────────────────────────────────────────────────
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── UI State ────────────────────────────────────────────────────────────
  const [expandedLevels, setExpandedLevels] = useState<string[]>(['FORM_1']);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [isActivatingTerm, setIsActivatingTerm] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [classesRes, subjectsRes, deptsRes, yearRes] = await Promise.all([
        api.get('/academic/classes'),
        api.get('/academic/subjects'),
        api.get('/academic/departments'),
        api.get('/academic/years/active'),
      ]);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setDepartments(deptsRes.data);
      setActiveYear(yearRes.data);
    } catch {
      setError('Failed to load academic structure');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Group classes by level ─────────────────────────────────────────────
  const classesByLevel = useMemo(() => {
    const map: Record<string, ClassSection[]> = {
      FORM_1: [],
      FORM_2: [],
      FORM_3: [],
    };
    classes.forEach(c => {
      if (map[c.level]) map[c.level].push(c);
    });
    return map;
  }, [classes]);

  const LEVEL_LABELS: Record<string, string> = {
    FORM_1: 'Form 1 (SHS 1)',
    FORM_2: 'Form 2 (SHS 2)',
    FORM_3: 'Form 3 (SHS 3)',
  };

  const toggleLevel = (level: string) => {
    setExpandedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const handleActivateTerm = async (termId: string) => {
    setIsActivatingTerm(termId);
    try {
      await api.patch(`/academic/terms/${termId}/activate`);
      showToast('Term activated');
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to activate term');
    } finally {
      setIsActivatingTerm(null);
    }
  };

  const filteredSubjects = useMemo(() => {
    if (!subjectSearch.trim()) return subjects;
    return subjects.filter(s =>
      s.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(subjectSearch.toLowerCase())
    );
  }, [subjects, subjectSearch]);

  // ─── Derived stats ──────────────────────────────────────────────────────
  const totalStudents = classes.reduce((sum, c) => sum + (c._count?.students ?? 0), 0);
  const totalCapacity = classes.reduce((sum, c) => sum + c.capacity, 0);
  const overCapacityClasses = classes.filter(c => (c._count?.students ?? 0) > c.capacity);
  const coreSubjects = subjects.filter(s => s.type === 'CORE').length;
  const electiveSubjects = subjects.filter(s => s.type === 'ELECTIVE').length;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading academic structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">

      {/* Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} />
            <span className="text-sm font-bold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900 uppercase">Academic Architect</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              Institutional Structural Governance
            </h1>
            {activeYear && (
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {activeYear.label} · {activeYear.terms?.find(t => t.isActive)?.termNumber?.replace('_', ' ') ?? 'No active term'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <RefreshCw size={16} />
            </button>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
              {[
                { id: 'Blueprint', label: 'Class Structures', icon: Building2 },
                { id: 'Curriculum', label: 'Subject Mapping', icon: BookOpen },
                { id: 'Grading', label: 'Grading Protocol', icon: Gauge },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                    activeTab === tab.id ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── BLUEPRINT TAB ── */}
          {activeTab === 'Blueprint' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">

              {/* Tree */}
              <div className="xl:col-span-8 space-y-6">

                {/* Academic Year & Terms */}
                {activeYear && (
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">
                          Academic Calendar
                        </h3>
                        <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
                          {activeYear.label} — {new Date(activeYear.startDate).toLocaleDateString()} to {new Date(activeYear.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Year</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {activeYear.terms?.map(term => (
                        <div key={term.id} className={cn(
                          'p-5 rounded-2xl border transition-all',
                          term.isActive
                            ? 'bg-slate-900 border-slate-700 text-white'
                            : term.isLocked
                            ? 'bg-rose-50 border-rose-100'
                            : 'bg-slate-50 border-slate-100'
                        )}>
                          <div className="flex items-center justify-between mb-3">
                            <p className={cn(
                              'text-[10px] font-black uppercase tracking-widest',
                              term.isActive ? 'text-white/60' : 'text-slate-400'
                            )}>
                              {term.termNumber.replace('_', ' ')}
                            </p>
                            {term.isLocked && <Lock size={12} className="text-rose-500" />}
                            {term.isActive && <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />}
                          </div>
                          <p className={cn(
                            'text-xs font-bold mb-3',
                            term.isActive ? 'text-white/80' : 'text-slate-500'
                          )}>
                            {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                          </p>
                          {!term.isActive && !term.isLocked && (
                            <button
                              onClick={() => handleActivateTerm(term.id)}
                              disabled={isActivatingTerm === term.id}
                              className="w-full py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              {isActivatingTerm === term.id ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
                              Activate
                            </button>
                          )}
                          {term.isLocked && (
                            <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest text-center">Locked</p>
                          )}
                          {term.isActive && (
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest text-center">Current Term</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Class Structure Tree */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Institutional Blueprint</h3>
                      <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest italic">
                        {classes.length} class sections · {totalStudents} students
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAddClass(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                    >
                      <Plus size={14} /> Add Class
                    </button>
                  </div>

                  {error ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <AlertCircle size={32} className="text-rose-400 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400">{error}</p>
                      </div>
                    </div>
                  ) : classes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <Building2 size={40} className="text-slate-200 mb-4" />
                      <p className="text-sm font-bold text-slate-400 mb-4">No class sections yet</p>
                      <button onClick={() => setShowAddClass(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                        <Plus size={14} /> Create First Class
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {Object.entries(classesByLevel).map(([level, levelClasses]) => {
                        if (levelClasses.length === 0) return null;
                        const levelTotal = levelClasses.reduce((sum, c) => sum + (c._count?.students ?? 0), 0);
                        const isExpanded = expandedLevels.includes(level);

                        return (
                          <div key={level} className="space-y-3">
                            {/* Level Node */}
                            <div
                              onClick={() => toggleLevel(level)}
                              className={cn(
                                'flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all',
                                isExpanded ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                                  isExpanded ? 'bg-white/10 text-white' : 'bg-white text-slate-400 border border-slate-200'
                                )}>
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </div>
                                <span className="text-sm font-black italic font-display tracking-tight">
                                  {LEVEL_LABELS[level]}
                                </span>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className={cn('text-[9px] font-black uppercase tracking-widest', isExpanded ? 'text-white/40' : 'text-slate-400')}>
                                    Population
                                  </p>
                                  <p className="text-[11px] font-black italic font-display">
                                    {levelTotal} Students
                                  </p>
                                </div>
                                <span className={cn('text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg', isExpanded ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600')}>
                                  {levelClasses.length} Classes
                                </span>
                              </div>
                            </div>

                            {/* Class nodes */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="pl-8 space-y-3 overflow-hidden border-l-2 border-slate-100 ml-8"
                                >
                                  {levelClasses.map(cls => {
                                    const studentCount = cls._count?.students ?? 0;
                                    const occupancyPct = Math.min(100, (studentCount / cls.capacity) * 100);
                                    const isOverCapacity = studentCount > cls.capacity;

                                    return (
                                      <div key={cls.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all shadow-sm group">
                                        <div className="flex items-center gap-5">
                                          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                                            <Layers size={18} />
                                          </div>
                                          <div>
                                            <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1">
                                              {cls.level.replace('FORM_', 'Form ')} {cls.name}
                                            </p>
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-1.5">
                                                <Users size={10} className="text-slate-300" />
                                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.15em]">
                                                  {studentCount} Students
                                                </span>
                                              </div>
                                              {cls.classTeacher && (
                                                <span className="text-[9px] font-bold text-slate-400">
                                                  · {cls.classTeacher.firstName} {cls.classTeacher.lastName}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                          <div className="text-center min-w-[100px]">
                                            <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-1.5">Capacity Load</p>
                                            <div className="flex items-center gap-2">
                                              <div className="h-1 flex-1 bg-slate-100 rounded-full overflow-hidden min-w-[50px]">
                                                <motion.div
                                                  initial={{ width: 0 }}
                                                  animate={{ width: `${occupancyPct}%` }}
                                                  transition={{ duration: 0.8 }}
                                                  className={cn('h-full rounded-full', isOverCapacity ? 'bg-rose-500' : 'bg-emerald-500')}
                                                />
                                              </div>
                                              <span className={cn('text-[10px] font-black', isOverCapacity ? 'text-rose-600' : 'text-emerald-600')}>
                                                {studentCount}/{cls.capacity}
                                              </span>
                                            </div>
                                            {isOverCapacity && (
                                              <div className="flex items-center gap-1 mt-1 justify-center">
                                                <AlertTriangle size={8} className="text-rose-500" />
                                                <span className="text-[7px] font-black text-rose-500 uppercase tracking-tighter">Overflow</span>
                                              </div>
                                            )}
                                          </div>
                                          <button className="p-2.5 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                                            <MoreVertical size={18} />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <button
                                    onClick={() => setShowAddClass(true)}
                                    className="w-full py-4 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center gap-3 text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-all"
                                  >
                                    <Plus size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Class to {LEVEL_LABELS[level]}</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className="xl:col-span-4 space-y-6 sticky top-8">
                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl">
                  <h3 className="text-[12px] font-black uppercase tracking-[0.25em] mb-6 text-white/60">
                    Load Distribution Matrix
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Total Students</p>
                      <p className="text-3xl font-black italic font-display">{totalStudents}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Class Sections</p>
                        <p className="text-2xl font-black italic font-display">{classes.length}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Avg Occupancy</p>
                        <p className="text-2xl font-black italic font-display">
                          {totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                    {overCapacityClasses.length > 0 && (
                      <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Over Capacity</p>
                        <p className="text-sm font-black text-rose-300">{overCapacityClasses.length} class{overCapacityClasses.length > 1 ? 'es' : ''}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Department Summary */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em] mb-6">Departments</h3>
                  <div className="space-y-3">
                    {departments.map(dept => (
                      <div key={dept.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div>
                          <p className="text-[12px] font-black text-slate-900">{dept.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{dept.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-black text-slate-600">{dept.subjects?.length ?? 0} subjects</p>
                          <p className="text-[9px] font-bold text-slate-400">{dept._count?.staff ?? 0} staff</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {overCapacityClasses.length > 0 && (
                  <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-xl flex items-center justify-center">
                        <AlertTriangle size={20} />
                      </div>
                      <h3 className="text-[11px] font-black text-amber-900 uppercase tracking-[0.25em]">Capacity Anomalies</h3>
                    </div>
                    <div className="space-y-3">
                      {overCapacityClasses.map(cls => (
                        <div key={cls.id} className="p-4 bg-white/60 rounded-2xl border border-amber-200/50">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[12px] font-black text-slate-900 italic font-display">
                              {cls.level.replace('FORM_', 'Form ')} {cls.name}
                            </span>
                            <span className="text-[10px] font-black text-rose-600">⚠️ Overflow</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {cls._count?.students} / {cls.capacity} capacity
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── CURRICULUM TAB ── */}
          {activeTab === 'Curriculum' && (
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
                    <div>
                      <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">
                        Subject Registry
                      </h3>
                      <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest italic">
                        {coreSubjects} Core · {electiveSubjects} Elective · {subjects.length} Total
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search subjects..."
                          value={subjectSearch}
                          onChange={e => setSubjectSearch(e.target.value)}
                          className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none w-64 focus:border-emerald-500"
                        />
                      </div>
                      <button
                        onClick={() => setShowAddSubject(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                      >
                        <Plus size={14} /> Add Subject
                      </button>
                    </div>
                  </div>

                  {/* Type filter chips */}
                  <div className="flex gap-3">
                    {['All', 'CORE', 'ELECTIVE'].map((f, i) => (
                      <button key={i} className={cn(
                        'px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                        i === 0 ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
                      )}>
                        {f === 'All' ? `All (${subjects.length})` : f === 'CORE' ? `Core (${coreSubjects})` : `Elective (${electiveSubjects})`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject table */}
                {subjects.length === 0 ? (
                  <div className="p-16 text-center">
                    <BookOpen size={40} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 mb-4">No subjects yet</p>
                    <button onClick={() => setShowAddSubject(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mx-auto">
                      <Plus size={14} /> Add First Subject
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Code</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Type</th>
                          <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                          <th className="px-8 py-5"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 bg-white">
                        {filteredSubjects.map(sub => (
                          <tr key={sub.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  'w-9 h-9 rounded-xl flex items-center justify-center shadow-sm',
                                  sub.type === 'CORE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                )}>
                                  {sub.type === 'CORE' ? <ShieldCheck size={16} /> : <BookMarked size={16} />}
                                </div>
                                <p className="text-[13px] font-black italic font-display text-slate-900">{sub.name}</p>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-[11px] font-black font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{sub.code}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <span className={cn(
                                'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border',
                                sub.type === 'CORE'
                                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                  : 'bg-blue-50 border-blue-100 text-blue-700'
                              )}>
                                {sub.type}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-[12px] font-bold text-slate-500">
                                {sub.department?.name ?? '—'}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button className="p-2 text-slate-300 hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all">
                                <MoreVertical size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="p-8 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Core Subjects</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Elective Subjects</span>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold text-slate-400">
                    {filteredSubjects.length} of {subjects.length} shown
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: 'Total Subjects', value: subjects.length, icon: BookMarked, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Core Subjects', value: coreSubjects, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Elective Subjects', value: electiveSubjects, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Departments', value: departments.length, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center justify-between">
                    <div className={cn('w-12 h-12 rounded-[1.25rem] flex items-center justify-center', stat.bg, stat.color)}>
                      <stat.icon size={22} />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                      <p className="text-2xl font-black italic font-display text-slate-900">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GRADING TAB ── */}
          {activeTab === 'Grading' && (
            <div className="-mx-8 -my-8 h-[calc(100vh-200px)]">
              <GradingRulesView />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddClass && (
          <AddClassModal
            onClose={() => setShowAddClass(false)}
            onSuccess={() => { fetchData(); showToast('Class section created'); }}
          />
        )}
        {showAddSubject && (
          <AddSubjectModal
            departments={departments}
            onClose={() => setShowAddSubject(false)}
            onSuccess={() => { fetchData(); showToast('Subject added'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}