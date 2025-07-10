
'use client';

import React, { useEffect, useState, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Role = 'student' | 'instructor' | 'admin' | 'tutor';

// Get user role from Firestore
const getUserRole = async (user: User | null): Promise<Role | null> => {
    if (!user) return null;
    try {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
            return userDoc.data().role as Role;
        }
        console.warn("User document not found in Firestore for UID:", user.uid);
        return 'student'; // Default role if not found
    } catch (error) {
        console.error("Error fetching user role from Firestore:", error);
        return null;
    }
};


const withAuth = <P extends object>(
  WrappedComponent: ComponentType<P>,
  allowedRoles: Role[]
) => {
  const WithAuthComponent: React.FC<P> = (props) => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState<Role | null>(null);

    useEffect(() => {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
              const role = await getUserRole(currentUser);
              setUserRole(role);
            } else {
              setUserRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace('/login');
        } else if (userRole && !allowedRoles.includes(userRole)) {
            // If user is logged in but doesn't have the right role, send them to their correct dashboard
            switch (userRole) {
                case 'instructor':
                    router.replace('/instructor');
                    break;
                case 'admin':
                    router.replace('/admin');
                    break;
                 case 'tutor':
                    router.replace('/tutor');
                    break;
                default:
                    router.replace('/dashboard');
                    break;
            }
        }
      }
    }, [loading, user, userRole, router, allowedRoles]);

    if (loading || !user || (userRole && !allowedRoles.includes(userRole))) {
        return (
             <div className="space-y-8 p-4 md:p-6 lg:p-8">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                    <Skeleton className="h-28 rounded-xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-xl" />
            </div>
        );
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
};

export default withAuth;
