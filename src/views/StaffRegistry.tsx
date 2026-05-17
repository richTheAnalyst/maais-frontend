import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, UserPlus, MoreVertical, Mail, Phone,
  ShieldCheck, Lock, ArrowLeft, X, Filter,
  Download, Loader2, RefreshCw, AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import api from '../lib/api';
import { useRole } from '../context/RoleContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface StaffMember {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone?: string;
  departmentId?: string;
  department?: { name: string; code: string };
  user: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
    lastLoginAt?: string;
  };
  teachingAssignments?: {
    subject: { name: string };
    classSection: { name: string; level: string };
  }[];
}

interface OnboardFormData {
  email: string;
  password: string;
  role: string;
  staffId: string;
  firstName: string;
  lastName: string;
  gender: string;
  phone: string;
  departmentId: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  HEADMASTER: 'Headmaster',
  HOD: 'Head of Dept',
  TEACHER: 'Teacher',
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-50 border-purple-100 text-purple-700',
  HEADMASTER: 'bg-blue-50 border-blue-100 text-blue-700',
  HOD: 'bg-amber-50 border-amber-100 text-amber-700',
  TEACHER: 'bg-emerald-50 border-emerald-100 text-emerald-700',
};

// ─── Onboard Modal ────────────────────────────────────────────────────────────

