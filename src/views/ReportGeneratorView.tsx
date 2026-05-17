import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Send, Printer, ShieldCheck,
  AlertTriangle, Filter, Search, CheckCircle2,
  PenTool, Download, Layers, UserCheck,
  Clock, MoreVertical, ChevronRight, Calendar,
  Bookmark, RefreshCw, Loader2, AlertCircle,
  QrCode, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import api from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassSection {
  id: string;
  name: string;
  level: string;
  _count?: { students: number };
}

interface Term {
  id: string;
  termNumber: string;
  isActive: boolean;
  isLocked: boolean;
}

interface AcademicYear {
  id: string;
  label: string;
  terms: Term[];
}

interface ReportCardRow {
  studentId: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  averageScore: number | null;
  classPosition: number | null;
  classSize: number | null;
  systemHash: string | null;
  generatedAt: string | null;
  releasedAt: string | null;
  status: 'READY' | 'MISSING_MARKS' | 'NOT_GENERATED';
}

interface BatchResult {
  total: number;
  succeeded: number;
  failedCount: number;
  failed: { studentId: string; indexNumber: string; error: string }[];
}

interface VerifyResult {
  valid: boolean;
  documentType?: string;
  student?: { indexNumber: string; firstName: string; lastName: string };
  term?: { termNumber: string; academicYear: { label: string } };
  generatedAt?: string;
  message?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const ReportGeneratorView: React.FC = () => {
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [activeYear, setActiveYear] = useState<AcademicYear | null>(null);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedTermId, setSelectedTermId] = useState('');
  const [students, setStudents] = useState<ReportCardRow[]>([]);

  const [isLoadingSetup, setIsLoadingSetup] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [generatingSingleId, setGeneratingSingleId] = useState<string | null>(null);
  const [isLockingTerm, setIsLockingTerm] = useState(false);

  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [showBatchResult, setShowBatchResult] = useState(false);

