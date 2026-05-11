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

const DEFAULT_PRODUCTION_API_URL = 'https://smart-work-management-system.onrender.com';

const normalizeBaseUrl = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const isLoopbackUrl = (value) => {
  try {
    const url = new URL(value);
    return ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  } catch {
    return false;
  }
};

const getApiBaseUrl = () => {
  const configuredBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL);
  const isBrowser = typeof window !== 'undefined';
  const isLocalhost = isBrowser && ['localhost', '127.0.0.1'].includes(window.location.hostname);

  // Respect an explicit production override, but ignore loopback URLs when
  // the app is deployed so a stale Vercel value cannot point auth at localhost.
  if (configuredBaseUrl && (isLocalhost || !isLoopbackUrl(configuredBaseUrl))) {
    return configuredBaseUrl;
  }

  return isLocalhost ? 'http://localhost:8080' : DEFAULT_PRODUCTION_API_URL;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
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
    const requestUrl = error.config?.url || '';
    const isAuthRequest = requestUrl.startsWith('/auth/');

    if (error.response?.status === 401 && !isAuthRequest) {
      // Token expired or invalid — clear storage and force re-login
      localStorage.removeItem('swms_token');
      localStorage.removeItem('swms_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
