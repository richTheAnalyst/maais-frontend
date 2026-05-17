import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Cpu, MessageSquare, MoreHorizontal } from 'lucide-react';
import { useUI } from '../context/UIContext';
import { useRole } from '../context/RoleContext';
import { cn } from '../lib/utils';

export const MobileBottomNav: React.FC = () => {
  const { setMobileMenuOpen } = useUI();
  const { user } = useRole();

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'HEADMASTER' && user.role !== 'ADMIN')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-lg border-t border-slate-200 lg:hidden flex items-center justify-around px-2 z-[90] pb-safe">
      <NavLink 
        to="/"
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
          isActive ? "text-brand-teal" : "text-slate-400"
        )}
      >
        <LayoutDashboard size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Pulse</span>
      </NavLink>

      <NavLink 
        to="/identity/staff"
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
          isActive || window.location.pathname.startsWith('/identity') ? "text-brand-teal" : "text-slate-400"
        )}
      >
        <Users size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">People</span>
      </NavLink>

      <NavLink 
        to="/academic-architect"
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
          isActive ? "text-brand-teal" : "text-slate-400"
        )}
      >
        <Cpu size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Engine</span>
      </NavLink>

      <NavLink 
        to="/comms"
        className={({ isActive }) => cn(
          "flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all",
          isActive ? "text-brand-teal" : "text-slate-400"
        )}
      >
        <MessageSquare size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Comms</span>
      </NavLink>

      <button 
        onClick={() => setMobileMenuOpen(true)}
        className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-slate-400 transition-all active:scale-95"
      >
        <MoreHorizontal size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">More</span>
      </button>
    </nav>
  );
};
