import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Activity,
  History,
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Zap,
  Trash2,
  Users,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { cn } from "../lib/utils";
import { ArchiveStudent, HistoricalTerm } from "../types";
import api from "../lib/api";
import {
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface Intervention {
  id: string;
  term: string;
  year: string;
  reason: string;
  action: string;
  outcome: string;
}

interface ScholasticArchiveStudent extends ArchiveStudent {
  firstName: string;
  lastName: string;
  indexNumber: string;
  archivedAt?: string;
  interventions: Intervention[];
  consistencyScore: "Steady" | "Volatile" | "Improving";
  percentileHistory: { term: string; percentile: number }[];
}

function getWAECGrade(score: number): string {
  if (score >= 80) return "A1";
  if (score >= 70) return "B2";
  if (score >= 65) return "B3";
  if (score >= 60) return "C4";
  if (score >= 55) return "C5";
  if (score >= 50) return "C6";
  if (score >= 45) return "D7";
  if (score >= 40) return "E8";
  return "F9";
}

type ArchiveSubTab = "VAULT" | "PROMOTION" | "MAINTENANCE";

export function ArchiveView() {
  const [activeSubTab, setActiveSubTab] =
    React.useState<ArchiveSubTab>("VAULT");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("2024/2025");
  const [selectedSubject, setSelectedSubject] =
    React.useState("Integrated Science");
  const [showCoreComparison, setShowCoreComparison] = React.useState(false);
  const [selectedStudent, setSelectedStudent] =
    React.useState<ScholasticArchiveStudent | null>(null);
  const [reportConfig, setReportConfig] = React.useState({
    range: "Full Journey",
    type: "Subject-Specific",
    concludingSummary: "",
  });
  const [vaultStudents, setVaultStudents] = React.useState<any[]>([]);
  const [isLoadingVault, setIsLoadingVault] = React.useState(false);
  const [vaultDetail, setVaultDetail] = React.useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);
  const [activeYear, setActiveYear] = React.useState<any>(null);
  const [readiness, setReadiness] = React.useState<any>(null);
  const [isLoadingPromotion, setIsLoadingPromotion] = React.useState(true);
  const [isAdvancingTerm, setIsAdvancingTerm] = React.useState(false);
  const [isPromoting, setIsPromoting] = React.useState(false);
  const [promotionResult, setPromotionResult] = React.useState<any>(null);
  const [showPromotionConfirm, setShowPromotionConfirm] = React.useState(false);
  const [showAdvanceConfirm, setShowAdvanceConfirm] = React.useState(false);

  //functions
  const fetchVault = React.useCallback(async () => {
    setIsLoadingVault(true);
    try {
      const res = await api.get("/archive/vault/search", {
        params: searchTerm ? { indexNumber: searchTerm } : {},
      });
      setVaultStudents(res.data);
    } catch (err) {
      console.error("Vault search failed", err);
      setVaultStudents([]);
    } finally {
      setIsLoadingVault(false);
    }
  }, [searchTerm]);

  React.useEffect(() => {
    if (activeSubTab === "VAULT" && !selectedStudent) {
      fetchVault();
    }
  }, [activeSubTab, selectedStudent, fetchVault]);

  // Debounced search
  React.useEffect(() => {
    if (activeSubTab !== "VAULT") return;
    const timer = setTimeout(() => fetchVault(), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPromotionData = React.useCallback(async () => {
    setIsLoadingPromotion(true);
    try {
      const yearRes = await api.get("/academic/years/active");
      setActiveYear(yearRes.data);

      if (yearRes.data?.id) {
        const readinessRes = await api.get(
          `/archive/promotion/readiness/${yearRes.data.id}`,
        );
        setReadiness(readinessRes.data);
      }
    } catch (err) {
      console.error("Failed to load promotion data", err);
    } finally {
      setIsLoadingPromotion(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeSubTab === "PROMOTION") {
      fetchPromotionData();
    }
  }, [activeSubTab, fetchPromotionData]);

  const currentTerm = activeYear?.terms?.find((t: any) => t.isActive);
  const isFinalTerm = currentTerm?.termNumber === "TERM_3";

  const handleAdvanceTerm = async () => {
    if (!currentTerm) return;
    setIsAdvancingTerm(true);
    try {
      const res = await api.patch(`/archive/terms/${currentTerm.id}/advance`);
      setShowAdvanceConfirm(false);
      await fetchPromotionData();
      alert(
        `Advanced from ${res.data.previousTerm.replace("TERM_", "Term ")} to ${res.data.newActiveTerm.replace("TERM_", "Term ")}`,
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to advance term");
    } finally {
      setIsAdvancingTerm(false);
    }
  };

  const handleExecutePromotion = async () => {
    if (!activeYear) return;
    setIsPromoting(true);
    try {
      const res = await api.post("/archive/promote", {
        academicYearId: activeYear.id,
      });
      setPromotionResult(res.data);
      setShowPromotionConfirm(false);
      await fetchPromotionData();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
          "Promotion failed. Ensure all terms are locked first.",
      );
    } finally {
      setIsPromoting(false);
    }
  };

  const terms = [
    "SHS 1-T1",
    "SHS 1-T2",
    "SHS 1-T3",
    "SHS 2-T1",
    "SHS 2-T2",
    "SHS 2-T3",
  ];
  const coreSubjects = [
    "Core Math",
    "English",
    "Int. Science",
    "Social Studies",
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#F0F4F2] relative">
      {/* Sub-Tab Selector */}
      <div className="bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-emerald-900 rounded-lg flex items-center justify-center text-white shadow-lg">
            <Database size={16} />
          </div>
          <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest font-sans">
            System Archives & Promotion
          </span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {[
            { id: "VAULT", label: "The Vault", icon: Database },
            { id: "PROMOTION", label: "Promotion Cycle", icon: GraduationCap },
            { id: "MAINTENANCE", label: "Maintenance", icon: RefreshCw },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as ArchiveSubTab)}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                activeSubTab === tab.id
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600",
              )}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Global Background Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none z-0">
        <h1 className="text-[25vw] font-black rotate-[-25deg] text-emerald-950 uppercase">
          OFFICIAL
        </h1>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {activeSubTab === "PROMOTION" && (
            <motion.div
              key="promotion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 p-10 overflow-y-auto"
            >
              <div className="max-w-5xl mx-auto space-y-10">
                {isLoadingPromotion ? (
                  <div className="flex items-center justify-center py-32">
                    <Loader2
                      size={40}
                      className="text-emerald-600 animate-spin"
                    />
                  </div>
                ) : !activeYear ? (
                  <div className="bg-white rounded-[2.5rem] border border-slate-200 p-16 text-center">
                    <AlertCircle
                      size={40}
                      className="text-rose-400 mx-auto mb-4"
                    />
                    <p className="text-sm font-bold text-slate-900">
                      No active academic year found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Set up an academic year first in Academic Architect
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Promotion result success state */}
                    {promotionResult ? (
                      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm text-center">
                        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-3xl font-black italic font-display text-slate-900 mb-2">
                          Promotion Complete
                        </h2>
                        <p className="text-slate-400 text-sm mb-10">
                          {promotionResult.academicYear}
                        </p>
                        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-10">
                          <div className="bg-slate-50 p-6 rounded-2xl">
                            <p className="text-3xl font-black text-slate-900">
                              {promotionResult.totalProcessed}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              Processed
                            </p>
                          </div>
                          <div className="bg-blue-50 p-6 rounded-2xl">
                            <p className="text-3xl font-black text-blue-600">
                              {promotionResult.promoted}
                            </p>
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">
                              Promoted
                            </p>
                          </div>
                          <div className="bg-emerald-50 p-6 rounded-2xl">
                            <p className="text-3xl font-black text-emerald-600">
                              {promotionResult.graduated}
                            </p>
                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">
                              Graduated
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setPromotionResult(null)}
                          className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <>
                        {/* Term Advancement Card */}
                        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12 opacity-5">
                            <ArrowRight
                              size={150}
                              className="text-emerald-950"
                            />
                          </div>
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                              <h2 className="text-2xl font-black italic font-display text-slate-900 tracking-tighter">
                                Term Advancement
                              </h2>
                              <span className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {activeYear.label}
                              </span>
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-2xl">
                              Move from one term to the next within the current
                              academic year. No students change class — only the
                              active grading window shifts.
                            </p>

                            <div className="mt-10 grid grid-cols-3 gap-4">
                              {activeYear.terms?.map((term: any) => (
                                <div
                                  key={term.id}
                                  className={cn(
                                    "p-6 rounded-2xl border-2 text-center transition-all",
                                    term.isActive
                                      ? "bg-emerald-50 border-emerald-300"
                                      : term.isLocked
                                        ? "bg-slate-50 border-slate-200"
                                        : "bg-white border-slate-100",
                                  )}
                                >
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                    {term.termNumber.replace("TERM_", "Term ")}
                                  </p>
                                  {term.isActive && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-700 uppercase">
                                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />{" "}
                                      Active
                                    </span>
                                  )}
                                  {term.isLocked && !term.isActive && (
                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase">
                                      <Lock size={10} /> Locked
                                    </span>
                                  )}
                                  {!term.isLocked && !term.isActive && (
                                    <span className="text-[10px] font-black text-slate-300 uppercase">
                                      Pending
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="mt-10 flex justify-center">
                              {isFinalTerm ? (
                                <p className="text-sm font-bold text-slate-400 italic">
                                  This is the final term. Use Year-End Promotion
                                  below once locked.
                                </p>
                              ) : (
                                <button
                                  onClick={() => setShowAdvanceConfirm(true)}
                                  disabled={!currentTerm?.isLocked}
                                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
                                >
                                  <ArrowRight size={16} />
                                  {currentTerm?.isLocked
                                    ? `Advance to ${activeYear.terms?.[activeYear.terms.findIndex((t: any) => t.isActive) + 1]?.termNumber.replace("TERM_", "Term ")}`
                                    : "Lock Current Term First"}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Year-End Promotion Card */}
                        <div className="bg-white rounded-[3rem] border border-slate-200 p-12 shadow-sm relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-12 opacity-5">
                            <GraduationCap
                              size={150}
                              className="text-emerald-950"
                            />
                          </div>
                          <div className="relative">
                            <h2 className="text-2xl font-black italic font-display text-slate-900 mb-4 tracking-tighter">
                              End-of-Year Promotion Cycle
                            </h2>
                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed max-w-2xl">
                              Promotes all students to their next form. Form 3
                              students are migrated to the Alumni archive (The
                              Vault).
                              <span className="block mt-2 text-rose-500 font-black">
                                Warning: This action is irreversible for the
                                current academic session.
                              </span>
                            </p>

                            {readiness && (
                              <div
                                className="mt-8 p-5 rounded-2xl border flex items-center gap-4"
                                style={{
                                  backgroundColor: readiness.isReady
                                    ? "rgb(236 253 245)"
                                    : "rgb(254 252 232)",
                                  borderColor: readiness.isReady
                                    ? "rgb(167 243 208)"
                                    : "rgb(254 240 138)",
                                }}
                              >
                                {readiness.isReady ? (
                                  <CheckCircle2
                                    size={20}
                                    className="text-emerald-600 shrink-0"
                                  />
                                ) : (
                                  <AlertCircle
                                    size={20}
                                    className="text-amber-500 shrink-0"
                                  />
                                )}
                                <p
                                  className={cn(
                                    "text-sm font-bold",
                                    readiness.isReady
                                      ? "text-emerald-700"
                                      : "text-amber-700",
                                  )}
                                >
                                  {readiness.isReady
                                    ? "All terms locked — ready to promote"
                                    : `${readiness.termsLocked} of ${readiness.termsTotal} terms locked. Lock all terms before promoting.`}
                                </p>
                              </div>
                            )}

                            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[
                                {
                                  title: "Form 1 → Form 2",
                                  count: `${readiness?.breakdown?.form1ToForm2 ?? 0} Students`,
                                  icon: Users,
                                  color: "emerald",
                                },
                                {
                                  title: "Form 2 → Form 3",
                                  count: `${readiness?.breakdown?.form2ToForm3 ?? 0} Students`,
                                  icon: Users,
                                  color: "blue",
                                },
                                {
                                  title: "Form 3 → Alumni",
                                  count: `${readiness?.breakdown?.form3ToAlumni ?? 0} Students`,
                                  icon: GraduationCap,
                                  color: "purple",
                                },
                              ].map((card, i) => (
                                <div
                                  key={i}
                                  className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center text-center"
                                >
                                  <div
                                    className={cn(
                                      "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white",
                                      card.color === "emerald"
                                        ? "bg-emerald-600"
                                        : card.color === "blue"
                                          ? "bg-blue-600"
                                          : "bg-purple-600",
                                    )}
                                  >
                                    <card.icon size={20} />
                                  </div>
                                  <p className="text-[14px] font-black text-slate-900 italic font-display">
                                    {card.title}
                                  </p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {card.count}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <div className="mt-12 flex justify-center">
                              <button
                                onClick={() => setShowPromotionConfirm(true)}
                                disabled={!readiness?.isReady}
                                className="px-12 py-5 bg-emerald-900 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                              >
                                <Zap size={20} className="text-amber-400" />
                                Execute Global Promotion
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Advance term confirmation */}
              <AnimatePresence>
                {showAdvanceConfirm && currentTerm && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                      onClick={() => setShowAdvanceConfirm(false)}
                    />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
                    >
                      <h3 className="text-xl font-black text-slate-900 mb-3">
                        Advance to Next Term?
                      </h3>
                      <p className="text-sm text-slate-500 mb-8">
                        This will deactivate{" "}
                        {currentTerm.termNumber.replace("TERM_", "Term ")} and
                        activate the next term. Teachers will then enter grades
                        for the new term.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowAdvanceConfirm(false)}
                          className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAdvanceTerm}
                          disabled={isAdvancingTerm}
                          className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isAdvancingTerm ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <ArrowRight size={14} />
                          )}
                          Confirm
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              {/* Execute promotion confirmation */}
              <AnimatePresence>
                {showPromotionConfirm && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                    <div
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                      onClick={() => setShowPromotionConfirm(false)}
                    />
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl"
                    >
                      <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                        <AlertCircle size={28} />
                      </div>
                      <h3 className="text-2xl font-black italic font-display text-slate-900 mb-3">
                        Confirm Global Promotion
                      </h3>
                      <p className="text-sm text-slate-500 mb-8">
                        This will promote{" "}
                        <strong>{readiness?.totalActiveStudents}</strong>{" "}
                        students. Form 3 students will be archived to the Alumni
                        Vault. This is irreversible.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowPromotionConfirm(false)}
                          className="flex-1 py-4 bg-slate-50 rounded-2xl text-xs font-black uppercase tracking-widest"
                        >
                          Abort
                        </button>
                        <button
                          onClick={handleExecutePromotion}
                          disabled={isPromoting}
                          className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {isPromoting ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Zap size={14} />
                          )}
                          Execute
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeSubTab === "MAINTENANCE" && (
            <motion.div
              key="maintenance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 p-10"
            >
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm">
                  <h3 className="text-xl font-black italic font-display text-slate-900 mb-8 font-sans">
                    Database Maintenance & Safety
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                          <RefreshCw size={18} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900 tracking-tight">
                            Regenerate Audit Hashes
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Ensures data integrity for all archived terms
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                        Execute
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white">
                          <Trash2 size={18} />
                        </div>
                        <div>
                          <p className="text-[12px] font-black text-slate-900 tracking-tight">
                            Purge Orphaned Records
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Deletes data for students not linked to any form
                          </p>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all">
                        Deep Clean
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === "VAULT" && !selectedStudent && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col min-w-0"
            >
              <header className="p-8 border-b border-gray-200 bg-white/40 backdrop-blur-xl shrink-0">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center text-emerald-100 shadow-2xl border border-emerald-800 rotate-3">
                      <Database size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-black text-gray-900 tracking-tighter">
                        The Vault
                      </h1>
                      <div className="flex items-center gap-3">
                        <p className="text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-100/50 px-2 py-0.5 rounded">
                          Historical Archive v4.2
                        </p>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                          Last Synced: Today 04:12 AM
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shadow-inner">
                      <button
                        onClick={() => setShowCoreComparison(false)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-xs font-black transition-all",
                          !showCoreComparison
                            ? "bg-white text-emerald-900 shadow-sm"
                            : "text-gray-400 hover:text-gray-600",
                        )}
                      >
                        Expert View
                      </button>
                    </div>
                    <button className="px-6 py-3 bg-emerald-900 text-white rounded-xl font-black text-sm hover:bg-emerald-950 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-2">
                      <FileText size={18} />
                      Bulk Progress Report
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 items-center">
                  {/* Subject Selector */}
                  {/* <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                    <Filter size={16} className="text-emerald-700" />
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="bg-transparent text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-4"
                    >
                      <option>Integrated Science</option>
                      <option>Elective Physics</option>
                      <option>Elective Chemistry</option>
                      <option>Elective Biology</option>
                    </select>
                  </div> */}

                  {/* Year Selector */}
                  {/* <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-sm">
                    <Calendar size={16} className="text-emerald-700" />
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-transparent text-sm font-black text-gray-900 focus:outline-none cursor-pointer pr-4"
                    >
                      <option>2024/2025</option>
                      <option>2023/2024</option>
                      <option>2022/2023</option>
                    </select>
                  </div> */}

                  <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex-1 min-w-[300px] relative h-12">
                      <Search
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        size={18}
                      />
                      <input
                        type="text"
                        placeholder="Lookup by index number, first or last name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-sm h-full"
                      />
                    </div>
                    <button
                      onClick={fetchVault}
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-2xl font-black text-xs hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Refresh
                    </button>
                  </div>
                </div>
              </header>

              {/* Comparison Grid */}
              <div className="flex-1 overflow-x-auto p-8 pt-4">
                {isLoadingVault ? (
                  <div className="flex items-center justify-center py-32">
                    <Loader2
                      size={40}
                      className="text-emerald-600 animate-spin"
                    />
                  </div>
                ) : vaultStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <Database size={48} className="text-slate-200 mb-4" />
                    <p className="text-sm font-bold text-slate-400">
                      No students found
                    </p>
                    <p className="text-xs text-slate-300 mt-1">
                      Try searching by index number, first or last name
                    </p>
                  </div>
                ) : (
                  <div className="min-w-max">
                    <table className="w-full border-separate border-spacing-y-4">
                      <thead>
                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                          <th className="px-6 py-4 text-left">
                            Student Identity
                          </th>
                          <th className="px-4 py-4 text-center border-x border-gray-100/50">
                            Class / Status
                          </th>
                          <th className="px-4 py-4 text-center border-x border-gray-100/50">
                            Report Cards
                          </th>
                          <th className="px-4 py-4 text-center border-x border-gray-100/50">
                            Grade Entries
                          </th>
                          <th className="px-6 py-4 text-right">Aggregate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vaultStudents.map((student) => {
                          const allScores =
                            student.grades
                              ?.map((g: any) => g.totalScore)
                              .filter(Boolean) ?? [];
                          const avg =
                            allScores.length > 0
                              ? allScores.reduce(
                                  (a: number, b: number) => a + b,
                                  0,
                                ) / allScores.length
                              : 0;

                          return (
                            <motion.tr
                              key={student.id}
                              layoutId={student.id}
                              onClick={async () => {
                                setIsLoadingDetail(true);
                                setSelectedStudent(student);
                                try {
                                  const res = await api.get(
                                    `/users/students/${student.id}`,
                                  );
                                  setVaultDetail(res.data);
                                } catch {
                                  setVaultDetail(student);
                                } finally {
                                  setIsLoadingDetail(false);
                                }
                              }}
                              whileHover={{ scale: 1.002, x: 4 }}
                              className="group cursor-pointer"
                            >
                              <td className="bg-white/40 backdrop-blur-md px-6 py-5 rounded-l-[1.5rem] border-y border-l border-gray-200 shadow-sm group-hover:bg-white transition-all sticky left-0 z-20">
                                <div className="flex items-center gap-4">
                                  <img
                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.firstName}${student.lastName}`}
                                    alt={student.firstName}
                                    className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm grayscale group-hover:grayscale-0 transition-all"
                                  />
                                  <div>
                                    <p className="text-sm font-black text-gray-900 tracking-tight">
                                      {student.firstName} {student.lastName}
                                    </p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase font-mono">
                                      {student.indexNumber}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="bg-white/30 backdrop-blur-[2px] px-6 py-5 border-y border-x border-gray-100/50 text-center">
                                <span
                                  className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                    student.archivedAt
                                      ? "bg-purple-50 text-purple-700"
                                      : "bg-emerald-50 text-emerald-700",
                                  )}
                                >
                                  {student.archivedAt
                                    ? "Alumni"
                                    : student.currentClass?.level?.replace(
                                        "FORM_",
                                        "Form ",
                                      ) +
                                        " " +
                                        student.currentClass?.name || "—"}
                                </span>
                              </td>
                              <td className="bg-white/30 backdrop-blur-[2px] px-6 py-5 border-y border-x border-gray-100/50 text-center">
                                <span className="text-sm font-black text-gray-700">
                                  {student.reportCards?.length ?? 0}
                                </span>
                              </td>
                              <td className="bg-white/30 backdrop-blur-[2px] px-6 py-5 border-y border-x border-gray-100/50 text-center">
                                <span className="text-sm font-black text-gray-700">
                                  {student.grades?.length ?? 0}
                                </span>
                              </td>
                              <td className="bg-emerald-900 px-8 py-5 rounded-r-[1.5rem] border-y border-r border-emerald-950 shadow-xl group-hover:bg-emerald-950 transition-all text-right">
                                <p className="text-[10px] font-black text-emerald-300/50 uppercase mb-1">
                                  Avg
                                </p>
                                <p className="text-xl font-black text-white italic">
                                  {avg > 0 ? `${avg.toFixed(1)}%` : "—"}
                                </p>
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeSubTab === "VAULT" && selectedStudent && (
            <motion.div
              key="report"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 overflow-hidden flex flex-col items-center bg-white z-10 w-full"
            >
              <div className="w-full max-w-7xl mt-6 pb-6 flex flex-col md:flex-row items-center justify-between border-b border-gray-100 px-6 lg:px-8 gap-4 mx-auto">
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 italic">
                    <ShieldCheck size={14} />
                    Index: {selectedStudent.indexNumber}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 justify-center md:justify-end">
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setVaultDetail(null);
                    }}
                    className="px-6 py-2 bg-gray-100 text-gray-500 rounded-xl text-xs font-black hover:bg-gray-200 transition-all uppercase tracking-widest"
                  >
                    Return
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-emerald-900 text-white rounded-xl text-xs font-black hover:bg-emerald-950 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    <Printer size={16} />
                    Print Transcript
                  </button>
                </div>
              </div>

              {isLoadingDetail ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2
                    size={40}
                    className="text-emerald-600 animate-spin"
                  />
                </div>
              ) : (
                <div className="flex-1 w-full max-w-7xl overflow-y-auto no-scrollbar relative p-6 lg:p-16 mx-auto">
                  {/* Report Header & Bio */}
                  <div className="flex flex-col md:justify-between md:flex-row md:items-start mb-16 gap-8">
                    <div className="flex flex-col items-center md:flex-row md:items-center gap-8 text-center md:text-left">
                      <div className="relative">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedStudent.firstName}${selectedStudent.lastName}`}
                          alt={selectedStudent.firstName}
                          className="w-28 h-28 rounded-3xl bg-gray-50 p-1 border-4 border-white shadow-2xl"
                        />
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-900 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-900/20">
                          <User size={20} />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2 italic">
                          {selectedStudent.firstName} {selectedStudent.lastName}
                        </h2>
                        <p className="text-emerald-800 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs">
                          Scholastic Longitudinal Portfolio
                        </p>
                        <div className="flex flex-wrap gap-2 md:gap-3 mt-4 justify-center md:justify-start">
                          <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            ID: {selectedStudent.indexNumber}
                          </span>
                          {selectedStudent.archivedAt && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-[10px] font-black uppercase tracking-widest">
                              Alumni
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right flex flex-col items-center md:items-end">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                        Generated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Terminal Performance Breakdown — grouped by term */}
                  <section className="mb-20">
                    <header className="flex items-center gap-3 mb-10 border-b-2 border-emerald-900 pb-2">
                      <Database size={24} className="text-emerald-900" />
                      <h3 className="text-lg font-black text-emerald-950 uppercase tracking-[0.1em]">
                        Terminal Performance Breakdown
                      </h3>
                    </header>

                    {(() => {
                      const grades = vaultDetail?.grades ?? [];
                      const byTerm = new Map<string, any[]>();
                      grades.forEach((g: any) => {
                        const key = `${g.term?.academicYear?.label ?? ""} · ${g.term?.termNumber?.replace("TERM_", "Term ") ?? ""}`;
                        if (!byTerm.has(key)) byTerm.set(key, []);
                        byTerm.get(key)!.push(g);
                      });

                      if (byTerm.size === 0) {
                        return (
                          <div className="bg-slate-50 rounded-3xl p-16 text-center border border-slate-100">
                            <FileText
                              size={40}
                              className="text-slate-200 mx-auto mb-4"
                            />
                            <p className="text-sm font-bold text-slate-400">
                              No graded terms on record yet
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 gap-y-16">
                          {Array.from(byTerm.entries()).map(
                            ([termLabel, termGrades], tIdx) => (
                              <div
                                key={termLabel}
                                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                              >
                                <div className="bg-gray-50/80 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
                                      {tIdx + 1}
                                    </div>
                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest italic">
                                      {termLabel}
                                    </h4>
                                  </div>
                                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-4 py-1.5 rounded-full uppercase tracking-widest italic">
                                    Official Record
                                  </span>
                                </div>
                                <div className="p-4 overflow-x-auto no-scrollbar">
                                  <table className="w-full text-left min-w-[600px]">
                                    <thead>
                                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                                        <th className="py-4 pl-6">
                                          Subject Title
                                        </th>
                                        <th className="py-4 text-center">
                                          Class (30)
                                        </th>
                                        <th className="py-4 text-center">
                                          Exam (70)
                                        </th>
                                        <th className="py-4 text-center">
                                          Grade
                                        </th>
                                        <th className="py-4 text-right pr-6 italic">
                                          Total (%)
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                      {termGrades.map((g: any) => (
                                        <tr
                                          key={g.id}
                                          className="group hover:bg-emerald-50/20 transition-all"
                                        >
                                          <td className="py-5 pl-6">
                                            <p className="text-sm font-black text-gray-900 italic tracking-tight">
                                              {g.subject?.name ?? "—"}
                                            </p>
                                          </td>
                                          <td className="py-5 text-center">
                                            <span className="text-sm font-bold text-gray-600 font-mono italic">
                                              {g.classScore ?? "—"}
                                            </span>
                                          </td>
                                          <td className="py-5 text-center">
                                            <span className="text-sm font-bold text-gray-600 font-mono italic">
                                              {g.examScore ?? "—"}
                                            </span>
                                          </td>
                                          <td className="py-5 text-center">
                                            <span
                                              className={cn(
                                                "px-3 py-1 rounded-lg text-xs font-black",
                                                (g.totalScore ?? 0) >= 70
                                                  ? "bg-emerald-100 text-emerald-900"
                                                  : (g.totalScore ?? 0) >= 50
                                                    ? "bg-amber-100 text-amber-900"
                                                    : "bg-red-100 text-red-900",
                                              )}
                                            >
                                              {g.grade ??
                                                getWAECGrade(g.totalScore ?? 0)}
                                            </span>
                                          </td>
                                          <td className="py-5 text-right pr-6">
                                            <span className="text-lg font-black italic tracking-tighter font-mono text-gray-900">
                                              {g.totalScore?.toFixed(1) ?? "—"}%
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      );
                    })()}

                    {/* Summary Widgets */}
                    {(() => {
                      const grades = vaultDetail?.grades ?? [];
                      const scores = grades
                        .map((g: any) => g.totalScore)
                        .filter(Boolean);
                      const gpa =
                        scores.length > 0
                          ? scores.reduce((a: number, b: number) => a + b, 0) /
                            scores.length
                          : 0;

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                          <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50">
                            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                              Cumulative Average
                            </p>
                            <p className="text-3xl font-black text-emerald-900 italic tracking-tighter">
                              {gpa > 0 ? `${gpa.toFixed(1)}%` : "—"}
                            </p>
                          </div>
                          <div className="bg-emerald-50/30 p-8 rounded-3xl border border-emerald-100/50">
                            <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">
                              Report Cards on File
                            </p>
                            <p className="text-3xl font-black text-emerald-900 italic tracking-tighter">
                              {vaultDetail?.reportCards?.length ?? 0}
                            </p>
                          </div>
                          <div className="bg-emerald-900 p-8 rounded-3xl border border-emerald-800 text-white shadow-2xl">
                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                              Status
                            </p>
                            <p className="text-lg font-black italic tracking-tighter">
                              {selectedStudent.archivedAt
                                ? "Alumni (Archived)"
                                : "Active Student"}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </section>

                  {/* Performance Trajectory */}
                  {(vaultDetail?.reportCards?.length ?? 0) > 0 && (
                    <div className="grid grid-cols-1 gap-12 mb-20">
                      <section>
                        <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
                          <TrendingUp size={24} className="text-emerald-900" />
                          <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">
                            Longitudinal Performance Trajectory
                          </h3>
                        </header>
                        <div className="bg-gray-50/50 p-12 rounded-[3rem] border border-gray-100 h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={[...vaultDetail.reportCards]
                                .sort((a: any, b: any) =>
                                  a.term.academicYear.label.localeCompare(
                                    b.term.academicYear.label,
                                  ),
                                )
                                .map((rc: any) => ({
                                  term: `${rc.term.academicYear.label} T${rc.term.termNumber.replace("TERM_", "")}`,
                                  finalGrade: rc.averageScore,
                                }))}
                            >
                              <defs>
                                <linearGradient
                                  id="subScreenTrend"
                                  x1="0"
                                  y1="0"
                                  x2="0"
                                  y2="1"
                                >
                                  <stop
                                    offset="5%"
                                    stopColor="#065F46"
                                    stopOpacity={0.2}
                                  />
                                  <stop
                                    offset="95%"
                                    stopColor="#065F46"
                                    stopOpacity={0}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                strokeDasharray="5 5"
                                vertical={false}
                                stroke="#e5e7eb"
                              />
                              <XAxis
                                dataKey="term"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 10,
                                  fontWeight: 900,
                                  fill: "#9ca3af",
                                }}
                                dy={10}
                              />
                              <YAxis
                                domain={[0, 100]}
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                  fontSize: 10,
                                  fontWeight: 900,
                                  fill: "#9ca3af",
                                }}
                              />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="finalGrade"
                                stroke="#065F46"
                                strokeWidth={6}
                                fillOpacity={1}
                                fill="url(#subScreenTrend)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </section>
                    </div>
                  )}

                  {/* Promotion history */}
                  {(vaultDetail?.promotions?.length ?? 0) > 0 && (
                    <section className="mb-20">
                      <header className="flex items-center gap-3 mb-8 border-b-2 border-emerald-900 pb-2">
                        <History size={24} className="text-emerald-900" />
                        <h3 className="text-sm font-black text-emerald-950 uppercase tracking-[0.1em]">
                          Promotion History
                        </h3>
                      </header>
                      <div className="space-y-4">
                        {vaultDetail.promotions.map((p: any) => (
                          <div
                            key={p.id}
                            className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center justify-between"
                          >
                            <div>
                              <p className="text-sm font-black text-gray-900">
                                {p.academicYear?.label}
                              </p>
                              <p className="text-xs font-bold text-gray-400 mt-1">
                                {p.fromClass?.replace("FORM_", "Form ")} →{" "}
                                {p.toClass?.replace("FORM_", "Form ") ??
                                  "Graduated"}
                              </p>
                            </div>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-lg text-[10px] font-black uppercase",
                                p.status === "GRADUATED"
                                  ? "bg-purple-50 text-purple-700"
                                  : "bg-emerald-50 text-emerald-700",
                              )}
                            >
                              {p.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
