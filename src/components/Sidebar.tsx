import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ShieldCheck, 
  Archive, 
  UserCircle, 
  Settings, 
  Info, 
  LogOut,
  GraduationCap,
  Database,
  TrendingUp,
  AlertCircle,
  ClipboardCheck,
  LifeBuoy,
  AlertTriangle,
  X,
  Calendar,
  ChevronRight,
  UserPlus,
  Cpu,
  Wallet,
  MessageSquare,
  Clock
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useRole } from '../context/RoleContext';
import { useUI } from '../context/UIContext';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useRole();
  const { setSettingsModalOpen, setSupportModalOpen } = useUI();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const [unsavedMarks] = React.useState(12); // Mock unsaved marks for demonstration

  const navItems = [
    // 1. DASHBOARD OVERVIEW (The "Pulse")
    { 
      icon: LayoutDashboard, 
      label: 'Pulse', 
      id: 'dashboard', 
      path: '/', 
      roles: ['TEACHER', 'HOD', 'SUPER_ADMIN', 'HEADMASTER', 'STUDENT'] 
    },

    // 2. STAKEHOLDER MANAGEMENT (The People Tab)
    { 
      icon: Users, 
      label: 'People', 
      id: 'people', 
      roles: ['SUPER_ADMIN', 'HEADMASTER','HOD'],
      subItems: [
        { label: 'Staff Directory', path: '/identity/staff' },
/*         { label: 'Departmental Hierarchy', path: '/identity/departments' },
 */        { label: 'Student Registry', path: '/identity/students' },
        { label: 'Parent Registry', path: '/identity/parents' }
      ]
    },

    // 3. ACADEMIC ARCHITECT (The Engine Room)
    /* { 
      icon: Cpu, 
      label: 'Engine Room', 
      id: 'architect', 
      roles: ['SUPER_ADMIN', 'HEADMASTER'],
      subItems: [
        { label: 'Class/Form Manager', path: '/identity/departments' },
        { label: 'Subject Curriculum', path: '/academic-architect' },
        { label: 'Grading Rules', path: '/grading' }
      ]
    }, */

    {
      icon: Cpu,
      label: 'Academic Setup',
      id: 'academic-setup',
      path: '/academic-setup',
      roles: ['SUPER_ADMIN', 'HEADMASTER']
    },

    // 4. SCHEDULING & TIMETABLE
    { 
      icon: Clock, 
      label: 'Timetable', 
      id: 'scheduling', 
      roles: ['SUPER_ADMIN', 'HEADMASTER', 'TEACHER', 'HOD'],
      path: '/timetable'
      /* subItems: [
        { label: 'Master Timetable', path: '/timetable' },
        { label: 'Event Calendar', path: '/timetable' }
      ] */
    },

    {
  icon: GraduationCap,
  label: 'Grading',
  id: 'grading',
  roles: ['SUPER_ADMIN', 'HEADMASTER'],
  subItems: [
    { label: 'Grade Sheet', path: '/grading' },
    { label: 'Grading Rules', path: '/grading-rules' },
  ]
},

    // 5. FINANCE & PROCUREMENT
    /* { 
      icon: Wallet, 
      label: 'Finance', 
      id: 'finance', 
      path: '/finance',
      roles: ['SUPER_ADMIN', 'HEADMASTER']
    }, */

    // 6. COMMUNICATIONS & REPORTS
    /* { 
      icon: MessageSquare, 
      label: 'Comms', 
      id: 'comms', 
      path: '/comms',
      roles: ['SUPER_ADMIN', 'HEADMASTER']
    },
 */
    // 7. SYSTEM Settings (The "Vault")
    { 
      icon: ShieldCheck, 
      label: 'Vault', 
      id: 'vault', 
      roles: ['SUPER_ADMIN', 'HEADMASTER'],
      subItems: [
        //{ label: 'User Permissions', path: '/system' },
        { label: 'Audit Logs', path: '/audit' },
        { label: 'Academic Archive', path: '/archive' },
        //{ label: 'System Forensics', path: '/audit/extended' },
        
      ]
    },

    // FALLBACKS FOR OTHER ROLES (TEACHERS, HODs, STUDENTS)
/*     { icon: Calendar, label: 'Timetable', id: 'timetable', path: '/timetable', roles: ['TEACHER', 'STUDENT', 'SUPER_ADMIN'] },
 *//*     { icon: AlertCircle, label: 'Revisions', id: 'revisions', path: '/revisions', roles: ['TEACHER', 'HOD', 'SUPER_ADMIN'], badge: 3 },
 *//*     { icon: ClipboardCheck, label: 'Missing Observations', id: 'missing-obs', path: '/missing-observations', roles: ['TEACHER', 'HOD', 'SUPER_ADMIN'], badge: 5, badgeColor: 'bg-amber-500' },
 */    { icon: GraduationCap, label: 'Grading', id: 'grading', path: '/grading', roles: ['TEACHER', 'HOD'] },
    { icon: TrendingUp, label: 'Analytics', id: 'analytics', path: '/analytics', roles: ['TEACHER', 'HOD'] },
/*     { icon: Database, label: 'Archive', id: 'archive', path: '/archive', roles: ['SUPER_ADMIN', 'HEADMASTER', 'HOD'] },
 *//*     { icon: ShieldCheck, label: 'Certification', id: 'certification', path: '/certification', roles: ['HOD'], badge: 2, badgeColor: 'bg-emerald-600' },
 */    { icon: TrendingUp, label: 'Journey', id: 'journey', path: '/journey', roles: ['STUDENT'] },
  ];

  const [activeSubMenu, setActiveSubMenu] = React.useState<string | null>(null);

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    // Session Purge Logic
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/'; // Hard redirect to clear state
  };

  return (
    <>
      <aside className="w-20 h-screen bg-slate-50 border-r border-slate-200/60 flex flex-col items-center py-8 gap-8 z-30">
        <Link to="/" className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-white font-medium text-xl shadow-lg shadow-brand-teal/20 mb-4">
          M
        </Link>
        
        <nav className="flex-1 flex flex-col gap-5">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path || (item.subItems?.some(s => location.pathname === s.path));
            const hasSubMenu = !!item.subItems;
            
            return (
              <div key={item.id} className="relative group">
                {hasSubMenu ? (
                  <button
                    onClick={() => setActiveSubMenu(activeSubMenu === item.id ? null : item.id)}
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-300 group relative w-full flex items-center justify-center",
                      isActive 
                        ? "bg-white text-brand-teal shadow-md shadow-slate-200/50 ring-1 ring-slate-100" 
                        : "text-slate-400 hover:bg-white hover:text-slate-900"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {isActive && (
                      <div className="absolute left-0 w-1.5 h-6 bg-brand-teal rounded-r-full" />
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.path || '#'}
                    className={cn(
                      "p-3 rounded-2xl transition-all duration-300 group relative w-full flex items-center justify-center",
                      isActive 
                        ? "bg-white text-brand-teal shadow-md shadow-slate-200/50 ring-1 ring-slate-100" 
                        : "text-slate-400 hover:bg-white hover:text-slate-900"
                    )}
                    title={item.label}
                  >
                    <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    {item.badge && (
                      <div className={cn(
                        "absolute top-0 right-0 px-1.5 py-0.5 min-w-[1.25rem] min-h-[1.25rem] text-white text-[9px] font-medium rounded-full flex items-center justify-center border-2 border-white",
                        item.badgeColor || "bg-rose-500"
                      )}>
                        {item.badge}
                      </div>
                    )}
                  </Link>
                )}

                {/* Popout Submenu */}
                <AnimatePresence>
                  {activeSubMenu === item.id && item.subItems && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="absolute left-[calc(100%+12px)] top-0 w-44 bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 py-4 px-2 z-50 ring-1 ring-slate-900/5"
                    >
                      <div className="mb-3 px-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{item.label}</p>
                        <h4 className="text-[15px] font-black text-slate-900 italic font-display tracking-tight leading-none">Vault Entries</h4>
                      </div>
                      <div className="space-y-1">
                        {item.subItems.map((sub, idx) => (
                          <Link
                            key={idx}
                            to={sub.path}
                            onClick={() => setActiveSubMenu(null)}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl transition-all group/item",
                              location.pathname === sub.path 
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">{sub.label}</span>
                            <ChevronRight size={12} className={cn(
                              "transition-transform",
                              location.pathname === sub.path ? "text-slate-400" : "text-slate-200 group-hover/item:translate-x-1"
                            )} />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        <div className="flex flex-col gap-5 mt-auto">
          {user?.role === 'STUDENT' ? (
            <>
              {/* <Link 
                to="/support"
                className={cn(
                  "p-3 rounded-2xl transition-all duration-200 group relative",
                  location.pathname === '/support' ? "bg-white text-brand-teal shadow-md" : "text-slate-400 hover:bg-white hover:text-slate-600"
                )}
                title="ICT Support"
              >
                <LifeBuoy size={22} strokeWidth={location.pathname === '/support' ? 2.5 : 2} />
              </Link> */}
              <Link 
                to="/settings"
                className={cn(
                  "p-3 rounded-2xl transition-all duration-200 group relative",
                  location.pathname === '/settings' ? "bg-white text-brand-teal shadow-md" : "text-slate-400 hover:bg-white hover:text-slate-600"
                )}
                title="Settings"
              >
                <Settings size={22} strokeWidth={location.pathname === '/settings' ? 2.5 : 2} />
              </Link>
            </>
          ) : (
            <>
              {/* <button 
                onClick={() => setSupportModalOpen(true)}
                className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-200"
                title="ICT Support"
              >
                <LifeBuoy size={22} />
              </button> */}
              {/* <button 
                onClick={() => setSettingsModalOpen(true)}
                className="p-3 rounded-2xl text-slate-400 hover:bg-white hover:text-slate-600 transition-all duration-200"
                title="Settings"
              >
                <Settings size={22} />
              </button> */}
            </>
          )}
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="p-3 rounded-2xl text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200" 
            title="Logout"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="w-14 h-14 bg-rose-50 rounded-[1.25rem] flex items-center justify-center text-rose-600">
                    <AlertTriangle size={32} />
                  </div>
                  <button onClick={() => setShowLogoutModal(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                
                <h3 className="text-2xl font-medium text-slate-900 tracking-tight mb-3">Terminate Session?</h3>
                <p className="text-slate-500 font-medium leading-relaxed mb-8">
                  Are you sure you want to log out? Your access will be revoked until your next authorized login.
                </p>

                {unsavedMarks > 0 && (
                  <div className="bg-amber-50/50 border border-amber-100 rounded-[1.5rem] p-5 mb-8 flex gap-4">
                    <div className="text-amber-600 shrink-0">
                      <AlertCircle size={20} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-amber-900">Historical Buffer Integrity</p>
                      <p className="text-[12px] font-medium text-amber-700/70 mt-1">
                        ⚠️ There are {unsavedMarks} data nodes currently in local cache (SHS 2 Science). 
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button 
                    onClick={() => setShowLogoutModal(false)}
                    className="flex-1 py-4.5 bg-slate-50 text-slate-900 font-medium rounded-2xl text-sm hover:bg-slate-100 transition-all border border-slate-200/50"
                  >
                    Stay
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex-1 py-4.5 bg-rose-600 text-white font-medium rounded-2xl text-sm hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20"
                  >
                    Log Out
                  </button>
                </div>
              </div>
              <div className="bg-slate-50 py-5 text-center border-t border-slate-100">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-[0.2em]">Technical Protocol Secure</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