const OnboardModal: React.FC<{
  departments: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: () => void;
}> = ({ departments, onClose, onSuccess }) => {
  const [form, setForm] = React.useState<OnboardFormData>({
    email: '', password: 'Staff@2024!', role: 'TEACHER',
    staffId: '', firstName: '', lastName: '',
    gender: 'MALE', phone: '', departmentId: departments[0]?.id ?? '',
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await api.post('/users/staff', {
        ...form,
        phone: form.phone || undefined,
        departmentId: form.departmentId || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to onboard staff');
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
            <h3 className="text-xl font-black text-slate-900">Onboard Staff Member</h3>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Institutional Identity Provisioning</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-5">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name *', field: 'firstName', placeholder: 'Ama' },
              { label: 'Last Name *', field: 'lastName', placeholder: 'Owusu' },
              { label: 'Staff ID *', field: 'staffId', placeholder: 'TCH-2024-001' },
              { label: 'Email *', field: 'email', placeholder: 'teacher@mandoshts.edu.gh', type: 'email' },
              { label: 'Phone', field: 'phone', placeholder: '+233 24 000 0000' },
              { label: 'Initial Password *', field: 'password', placeholder: '••••••••', type: 'password' },
            ].map(item => (
              <div key={item.field}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                  {item.label}
                </label>
                <input
                  required={item.label.includes('*')}
                  type={item.type ?? 'text'}
                  value={(form as any)[item.field]}
                  onChange={e => setForm({ ...form, [item.field]: e.target.value })}
                  placeholder={item.placeholder}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
                />
              </div>
            ))}

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Role *</label>
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
              >
                <option value="TEACHER">Teacher</option>
                <option value="HOD">Head of Department</option>
                <option value="HEADMASTER">Headmaster</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Gender *</label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Department</label>
              <select
                value={form.departmentId}
                onChange={e => setForm({ ...form, departmentId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500"
              >
                <option value="">No Department</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
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
            Onboard Staff
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function StaffRegistry() {
  const { user } = useRole();
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [departments, setDepartments] = React.useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState('All');
  const [selectedStaff, setSelectedStaff] = React.useState<StaffMember | null>(null);
  const [showOnboardModal, setShowOnboardModal] = React.useState(false);
  const [isResettingPassword, setIsResettingPassword] = React.useState(false);
  const [isDeactivating, setIsDeactivating] = React.useState(false);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [staffRes, deptRes] = await Promise.all([
        api.get('/users/staff'),
        api.get('/academic/departments'),
      ]);
      setStaff(staffRes.data);
      setDepartments(deptRes.data);
    } catch {
      setError('Failed to load staff registry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStaff = React.useMemo(() => {
    return staff.filter(s => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        s.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = selectedRole === 'All' || s.user?.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [staff, searchQuery, selectedRole]);

  const handleDeactivate = async (staffMember: StaffMember) => {
    if (!window.confirm(`Deactivate ${staffMember.firstName} ${staffMember.lastName}?`)) return;
    setIsDeactivating(true);
    try {
      await api.delete(`/users/${staffMember.user.id}/deactivate`);
      showToast('Staff member deactivated');
      setSelectedStaff(null);
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleResetPassword = async (staffMember: StaffMember) => {
    setIsResettingPassword(true);
    // In production this would trigger an email reset flow
    await new Promise(r => setTimeout(r, 1500));
    setIsResettingPassword(false);
    showToast(`Reset link dispatched to ${staffMember.user.email}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative">

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
          >
            <ShieldCheck size={16} />
            <span className="text-sm font-bold">{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-8 py-6 bg-white border-b border-slate-200/60 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none mb-1">
            Staff Directory
          </h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Institutional Command Registry · {staff.length} Nodes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
          >
            <RefreshCw size={16} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-100 transition-all">
            <Download size={14} /> Export CSV
          </button>
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'HEADMASTER') && (
            <button
              onClick={() => setShowOnboardModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
            >
              <UserPlus size={16} /> Onboard Staff
            </button>
          )}
        </div>
      </header>

      {/* Filter Bar */}
      <div className="px-8 py-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4 shrink-0 flex-wrap">
        <div className="relative w-80 flex items-center group">
          <Search className="absolute left-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          {['All', 'TEACHER', 'HOD', 'HEADMASTER', 'SUPER_ADMIN'].map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                selectedRole === role
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-400 border border-slate-200 hover:bg-slate-100'
              )}
            >
              {role === 'All' ? 'All' : ROLE_LABELS[role] ?? role}
            </button>
          ))}
          <p className="text-[11px] font-bold text-slate-400 ml-2">
            {filteredStaff.length} of {staff.length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">Loading staff registry...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-900 mb-2">{error}</p>
              <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mx-auto">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name / ID</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignments</th>
                <th className="px-8 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredStaff.map(member => (
                <tr
                  key={member.id}
                  onClick={() => setSelectedStaff(member)}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-[0.75rem] bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-sm border border-slate-200 group-hover:bg-white transition-colors uppercase">
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-slate-900 leading-none mb-1 group-hover:text-emerald-800 transition-colors">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-[11px] font-bold text-slate-400 font-mono tracking-tighter">{member.staffId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[13px] font-bold text-slate-600">
                      {member.department?.name ?? '—'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest',
                      ROLE_COLORS[member.user?.role] ?? 'bg-slate-100 border-slate-200 text-slate-500'
                    )}>
                      {ROLE_LABELS[member.user?.role] ?? member.user?.role}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[12px] font-bold text-slate-400">
                      {member.teachingAssignments?.length ?? 0} classes
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={cn(
                      'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest',
                      member.user?.isActive
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    )}>
                      <div className={cn('w-1 h-1 rounded-full', member.user?.isActive ? 'bg-emerald-500' : 'bg-slate-400')} />
                      {member.user?.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!isLoading && !error && filteredStaff.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-200 mb-6 text-4xl font-display italic">
              ?
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">No Nodes Identified</h3>
            <p className="text-sm font-medium text-slate-400 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">
              No staff members matching your filters were found.
            </p>
            <button
              onClick={() => setShowOnboardModal(true)}
              className="mt-6 flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              <UserPlus size={14} /> Onboard First Staff Member
            </button>
          </div>
        )}
      </div>

      {/* Staff Profile Side Panel */}
      <AnimatePresence>
        {selectedStaff && (
          <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedStaff(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
            >
              {/* Profile Header */}
              <div className="p-8 bg-slate-900 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
                  <ShieldCheck size={200} />
                </div>
                <div className="flex justify-between items-center mb-8 relative">
                  <button onClick={() => setSelectedStaff(null)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                    <ArrowLeft size={20} />
                  </button>
                  <button onClick={() => setSelectedStaff(null)} className="p-2.5 bg-white/10 hover:bg-rose-500 rounded-xl transition-all">
                    <X size={20} />
                  </button>
                </div>
                <div className="relative">
                  <div className="w-24 h-24 rounded-[2rem] bg-white text-slate-900 flex items-center justify-center text-3xl font-black italic font-display shadow-2xl mb-6 ring-4 ring-white/10">
                    {selectedStaff.firstName[0]}{selectedStaff.lastName[0]}
                  </div>
                  <h3 className="text-3xl font-black italic font-display tracking-tight mb-2 leading-none">
                    {selectedStaff.firstName} {selectedStaff.lastName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
                      {selectedStaff.staffId}
                    </span>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                    <span className={cn(
                      'text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full',
                      ROLE_COLORS[selectedStaff.user?.role] ?? 'text-white/60'
                    )}>
                      {ROLE_LABELS[selectedStaff.user?.role] ?? selectedStaff.user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">

                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', selectedStaff.user?.isActive ? 'bg-emerald-500' : 'bg-slate-400')} />
                      <span className="text-[14px] font-black text-slate-900">
                        {selectedStaff.user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</p>
                    <span className="text-[14px] font-black text-slate-900">
                      {selectedStaff.department?.name ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Teaching Assignments */}
                {(selectedStaff.teachingAssignments?.length ?? 0) > 0 && (
                  <section>
                    <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                      <div className="w-6 h-[1px] bg-slate-200" />
                      Teaching Assignments
                    </h4>
                    <div className="space-y-2">
                      {selectedStaff.teachingAssignments?.map((a, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                          <span className="text-[12px] font-bold text-slate-700">{a.subject?.name}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase">
                            {a.classSection?.level} {a.classSection?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Contact */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-slate-200" />
                    Contact Protocol
                  </h4>
                  <div className="space-y-3">
                    <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm group hover:border-slate-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                          <Mail size={18} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Email</p>
                          <p className="text-[13px] font-bold text-slate-900">{selectedStaff.user?.email}</p>
                        </div>
                      </div>
                    </div>
                    {selectedStaff.phone && (
                      <div className="p-5 bg-white border border-slate-100 rounded-3xl shadow-sm group hover:border-slate-300 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                            <Phone size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Secure Line</p>
                            <p className="text-[13px] font-bold text-slate-900">{selectedStaff.phone}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedStaff.user?.lastLoginAt && (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Login</p>
                        <p className="text-[12px] font-bold text-slate-700">
                          {new Date(selectedStaff.user.lastLoginAt).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* Security Actions */}
                <section>
                  <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-4 flex items-center gap-3">
                    <div className="w-6 h-[1px] bg-slate-200" />
                    Security Procedures
                  </h4>
                  <div className="p-6 bg-slate-900 rounded-[2rem] shadow-xl space-y-3">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-white/10 text-white rounded-2xl flex items-center justify-center">
                        <Lock size={22} />
                      </div>
                      <div>
                        <h5 className="text-white text-sm font-black tracking-tight leading-none mb-1">Access Protocol Hub</h5>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{selectedStaff.staffId}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleResetPassword(selectedStaff)}
                      disabled={isResettingPassword}
                      className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-40"
                    >
                      {isResettingPassword ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                      {isResettingPassword ? 'Dispatching Token...' : 'Reset Access Password'}
                    </button>
                    {selectedStaff.user?.isActive && (
                      <button
                        onClick={() => handleDeactivate(selectedStaff)}
                        disabled={isDeactivating}
                        className="w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-40"
                      >
                        {isDeactivating ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                        {isDeactivating ? 'Deactivating...' : 'Deactivate Account'}
                      </button>
                    )}
                    <p className="text-[9px] text-white/30 text-center mt-2 font-medium leading-relaxed italic">
                      Reset terminates all active sessions and invalidates current tokens.
                    </p>
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="p-8 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setSelectedStaff(null)}
                  className="w-full py-4 bg-white border border-slate-200 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                >
                  Close Panel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Onboard Modal */}
      <AnimatePresence>
        {showOnboardModal && (
          <OnboardModal
            departments={departments}
            onClose={() => setShowOnboardModal(false)}
            onSuccess={fetchData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}