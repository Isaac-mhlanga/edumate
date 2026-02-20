'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { getAuth, sendPasswordResetEmail, type Auth } from "firebase/auth";
import { getApp, getApps, initializeApp, FirebaseError } from "firebase/app";
import Image from "next/image";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [auth, setAuth] = React.useState<Auth | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        setAuth(getAuth(app));
    }, []);

    const handleSendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!auth) return;

        setIsLoading(true);
        const email = (e.currentTarget.querySelector('#email') as HTMLInputElement).value;

        try {
            await sendPasswordResetEmail(auth, email);
            toast({
                title: "Password Reset Link Sent",
                description: "If an account with that email exists, a reset link has been sent.",
            });
            router.push('/login');
        } catch (error) {
             let errorMessage = "An unknown error occurred.";
            if (error instanceof FirebaseError) {
                // We don't want to reveal if an email exists or not for security reasons.
                // So we show a generic message for most errors.
                errorMessage = "Could not send reset link. Please try again later.";
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast({
                variant: "destructive",
                title: "Error",
                description: errorMessage,
            });
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
             <Image
                src="https://picsum.photos/seed/loginbg/1920/1080"
                alt="Background"
                fill
                className="object-cover z-0"
                data-ai-hint="modern campus building"
            />
            <div className="absolute inset-0 bg-black/60 z-0" />
            <div className="relative z-10 w-full max-w-md">
                <form onSubmit={handleSendLink}>
                    <Card className="bg-card/80 backdrop-blur-lg border-white/20">
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Link href="/">
                                    <Icons.logo className="w-auto h-12" />
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                            <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@example.com" required className="bg-background/70"/>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full" disabled={isLoading || !auth}>
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                            <div className="text-center text-sm text-muted-foreground">
                                <Link href="/login" className="font-medium text-primary hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    );
}
