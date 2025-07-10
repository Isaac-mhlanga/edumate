
'use client';

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
    const router = useRouter();
    const { toast } = useToast();

    const handleSendLink = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Password Reset Link Sent",
            description: "If an account with that email exists, a reset link has been sent.",
        });
        router.push('/login');
    }
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <form onSubmit={handleSendLink}>
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mb-4 flex justify-center">
                                <Link href="/">
                                    <Icons.logo className="h-12 w-12 text-primary" />
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
                            <CardDescription>Enter your email and we'll send you a link to reset your password.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="name@example.com" required />
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-4">
                            <Button type="submit" className="w-full">Send Reset Link</Button>
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
