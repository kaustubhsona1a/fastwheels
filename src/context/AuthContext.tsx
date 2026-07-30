import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  loginAsDealer: () => void; // Keep for interface compatibility, but implement via Supabase
  loginWithGoogle?: () => Promise<void>; 
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAdmin: false,
  loading: true,
  loginAsDealer: () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo/dev dealer mode is saved in localStorage
    const demoAdmin = localStorage.getItem('demo_is_admin') === 'true';
    if (demoAdmin) {
      setIsAdmin(true);
      setLoading(false);
    }

    // Check active session with Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminRole(session.user.id);
      } else if (!demoAdmin) {
        setUser(null);
        setLoading(false);
      }
    }).catch(() => {
      if (!demoAdmin) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        checkAdminRole(session.user.id);
      } else {
        setUser(null);
        const stillDemo = localStorage.getItem('demo_is_admin') === 'true';
        if (!stillDemo) {
          setIsAdmin(false);
        }
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setIsAdmin(true);
      } else {
        // Fallback to checking demo flag if Supabase table query fails
        const demoAdmin = localStorage.getItem('demo_is_admin') === 'true';
        setIsAdmin(demoAdmin);
      }
    } catch (e) {
      console.error('Failed to check admin role', e);
      const demoAdmin = localStorage.getItem('demo_is_admin') === 'true';
      setIsAdmin(demoAdmin);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDealer = () => {
    localStorage.setItem('demo_is_admin', 'true');
    setIsAdmin(true);
  };

  const logout = async () => {
    localStorage.removeItem('demo_is_admin');
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore if Supabase is disconnected
    }
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAdmin, 
      loading, 
      loginAsDealer, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

