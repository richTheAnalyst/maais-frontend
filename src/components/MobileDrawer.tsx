import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  X,
  LayoutDashboard, 
  Calendar,
  AlertCircle,
  ClipboardCheck,
  GraduationCap,
  Database,
  ShieldCheck,
  TrendingUp,
  FileText,
  LifeBuoy,
  Settings,
  LogOut,
  ChevronRight,
  Users,
  Cpu,
  MessageSquare
} from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useRole } from '../context/RoleContext';
import { cn } from '../lib/utils';

export function MobileDrawer() {
  const { mobileMenuOpen, setMobileMenuOpen, setSettingsModalOpen, setSupportModalOpen } = useUI();
  const { user } = useRole();
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Pulse (Dashboard)', id: 'dashboard', path: '/', roles: ['TEACHER', 'HOD', 'ADMIN', 'SUPER_ADMIN', 'HEADMASTER', 'STUDENT'] },
    
    // People Category
    { icon: Users, label: 'Staff Registry', id: 'staff', path: '/identity/staff', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    { icon: Users, label: 'Student Registry', id: 'students', path: '/identity/students', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    { icon: Users, label: 'Parent Registry', id: 'parents', path: '/identity/parents', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    
    // Engine Room
   /*  { icon: Cpu, label: 'Academic Blueprint', id: 'architect', path: '/academic-architect', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    { icon: GraduationCap, label: 'Grading Rules', id: 'grading-admin', path: '/grading', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
     */
    // Scheduling
    { icon: Calendar, label: 'Timetable', id: 'timetable', path: '/timetable', roles: ['TEACHER', 'STUDENT', 'ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    
    // Finance
/*     { icon: Database, label: 'Finance & Assets', id: 'finance', path: '/finance', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
 */    
    // Comms
/*     { icon: MessageSquare, label: 'Notice Board', id: 'comms', path: '/comms', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
 */    
    // Vault
   /*  { icon: ShieldCheck, label: 'User Roles', id: 'system', path: '/system', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    { icon: FileText, label: 'Extended Logs', id: 'audit-ext', path: '/audit/extended', roles: ['ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
    { icon: FileText, label: 'Academic Audit', id: 'audit', path: '/audit', roles: ['HOD', 'ADMIN', 'SUPER_ADMIN', 'HEADMASTER'] },
 */
    // Role specific
    { icon: AlertCircle, label: 'Revisions', id: 'revisions', path: '/revisions', roles: ['TEACHER'], badge: 3 },
    { icon: ClipboardCheck, label: 'Missing Observations', id: 'missing-obs', path: '/missing-observations', roles: ['TEACHER'], badge: 5, badgeColor: 'bg-amber-500' },
    { icon: GraduationCap, label: 'Grading', id: 'grading', path: '/grading', roles: ['TEACHER', 'HOD'] },
    { icon: Database, label: 'Archive', id: 'archive', path: '/archive', roles: ['TEACHER', 'HOD'] },
    { icon: ShieldCheck, label: 'Certification', id: 'certification', path: '/certification', roles: ['HOD'] },
    { icon: TrendingUp, label: 'Journey', id: 'journey', path: '/journey', roles: ['STUDENT'] },
     
  ];

  const filteredItems = navItems.filter(item => user && item.roles.includes(user.role));

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-white z-[120] lg:hidden flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center text-white font-medium text-xl shadow-lg shadow-brand-teal/20">
                  M
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 tracking-tight">MAAIS</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">Security Node</p>
                </div>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Items */}
            <div className="flex-1 overflow-y-auto py-6 px-4">
              <div className="space-y-1">
                {filteredItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all group",
                        isActive 
                          ? "bg-slate-50 text-brand-teal shadow-inner" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <item.icon size={20} className={cn(isActive ? "text-brand-teal" : "text-slate-400 group-hover:text-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="flex-1 text-[14px] font-medium tracking-tight">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "px-2 py-0.5 text-[10px] font-medium text-white rounded-full",
                          item.badgeColor || "bg-rose-500"
                        )}>
                          {item.badge}
                        </span>
                      )}
                      {isActive && <ChevronRight size={14} className="text-brand-teal/40" />}
                    </Link>
                  );
                })}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 space-y-1">
                {user?.role === 'STUDENT' ? (
                  <>
                    <Link 
                      to="/support"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-medium text-[14px] tracking-tight",
                        location.pathname === '/support' ? "bg-slate-50 text-brand-teal" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <LifeBuoy size={20} className={cn(location.pathname === '/support' ? "text-brand-teal" : "text-slate-400")} />
                      ICT Support
                    </Link>
                    <Link 
                      to="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-medium text-[14px] tracking-tight",
                        location.pathname === '/settings' ? "bg-slate-50 text-brand-teal" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <Settings size={20} className={cn(location.pathname === '/settings' ? "text-brand-teal" : "text-slate-400")} />
                      Settings
                    </Link>
                  </>
                ) : (
                  <>
                    {/* <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSupportModalOpen(true);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-[14px] tracking-tight"
                    >
                      <LifeBuoy size={20} className="text-slate-400" />
                      ICT Support
                    </button> */}
                    {/* <button 
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSettingsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all font-medium text-[14px] tracking-tight"
                    >
                      <Settings size={20} className="text-slate-400" />
                      Settings
                    </button> */}
                  </>
                )}
              </div>
            </div>

            {/* Footer / User Info */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 mt-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                  <img src={user?.avatar} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-900 tracking-tight truncate">{user?.name}</p>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 font-medium rounded-2xl text-xs hover:bg-rose-100 transition-all border border-rose-100"
              >
                <LogOut size={16} />
                Terminate Session
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
