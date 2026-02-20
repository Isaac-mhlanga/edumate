
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, Eye, UserCheck, Filter } from 'lucide-react';
import { type SubmittedAssignment } from '@/app/instructor/page';
import { type User } from 'firebase/auth';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface InstructorAssignmentsTabProps {
    assignments: SubmittedAssignment[];
    loading: boolean;
    onReviewAssignment: (assignment: SubmittedAssignment) => void;
    user: User | null;
}

export function InstructorAssignmentsTab({ assignments, loading, onReviewAssignment, user }: InstructorAssignmentsTabProps) {
    const [filter, setFilter] = React.useState('All');

    const filteredAssignments = React.useMemo(() => {
        if (filter === 'Available') {
            return assignments.filter(a => a.status === 'Pending Review');
        }
        if (filter === 'My Assignments') {
            return assignments.filter(a => a.markerId === user?.uid && a.status === 'In Progress');
        }
        return assignments;
    }, [assignments, filter, user]);
    
    const getStatusInfo = (assignment: SubmittedAssignment) => {
        switch (assignment.status) {
            case 'Pending Review':
                return {
                    icon: <Clock className="mr-1 h-3 w-3" />,
                    variant: 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400' as const,
                    text: 'Pending Review'
                };
            case 'In Progress':
                if (assignment.markerId === user?.uid) {
                    return {
                        icon: <UserCheck className="mr-1 h-3 w-3" />,
                        variant: 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400' as const,
                        text: 'Accepted by You'
                    };
                }
                return {
                    icon: <Clock className="mr-1 h-3 w-3" />,
                    variant: 'outline' as const,
                    text: 'Taken by another'
                };
            default:
                return {
                    icon: <CheckCircle className="mr-1 h-3 w-3" />,
                    variant: 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400' as const,
                    text: assignment.status
                };
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Assignment Queue</CardTitle>
                    <CardDescription>Review and mark student submissions.</CardDescription>
                </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1">
                            <Filter className="h-3.5 w-3.5" />
                            <span>Filter</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter Assignments</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filter} onValueChange={setFilter}>
                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Available">Available for Review</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="My Assignments">Accepted by Me</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="hidden sm:table-cell">Assignment</TableHead>
                            <TableHead className="hidden md:table-cell">Submitted</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredAssignments.length > 0 ? (
                            filteredAssignments.map((assignment) => {
                                const statusInfo = getStatusInfo(assignment);
                                return (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div className="font-medium">{assignment.studentName}</div>
                                            {assignment.deletedByStudent && <Badge variant="destructive" className="mt-1">Hidden by student</Badge>}
                                            <div className="text-xs text-muted-foreground sm:hidden">{assignment.title}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{assignment.title}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {assignment.submittedAt ? format(assignment.submittedAt.toDate(), 'PPP') : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={'outline'} className={statusInfo.variant}>
                                                {statusInfo.icon}
                                                {statusInfo.text}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => onReviewAssignment(assignment)}>
                                                <Eye className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Review</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    There are no assignments in this category.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {filteredAssignments.length > 0 && (
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{filteredAssignments.length}</strong> assignments.
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}

    