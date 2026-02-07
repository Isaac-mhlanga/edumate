'use client';
import withAuth from "@/components/with-auth";
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare, FilePenLine, Gift, CreditCard } from "lucide-react";

function VarsityDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Varsity Dashboard</h1>
                <p className="text-muted-foreground">Welcome! Here are your tools for success in your tertiary studies.</p>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>Navigate to the most important sections of your dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" /> Community Forum</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">Ask questions about your modules, connect with experts, and share knowledge with peers.</p></CardContent>
                        <CardFooter>
                            <Button asChild><Link href="/dashboard/community">Go to Community</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><FilePenLine className="h-5 w-5 text-primary" /> Assignments</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">Submit your assignments and projects for expert help and detailed solutions.</p></CardContent>
                        <CardFooter>
                             <Button asChild><Link href="/dashboard?tab=assignments">View Assignments</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Gift className="h-5 w-5 text-primary" /> Referrals</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">Invite friends and earn rewards when they sign up and use our services.</p></CardContent>
                        <CardFooter>
                             <Button asChild><Link href="/dashboard/referrals">View Referrals</Link></Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> My Plan</CardTitle>
                        </CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground">Manage your subscription plan, view benefits, and update billing details.</p></CardContent>
                        <CardFooter>
                             <Button asChild><Link href="/dashboard?tab=subscriptions">Manage Plan</Link></Button>
                        </CardFooter>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}

export default withAuth(VarsityDashboardPage, ['varsity-student']);
