
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithRedirect, signOut, getRedirectResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This effect runs once on mount
    
    // First, check for the result of a redirect authentication
    getRedirectResult(auth)
      .then((result) => {
        // If a result exists, the onAuthStateChanged observer below
        // will fire with the user object, so we don't need to do anything here.
        // If result is null, it means the user just landed on the page without
        // coming from a redirect.
      })
      .catch((error) => {
        // Handle Errors here.
        console.error("Error processing redirect result:", error);
      })
      .finally(() => {
        // After processing the redirect, set up the permanent observer
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          // This is the single source of truth for loading state.
          // Once this fires for the first time, we know the auth state is determined.
          setLoading(false);
        });

        // Cleanup the subscription when the component unmounts
        return () => unsubscribe();
      });
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true); 
      await signInWithRedirect(auth, provider);
      // After this call, the page will redirect and unmount.
      // The logic in the useEffect will handle the result when the user returns.
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      setLoading(false); // Only reached if signInWithRedirect fails immediately
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // setUser will be set to null by the onAuthStateChanged observer
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signInWithGoogle, logout };

  if (loading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
