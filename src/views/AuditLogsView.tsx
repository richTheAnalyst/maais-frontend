import React from 'react';
import { ShieldCheck, User, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const auditLogs = [
  {
    id: '1',
    studentName: 'Angela Efia Owusu',
    subject: 'General Agric',
    action: 'UPDATE',
    oldValue: 45,
    newValue: 85,
    justification: 'Error in practical sheet entry - re-evaluated after review.',
    userId: 'Mr. Hackman',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    studentName: 'Kofi Mensah',
    subject: 'Core Math',
    action: 'LOCK',
    justification: 'Term results finalized by HOD.',
    userId: 'HOD Martha Baah',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '3',
    studentName: 'Yaw Boateng',
    subject: 'English',
    action: 'CREATE',
    newValue: 72,
    justification: 'Initial mark entry.',
    userId: 'Mr. Hackman',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  }
];

export function AuditLogsView() {
  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <header className="mb-10 flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-gray-900/10">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[34px] font-black text-gray-900 tracking-tighter leading-none italic font-display italic uppercase italic">Audit Repository</h1>
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mt-1">Mandatory cryptographically verifiable modification log</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-gray-900 transition-all shadow-sm">
              Export Registry
            </button>
            <button className="px-5 py-2.5 bg-emerald-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-emerald-900/10">
              Filter Nodes
            </button>
          </div>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 border-b border-gray-100">
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Timestamp</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Custodian</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Biological Node</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Action Protocol</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Delta</th>
                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                      <Clock size={12} className="opacity-40" />
                      {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors">
                        <User size={12} />
                      </div>
                      <span className="text-[12px] font-black text-gray-900 tracking-tight">{log.userId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[12px] font-black text-gray-900 tracking-tight">{log.studentName}</span>
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none mt-0.5">{log.subject}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                      log.action === 'UPDATE' ? 'bg-amber-50 text-amber-700' :
                      log.action === 'LOCK' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.action === 'UPDATE' ? (
                      <div className="flex items-center gap-2 text-[11px] font-black">
                        <span className="text-gray-300 line-through">{log.oldValue}</span>
                        <ArrowRight size={12} className="text-gray-200" />
                        <span className="text-emerald-600">{log.newValue}</span>
                      </div>
                    ) : log.action === 'CREATE' ? (
                      <span className="text-[11px] font-black text-emerald-600">{log.newValue}</span>
                    ) : (
                      <span className="text-[10px] text-gray-200 font-bold tracking-widest">NONE</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-2 max-w-xs">
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic opacity-70 group-hover:opacity-100 transition-opacity italic">
                        "{log.justification}"
                      </p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
