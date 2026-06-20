
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase.js';

const AuthContext = createContext(null);

  // Admin access is based on Supabase session + admin_users table.
  // Grant access if a matching row exists for either:
  // - id == user.id
  // - email == user.email
const getAdminFromSession = async () => {
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log('[AuthContext] No authenticated user found');
      return null;
    }

    const user = session.user;

    console.log('[AuthContext] user.id:', user.id);
    console.log('[AuthContext] user.email:', user.email);

    // First try matching by id
    let { data: adminRow, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    // If not found by id, try matching by email
    if (!adminRow) {
      const result = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      adminRow = result.data;
      error = result.error;
    }

    console.log('[AuthContext] adminRow:', adminRow);
    console.log('[AuthContext] error:', error);

    if (error) {
      console.error('[AuthContext] Query error:', error);
      return null;
    }

    if (adminRow) {
      console.log('[AuthContext] Admin matched');
      return adminRow;
    }

    console.log('[AuthContext] Rejecting: no matching admin_users row found by id/email');
    return null;
  } catch (error) {
    console.error('[AuthContext] Unexpected error:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);

const resetInactivityTimeout = () => {
  if (timeoutRef.current) clearTimeout(timeoutRef.current);

  // adminUser exists means admin access is granted
  if (adminUser) {
    timeoutRef.current = setTimeout(() => {
      logout();
      toast.error('Session expired due to inactivity. Please log in again.');
    }, INACTIVITY_TIMEOUT);
  }
};

  useEffect(() => {
    let isMounted = true;

    const loadAdmin = async () => {
      const admin = await getAdminFromSession();
      if (!isMounted) return;

      setAdminUser(admin);
      if (admin) resetInactivityTimeout();
      else if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsLoading(false);
    };

    loadAdmin();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
      // re-check role on any auth change
      loadAdmin();
    });

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimeout();
    events.forEach((event) => document.addEventListener(event, handleActivity));

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach((event) => document.removeEventListener(event, handleActivity));
      authListener.subscription?.unsubscribe();
    };
  }, []);

const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const admin = await getAdminFromSession();

    if (!admin) {
      console.log('[AuthContext][login] Unauthorized. Admin not found.');
      await logout();
      return { success: false, error: 'Unauthorized admin credentials.' };
    }

    // Row exists => success immediately (NO role/status checks)
    setAdminUser(admin);
    resetInactivityTimeout();
    return { success: true };
  } catch (error) {
    return { success: false, error: error?.message || 'Login failed' };
  }
};

const logout = async () => {
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore
  }

  setAdminUser(null);
  if (timeoutRef.current) clearTimeout(timeoutRef.current);
};



  const value = {
    adminUser,
    isAdminAuthenticated: !!adminUser,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
