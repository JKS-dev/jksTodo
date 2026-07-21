import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { UserProfile } from '../types';

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        if (isMounted) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || (firebaseUser.isAnonymous ? 'Guest User' : 'User'),
            isAnonymous: firebaseUser.isAnonymous,
          });
          setLoading(false);
        }
      } else {
        // Auto-initialize an anonymous Firebase session for zero-config live cloud sync
        try {
          await signInAnonymously(auth);
        } catch (err) {
          console.warn('Auto anonymous authentication failed, fallback to offline local mode:', err);
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { user, loading };
}
