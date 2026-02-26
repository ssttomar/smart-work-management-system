/**
 * AuthContext.js — global authentication state via React Context API.
 *
 * WHAT IT PROVIDES:
 *   user      → { token, role, name, email, userId } | null
 *   login()   → stores auth data in state + localStorage
 *   logout()  → clears state + localStorage, redirects to /login
 *   isAdmin() / isManager() / isEmployee() — role helpers
 *
 * WHY CONTEXT (not Redux):
 *   The auth state is needed in many components (Navbar, ProtectedRoute,
 *   dashboards). Context provides this without prop drilling, and the state
 *   here is simple enough not to warrant Redux boilerplate.
 *
 * HOW TOKEN PERSISTENCE WORKS:
 *   On page refresh, React state is lost. We save the token to localStorage
 *   on login and re-hydrate from it on mount (see initial state below).
 */
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

// Re-hydrate from localStorage so refresh doesn't log the user out
const storedUser = localStorage.getItem('swms_user');
const initialUser = storedUser ? JSON.parse(storedUser) : null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  const navigate = useNavigate();

  /**
   * Call this after a successful /auth/login or /auth/register response.
   * @param {Object} authData - { token, role, name, email, userId }
   */
  const login = (authData) => {
    localStorage.setItem('swms_token', authData.token);
    localStorage.setItem('swms_user',  JSON.stringify(authData));
    setUser(authData);

    // Redirect to the correct dashboard based on role
    if (authData.role === 'ADMIN')   navigate('/admin/dashboard');
    else if (authData.role === 'MANAGER') navigate('/manager/dashboard');
    else navigate('/employee/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('swms_token');
    localStorage.removeItem('swms_user');
    setUser(null);
    navigate('/login');
  };

  const isAdmin    = () => user?.role === 'ADMIN';
  const isManager  = () => user?.role === 'MANAGER';
  const isEmployee = () => user?.role === 'EMPLOYEE';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, isManager, isEmployee }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Convenience hook — use in any component: const { user, logout } = useAuth(); */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
