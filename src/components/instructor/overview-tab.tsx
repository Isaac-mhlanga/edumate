
'use client';

import React, { useMemo } from 'react';
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
  loading: {
    courses: boolean;
    students: boolean;
    assignments: boolean;
    transactions: boolean;
  };
  onReviewAssignment: (assignment: SubmittedAssignment) => void;
}

export function InstructorOverviewTab({
  user,
  courses,
  students,
  assignments,
  transactions,
  loading,
  onReviewAssignment
}: InstructorOverviewTabProps) {

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = transactions
        .filter(t => (t.itemType === 'Course Sale' || t.itemType === 'Assignment Sale') && t.createdAt.toDate().getMonth() === currentMonth && t.createdAt.toDate().getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthRevenue = transactions
        .filter(t => (t.itemType === 'Course Sale' || t.itemType === 'Assignment Sale') && t.createdAt.toDate().getMonth() === lastMonth && t.createdAt.toDate().getFullYear() === lastMonthYear)
        .reduce((sum, t) => sum + t.amount, 0);

    let revenueChange = '0%';
    if (lastMonthRevenue > 0) {
        const change = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        revenueChange = `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
    } else if (currentMonthRevenue > 0) {
        revenueChange = '+100%';
    }

    const newStudentsThisMonth = students.filter(s => new Date(s.joined).getMonth() === currentMonth && new Date(s.joined).getFullYear() === currentYear).length;
    const pendingAssignments = assignments.filter(a => a.status === 'Pending Review').length;
    const newAssignmentsToday = assignments.filter(a => a.status === 'Pending Review' && new Date(a.submittedAt.toDate()).toDateString() === now.toDateString()).length;
    const totalRevenue = transactions.filter(t => t.itemType === 'Course Sale' || t.itemType === 'Assignment Sale').reduce((sum, t) => sum + t.amount, 0);

    return [
      { title: "Enrolled Students", value: students.length, icon: Users, change: `+${newStudentsThisMonth} this month` },
      { title: "Active Courses", value: courses.filter(c => c.status === 'Published').length, icon: Book, change: "" },
      { title: "Total Revenue", value: `R ${totalRevenue.toFixed(2)}`, icon: DollarSign, change: `${revenueChange} this month` },
      { title: "Pending Assignments", value: pendingAssignments, icon: Clock, change: `${newAssignmentsToday} new today` },
    ];
  }, [students, courses, transactions, assignments]);

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

      <section className="grid gap-6">
        <Card className="flex flex-col">
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
