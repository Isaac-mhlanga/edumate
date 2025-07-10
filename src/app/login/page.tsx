
'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword, type Auth } from "firebase/auth";
import { getApp, getApps, initializeApp, FirebaseError } from "firebase/app";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [auth, setAuth] = React.useState<Auth | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        setAuth(getAuth(app));
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;

        setIsLoading(true);
        const email = (e.currentTarget.querySelector('#email') as HTMLInputElement).value;
        const password = (e.currentTarget.querySelector('#password') as HTMLInputElement).value;

        // This is a mock role check. In a real app, you'd get this from Firestore or a custom claim.
        let role = 'student';
        if (email.includes('instructor')) role = 'instructor';
        if (email.includes('admin')) role = 'admin';
        if (email.includes('tutor')) role = 'tutor';

        try {
            await signInWithEmailAndPassword(auth, email, password);
            
            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting you...",
            });

            switch (role) {
                case 'instructor':
                    router.push('/instructor');
                    break;
                case 'admin':
                    router.push('/admin');
                    break;
                case 'tutor':
                    router.push('/tutor');
                    break;
                default:
                    router.push('/dashboard');
                    break;
            }

        } catch (error) {
            let errorMessage = "An unknown error occurred.";
            if (error instanceof FirebaseError) {
                switch (error.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        errorMessage = 'Invalid email or password.';
                        break;
                    default:
                        errorMessage = 'An error occurred during login.';
                        break;
                }
            }
            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <form onSubmit={handleLogin}>
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Link href="/">
                                    <Icons.logo className="h-12 w-12 text-primary" />
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Welcome Back!</CardTitle>
                            <CardDescription>Enter your credentials to access your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required />
                            </div>
                            <div className="flex items-center justify-between">
                                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                                    Forgot password?
                                </Link>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading || !auth}>
                                {isLoading ? 'Signing in...' : 'Sign In'}
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Don't have an account?{' '}
                                <Link href="/register" className="font-medium text-primary hover:underline">
                                    Sign Up
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    );
}
