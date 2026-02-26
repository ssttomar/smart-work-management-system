/**
 * axiosConfig.js — single Axios instance used across the entire app.
 *
 * WHY A SHARED INSTANCE:
 *  • One baseURL — change backend URL in one place.
 *  • Request interceptor: automatically injects the JWT from localStorage
 *    into every outgoing request as "Authorization: Bearer <token>".
 *  • Response interceptor: catches 401 (token expired / invalid) globally
 *    and redirects to /login without each component needing its own handler.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',   // Spring Boot base URL
  headers: { 'Content-Type': 'application/json' },
});

// ── REQUEST INTERCEPTOR ─────────────────────────────────────────────────────
// Runs before every request. Reads the token from storage and attaches it.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('swms_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
// Runs after every response. Handles 401 (expired/invalid token) globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear storage and force re-login
      localStorage.removeItem('swms_token');
      localStorage.removeItem('swms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
