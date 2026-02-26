/**
 * ProtectedRoute.js — guards routes that require authentication or a specific role.
 *
 * Usage in App.js:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin/users" element={<Users />} />
 *   </Route>
 *
 * HOW IT WORKS:
 *   1. If no user in context (not logged in) → redirect to /login
 *   2. If allowedRoles is supplied and user's role is not in it → redirect to
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

export default function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  // Not authenticated at all
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated but wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role] ?? '/login'} replace />;
  }

  return <Outlet />;
}
