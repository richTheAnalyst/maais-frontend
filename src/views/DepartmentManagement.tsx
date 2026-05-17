import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  Users, 
  ShieldCheck, 
  ChevronRight, 
  Plus, 
  Search, 
  MoreVertical,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  X,
  Crown,
  Lock,
  RotateCcw,
  FileText,
  PieChart,
  Settings2,
  Download,
  ChevronLeft,
  FileUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { useRole } from '../context/RoleContext';

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  user: { role: string };
}

interface BackendDepartment {
  id: string;
  name: string;
  code: string;
  description: string;
  staff: any[];
  subjects: any[];
  _count?: { staff: number; subjects: number; students: number };
}

export function DepartmentManagement() {
  const { user } = useRole();
  const [departments, setDepartments] = useState<BackendDepartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'staff' | 'grading' | 'vault'>('staff');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [assigningHOD, setAssigningHOD] = useState<{ staffId: string, staffName: string, deptId: string, deptName: string } | null>(null);
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const [activeOperation, setActiveOperation] = useState<{ type: string, staffName: string, staffId: string } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/academic/departments');
      setDepartments(res.data);
    } catch (err: any) {
      setError('Failed to load departmental hierarchy');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const selectedDept = departments.find(d => d.id === selectedDeptId);

  const toggleKebab = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenKebabId(openKebabId === id ? null : id);
  };

  useEffect(() => {
    const closeMenu = () => setOpenKebabId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleNodeOperation = (operation: string, staffId: string, staffName: string) => {
    setActiveOperation({ type: operation, staffId, staffName });
  };

  const handleAssignHOD = (e: React.MouseEvent, staffId: string, staffName: string, deptId: string, deptName: string) => {
    e.stopPropagation();
    setAssigningHOD({ staffId, staffName, deptId, deptName });
  };

  const confirmAssignment = async () => {
    if (!assigningHOD) return;
    alert(`Institutional Authority Dispatched: ${assigningHOD.staffName} is now certified HOD.`);
    setAssigningHOD(null);
  };

  const renderOperationModal = () => {
    if (!activeOperation) return null;
    const { type, staffName } = activeOperation;
    return (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveOperation(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden" >
          <div className="p-10">
            <header className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center">
                  {type === 'Registry Transfer' && <ArrowRight size={24} />}
                  {type === 'Credential Reset' && <RotateCcw size={24} />}
                  {type === 'Audit Trail View' && <Search size={24} />}
                  {type === 'Deep Archive' && <Trash2 size={24} />}
                </div>
                <div>
                  <h3 className="text-xl font-black italic font-display text-slate-900 leading-none mb-1">{type}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic leading-none">Node: {staffName}</p>
                </div>
              </div>
              <button onClick={() => setActiveOperation(null)} className="p-2 text-slate-300 hover:text-slate-900 transition-all">
                <X size={24} />
              </button>
            </header>
            <p className="text-sm font-medium text-slate-600 leading-relaxed mb-8">
              This operation requires High-Level clearance. Executing this will modify the institutional registry.
            </p>
            <button className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest hover:bg-black transition-all">
              Confirm {type}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderStaffTab = (dept: BackendDepartment) => (
    <div className="space-y-4">
      {(dept.staff ?? []).map((member) => {
        const isHOD = member.user?.role === 'HOD';
        const fullName = `${member.firstName} ${member.lastName}`;
        return (
          <div key={member.id} className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-slate-300 transition-all group flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold text-xs ring-1 ring-slate-100">
                {member.firstName[0]}{member.lastName[0]}
              </div>
              <div>
                <p className="text-[13px] font-black text-slate-900 leading-none mb-1">{fullName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{member.user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isHOD ? (
                <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100 flex items-center gap-2 shadow-sm">
                  <Crown size={12} className="fill-amber-500" />
                  <span className="text-[9px] font-black uppercase tracking-widest leading-none">HOD Authority</span>
                </div>
              ) : (user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER') && (
                <button 
                  onClick={(e) => handleAssignHOD(e, member.id, fullName, dept.id, dept.name)}
                  className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-all" 
                  title="Assign HOD"
                >
                  <Crown size={16} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center bg-slate-50"><Loader2 size={40} className="text-slate-900 animate-spin" /></div>;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedDept ? (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
            <header className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
              <div>
                <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none mb-1">Departmental Hierarchy</h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Structure Monitor</p>
              </div>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER') && (
                <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg">
                  <Plus size={16} /> Spawn Department
                </button>
              )}
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              {error ? (
                <div className="text-center py-20">
                  <AlertCircle size={40} className="text-rose-500 mx-auto mb-4" />
                  <p className="font-bold text-slate-900">{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                  {departments.map((dept) => (
                    <div key={dept.id} onClick={() => setSelectedDeptId(dept.id)} className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-2xl transition-all cursor-pointer group relative overflow-hidden">
                      <h4 className="text-3xl font-black italic font-display text-slate-900 mb-2">{dept.name}</h4>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-8">{dept.description}</p>
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-slate-400" />
                          <span className="text-xs font-black text-slate-900">{dept._count?.staff ?? 0} Nodes</span>
                        </div>
                        <ArrowRight size={16} className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col bg-white overflow-hidden">
             <header className="p-8 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedDeptId(null)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"><ChevronLeft size={20} /></button>
                  <h2 className="text-2xl font-black italic font-display">{selectedDept.name} Cluster</h2>
                </div>
             </header>
             <div className="flex-1 overflow-y-auto p-8">
                <div className="flex gap-4 mb-8">
                   {['staff', 'grading', 'vault'].map(tab => (
                     <button key={tab} onClick={() => setActiveTab(tab as any)} className={cn("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:bg-slate-100")}>
                       {tab}
                     </button>
                   ))}
                </div>
                {activeTab === 'staff' && renderStaffTab(selectedDept)}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      {renderOperationModal()}
    </div>
  );
}
