/**
 * ProtectedRoute.js - guards routes that require authentication or a specific role.
 *
 * Usage in App.js:
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} loginPath="/admin" />}>
 *     <Route path="/admin/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
 *     <Route path="/manager/tasks" element={<Tasks />} />
 *   </Route>
 *
 * HOW IT WORKS:
 *   1. If no user in context (not logged in) -> redirect to loginPath
 *      (admin routes -> /admin, all others -> /login)
 *   2. If allowedRoles is supplied and user's role is not in it -> redirect to
 *      their own dashboard (prevents URL-bar privilege escalation)
 *   3. Otherwise render the child route via <Outlet />
 */
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DASHBOARD_BY_ROLE = {
  ADMIN:    '/admin/dashboard',
  MANAGER:  '/manager/dashboard',
  EMPLOYEE: '/employee/dashboard',
};

export default function ProtectedRoute({ allowedRoles, loginPath = '/login' }) {
  const { user } = useAuth();

  // Not authenticated at all
  if (!user) return <Navigate to={loginPath} replace />;

  // Authenticated but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}
