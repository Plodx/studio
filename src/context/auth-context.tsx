
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
    const processAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Si hay un resultado del redirect, el onAuthStateChanged
          // se disparará de todas formas, así que no necesitamos
          // llamar a setUser(result.user) aquí. El listener de abajo lo hará.
          // Esto evita potenciales re-renders.
        }
      } catch (error) {
        console.error("Error getting redirect result:", error);
      } finally {
        // En este punto, ya sea que hubo redirect o no,
        // podemos confiar en onAuthStateChanged para el estado final.
      }
    };
    
    processAuth();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true); 
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google: ", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // setUser a null ya se maneja por el onAuthStateChanged
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
