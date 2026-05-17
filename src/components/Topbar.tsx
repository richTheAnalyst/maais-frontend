import React from 'react';
import { Search, Lock, ChevronDown, ChevronRight, Users, GraduationCap, X, ShieldCheck, Menu, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const mockSearchResults = [
  { id: 's1', type: 'student', name: 'Angela Owusu', detail: 'SHS 3 Agric B', index: '001' },
  { id: 's2', type: 'student', name: 'Kwame Mensah', detail: 'SHS 3 Agric B', index: '002' },
  { id: 's3', type: 'student', name: 'Kofi Owusu', detail: 'SHS 2 Science A', index: '003' },
  { id: 'c1', type: 'class', name: 'SHS 1 Agric B', detail: 'General Agriculture' },
  { id: 'c2', type: 'class', name: 'SHS 2 Science A', detail: 'Elective Physics' },
];

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  SUPER_ADMIN: { label: 'Super Admin',  color: 'text-purple-700 bg-purple-50 border-purple-100' },
  HEADMASTER: { label: 'Headmaster',  color: 'text-blue-600 bg-blue-50 border-blue-100' },
  ADMIN:    { label: 'Administrator',  color: 'text-purple-600 bg-purple-50 border-purple-100' },
  HOD:      { label: 'Head of Dept',   color: 'text-amber-600 bg-amber-50 border-amber-100' },
  TEACHER:  { label: 'Teacher',        color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
  STUDENT:  { label: 'Student',        color: 'text-sky-600 bg-sky-50 border-sky-100' },
  PARENT:   { label: 'Parent',         color: 'text-rose-600 bg-rose-50 border-rose-100' },
};

export function Topbar() {
  const { user, logout } = useRole();
  const { isDraftMode, setIsDraftMode, setMobileMenuOpen } = useUI();
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  const results = query.trim()
    ? mockSearchResults.filter(r =>
        r.name.toLowerCase().includes(query.toLowerCase()) ||
        r.detail.toLowerCase().includes(query.toLowerCase()) ||
        (r.index && r.index.includes(query))
      )
    : [];

  const handleResultClick = (result: any) => {
    setQuery('');
    setIsSearching(false);
    if (result.type === 'student') {
      navigate(`/journey?student=${result.id}`);
    } else {
      navigate('/grading');
    }
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ label: 'Home', path: '/' }];
    const map: Record<string, string> = {
      '/': 'Dashboard',
      '/revisions': 'Correction Requests',
      '/missing-observations': 'Compliance Observations',
      '/timetable': 'Timetable',
      '/archive': 'Archive',
      '/grading': 'Mark Entry',
      '/audit': 'Audit Logs',
      '/certification': 'Certification',
      '/journey': 'Student Journey',
      '/system': 'System Admin',
      '/settings': 'Settings',
      '/support': 'Support',
      '/academic-architect': 'Academic Architect',
      '/comms': 'Communications',
      '/finance': 'Finance',
      '/identity/staff': 'Staff Registry',
      '/identity/students': 'Student Registry',
      '/identity/departments': 'Departments',
      '/identity/parents': 'Parent Registry',
    };
    if (map[path]) crumbs.push({ label: map[path], path });
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const roleInfo = ROLE_LABELS[user?.role ?? ''] ?? { label: user?.role ?? '', color: 'text-gray-600 bg-gray-50 border-gray-100' };

  return (
    <header className="h-16 bg-[#F0F4F2] flex items-center justify-between px-4 lg:px-8 border-b border-gray-200/50 shrink-0">
      {/* Breadcrumbs */}
      <nav className="hidden md:flex items-center gap-2 text-xs font-black uppercase tracking-widest">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight size={12} className="text-gray-400" />}
            <Link
              to={crumb.path}
              className={idx === breadcrumbs.length - 1 ? 'text-emerald-800' : 'text-gray-400 hover:text-gray-600 transition-colors'}
            >
              {crumb.label}
            </Link>
          </React.Fragment>
        ))}
      </nav>

      {/* Mobile Branding */}
      <div className="lg:hidden flex items-center gap-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 bg-[#064E3B] rounded-lg flex items-center justify-center text-white font-bold text-sm font-display italic shadow-lg shadow-emerald-950/20">
            M
          </div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#064E3B] font-display italic">MAAIS</p>
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">

        {/* Draft/Live mode toggle on grading page */}
        {user?.role !== 'STUDENT' && location.pathname === '/grading' && (
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => setIsDraftMode(!isDraftMode)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all border',
                isDraftMode
                  ? 'bg-white border-emerald-100 text-emerald-700 hover:bg-emerald-50'
                  : 'bg-emerald-800 border-emerald-900 text-white hover:bg-emerald-900'
              )}
            >
              {isDraftMode ? <Lock size={14} /> : <ShieldCheck size={14} />}
              <span>
                {user?.role === 'HOD'
                  ? isDraftMode ? 'Audit Mode' : 'Live Mode'
                  : isDraftMode ? 'Draft Mode' : 'Submitted'}
              </span>
              <div className={cn('w-1 h-1 rounded-full', isDraftMode ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-200')} />
            </button>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
              Last saved 2h ago
            </span>
          </div>
        )}

        {/* Search */}
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search students, classes..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsSearching(true); }}
            onFocus={() => setIsSearching(true)}
            className="pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all w-32 md:w-64"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setIsSearching(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
          <AnimatePresence>
            {isSearching && query.trim() && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSearching(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden min-w-[320px]"
                >
                  <div className="p-2">
                    {results.length > 0 ? results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleResultClick(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-all group text-left"
                      >
                        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', result.type === 'student' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600')}>
                          {result.type === 'student' ? <Users size={18} /> : <GraduationCap size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-gray-900 truncate group-hover:text-emerald-900">{result.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate group-hover:text-emerald-700/60">
                            {result.detail} {result.index && `• ${result.index}`}
                          </p>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover:text-emerald-400" />
                      </button>
                    )) : (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-3">
                          <Search size={24} />
                        </div>
                        <p className="text-sm font-bold text-gray-900">No results found</p>
                        <p className="text-xs font-medium text-gray-400 mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                  {results.length > 0 && (
                    <div className="bg-gray-50 p-3 border-t border-gray-100 flex items-center justify-between">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{results.length} results matching "{query}"</p>
                      <button className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 uppercase tracking-widest">View All</button>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div ref={profileRef} className="relative pl-4 border-l border-gray-200">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 hover:bg-white/80 rounded-xl px-2 py-1.5 transition-all group"
          >
            <img
              src={user?.avatar}
              alt="User"
              className="w-8 h-8 rounded-xl bg-emerald-100 border border-white shadow-sm"
            />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black text-gray-900 leading-tight">{user?.name}</p>
              <p className={cn('text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border mt-0.5 inline-block', roleInfo.color)}>
                {roleInfo.label}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={cn('text-gray-400 transition-transform hidden sm:block', profileOpen && 'rotate-180')}
            />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-2xl z-50 overflow-hidden"
              >
                {/* Profile Header */}
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-white border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar}
                      alt="User"
                      className="w-12 h-12 rounded-2xl bg-emerald-100 border-2 border-white shadow-md"
                    />
                    <div>
                      <p className="text-sm font-black text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{user?.username}</p>
                      <span className={cn('text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border mt-1 inline-block', roleInfo.color)}>
                        {roleInfo.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <Settings size={15} className="text-gray-500 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Settings</p>
                      <p className="text-[10px] text-gray-400">Identity & security</p>
                    </div>
                  </button>

                  <button
                    onClick={() => { setProfileOpen(false); navigate('/support'); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                      <UserIcon size={15} className="text-gray-500 group-hover:text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">Support</p>
                      <p className="text-[10px] text-gray-400">ICT help desk</p>
                    </div>
                  </button>
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl transition-all text-left group"
                  >
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-red-100 transition-colors">
                      <LogOut size={15} className="text-gray-500 group-hover:text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-red-600">Sign Out</p>
                      <p className="text-[10px] text-gray-400">End your session</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </header>
  );
}