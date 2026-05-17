import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  Shield, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Calendar,
  User,
  Terminal,
  Cpu,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

type LogSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
type LogCategory = 'AUTH' | 'ACADEMIC' | 'SYSTEM' | 'SECURITY' | 'SUPPORT';

interface SystemLog {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  category: LogCategory;
  event: string;
  user: string;
  ipAddress: string;
  userAgent: string;
  metadata: any;
}

const MOCK_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'L-001',
    timestamp: new Date().toISOString(),
    severity: 'INFO',
    category: 'AUTH',
    event: 'Successful Admin Login via MFA',
    user: 'immanuel.eshun@school.edu',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    metadata: { method: 'Google OAuth', location: 'Accra, GH' }
  },
  {
    id: 'L-002',
    timestamp: new Date(Date.now() - 500000).toISOString(),
    severity: 'WARNING',
    category: 'SECURITY',
    event: 'Multiple Failed Login Attempts Detected',
    user: 'unknown.user@external.com',
    ipAddress: '45.12.33.109',
    userAgent: 'Python-requests/2.25.1', 
    metadata: { count: 15, target: 'admin_portal' }
  },
  {
    id: 'L-003',
    timestamp: new Date(Date.now() - 1200000).toISOString(),
    severity: 'ERROR',
    category: 'SYSTEM',
    event: 'Database Sync Failure: Node #14',
    user: 'System Process',
    ipAddress: '127.0.0.1',
    userAgent: 'Internal Node Poller v2.0',
    metadata: { error: 'Connection Timeout', retry_count: 3 }
  },
  {
    id: 'L-004',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    severity: 'CRITICAL',
    category: 'SECURITY',
    event: 'Unauthorised API Access Attempt in Vault',
    user: 'guest_user_99',
    ipAddress: '103.44.1.22',
    userAgent: 'CURL/7.64.1',
    metadata: { endpoint: '/api/v1/vault/keys', payload_size: '1.2MB' }
  },
  {
    id: 'L-005',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    severity: 'INFO',
    category: 'ACADEMIC',
    event: 'Bulk Grade Export - SHS 3 Science',
    user: 'Mr. Hackman',
    ipAddress: '192.168.1.12',
    userAgent: 'Chrome 120.0.0.0',
    metadata: { file_name: 'results_shs3_sci.csv', records: 450 }
  }
];

export const ExtendedLogsView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<LogSeverity | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'ALL'>('ALL');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const filteredLogs = useMemo(() => {
    return MOCK_SYSTEM_LOGS.filter(log => {
      const matchesSearch = log.event.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            log.user.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      const matchesCategory = selectedCategory === 'ALL' || log.category === selectedCategory;
      return matchesSearch && matchesSeverity && matchesCategory;
    });
  }, [searchQuery, selectedSeverity, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getSeverityStyle = (severity: LogSeverity) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'ERROR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'WARNING': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'INFO': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getCategoryIcon = (category: LogCategory) => {
    switch (category) {
      case 'AUTH': return <Shield size={14} />;
      case 'SECURITY': return <AlertTriangle size={14} />;
      case 'ACADEMIC': return <Activity size={14} />;
      case 'SYSTEM': return <Cpu size={14} />;
      case 'SUPPORT': return <Terminal size={14} />;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* Header */}
      <header className="px-8 py-10 bg-white border-b border-slate-200/60 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-slate-900/20">
              <Activity size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-black italic font-display text-slate-900 tracking-tight">
                Extended System Logs
              </h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">
                Institutional Operational Intelligence & Forensics
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-900 border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
              <Download size={14} />
              Export Archive
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-black transition-all">
              <Calendar size={14} />
              Temporal Shift
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-8 py-6 bg-slate-50/50 backdrop-blur-md border-b border-slate-200/40 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-black font-mono" size={18} />
            <input 
              type="text" 
              placeholder="Search Events, Users, or Identifiers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-[13px] font-bold text-slate-600 outline-none focus:ring-4 focus:ring-slate-900/5 transition-all shadow-sm"
            />
          </div>

          <div className="relative group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value as any)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">All Severities</option>
              <option value="INFO">Information</option>
              <option value="WARNING">Warning</option>
              <option value="ERROR">Error</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="relative group">
            <Terminal className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer shadow-sm"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH">Authentication</option>
              <option value="SECURITY">Security Ops</option>
              <option value="ACADEMIC">Academic Logic</option>
              <option value="SYSTEM">System Process</option>
              <option value="SUPPORT">ICT Support</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-4 pb-20">
          {filteredLogs.length > 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 uppercase">
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Timestamp</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Severity</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Category</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Event Narrative</th>
                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 tracking-widest">Actor</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={cn(
                          "hover:bg-slate-50/80 transition-all cursor-pointer group",
                          expandedLogId === log.id && "bg-slate-50/50"
                        )}
                        onClick={() => toggleExpand(log.id)}
                      >
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-[12px] font-black text-slate-900 tracking-tighter">
                              {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                              {format(new Date(log.timestamp), 'MMM d, yyyy')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            getSeverityStyle(log.severity)
                          )}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            {getCategoryIcon(log.category)}
                            <span className="text-[10px] font-black uppercase tracking-widest">
                              {log.category}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-[13px] font-bold text-slate-800 tracking-tight leading-none">
                            {log.event}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center">
                              <User size={12} className="text-slate-400" />
                            </div>
                            <span className="text-[11px] font-black text-slate-600 truncate max-w-[120px]">
                              {log.user}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {expandedLogId === log.id ? (
                            <ChevronUp className="text-slate-400" size={16} />
                          ) : (
                            <ChevronDown className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                          )}
                        </td>
                      </tr>
                      
                      <AnimatePresence>
                        {expandedLogId === log.id && (
                          <tr>
                            <td colSpan={6} className="px-8 py-0">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden border-b border-slate-100"
                              >
                                <div className="py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Source Identification</h4>
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[11px] border-b border-dashed border-slate-100 pb-2">
                                          <span className="font-bold text-slate-400">IP Address</span>
                                          <span className="font-black text-slate-900 font-mono">{log.ipAddress}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] border-b border-dashed border-slate-100 pb-2">
                                          <span className="font-bold text-slate-400">Identity ID</span>
                                          <span className="font-black text-slate-900 font-mono">{log.id}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] pt-1">
                                          <span className="font-bold text-slate-400">Authentication</span>
                                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black tracking-widest border border-emerald-100">VERIFIED</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Hardware/Software Context</h4>
                                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                        <div className="flex items-start gap-4">
                                          <Globe size={16} className="text-slate-400 mt-1" />
                                          <div>
                                            <p className="text-[11px] font-black text-slate-900 leading-tight">User Agent Proxy</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed break-all font-mono">{log.userAgent}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    <div>
                                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Event Meta-Payload</h4>
                                      <div className="bg-slate-900 text-emerald-400 p-6 rounded-[1.5rem] font-mono text-[10px] overflow-x-auto shadow-xl">
                                        <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="md:col-span-3 flex justify-end gap-3 pt-4">
                                    <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all">
                                      Copy Evidence URI
                                    </button>
                                    <button className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-black transition-all flex items-center gap-2">
                                      Audit Dossier
                                      <ExternalLink size={12} />
                                    </button>
                                  </div>
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
          ) : (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                <Info size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900 italic font-display">No logs found in the selected range</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 px-12">
                Adjust your search parameters or temporal filters to view system activity
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