  const [verifyHash, setVerifyHash] = useState('');
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') setSuccessMsg(msg);
    else setError(msg);
    setTimeout(() => { setSuccessMsg(null); setError(null); }, 4000);
  };

  // ─── Load setup ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setIsLoadingSetup(true);
      try {
        const [classesRes, yearRes] = await Promise.all([
          api.get('/academic/classes'),
          api.get('/academic/years/active'),
        ]);
        setClasses(classesRes.data);
        setActiveYear(yearRes.data);

        if (classesRes.data.length > 0) setSelectedClassId(classesRes.data[0].id);

        const activeTerm = yearRes.data?.terms?.find((t: Term) => t.isActive);
        if (activeTerm) setSelectedTermId(activeTerm.id);
      } catch {
        showToast('Failed to load setup data', 'error');
      } finally {
        setIsLoadingSetup(false);
      }
    }
    load();
  }, []);

  // ─── Load students + their report cards ────────────────────────────────────
  const loadStudents = useCallback(async () => {
    if (!selectedClassId || !selectedTermId) return;
    setIsLoadingStudents(true);
    try {
      const studentsRes = await api.get(`/users/students?classId=${selectedClassId}`);
      const studentList = studentsRes.data;

      // Fetch report cards in parallel
      const rows: ReportCardRow[] = await Promise.all(
        studentList.map(async (s: any) => {
          try {
            // Try to get existing report card from student profile
            const profileRes = await api.get(`/users/students/${s.id}`);
            const reportCard = profileRes.data.reportCards?.find(
              (rc: any) => rc.termId === selectedTermId
            );
            return {
              studentId: s.id,
              indexNumber: s.indexNumber,
              firstName: s.firstName,
              lastName: s.lastName,
              averageScore: reportCard?.averageScore ?? null,
              classPosition: reportCard?.classPosition ?? null,
              classSize: reportCard?.classSize ?? null,
              systemHash: reportCard?.systemHash ?? null,
              generatedAt: reportCard?.generatedAt ?? null,
              releasedAt: reportCard?.releasedAt ?? null,
              status: reportCard
                ? 'READY'
                : 'NOT_GENERATED',
            } as ReportCardRow;
          } catch {
            return {
              studentId: s.id,
              indexNumber: s.indexNumber,
              firstName: s.firstName,
              lastName: s.lastName,
              averageScore: null,
              classPosition: null,
              classSize: null,
              systemHash: null,
              generatedAt: null,
              releasedAt: null,
              status: 'NOT_GENERATED',
            } as ReportCardRow;
          }
        })
      );

      setStudents(rows);
    } catch {
      showToast('Failed to load students', 'error');
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedClassId, selectedTermId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // ─── Generate single report card ───────────────────────────────────────────
  const generateSingle = async (studentId: string) => {
    setGeneratingSingleId(studentId);
    try {
      await api.post('/reports/report-cards/generate', {
        studentId,
        termId: selectedTermId,
      });
      showToast('Report card generated successfully');
      await loadStudents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to generate report card', 'error');
    } finally {
      setGeneratingSingleId(null);
    }
  };

  // ─── Batch generate all ─────────────────────────────────────────────────────
  const handleBatchGenerate = async () => {
    if (!selectedClassId || !selectedTermId) return;
    setIsCompiling(true);
    setBatchResult(null);
    try {
      const res = await api.post('/reports/report-cards/batch', {
        classSectionId: selectedClassId,
        termId: selectedTermId,
      });
      setBatchResult(res.data);
      setShowBatchResult(true);
      await loadStudents();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Batch generation failed. Ensure all terms are ready.', 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  // ─── Lock term ──────────────────────────────────────────────────────────────
  const handleLockTerm = async () => {
    if (!selectedTermId) return;
    if (!window.confirm('Lock this term? Teachers will no longer be able to edit grades after this.')) return;
    setIsLockingTerm(true);
    try {
      await api.patch(`/archive/terms/${selectedTermId}/lock`);
      showToast('Term locked successfully');
      // Refresh year data
      const yearRes = await api.get('/academic/years/active');
      setActiveYear(yearRes.data);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to lock term', 'error');
    } finally {
      setIsLockingTerm(false);
    }
  };

  // ─── Verify document ───────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (!verifyHash.trim()) return;
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.get(`/reports/verify/${verifyHash.trim()}`);
      setVerifyResult(res.data);
    } catch {
      setVerifyResult({ valid: false, message: 'Verification failed' });
    } finally {
      setIsVerifying(false);
    }
  };

  // ─── Derived stats ──────────────────────────────────────────────────────────
  const readyCount = students.filter(s => s.status === 'READY').length;
  const notGeneratedCount = students.filter(s => s.status === 'NOT_GENERATED').length;
  const selectedClass = classes.find(c => c.id === selectedClassId);
  const selectedTerm = activeYear?.terms?.find(t => t.id === selectedTermId);
  const termIsLocked = selectedTerm?.isLocked ?? false;

  if (isLoadingSetup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-400">Loading report engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto">

      {/* Toasts */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={16} /> <span className="text-sm font-bold">{successMsg}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <AlertCircle size={16} /> <span className="text-sm font-bold">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-8 pb-20">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Academic Engine</span>
              <ChevronRight size={10} />
              <span className="text-slate-900 uppercase">Terminal Report Engine</span>
            </div>
            <h1 className="text-3xl font-black italic font-display text-slate-900 tracking-tight leading-none">
              Automated Report Factory
            </h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">
              {activeYear?.label} · Batch Processing & QR Verification
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setShowVerifyModal(true)}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
            >
              <QrCode size={14} /> Verify Document
            </button>
            <button
              onClick={handleLockTerm}
              disabled={isLockingTerm || termIsLocked}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                termIsLocked
                  ? 'bg-rose-100 text-rose-600 border border-rose-200 cursor-not-allowed'
                  : 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 hover:bg-amber-700'
              )}
            >
              {isLockingTerm ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
              {termIsLocked ? 'Term Locked' : 'Lock Term'}
            </button>
            <button
              onClick={handleBatchGenerate}
              disabled={isCompiling || !selectedClassId || !selectedTermId}
              className={cn(
                'flex items-center gap-2 px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all',
                isCompiling && 'animate-pulse cursor-not-allowed opacity-80'
              )}
            >
              {isCompiling ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
              {isCompiling ? 'Compiling...' : 'Compile Batch Reports'}
            </button>
          </div>
        </header>

        {/* Filter Controls */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Class</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.level} — {c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Term</label>
              <select
                value={selectedTermId}
                onChange={e => setSelectedTermId(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[12px] font-bold outline-none"
              >
                {activeYear?.terms?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.termNumber.replace('_', ' ')} {t.isActive ? '(Active)' : ''} {t.isLocked ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 flex items-end">
              <button
                onClick={loadStudents}
                disabled={isLoadingStudents}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
              >
                {isLoadingStudents
                  ? <Loader2 size={14} className="animate-spin" />
                  : <RefreshCw size={14} />}
                Scan Database
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">

          {/* Main Table */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Layers size={18} className="text-emerald-600" />
                    Compilation Registry
                  </h3>
                  <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {selectedClass ? `${selectedClass.level} ${selectedClass.name}` : '—'} · {selectedTerm?.termNumber.replace('_', ' ') ?? '—'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                    <CheckCircle2 size={12} /> {readyCount} Ready
                  </span>
                  {notGeneratedCount > 0 && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">
                      <AlertTriangle size={12} /> {notGeneratedCount} Pending
                    </span>
                  )}
                </div>
              </div>

              {isLoadingStudents ? (
                <div className="p-16 flex items-center justify-center">
                  <Loader2 size={32} className="text-emerald-600 animate-spin" />
                </div>
              ) : students.length === 0 ? (
                <div className="p-16 text-center">
                  <FileText size={40} className="text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-400">No students in this class</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white border-b border-slate-50">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Avg</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Position</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Generated</th>
                        <th className="px-6 py-5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {students.map(student => (
                        <tr key={student.studentId} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-8 py-5">
                            <p className="text-[14px] font-black italic font-display text-slate-900 leading-tight">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {student.indexNumber}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-center">
                            {student.averageScore != null ? (
                              <span className="text-[15px] font-black font-display italic text-slate-900">
                                {student.averageScore.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center">
                            {student.classPosition != null ? (
                              <span className="text-sm font-black text-slate-700">
                                {student.classPosition} / {student.classSize}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className={cn(
                              'inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                              student.status === 'READY'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                : student.status === 'MISSING_MARKS'
                                ? 'bg-rose-50 text-rose-600 border-rose-100'
                                : 'bg-slate-50 text-slate-400 border-slate-100'
                            )}>
                              {student.status === 'READY' && <CheckCircle2 size={10} />}
                              {student.status === 'NOT_GENERATED' && <Clock size={10} />}
                              {student.status === 'MISSING_MARKS' && <AlertTriangle size={10} />}
                              {student.status.replace('_', ' ')}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            {student.generatedAt ? (
                              <span className="text-[10px] font-bold text-slate-400">
                                {new Date(student.generatedAt).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs">Not yet</span>
                            )}
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              {student.systemHash && (
                                <button
                                  onClick={() => { setVerifyHash(student.systemHash!); setShowVerifyModal(true); }}
                                  className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all"
                                  title="Verify QR"
                                >
                                  <QrCode size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => generateSingle(student.studentId)}
                                disabled={generatingSingleId === student.studentId}
                                className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
                                title="Generate report card"
                              >
                                {generatingSingleId === student.studentId
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <FileText size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="xl:col-span-4 space-y-6">

            {/* Stats Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
              <h3 className="text-lg font-black italic font-display text-white tracking-tight mb-6">
                Batch Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Students</span>
                  <span className="text-xl font-black text-white">{students.length}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Reports Ready</span>
                  <span className="text-xl font-black text-emerald-400">{readyCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                  <span className="text-[11px] font-black text-rose-400 uppercase tracking-widest">Not Generated</span>
                  <span className="text-xl font-black text-rose-400">{notGeneratedCount}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Term Status</span>
                  <span className={cn(
                    'text-[10px] font-black uppercase px-2 py-1 rounded-lg',
                    termIsLocked ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                  )}>
                    {termIsLocked ? '🔒 Locked' : '✓ Open'}
                  </span>
                </div>
              </div>
            </div>

            {/* Batch Result */}
            {batchResult && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  Last Batch Run
                </h3>
                <div className="space-y-3">
                  {[
                    { label: 'Total Processed', value: batchResult.total, color: 'text-slate-900' },
                    { label: 'Succeeded', value: batchResult.succeeded, color: 'text-emerald-600' },
                    { label: 'Failed', value: batchResult.failedCount, color: 'text-rose-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                      <span className={cn('text-lg font-black', item.color)}>{item.value}</span>
                    </div>
                  ))}
                </div>
                {batchResult.failedCount > 0 && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                    <p className="text-[10px] font-black text-rose-700 uppercase tracking-widest mb-2">Failed Students</p>
                    {batchResult.failed.map((f, i) => (
                      <p key={i} className="text-[11px] font-bold text-rose-600">
                        {f.indexNumber}: {f.error}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="bg-amber-50 rounded-[2.5rem] border border-amber-100 p-8">
              <h3 className="text-[13px] font-black text-amber-900 uppercase tracking-widest flex items-center gap-2 mb-6">
                <AlertTriangle size={16} className="text-amber-500" />
                Before Compiling
              </h3>
              <div className="space-y-3 text-[11px] font-bold text-amber-800">
                {[
                  'All teachers must submit grades',
                  'HODs must lock all grade sheets',
                  'Lock the term before batch generation',
                  'Each report gets a unique QR hash',
                  'Class positions are auto-computed',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <ChevronRight size={12} className="mt-0.5 shrink-0 text-amber-500" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Verify Modal ── */}
      <AnimatePresence>
        {showVerifyModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setShowVerifyModal(false); setVerifyResult(null); setVerifyHash(''); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <QrCode size={28} />
                </div>
                <button
                  onClick={() => { setShowVerifyModal(false); setVerifyResult(null); setVerifyHash(''); }}
                  className="text-slate-300 hover:text-slate-900 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <h3 className="text-2xl font-black italic font-display text-slate-900 mb-2">
                Document Verifier
              </h3>
              <p className="text-slate-400 font-medium leading-relaxed mb-8">
                Enter a document hash or scan a QR code to verify authenticity.
              </p>

              <div className="flex gap-3 mb-6">
                <input
                  value={verifyHash}
                  onChange={e => setVerifyHash(e.target.value)}
                  placeholder="Paste system hash here..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleVerify}
                  disabled={isVerifying || !verifyHash.trim()}
                  className="px-4 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm disabled:opacity-50"
                >
                  {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                </button>
              </div>

              {verifyResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'p-6 rounded-2xl border',
                    verifyResult.valid
                      ? 'bg-emerald-50 border-emerald-100'
                      : 'bg-rose-50 border-rose-100'
                  )}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {verifyResult.valid
                      ? <CheckCircle2 size={20} className="text-emerald-600" />
                      : <AlertCircle size={20} className="text-rose-600" />}
                    <p className={cn(
                      'text-sm font-black uppercase tracking-widest',
                      verifyResult.valid ? 'text-emerald-700' : 'text-rose-700'
                    )}>
                      {verifyResult.valid ? 'Document Authentic' : 'Document Not Found'}
                    </p>
                  </div>
                  {verifyResult.valid && (
                    <div className="space-y-2 text-xs font-bold text-slate-600">
                      {verifyResult.student && (
                        <p>Student: {verifyResult.student.firstName} {verifyResult.student.lastName} ({verifyResult.student.indexNumber})</p>
                      )}
                      {verifyResult.term && (
                        <p>Term: {verifyResult.term.academicYear.label} — {verifyResult.term.termNumber.replace('_', ' ')}</p>
                      )}
                      {verifyResult.documentType && (
                        <p>Type: {verifyResult.documentType.replace('_', ' ')}</p>
                      )}
                      {verifyResult.generatedAt && (
                        <p>Generated: {new Date(verifyResult.generatedAt).toLocaleString()}</p>
                      )}
                    </div>
                  )}
                  {!verifyResult.valid && verifyResult.message && (
                    <p className="text-xs font-bold text-rose-600">{verifyResult.message}</p>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};