import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Settings, 
  Database, 
  ShieldAlert, 
  Search, 
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Server,
  Activity,
  Lock,
  Globe,
  Cpu,
  RefreshCw,
  HardDrive,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { useRole } from '../context/RoleContext';

interface BackendUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  staffProfile?: { firstName: string, lastName: string, department?: { name: string } };
  studentProfile?: { firstName: string, lastName: string, currentClass?: { name: string } };
}

const tabs = [
  { id: 'registry', label: 'Command Registry', icon: Users },
  { id: 'infrastructure', label: 'Infrastructure Hub', icon: Server },
  { id: 'protocols', label: 'Institutional Protocols', icon: Globe },
];

export function AdminManagement() {
  const { user: currentUser } = useRole();
  const [activeTab, setActiveTab] = useState('registry');
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all staff and students to build a user registry
      const [staffRes, studentsRes] = await Promise.all([
        api.get('/users/staff'),
        api.get('/users/students')
      ]);
      
      const combined = [
        ...staffRes.data.map((s: any) => ({ ...s.user, profile: s, type: 'STAFF' })),
        ...studentsRes.data.map((s: any) => ({ ...s.user, profile: s, type: 'STUDENT' }))
      ];
      
      setUsers(combined);
    } catch (err) {
      setError('Failed to load user registry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = users.filter(u => {
    const name = `${u.profile?.firstName} ${u.profile?.lastName}`.toLowerCase();
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const renderRegistry = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search institutional nodes..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-[11px] font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/5 w-72 transition-all"
              />
            </div>
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
              {['ALL', 'TEACHER', 'HOD', 'STUDENT'].map((role) => (
                <button 
                  key={role} 
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    selectedRole === role ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-900"
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/10 border-b border-gray-50 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Verified Identity</th>
                <th className="px-8 py-5">Authorization</th>
                <th className="px-8 py-5">Department / Class</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                        {u.profile?.firstName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-gray-900 tracking-tight leading-none mb-1">
                          {u.profile?.firstName} {u.profile?.lastName}
                        </p>
                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em]",
                      u.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700' :
                      u.role === 'HOD' ? 'bg-blue-50 text-blue-700' :
                      u.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-400'
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <span className="text-[11px] font-black text-gray-900 uppercase tracking-widest">
                      {u.profile?.department?.name || u.profile?.currentClass?.name || '—'}
                    </span>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full", u.isActive ? "bg-emerald-500" : "bg-gray-300")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", u.isActive ? "text-emerald-600" : "text-gray-400")}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <button className="p-2 text-gray-300 hover:text-gray-900"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9F9F7] p-6 lg:p-12 pb-32 lg:pb-24">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-950 rounded-2xl flex items-center justify-center text-white shadow-2xl">
              <ShieldAlert size={32} />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[38px] font-black text-gray-900 tracking-tighter leading-none italic font-display uppercase">Architectural Oversight</h1>
              <p className="text-[11px] font-black text-emerald-800 uppercase tracking-[0.25em] mt-2">Centralized Command Hub for System Governance</p>
            </div>
          </div>
          <div className="flex p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all",
                  activeTab === tab.id ? "bg-emerald-950 text-white shadow-xl" : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <tab.icon size={16} /><span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }}>
            {activeTab === 'registry' && renderRegistry()}
            {activeTab !== 'registry' && (
              <div className="py-20 text-center bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <Settings size={40} className="text-gray-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Protocol Panel Under Construction</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
