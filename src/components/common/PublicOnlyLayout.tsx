import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicOnlyLayout = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f3ed] text-[#7b8385]">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
};

export default PublicOnlyLayout;
