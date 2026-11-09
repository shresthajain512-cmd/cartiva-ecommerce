import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, registerApi } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'cartiva_auth_token';
const USER_KEY = 'cartiva_auth_user';

// Built-in verified demo accounts for development/test mode ONLY.
// In production builds (npm run build), import.meta.env.DEV evaluates to false,
// allowing esbuild/Rollup to dead-code eliminate this entire object and all credentials.
const DEV_DEMO_ACCOUNTS = import.meta.env.DEV
  ? {
      customer: {
        email: 'patron@cartiva.com',
        password: 'CartivaCustomer123!',
        name: 'Shrestha Jain',
        role: 'customer'
      },
      seller: {
        email: 'kaito@kansosound.com',
        password: 'ArtisanPassword123!',
        name: 'Kaito Tanaka',
        businessName: 'Kanso Sound & Acoustics',
        role: 'seller'
      },
      admin: {
        email: 'd11_admin@example.com',
        password: 'Password123!',
        name: 'Cartiva Curator Admin',
        role: 'admin'
      }
    }
  : null;

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Sync token and user to localStorage
  useEffect(() => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (err) {
      console.error('Failed to sync auth token to localStorage:', err);
    }
  }, [token]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (err) {
      console.error('Failed to sync user to localStorage:', err);
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const res = await loginApi(email, password);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user, token: res.token };
      }
      throw new Error(res.message || 'Login failed');
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const res = await registerApi(userData);
      if (res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        return { success: true, user: res.user, token: res.token };
      }
      throw new Error(res.message || 'Registration failed');
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {}
  }, []);

  /**
   * Secure session helper for checkout:
   * - If already authenticated with a valid token, returns the active token.
   * - If unauthenticated, requires user-provided credentials (email & password)
   *   to log in or register a distinct, dedicated customer account.
   * - Never silently falls back to a shared hardcoded account.
   */
  const ensureAuthenticatedSession = useCallback(
    async (credentials = {}) => {
      if (token && user) {
        return token;
      }

      const email = (credentials.email || '').toLowerCase().trim();
      const password = credentials.password || '';
      const name = (credentials.name || '').trim() || 'Cartiva Patron';

      if (!email || !password) {
        throw new Error('Please sign in or enter an account password to place your order with studio insurance.');
      }

      setIsLoading(true);
      try {
        // 1. Attempt login with patron's explicit credentials
        try {
          const loginRes = await loginApi(email, password);
          if (loginRes.token) {
            setToken(loginRes.token);
            setUser(loginRes.user);
            return loginRes.token;
          }
        } catch (loginErr) {
          // 2. If login failed, attempt new customer registration
          const regRes = await registerApi({
            name,
            email,
            password,
            role: 'customer'
          });
          if (regRes.token) {
            setToken(regRes.token);
            setUser(regRes.user);
            return regRes.token;
          }
        }
      } catch (err) {
        throw new Error(err.message || 'Authentication failed. Please verify your email and password.');
      } finally {
        setIsLoading(false);
      }

      return token;
    },
    [token, user]
  );

  /**
   * One-click demo persona switcher:
   * Strictly enabled only in development environments (import.meta.env.DEV).
   * In production builds, this resolves to a rejected promise and DEV_DEMO_ACCOUNTS
   * is completely eliminated from the bundle.
   */
  const loginAsDemo = useCallback(
    import.meta.env.DEV
      ? async (roleName = 'customer') => {
          const demo = DEV_DEMO_ACCOUNTS?.[roleName] || DEV_DEMO_ACCOUNTS?.customer;
          if (!demo) throw new Error('Demo persona not configured');
          try {
            return await login(demo.email, demo.password);
          } catch {
            return await register(demo);
          }
        }
      : async () => {
          throw new Error('Test persona switching is disabled in production builds');
        },
    [login, register]
  );

  const value = {
    user,
    token,
    role: user?.role || 'customer',
    isAuthenticated: Boolean(token && user),
    isDev: Boolean(import.meta.env.DEV),
    isLoading,
    login,
    register,
    logout,
    ensureAuthenticatedSession,
    loginAsDemo
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};