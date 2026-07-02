import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, User, Clock, ArrowRight,
  RefreshCw, Loader2, AlertCircle, Filter,
  Download, Search, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { downloadCSV } from '../lib/csv';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  payload: any;
  ipAddress?: string;
  createdAt: string;
  user: {
    email: string;
    role: string;
    staffProfile?: {
      firstName: string;
      lastName: string;
      staffId: string;
    };
  };
}

const ACTION_STYLES: Record<string, string> = {
  CREATE: 'bg-blue-50 text-blue-700',
  UPDATE: 'bg-amber-50 text-amber-700',
  DELETE: 'bg-rose-50 text-rose-600',
  LOCK: 'bg-emerald-50 text-emerald-700',
  UNLOCK: 'bg-orange-50 text-orange-600',
  PROMOTE: 'bg-purple-50 text-purple-700',
  GRADE_CORRECTION: 'bg-indigo-50 text-indigo-700',
};

const ENTITIES = ['GradeEntry', 'Term', 'Student', 'StaffProfile', 'ReportCard', 'TeachingAssignment'];
const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'LOCK', 'UNLOCK', 'PROMOTE', 'GRADE_CORRECTION'];

// ─── Payload Delta renderer ───────────────────────────────────────────────────

function PayloadDelta({ action, payload }: { action: string; payload: any }) {
  if (!payload) return <span className="text-[10px] text-slate-300 font-bold">—</span>;

  if (action === 'UPDATE' && payload.before !== undefined && payload.after !== undefined) {
    return (
      <div className="flex items-center gap-2 text-[11px] font-black">
        <span className="text-slate-300 line-through">{String(payload.before)}</span>
        <ArrowRight size={10} className="text-slate-300" />
        <span className="text-emerald-600">{String(payload.after)}</span>
      </div>
    );
  }

  if (action === 'GRADE_CORRECTION') {
    return (
      <div className="text-[10px] font-bold text-slate-500">
        <span className="font-black text-slate-700">{payload.fieldChanged}</span>:&nbsp;
        <span className="line-through text-slate-300">{payload.oldValue}</span>
        &nbsp;→&nbsp;
        <span className="text-emerald-600">{payload.newValue}</span>
      </div>
    );
  }

  if (action === 'LOCK' || action === 'UNLOCK') {
    return (
      <span className={cn('text-[10px] font-black px-2 py-0.5 rounded-lg', action === 'LOCK' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700')}>
        {payload.reason ?? action}
      </span>
    );
  }

  if (action === 'PROMOTE') {
    return (
      <span className="text-[10px] font-bold text-slate-500">
        {payload.from} → {payload.to ?? 'Graduated'}
      </span>
    );
  }

  // Generic: show key count
  const keys = Object.keys(payload).length;
  return <span className="text-[10px] text-slate-400 font-bold">{keys} field{keys !== 1 ? 's' : ''}</span>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AuditLogsView() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: any = { take: 100 };
      if (entityFilter) params.entity = entityFilter;
      if (actionFilter) params.action = actionFilter;
      const res = await api.get('/academic/audit-logs', { params });
      setLogs(res.data);
    } catch (err: any) {
      setError('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [entityFilter, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (!search) return true;
    const q = search.toLowerCase();
    const staffName = log.user.staffProfile
      ? `${log.user.staffProfile.firstName} ${log.user.staffProfile.lastName}`.toLowerCase()
      : log.user.email.toLowerCase();
    return (
      staffName.includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.entityId.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    const rows = filteredLogs.map(log => ({
      timestamp: new Date(log.createdAt).toLocaleString(),
      user: log.user.staffProfile
        ? `${log.user.staffProfile.firstName} ${log.user.staffProfile.lastName} (${log.user.staffProfile.staffId})`
        : log.user.email,
      role: log.user.role,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      payload: JSON.stringify(log.payload ?? {}),
      ipAddress: log.ipAddress ?? '',
    }));
    downloadCSV(`audit_log_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-GB', {
      day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const staffName = (log: AuditLog) =>
    log.user.staffProfile
      ? `${log.user.staffProfile.firstName} ${log.user.staffProfile.lastName}`
      : log.user.email.split('@')[0];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">
                Audit Repository
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {filteredLogs.length} entries
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchLogs}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                showFilters ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 text-slate-500 hover:bg-slate-50'
              )}
            >
              <Filter size={14} /> Filters
              {(entityFilter || actionFilter) && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-900/10"
            >
              <Download size={14} /> Export
            </button>
          </div>
        </header>

        {/* Search + Filter bar */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user, entity, or action..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none focus:border-emerald-500 shadow-sm"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-lg">
                <X size={14} className="text-slate-400" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-3 flex-wrap">
                  <select
                    value={entityFilter}
                    onChange={e => setEntityFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-widest outline-none"
                  >
                    <option value="">All Entities</option>
                    {ENTITIES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>

                  <select
                    value={actionFilter}
                    onChange={e => setActionFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-black uppercase tracking-widest outline-none"
                  >
                    <option value="">All Actions</option>
                    {ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>

                  {(entityFilter || actionFilter) && (
                    <button
                      onClick={() => { setEntityFilter(''); setActionFilter(''); }}
                      className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100">
            <div className="text-center">
              <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">Loading audit trail...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100">
            <div className="text-center">
              <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-900 mb-2">{error}</p>
              <button onClick={fetchLogs} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Retry
              </button>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center py-32 bg-white rounded-[2.5rem] border border-gray-100">
            <div className="text-center">
              <ShieldCheck size={40} className="text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">No audit entries found</p>
              {(search || entityFilter || actionFilter) && (
                <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 border-b border-gray-100">
                  {['Timestamp', 'Custodian', 'Entity', 'Action', 'Delta', 'Details'].map(h => (
                    <th key={h} className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredLogs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                    >
                      {/* Timestamp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 whitespace-nowrap">
                          <Clock size={12} className="opacity-40" />
                          {formatTime(log.createdAt)}
                        </div>
                      </td>

                      {/* Custodian */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                            <User size={12} />
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-gray-900 tracking-tight whitespace-nowrap">
                              {staffName(log)}
                            </p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">
                              {log.user.role.replace('_', ' ')}
                              {log.user.staffProfile && ` · ${log.user.staffProfile.staffId}`}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Entity */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-[12px] font-black text-gray-900">{log.entity}</p>
                          <p className="text-[9px] font-mono text-slate-300 truncate max-w-[120px]">{log.entityId}</p>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4">
                        <span className={cn(
                          'px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest',
                          ACTION_STYLES[log.action] ?? 'bg-slate-50 text-slate-600'
                        )}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Delta */}
                      <td className="px-6 py-4">
                        <PayloadDelta action={log.action} payload={log.payload} />
                      </td>

                      {/* Expand toggle */}
                      <td className="px-6 py-4">
                        <ChevronDown
                          size={14}
                          className={cn('text-slate-300 transition-transform', expandedId === log.id && 'rotate-180')}
                        />
                      </td>
                    </tr>

                    {/* Expanded payload row */}
                    <AnimatePresence>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-expanded`}>
                          <td colSpan={6} className="px-6 pb-4 pt-0 bg-slate-50/50">
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="bg-white rounded-2xl border border-slate-100 p-4 mt-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Full Payload</p>
                                <pre className="text-[11px] font-mono text-slate-600 whitespace-pre-wrap break-all">
                                  {JSON.stringify(log.payload, null, 2)}
                                </pre>
                                {log.ipAddress && (
                                  <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-3">
                                    IP: {log.ipAddress}
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}