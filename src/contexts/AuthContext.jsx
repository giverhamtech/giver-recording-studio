
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import pb, { authStore } from '@/lib/firebaseClient.js';
import { toast } from 'sonner';

const AuthContext = createContext(null);

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef(null);

  const resetInactivityTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (authStore.isValid && authStore.model?.role === 'admin') {
      timeoutRef.current = setTimeout(() => {
        logout();
        toast.error('Session expired due to inactivity. Please log in again.');
      }, INACTIVITY_TIMEOUT);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      if (authStore.isValid && authStore.model?.role === 'admin') {
        setAdminUser(authStore.model);
        resetInactivityTimeout();
      } else {
        setAdminUser(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
      setIsLoading(false);
    };

    checkAuth();
    
    // Set up Firebase auth store listener
    const unsubscribe = authStore.onChange(() => {
      checkAuth();
    });

    // Set up activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetInactivityTimeout();
    
    events.forEach(event => document.addEventListener(event, handleActivity));

    return () => {
      unsubscribe();
      events.forEach(event => document.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

const login = async (email, password) => {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const { auth } = await import('../lib/firebaseClient');

    await signInWithEmailAndPassword(auth, email, password);

    // Wait for Firebase auth store to settle and expose the role.
    const authModel = await new Promise((resolve) => {
      if (authStore.isValid) {
        resolve(authStore.model);
        return;
      }

      const unsubscribeAuth = authStore.onChange((model) => {
        if (authStore.isValid) {
          unsubscribeAuth();
          resolve(model);
        }
      });

      setTimeout(() => resolve(authStore.model), 1500);
    });

    if (!authModel || authModel.role !== 'admin') {
      await logout();
      return {
        success: false,
        error: 'Unauthorized admin credentials.'
      };
    }

    setAdminUser(authModel);
    resetInactivityTimeout();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

 const logout = async () => {
  const { signOut } = await import("firebase/auth");
  const { auth } = await import("../lib/firebaseClient");

  await signOut(auth);

  setAdminUser(null);

  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }
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
