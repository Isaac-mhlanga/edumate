
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle, FilePenLine, MessageSquare, Gift, UploadCloud } from "lucide-react";
import { type SubmittedAssignment } from '@/app/varsity-dashboard/page';
import { Skeleton } from '../ui/skeleton';
import { type User } from 'firebase/auth';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface VarsityOverviewTabProps {
    user: User | null;
    submittedAssignments: SubmittedAssignment[];
    loading: boolean;
}

export function VarsityOverviewTab({ user, submittedAssignments, loading }: VarsityOverviewTabProps) {
    const stats = React.useMemo(() => {
        const completedAssignments = submittedAssignments.filter(a => a.status === 'Paid').length;
        const pendingAssignments = submittedAssignments.filter(a => a.status !== 'Paid').length;
        
        return [
            { title: "Completed Assignments", value: completedAssignments, icon: CheckCircle },
            { title: "Pending Assignments", value: pendingAssignments, icon: FilePenLine },
        ];
    }, [submittedAssignments]);
    
    const recentPendingAssignments = submittedAssignments
        .filter(a => a.status !== 'Paid')
        .slice(0, 3);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.displayName?.split(' ')[0] || 'Student'}!</h1>
                <p className="text-sm text-muted-foreground">Here's a quick look at your academic progress.</p>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)
                ) : (
                    stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">Total assignments</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold mb-4">Your Active Assignments</h2>
                     {loading ? (
                        <Skeleton className="h-64 rounded-xl" />
                    ) : recentPendingAssignments.length > 0 ? (
                         <Card>
                            <CardContent className="p-0">
                                <div className="space-y-4">
                                {recentPendingAssignments.map(assignment => (
                                    <div key={assignment.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                                        <div>
                                            <p className="font-semibold">{assignment.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Submitted {formatDistanceToNow(assignment.submittedAt.toDate(), { addSuffix: true })}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{assignment.status}</Badge>
                                    </div>
                                ))}
                                </div>
                            </CardContent>
                            <CardHeader>
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href="/varsity-dashboard?tab=assignments">
                                        View All Assignments <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </CardHeader>
                        </Card>
                    ) : (
                         <Card className="text-center py-12 flex flex-col items-center justify-center">
                            <CardContent className="flex flex-col items-center">
                                <FilePenLine className="h-12 w-12 text-muted-foreground mb-4"/>
                                <h3 className="text-lg font-semibold">No Pending Assignments</h3>
                                <p className="text-muted-foreground mt-2 mb-4 text-sm max-w-xs">You're all caught up! Submit a new assignment to get expert help.</p>
                                <Button asChild>
                                    <Link href="/varsity-dashboard?tab=assignments">
                                        Submit an Assignment
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Quick Access</h2>
                    <Card className="hover:bg-muted/50 transition-colors">
                        <Link href="/varsity-dashboard?tab=assignments">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                    <UploadCloud className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Submit Assignment</h4>
                                    <p className="text-sm text-muted-foreground">Get help with a new task.</p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <Link href="/dashboard/community">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                    <MessageSquare className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Community Forum</h4>
                                    <p className="text-sm text-muted-foreground">Ask questions and connect.</p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                     <Card className="hover:bg-muted/50 transition-colors">
                        <Link href="/dashboard/referrals">
                             <CardContent className="p-4 flex items-center gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                                    <Gift className="h-6 w-6"/>
                                </div>
                                <div>
                                    <h4 className="font-semibold">Refer & Earn</h4>
                                    <p className="text-sm text-muted-foreground">Invite friends and get rewards.</p>
                                </div>
                            </CardContent>
                        </Link>
                    </Card>
                </div>
            </div>
        </div>
    );
}

    