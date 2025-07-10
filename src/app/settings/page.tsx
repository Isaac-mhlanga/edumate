
'use client';

import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, updateProfile, type User, type Auth } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import withAuth from '@/components/with-auth';
import { UserCircle, Save } from 'lucide-react';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Role = 'student' | 'instructor' | 'admin' | 'tutor';

const settingsFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email(),
  role: z.enum(['student', 'instructor', 'tutor', 'admin']),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function SettingsPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
  });

  useEffect(() => {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const db = getFirestore(app);
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            form.reset({
                fullName: currentUser.displayName || userData.fullName || '',
                email: currentUser.email || '',
                role: userData.role || 'student',
            });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [form]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!user || !auth) return;

    try {
      // Update display name in Firebase Auth
      if (data.fullName !== user.displayName) {
        await updateProfile(user, { displayName: data.fullName });
      }
      
      // Update user document in Firestore
      const db = getFirestore(auth.app);
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        fullName: data.fullName,
        role: data.role,
      });

      toast({
        title: 'Settings Saved',
        description: 'Your profile information has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
      });
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
            <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" readOnly disabled {...field} />
                    </FormControl>
                     <FormDescription>
                        Email address cannot be changed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your role" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                     <FormDescription>
                        Changing your role will change your dashboard view upon next login.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4"/>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

// Protect the settings page with authentication, allowing any role.
export default withAuth(SettingsPage, ['student', 'instructor', 'admin', 'tutor']);
