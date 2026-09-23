import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header, { type EditNotification } from './Header';
import { useAuth } from '../../hooks/useAuth';
import { editApi } from '../../api/pages';
import { useToast } from '../../context/ToastContext';

const AuthenticatedLayout = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<EditNotification[]>([]);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try { setNotifications(await editApi.pending()); }
    catch { setNotifications([]); }
  }, [user]);

  useEffect(() => {
    if (user) void loadNotifications();
  }, [loadNotifications, user]);

  useEffect(() => {
    const timer = window.setInterval(() => { void loadNotifications(); }, 2000);
    return () => window.clearInterval(timer);
  }, [loadNotifications]);

  const resolveNotification = async (request: EditNotification, status: 'approved' | 'rejected') => {
    try {
      await editApi.resolve(request.bookId, request._id, status);
      setNotifications((current) => current.filter((item) => item._id !== request._id));
      showToast(status === 'approved' ? 'Edit access approved.' : 'Edit request rejected.', 'success');
    } catch {
      showToast('Unable to update the edit request.', 'error');
    }
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center bg-[#f6f3ed] text-[#7b8385]">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#f6f3ed]">
      <Header onLogout={logout} username={user.username} notifications={notifications} onResolveRequest={resolveNotification} />
      <Outlet />
    </div>
  );
};

export default AuthenticatedLayout;