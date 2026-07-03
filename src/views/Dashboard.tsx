import { Navigate } from 'react-router-dom';
import { AdminHome } from './AdminHome';
import { useRole } from '../context/RoleContext';
import { StudentDashboard } from './StudentDashboard';

export function Dashboard() {
  const { user } = useRole();

  if (!user) return null;

  // Role-based routing — each role gets its own dedicated page
  if (user.role === 'STUDENT') return <StudentDashboard />;
  if (user.role === 'ADMIN') return <AdminHome />;
  if (user.role === 'TEACHER') return <Navigate to="/dashboard/teacher" replace />;
  if (user.role === 'HOD') return <Navigate to="/dashboard/hod" replace />;

  // Fallback
  return <AdminHome />;
}