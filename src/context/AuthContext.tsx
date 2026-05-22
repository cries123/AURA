import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  isAdmin: boolean;
  isAffiliate: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  isAffiliate: false,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setUser(authUser);
      
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (authUser) {
        unsubscribeProfile = onSnapshot(doc(db, 'users', authUser.uid), async (snapshot) => {
          if (snapshot.exists()) {
            setUserProfile(snapshot.data());
            setLoading(false);
          } else {
            // check if user email matches the owner email provided in metadata/chat
            const isAdminBootstrap = authUser.email?.toLowerCase() === 'jaryn.b.healey@gmail.com';
            const newProfile = {
              uid: authUser.uid,
              email: authUser.email,
              role: isAdminBootstrap ? 'admin' : 'user',
              createdAt: new Date().toISOString(),
            };
            try {
              await setDoc(doc(db, 'users', authUser.uid), newProfile);
              // snapshot will trigger again with new data
            } catch (e) {
              console.error('Failed to create user profile:', e);
              setUserProfile({ ...newProfile, error: 'Profile creation pending rules deployment' });
              setLoading(false);
            }
          }
        }, (err) => {
          console.error('Profile listener error:', err);
          setLoading(false);
        });
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const logout = async () => {
    await auth.signOut();
  };

  const isAdmin = userProfile?.role === 'admin';
  const isAffiliate = userProfile?.role === 'affiliate';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, isAffiliate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
