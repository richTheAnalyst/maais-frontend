import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../lib/api';

interface RoleContextType {
  user: User | null;
  isLoading: boolean;
  setRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

function mapBackendUser(backendUser: any): User {
  const profile = backendUser.staffProfile || backendUser.studentProfile || null;
  const name = profile
    ? `${profile.firstName} ${profile.lastName}`
    : backendUser.email.split('@')[0];

  // Map backend roles to frontend roles
  const roleMap: Record<string, UserRole> = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    HEADMASTER: 'ADMIN',
    HOD: 'HOD',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT',
    PARENT: 'PARENT',
  };

  return {
    id: backendUser.id,
    username: backendUser.email.split('@')[0],
    name,
    role: roleMap[backendUser.role] ?? backendUser.role,
     departmentId: backendUser.staffProfile?.departmentId ?? backendUser.staffProfile?.department?.id ?? undefined,
     staffProfileId: backendUser.staffProfile?.id ?? undefined,

     studentProfileId: backendUser.studentProfile?.id ?? undefined,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${backendUser.id}`,
  };
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: if token exists, fetch current user profile
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(mapBackendUser(res.data)))
      .catch(() => {
        localStorage.clear();
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user: backendUser } = data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', backendUser.id);

    // /auth/login returns bare user (no profile), fetch full profile
    const profileRes = await api.get('/auth/me');
    setUser(mapBackendUser(profileRes.data));
  };

  const logout = () => {
  const refreshToken = localStorage.getItem('refreshToken');
  // Fire and forget — don't await, don't block on failure
  api.post('/auth/logout', { refreshToken }).catch(() => {});
  // Always clear immediately regardless of server response
  localStorage.clear();
  setUser(null);
};

  const setRole = (role: UserRole) => {
    if (user) setUser({ ...user, role });
  };

  return (
    <RoleContext.Provider value={{ user, isLoading, setRole, login, logout }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}