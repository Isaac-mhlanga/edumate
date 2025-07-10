
'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function RegisterPage() {
    const router = useRouter();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock registration and redirect
        router.push('/dashboard');
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <form onSubmit={handleRegister}>
                    <Card>
                        <CardHeader className="text-center">
                             <div className="mb-4 flex justify-center">
                                <Link href="/">
                                    <Icons.logo className="h-12 w-12 text-primary" />
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Create an Account</CardTitle>
                            <CardDescription>Join Edumate Pro to start your learning journey.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input id="fullName" type="text" placeholder="John Doe" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@example.com" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">I am a...</Label>
                                <Select required>
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="instructor">Instructor</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full">Create Account</Button>
                            <div className="text-center text-sm text-muted-foreground">
                                Already have an account?{' '}
                                <Link href="/login" className="font-medium text-primary hover:underline">
                                    Sign In
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    );
}
