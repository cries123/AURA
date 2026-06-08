import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db, firebaseReady } from '../lib/firebase';
import { isAdminEmail } from '../lib/adminAccess';

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
    let unsubscribeAuth: (() => void) | null = null;
    let cancelled = false;

    firebaseReady.then(() => {
      if (cancelled) {
        return;
      }

      if (!auth || !db) {
        setLoading(false);
        return;
      }

      unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
        setUser(authUser);
        
        if (unsubscribeProfile) {
          unsubscribeProfile();
          unsubscribeProfile = null;
        }

        if (authUser) {
          try {
            unsubscribeProfile = onSnapshot(doc(db, 'users', authUser.uid), async (snapshot) => {
              if (snapshot.exists()) {
                const profileData = snapshot.data();
                if (isAdminEmail(authUser.email)) {
                  setUserProfile({ ...profileData, role: 'admin' });
                  if (profileData.role !== 'admin') {
                    updateDoc(doc(db, 'users', authUser.uid), { role: 'admin' }).catch((err) => {
                      console.warn('Could not persist admin role bootstrap:', err);
                    });
                  }
                } else {
                  setUserProfile(profileData);
                }
                setLoading(false);
              } else {
                // check if user email matches the owner email provided in metadata/chat
                const newProfile = {
                  uid: authUser.uid,
                  email: authUser.email,
                  role: isAdminEmail(authUser.email) ? 'admin' : 'user',
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
          } catch (subErr) {
            console.error('Failed to subscribe to user profile updates:', subErr);
            setLoading(false);
          }
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      });
    });

    return () => {
      cancelled = true;
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const logout = async () => {
    if (auth) {
      await auth.signOut();
    }
  };

  const isAdmin = userProfile?.role === 'admin';
  const isAffiliate = userProfile?.role === 'affiliate';

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAdmin, isAffiliate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
