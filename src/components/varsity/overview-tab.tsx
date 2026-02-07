
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, CheckCircle, FilePenLine } from "lucide-react";
import { type SubmittedAssignment } from '@/app/varsity-dashboard/page';
import { Skeleton } from '../ui/skeleton';

interface VarsityOverviewTabProps {
    submittedAssignments: SubmittedAssignment[];
    loading: boolean;
}

export function VarsityOverviewTab({ submittedAssignments, loading }: VarsityOverviewTabProps) {
    const stats = React.useMemo(() => {
        const completedAssignments = submittedAssignments.filter(a => a.status === 'Paid').length;
        const pendingAssignments = submittedAssignments.filter(a => a.status !== 'Paid').length;
        
        return [
            { title: "Completed Assignments", value: completedAssignments, icon: CheckCircle },
            { title: "Pending Assignments", value: pendingAssignments, icon: FilePenLine },
        ];
    }, [submittedAssignments]);
    
    const recentAssignment = submittedAssignments.length > 0 ? submittedAssignments[0] : null;

    return (
        <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                ) : (
                    stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            <section>
                <h2 className="text-xl font-semibold mb-4">Recent Assignment</h2>
                 {loading ? (
                    <Skeleton className="h-64 rounded-xl" />
                ) : recentAssignment ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-base truncate">{recentAssignment.title}</CardTitle>
                            <CardDescription>{recentAssignment.course}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Status: <span className="font-semibold">{recentAssignment.status}</span>
                            </p>
                             <p className="text-sm text-muted-foreground mt-1">
                                Price: <span className="font-semibold">{recentAssignment.price ? `R ${recentAssignment.price.toFixed(2)}` : 'N/A'}</span>
                            </p>
                        </CardContent>
                        <CardHeader>
                            <Button asChild>
                                <Link href="/varsity-dashboard?tab=assignments">
                                    View All Assignments <ArrowRight className="ml-2 h-4 w-4"/>
                                </Link>
                            </Button>
                        </CardHeader>
                    </Card>
                ) : (
                     <Card className="text-center py-12">
                        <CardContent>
                            <h3 className="text-lg font-semibold">No Assignments Submitted</h3>
                            <p className="text-muted-foreground mt-2 mb-4">Submit your first assignment to get expert help.</p>
                            <Button asChild>
                                <Link href="/varsity-dashboard?tab=assignments">
                                    Go to Assignments
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}
