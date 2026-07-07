import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Shield, Lock, Eye, EyeOff,
  Users, GraduationCap, Search, Edit3, X,
  Loader2, Save, AlertCircle, CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import api from '../lib/api';

// ─── Password strength ────────────────────────────────────────────────────────

function getStrength(pass: string) {
  if (!pass) return 0;
  let s = 0;
  if (pass.length >= 8) s++;
  if (/[A-Z]/.test(pass)) s++;
  if (/[0-9]/.test(pass)) s++;
  if (/[^A-Za-z0-9]/.test(pass)) s++;
  return s;
}

const STRENGTH_LABEL = ['', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];
const STRENGTH_TEXT = ['', 'text-rose-500', 'text-amber-500', 'text-blue-500', 'text-emerald-600'];

// ─── Edit Modal ───────────────────────────────────────────────────────────────

const EditProfileModal: React.FC<{
  title: string;
  entityId: string;
  entityType: 'staff' | 'student';
  initial: any;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ title, entityId, entityType, initial, onClose, onSuccess }) => {
  const [form, setForm] = React.useState({ ...initial, newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const strength = getStrength(form.newPassword);

  const handleSave = async () => {
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.newPassword && getStrength(form.newPassword) < 2) {
      setError('Password is too weak');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const payload: any = {
        firstName: form.firstName,
        lastName: form.lastName,
        middleName: form.middleName || undefined,
        email: form.email || undefined,
      };
      if (entityType === 'staff') payload.phone = form.phone || undefined;
      if (entityType === 'student') payload.dateOfBirth = form.dateOfBirth || undefined;
      if (form.newPassword) payload.password = form.newPassword;

      await api.patch(
        entityType === 'staff'
          ? `/users/staff/${entityId}/profile`
          : `/users/students/${entityId}/profile`,
        payload
      );
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 700);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="text-base font-black text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm flex items-center gap-2">
              <CheckCircle2 size={14} /> Saved successfully
            </div>
          )}

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name', key: 'firstName' },
              { label: 'Last Name', key: 'lastName' },
              { label: 'Middle Name', key: 'middleName' },
              { label: 'Email', key: 'email', type: 'email', span: true },
            ].map(f => (
              <div key={f.key} className={f.span ? 'col-span-2' : ''}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                  {f.label}
                </label>
                <input
                  type={f.type ?? 'text'}
                  value={form[f.key] ?? ''}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            ))}

            {entityType === 'staff' && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Phone</label>
                <input value={form.phone ?? ''} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500" />
              </div>
            )}

            {entityType === 'student' && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Date of Birth</label>
                <input type="date" value={form.dateOfBirth ?? ''} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500" />
              </div>
            )}
          </div>

          {/* Password section */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Lock size={10} /> Change Password (leave blank to keep current)
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    placeholder="Enter new password..."
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 pr-10"
                  />
                  <button onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.newPassword && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1, 2, 3, 4].map(s => (
                        <div key={s} className={cn('h-1 flex-1 rounded-full transition-all', strength >= s ? STRENGTH_COLOR[strength] : 'bg-gray-200')} />
                      ))}
                    </div>
                    <p className={cn('text-[10px] font-bold', STRENGTH_TEXT[strength])}>
                      {STRENGTH_LABEL[strength]}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Confirm Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter password..."
                  className={cn(
                    'w-full px-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium outline-none focus:border-emerald-500',
                    form.confirmPassword && form.confirmPassword !== form.newPassword
                      ? 'border-rose-300' : 'border-slate-200'
                  )}
                />
                {form.confirmPassword && form.confirmPassword !== form.newPassword && (
                  <p className="text-[10px] font-bold text-rose-500 mt-1">Passwords do not match</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-3 bg-slate-50 rounded-xl text-xs font-black uppercase tracking-widest">Cancel</button>
          <button onClick={handleSave} disabled={isLoading}
            className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export function SettingsView() {
  const { user } = useRole();

  const [myProfile, setMyProfile] = React.useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'profile' | 'people'>('profile');

  // People
  const [staffList, setStaffList] = React.useState<any[]>([]);
  const [studentList, setStudentList] = React.useState<any[]>([]);
  const [peopleTab, setPeopleTab] = React.useState<'staff' | 'students'>('staff');
  const [search, setSearch] = React.useState('');
  const [isLoadingPeople, setIsLoadingPeople] = React.useState(false);

  // Edit modal
  const [editTarget, setEditTarget] = React.useState<any>(null);

  // Derived
  const canManagePeople = user?.role === 'SUPER_ADMIN' || user?.role === 'HOD';

  // ─── Load my own profile ────────────────────────────────────────────────────
  const loadMyProfile = React.useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const res = await api.get('/users/me');
      setMyProfile(res.data);
    } catch {
      setMyProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  }, []);

  React.useEffect(() => { loadMyProfile(); }, [loadMyProfile]);

  // ─── Load people ────────────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!canManagePeople || activeTab !== 'people') return;
    async function load() {
      setIsLoadingPeople(true);
      try {
        const [sRes, stRes] = await Promise.all([
          api.get('/users/staff'),
          api.get('/users/students'),
        ]);
        setStaffList(sRes.data);
        setStudentList(stRes.data);
      } catch {
        setStaffList([]);
        setStudentList([]);
      } finally {
        setIsLoadingPeople(false);
      }
    }
    load();
  }, [activeTab, canManagePeople]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const staffProfile = myProfile?.staffProfile;
  const studentProfile = myProfile?.studentProfile;
  const activeProfile = staffProfile ?? studentProfile;
  const isStaff = !!staffProfile;

  function openEditSelf() {
    if (!activeProfile) return;
    setEditTarget({
      id: activeProfile.id,
      type: isStaff ? 'staff' : 'student',
      title: 'Edit My Profile',
      initial: {
        firstName: activeProfile.firstName ?? '',
        lastName: activeProfile.lastName ?? '',
        middleName: activeProfile.middleName ?? '',
        phone: activeProfile.phone ?? '',
        email: myProfile?.email ?? '',
        dateOfBirth: activeProfile.dateOfBirth
          ? new Date(activeProfile.dateOfBirth).toISOString().split('T')[0]
          : '',
      },
    });
  }

  function openEditPerson(person: any, type: 'staff' | 'student') {
    setEditTarget({
      id: person.id,
      type,
      title: `Edit — ${person.firstName} ${person.lastName}`,
      initial: {
        firstName: person.firstName ?? '',
        lastName: person.lastName ?? '',
        middleName: person.middleName ?? '',
        phone: person.phone ?? '',
        email: person.user?.email ?? '',
        dateOfBirth: person.dateOfBirth
          ? new Date(person.dateOfBirth).toISOString().split('T')[0]
          : '',
      },
    });
  }

  const filteredStaff = staffList.filter(s =>
    `${s.firstName} ${s.lastName} ${s.staffId}`.toLowerCase().includes(search.toLowerCase())
  );
  const filteredStudents = studentList.filter(s =>
    `${s.firstName} ${s.lastName} ${s.indexNumber}`.toLowerCase().includes(search.toLowerCase())
  );

  const TABS = [
    { id: 'profile', label: 'My Profile', icon: User },
    ...(canManagePeople ? [{ id: 'people', label: 'People', icon: Users }] : []),
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#F0F4F2] p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-800 rounded-xl flex items-center justify-center text-white">
              <Settings size={22} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
          </div>
          <p className="text-gray-500 font-medium text-sm">
            Manage your profile and {canManagePeople ? 'your department\'s people.' : 'account security.'}
          </p>
        </header>

        {/* Tabs */}
        <div className="flex bg-white border border-slate-200 p-1 rounded-2xl mb-8 shadow-sm w-fit">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all',
                activeTab === tab.id ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-700'
              )}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-6">

              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="text-emerald-800" size={20} />
                    <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">My Profile</h2>
                  </div>
                  {!isLoadingProfile && activeProfile && (
                    <button onClick={openEditSelf}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all">
                      <Edit3 size={12} /> Edit Profile &amp; Password
                    </button>
                  )}
                </div>

                {isLoadingProfile ? (
                  <div className="p-16 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-emerald-600" />
                  </div>
                ) : !activeProfile ? (
                  <div className="p-16 text-center">
                    <AlertCircle size={32} className="text-rose-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400">Could not load profile</p>
                  </div>
                ) : (
                  <div className="p-8">
                    {/* Avatar + name */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-50">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${activeProfile.firstName}${activeProfile.lastName}`}
                        alt="avatar"
                        className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg bg-emerald-50"
                      />
                      <div>
                        <h3 className="text-xl font-black text-slate-900">
                          {activeProfile.firstName} {activeProfile.lastName}
                        </h3>
                        <p className="text-sm font-bold text-slate-400 mt-0.5">
                          {myProfile?.email}
                        </p>
                        <span className="mt-2 inline-block px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {myProfile?.role?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-2 gap-5">
                      {[
                        { label: 'First Name', value: activeProfile.firstName },
                        { label: 'Last Name', value: activeProfile.lastName },
                        { label: 'Middle Name', value: activeProfile.middleName || '—' },
                        { label: 'Email', value: myProfile?.email },
                        ...(isStaff ? [
                          { label: 'Staff ID', value: activeProfile.staffId },
                          { label: 'Phone', value: activeProfile.phone || '—' },
                          { label: 'Department', value: activeProfile.department?.name || '—' },
                          { label: 'Role', value: myProfile?.role?.replace('_', ' ') },
                        ] : [
                          { label: 'Index Number', value: activeProfile.indexNumber },
                          { label: 'Class', value: activeProfile.currentClass
                            ? `${activeProfile.currentClass.level?.replace('FORM_', 'Form ')} ${activeProfile.currentClass.name}`
                            : '—'
                          },
                        ]),
                      ].map((item, i) => (
                        <div key={i}>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                            {item.label}
                          </label>
                          <div className="px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-gray-900 font-bold text-sm min-h-[44px] flex items-center">
                            {item.value ?? '—'}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 flex items-center justify-center">
                          <Lock size={16} className="text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">Password</p>
                          <p className="text-[10px] font-bold text-slate-400">Last changed: contact admin for reset history</p>
                        </div>
                      </div>
                      <button onClick={openEditSelf}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                        Change Password
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </motion.div>
          )}

          {/* ── PEOPLE TAB ── */}
          {activeTab === 'people' && canManagePeople && (
            <motion.div key="people" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="text-emerald-800" size={20} />
                    <div>
                      <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                        {user?.role === 'HOD' ? 'Department People' : 'All People'}
                      </h2>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                        Click Edit on any person to update their profile or reset their password
                      </p>
                    </div>
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    {[
                      { id: 'staff', label: 'Staff', icon: User, count: staffList.length },
                      { id: 'students', label: 'Students', icon: GraduationCap, count: studentList.length },
                    ].map(t => (
                      <button key={t.id} onClick={() => setPeopleTab(t.id as any)}
                        className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all', peopleTab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400')}>
                        <t.icon size={12} /> {t.label}
                        <span className={cn('px-1.5 py-0.5 rounded-full text-[8px] font-black', peopleTab === t.id ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400')}>
                          {t.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-slate-50">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder={`Search ${peopleTab} by name or ID...`}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500" />
                  </div>
                </div>

                {isLoadingPeople ? (
                  <div className="py-16 flex items-center justify-center">
                    <Loader2 size={32} className="animate-spin text-emerald-600" />
                  </div>
                ) : (
                  <div className="max-h-[520px] overflow-y-auto divide-y divide-slate-50">
                    {(peopleTab === 'staff' ? filteredStaff : filteredStudents).map((person: any) => (
                      <div key={person.id} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-black uppercase group-hover:bg-emerald-50 group-hover:text-emerald-700 transition-colors shrink-0">
                            {person.firstName?.[0]}{person.lastName?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {person.firstName} {person.lastName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {peopleTab === 'staff'
                                ? `${person.staffId ?? '—'} · ${person.user?.role?.replace('_', ' ') ?? '—'}${person.department?.name ? ` · ${person.department.name}` : ''}`
                                : `${person.indexNumber ?? '—'} · ${person.currentClass?.level?.replace('FORM_', 'F') ?? ''} ${person.currentClass?.name ?? ''}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => openEditPerson(person, peopleTab === 'staff' ? 'staff' : 'student')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                      </div>
                    ))}

                    {(peopleTab === 'staff' ? filteredStaff : filteredStudents).length === 0 && (
                      <div className="py-16 text-center">
                        <Users size={32} className="text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400">
                          No {peopleTab} found{search && ` matching "${search}"`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </section>
            </motion.div>
          )}

        </AnimatePresence>

        <footer className="mt-10 text-center pb-8">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Shield size={12} />
            MAAIS · Role: {user?.role} · {new Date().getFullYear()}
          </p>
        </footer>
      </div>

      <AnimatePresence>
        {editTarget && (
          <EditProfileModal
            {...editTarget}
            onClose={() => setEditTarget(null)}
            onSuccess={() => {
              setEditTarget(null);
              loadMyProfile();
              // Refresh people list if editing someone else
              if (canManagePeople && activeTab === 'people') {
                api.get('/users/staff').then(r => setStaffList(r.data)).catch(() => {});
                api.get('/users/students').then(r => setStudentList(r.data)).catch(() => {});
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}