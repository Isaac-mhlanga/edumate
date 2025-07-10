
'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock login and redirect
        router.push('/dashboard');
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
                                <Link href="#" className="text-sm text-muted-foreground hover:text-primary">
                                    Forgot password?
                                </Link>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full">Sign In</Button>
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
