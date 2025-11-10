
'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getAuth, signInWithEmailAndPassword, sendEmailVerification, type User } from "firebase/auth";
import { getApp, getApps, initializeApp, FirebaseError } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Mail, KeyRound } from "lucide-react";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app and auth service at the module level
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export default function LoginPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [emailNotVerified, setEmailNotVerified] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);

    const handleResendVerification = async () => {
        if (!currentUser) return;
        setIsLoading(true);
        try {
            await sendEmailVerification(currentUser);
            toast({
                title: "Verification Email Sent",
                description: "A new verification link has been sent to your email address.",
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send verification email. Please try again later.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        setIsLoading(true);
        setEmailNotVerified(false);
        setCurrentUser(null);
        
        const email = (e.currentTarget.querySelector('#email') as HTMLInputElement).value;
        const password = (e.currentTarget.querySelector('#password') as HTMLInputElement).value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            if (!user.emailVerified) {
                setEmailNotVerified(true);
                setCurrentUser(user);
                setIsLoading(false);
                toast({
                    variant: "destructive",
                    title: "Email Not Verified",
                    description: "Please check your inbox and verify your email address to continue.",
                });
                return;
            }

            // Fetch user role from Firestore
            const db = getFirestore(auth.app);
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                throw new Error("User profile not found. Please contact support.");
            }
            
            const role = userDoc.data().role || 'student';
            
            toast({
                title: "Login Successful",
                description: "Welcome back! Redirecting you...",
            });

            // Redirect based on role from Firestore
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
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }

            toast({
                variant: "destructive",
                title: "Login Failed",
                description: errorMessage,
            });
        } finally {
            if (!emailNotVerified) {
                setIsLoading(false);
            }
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
                            {emailNotVerified && (
                                <Alert variant="destructive">
                                    <Terminal className="h-4 w-4" />
                                    <AlertTitle>Email Not Verified</AlertTitle>
                                    <AlertDescription className="flex flex-col gap-2">
                                        You must verify your email address before you can log in.
                                        <Button type="button" variant="secondary" size="sm" onClick={handleResendVerification} disabled={isLoading}>
                                            {isLoading ? 'Sending...' : 'Resend Verification Email'}
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" type="email" placeholder="name@example.com" required disabled={emailNotVerified} className="pl-10" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input id="password" type="password" required disabled={emailNotVerified} className="pl-10" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <Link href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary">
                                    Forgot password?
                                </Link>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading}>
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
