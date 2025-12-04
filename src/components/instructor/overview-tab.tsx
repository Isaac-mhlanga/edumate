
'use client';

import React from 'react';
import { type User } from 'firebase/auth';
import {
  type Course,
  type EnrolledStudent,
  type SubmittedAssignment,
  type Transaction,
} from '@/app/instructor/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, RefreshCw, Users, Book, DollarSign, Clock, ArrowUpRight, Eye } from "lucide-react";
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

interface InstructorOverviewTabProps {
  user: User | null;
  courses: Course[];
  students: EnrolledStudent[];
  assignments: SubmittedAssignment[];
  transactions: Transaction[];
  aiSummary: string;
  loading: {
    courses: boolean;
    students: boolean;
    assignments: boolean;
    transactions: boolean;
    aiSummary: boolean;
  };
  onRegenerateSummary: () => void;
  onReviewAssignment: (assignment: SubmittedAssignment) => void;
}

export function InstructorOverviewTab({
  user,
  courses,
  students,
  assignments,
  transactions,
  aiSummary,
  loading,
  onRegenerateSummary,
  onReviewAssignment
}: InstructorOverviewTabProps) {

  const totalRevenue = transactions.filter(t => t.itemType === 'Course Sale' || t.itemType === 'Assignment Sale').reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    { title: "Enrolled Students", value: students.length, icon: Users, change: `+${students.filter(s => new Date(s.joined).getMonth() === new Date().getMonth()).length} this month` },
    { title: "Active Courses", value: courses.filter(c => c.status === 'Published').length, icon: Book, change: "" },
    { title: "Total Revenue", value: `R ${totalRevenue.toFixed(2)}`, icon: DollarSign, change: "+21%" },
    { title: "Pending Assignments", value: assignments.filter(a => a.status === 'Pending Review').length, icon: Clock, change: `${assignments.filter(a => a.status === 'Pending Review' && new Date(a.submittedAt.toDate()).toDateString() === new Date().toDateString()).length} new today` },
  ];

  const recentPendingAssignments = assignments.filter(a => a.status === 'Pending Review').slice(0, 5);

  return (
    <div className="space-y-8">
       <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {loading.students || loading.courses || loading.transactions || loading.assignments ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : stats.map((stat) => (
            <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.change && <p className="text-xs text-muted-foreground flex items-center">
                        <span className="text-green-600 mr-1 flex items-center">{stat.change}</span>
                    </p>}
                </CardContent>
            </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary h-6 w-6" />
                <CardTitle className="text-xl">AI Performance Summary</CardTitle>
              </div>
              <Button variant="ghost" size="sm" disabled={loading.aiSummary} onClick={onRegenerateSummary}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading.aiSummary ? 'animate-spin' : ''}`} />
                Regenerate
              </Button>
            </div>
            <CardDescription>An AI-powered analysis of your performance.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading.aiSummary ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <p className="text-muted-foreground">{aiSummary}</p>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <CardDescription>Urgent tasks that need your attention.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                 {recentPendingAssignments.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {recentPendingAssignments.map(assignment => (
                            <TableRow key={assignment.id}>
                                <TableCell>
                                    <div className="font-medium">{assignment.studentName}</div>
                                    <div className="text-xs text-muted-foreground truncate">{assignment.title}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700">Pending</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => onReviewAssignment(assignment)}>
                                        <Eye className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex items-center justify-center h-full text-center text-sm text-muted-foreground">
                        <p>No pending assignments right now. Great job!</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </section>
    </div>
  );
}
