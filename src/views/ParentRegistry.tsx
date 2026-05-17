import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users, Search, Download, Plus,
  ChevronRight, X, Send, MoreVertical,
  GraduationCap, UserPlus, Fingerprint,
  Phone, MessageSquare, Activity,
  AlertCircle, Mail, ShieldCheck, UserCheck,
  CreditCard, Eye, EyeOff, Bell, Loader2,
  RefreshCw, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import {
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, Tooltip
} from 'recharts';
import api from '../lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Ward {
  id: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  currentClass?: { name: string; level: string };
  reportCards?: { averageScore: number }[];
}

interface ParentProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  occupation?: string;
  user: { email: string; isActive: boolean };
  studentLinks: {
    relationship: string;
    isPrimary: boolean;
    student: Ward;
  }[];
}

interface Notification {
  id: string;
  title: string;
  body: string;
  channel: string;
  isRead: boolean;
  deliveredAt?: string;
  failedAt?: string;
  createdAt: string;
}

// ─── Parent Profile Panel ─────────────────────────────────────────────────────

const ParentProfilePanel: React.FC<{
  parent: ParentProfile;
  onClose: () => void;
  onNotify: (parentId: string, studentIds: string[], message: string) => Promise<void>;
}> = ({ parent, onClose, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'Overview' | 'History' | 'Contact'>('Overview');
  const [maskFees, setMaskFees] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifs, setIsLoadingNotifs] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (activeTab === 'History') {
      const studentId = parent.studentLinks[0]?.student?.id;
      if (!studentId) return;
      setIsLoadingNotifs(true);
      api.get(`/comms/notifications/${studentId}`)
        .then(res => setNotifications(res.data))
        .catch(() => {})
        .finally(() => setIsLoadingNotifs(false));
    }
  }, [activeTab, parent]);

  const handleSendNotification = async () => {
    if (!notifyMessage.trim()) return;
    setIsSending(true);
    const studentIds = parent.studentLinks.map(l => l.student.id);
    await onNotify(parent.id, studentIds, notifyMessage);
    setNotifyMessage('');
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setIsSending(false);
  };

  const wards = parent.studentLinks.map(l => l.student);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 bg-emerald-900 text-white shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center ring-1 ring-white/20">
              <UserCheck size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black italic font-display">
                {parent.firstName} {parent.lastName}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">{parent.phone}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <X size={24} />
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'Overview', label: 'Wards', icon: Users },
            { id: 'History', label: 'Notifications', icon: MessageSquare },
            { id: 'Contact', label: 'Contact', icon: Phone },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab.id ? 'bg-white text-emerald-900 shadow-xl' : 'bg-white/5 text-white/60 hover:bg-white/10'
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-4">
        {activeTab === 'Overview' && (
          <>
            <div className="flex justify-between items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {wards.length} Linked Ward{wards.length !== 1 ? 's' : ''}
              </h4>
              <button
                onClick={() => setMaskFees(!maskFees)}
                className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest"
              >
                {maskFees ? <Eye size={12} /> : <EyeOff size={12} />}
                {maskFees ? 'Show Details' : 'Mask Details'}
              </button>
            </div>
            {wards.map(ward => {
              const link = parent.studentLinks.find(l => l.student.id === ward.id);
              const latestAvg = ward.reportCards?.[ward.reportCards.length - 1]?.averageScore;
              return (
                <div key={ward.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1">
                          {ward.firstName} {ward.lastName}
                        </p>
                        <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                          {ward.indexNumber}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                      {link?.relationship ?? '—'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class</p>
                      <p className="text-sm font-black text-slate-900">
                        {ward.currentClass ? `${ward.currentClass.level} ${ward.currentClass.name}` : '—'}
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg Score</p>
                      <p className="text-sm font-black italic font-display text-slate-900">
                        {maskFees ? '****' : latestAvg != null ? `${latestAvg.toFixed(1)}%` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'History' && (
          <>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Notification History
            </h4>
            {isLoadingNotifs ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-300" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-200">
                <MessageSquare size={32} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">No notifications sent yet</p>
              </div>
            ) : (
              notifications.map(notif => (
                <div key={notif.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center',
                        notif.channel === 'SMS' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'
                      )}>
                        {notif.channel === 'SMS' ? <MessageSquare size={14} /> : <Bell size={14} />}
                      </div>
                      <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest">
                        {notif.channel}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 italic">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[13px] font-bold text-slate-700 mb-1">{notif.title}</p>
                  <p className="text-[12px] font-medium text-slate-500 italic mb-3">"{notif.body}"</p>
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      notif.deliveredAt ? 'bg-emerald-500' : notif.failedAt ? 'bg-rose-500' : 'bg-amber-500'
                    )} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {notif.deliveredAt ? 'Delivered' : notif.failedAt ? 'Failed' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'Contact' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Contact Details
              </h4>
              {[
                { label: 'Phone', value: parent.phone, icon: Phone },
                { label: 'Email', value: parent.user?.email ?? parent.email ?? '—', icon: Mail },
                { label: 'Occupation', value: parent.occupation ?? '—', icon: UserCheck },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-[13px] font-bold text-slate-900">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick notify */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Send Quick Notification
              </h4>
              <textarea
                value={notifyMessage}
                onChange={e => setNotifyMessage(e.target.value)}
                placeholder="Type a message to this guardian..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none resize-none mb-3 focus:border-emerald-500"
              />
              {sent && (
                <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold mb-3">
                  <CheckCircle2 size={16} /> Notification sent!
                </div>
              )}
              <button
                onClick={handleSendNotification}
                disabled={isSending || !notifyMessage.trim()}
                className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Send via App
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-white border-t border-slate-100 flex gap-3 shrink-0">
        <a
          href={`tel:${parent.phone}`}
          className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-all flex items-center justify-center"
        >
          <Phone size={20} />
        </a>
        <button
          onClick={() => setActiveTab('Contact')}
          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest"
        >
          Send Message
        </button>
        <button onClick={onClose} className="flex-1 py-4 border border-slate-200 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
          Close
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const ParentRegistry: React.FC = () => {
  const [parents, setParents] = useState<ParentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const fetchParents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all students with parent links
      const studentsRes = await api.get('/users/students');
      const studentList = studentsRes.data;

      // Get full profiles with parent links
      const profilesWithParents = await Promise.all(
        studentList.slice(0, 20).map((s: any) =>
          api.get(`/users/students/${s.id}`).then(r => r.data).catch(() => null)
        )
      );

      // Extract unique parents from student profiles
      const parentMap = new Map<string, ParentProfile>();
      for (const profile of profilesWithParents) {
        if (!profile) continue;
        for (const link of profile.parentLinks ?? []) {
          const p = link.parent;
          if (!p) continue;
          if (!parentMap.has(p.id)) {
            parentMap.set(p.id, {
              ...p,
              studentLinks: [],
            });
          }
          const parent = parentMap.get(p.id)!;
          const alreadyLinked = parent.studentLinks.some(l => l.student?.id === profile.id);
          if (!alreadyLinked) {
            parent.studentLinks.push({
              relationship: link.relationship,
              isPrimary: link.isPrimary,
              student: {
                id: profile.id,
                indexNumber: profile.indexNumber,
                firstName: profile.firstName,
                lastName: profile.lastName,
                currentClass: profile.currentClass,
                reportCards: profile.reportCards,
              },
            });
          }
        }
      }

      setParents(Array.from(parentMap.values()));
    } catch {
      setError('Failed to load parent registry');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchParents(); }, [fetchParents]);

  const selectedParent = useMemo(
    () => parents.find(p => p.id === selectedParentId),
    [parents, selectedParentId]
  );

  const filteredParents = useMemo(() => {
    return parents.filter(p => {
      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const wardNames = p.studentLinks
        .map(l => `${l.student.firstName} ${l.student.lastName}`)
        .join(' ')
        .toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        wardNames.includes(searchQuery.toLowerCase())
      );
    });
  }, [parents, searchQuery]);

  const handleNotify = async (parentId: string, studentIds: string[], message: string) => {
    await api.post('/comms/notify', {
      studentIds,
      title: 'Message from School',
      body: message,
      channel: 'APP',
    });
    showToast('Notification sent');
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    setIsSendingBroadcast(true);
    try {
      await api.post('/comms/notify', {
        title: broadcastTitle,
        body: broadcastMessage,
        channel: 'APP',
      });
      setBroadcastSent(true);
      showToast(`Broadcast sent to all students`);
      setTimeout(() => {
        setBroadcastSent(false);
        setIsBroadcasting(false);
        setBroadcastTitle('');
        setBroadcastMessage('');
      }, 2000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Broadcast failed');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const totalWards = parents.reduce((sum, p) => sum + p.studentLinks.length, 0);
  const engagementData = [
    { name: 'Linked', value: parents.length },
    { name: 'Unlinked', value: Math.max(0, totalWards - parents.length) },
  ];

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
              <span>Registry</span>
              <ChevronRight size={10} />
              <span className="text-slate-900">Guardian Dynamic Hub</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 italic font-display tracking-tight leading-none">
              Institutional Household Management
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {parents.length} guardians · {totalWards} linked wards
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchParents} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setIsBroadcasting(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg"
            >
              <Send size={16} /> Broadcast Blast
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-slate-50 p-5 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div className="h-16 w-16 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={engagementData} cx="50%" cy="50%" innerRadius={20} outerRadius={30} paddingAngle={5} dataKey="value">
                    <Cell fill="#10b981" />
                    <Cell fill="#94a3b8" />
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guardians</p>
              <p className="text-xl font-black italic font-display text-slate-900">
                {isLoading ? '...' : parents.length}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-5 rounded-[2rem] border border-blue-100 flex items-center justify-between">
            <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Users size={24} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Wards</p>
              <p className="text-xl font-black italic font-display text-blue-900">
                {isLoading ? '...' : totalWards}
              </p>
            </div>
          </div>

          <div className="md:col-span-1 xl:col-span-2 bg-emerald-50 p-5 rounded-[2rem] border border-emerald-100 flex items-center gap-6">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
              <Send size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Communications</p>
              <p className="text-sm font-bold text-emerald-900">Use Broadcast to notify all parent-linked students via App</p>
            </div>
          </div>
        </div>
      </header>

      {/* Filter */}
      <div className="px-8 py-5 bg-white border-b border-slate-200/60 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guardians or wards..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] outline-none font-medium focus:border-emerald-500"
          />
        </div>
        <p className="text-[11px] font-bold text-slate-400 ml-auto">
          {filteredParents.length} of {parents.length}
        </p>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto p-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <Loader2 size={40} className="text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">Loading guardian registry...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-900 mb-2">{error}</p>
              <button onClick={fetchParents} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold mx-auto">
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          </div>
        ) : filteredParents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-200">
            <Users size={40} className="text-slate-200 mb-4" />
            <p className="text-sm font-bold text-slate-400 mb-2">No guardians found</p>
            <p className="text-xs text-slate-300 text-center max-w-xs">
              Parents appear here once they are linked to enrolled students via the student profile.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Guardian</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Wards</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ward Performance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredParents.map(parent => {
                  const avgScore = parent.studentLinks
                    .map(l => l.student.reportCards?.[l.student.reportCards.length - 1]?.averageScore ?? null)
                    .filter(s => s !== null);
                  const overallAvg = avgScore.length
                    ? avgScore.reduce((a, b) => a! + b!, 0)! / avgScore.length
                    : null;

                  return (
                    <tr
                      key={parent.id}
                      onClick={() => setSelectedParentId(parent.id)}
                      className="group hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                            <UserCheck size={18} />
                          </div>
                          <div>
                            <p className="text-[14px] font-black italic font-display text-slate-900 leading-none mb-1.5">
                              {parent.firstName} {parent.lastName}
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                              {parent.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {parent.studentLinks.map(l => (
                            <span key={l.student.id} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-black italic font-display rounded-lg">
                              {l.student.firstName} {l.student.lastName}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <p className="text-[12px] font-bold text-slate-600">{parent.user?.email ?? parent.email ?? '—'}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">{parent.occupation ?? '—'}</p>
                      </td>

                      <td className="px-6 py-5 text-center">
                        {overallAvg != null ? (
                          <span className={cn(
                            'px-3 py-1 rounded-full text-[11px] font-black italic font-display',
                            overallAvg >= 75 ? 'bg-emerald-50 text-emerald-700' :
                            overallAvg >= 50 ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          )}>
                            {overallAvg.toFixed(1)}%
                          </span>
                        ) : (
                          <span className="text-slate-300 text-sm">—</span>
                        )}
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <a
                            href={`tel:${parent.phone}`}
                            onClick={e => e.stopPropagation()}
                            className="p-3 bg-slate-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all"
                          >
                            <Phone size={18} />
                          </a>
                          <button className="p-3 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Panel */}
      <AnimatePresence>
        {selectedParent && (
          <div className="fixed inset-0 z-[150] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedParentId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="relative w-full max-w-xl bg-white h-full shadow-2xl">
              <ParentProfilePanel
                parent={selectedParent}
                onClose={() => setSelectedParentId(null)}
                onNotify={handleNotify}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Broadcast Modal */}
      <AnimatePresence>
        {isBroadcasting && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsBroadcasting(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden">
              <div className="p-10 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-3xl font-black italic font-display">Broadcast Terminal</h3>
                  <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mt-2">
                    Global Household Communication Protocol
                  </p>
                </div>
                <button onClick={() => setIsBroadcasting(false)} className="hover:text-rose-500 transition-all">
                  <X size={24} />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 block mb-2">
                    Notification Title *
                  </label>
                  <input
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. PTA Meeting — Friday 3PM"
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 block mb-2">
                    Broadcast Payload *
                  </label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    className="w-full px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-bold text-sm italic resize-none focus:border-emerald-500"
                    placeholder="Type your institutional message here..."
                  />
                </div>

                {broadcastSent && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700">
                    <CheckCircle2 size={16} />
                    <span className="text-sm font-bold">Broadcast sent successfully!</span>
                  </div>
                )}

                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-bold text-slate-500">
                  ℹ️ This will send an in-app notification to all students with linked parent accounts. SMS broadcast available via the Comms module.
                </div>

                <div className="flex gap-4 pt-2">
                  <button onClick={() => setIsBroadcasting(false)} className="flex-1 py-5 bg-slate-50 rounded-[2rem] text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                    Abort
                  </button>
                  <button
                    onClick={handleBroadcast}
                    disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastMessage.trim()}
                    className="flex-1 py-5 bg-slate-900 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {isSendingBroadcast ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSendingBroadcast ? 'Sending...' : 'Execute Blast'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};