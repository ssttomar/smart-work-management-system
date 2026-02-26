/**
 * App.js — root component: sets up React Router + AuthProvider + route tree.
 *
 * ROUTE STRUCTURE:
 *
 *   PUBLIC (no JWT required):
 *     /              → redirect to /login
 *     /login         → Login page
 *     /register      → Register page
 *
 *   PROTECTED (any valid JWT):
 *     /users/me      → own profile (already in UserController)
 *
 *   ADMIN ONLY:
 *     /admin/dashboard
 *     /admin/users
 *     /admin/tasks
 *     /admin/attendance
 *
 *   MANAGER ONLY:
 *     /manager/dashboard
 *     /manager/tasks
 *     /manager/attendance
 *
 *   EMPLOYEE ONLY:
 *     /employee/dashboard
 *     /employee/tasks
 *     /employee/attendance
 *
 * ProtectedRoute wraps each group and:
 *   1. Redirects to /login if unauthenticated
 *   2. Redirects to the user's own dashboard if wrong role (no privilege escalation)
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Users      from './pages/Users';
import Tasks      from './pages/Tasks';
import Attendance from './pages/Attendance';

export default function App() {
  return (
    <BrowserRouter>
      {/*
        AuthProvider must be INSIDE BrowserRouter because it calls
        useNavigate() which requires a router context.
      */}
      <AuthProvider>
        <Routes>

          {/* ── Public routes ─────────────────────────────────────── */}
          <Route path="/"         element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── ADMIN routes ───────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard"  element={<Dashboard />} />
            <Route path="/admin/users"      element={<Users />} />
            <Route path="/admin/tasks"      element={<Tasks />} />
            <Route path="/admin/attendance" element={<Attendance />} />
          </Route>

          {/* ── MANAGER routes ─────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['MANAGER']} />}>
            <Route path="/manager/dashboard"  element={<Dashboard />} />
            <Route path="/manager/tasks"      element={<Tasks />} />
            <Route path="/manager/attendance" element={<Attendance />} />
          </Route>

          {/* ── EMPLOYEE routes ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route path="/employee/dashboard"  element={<Dashboard />} />
            <Route path="/employee/tasks"      element={<Tasks />} />
            <Route path="/employee/attendance" element={<Attendance />} />
          </Route>

          {/* ── Catch-all → login ──────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
