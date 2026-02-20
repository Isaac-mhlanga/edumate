
'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Search, ListFilter, UploadCloud, ChevronLeft, ChevronRight, Edit, CreditCard, Download, CheckCircle, CircleDollarSign, Hourglass, FilePenLine, MoreVertical, Trash2 } from "lucide-react";
import { type SubmittedAssignment } from '@/app/dashboard/page';

interface AssignmentsTabProps {
    submittedAssignments: SubmittedAssignment[];
    loadingAssignments: boolean;
    onOpenAssignmentDialog: (assignment: SubmittedAssignment | null) => void;
    onSoftDelete: (assignmentId: string) => void;
}

export function AssignmentsTab({ submittedAssignments, loadingAssignments, onOpenAssignmentDialog, onSoftDelete }: AssignmentsTabProps) {
    const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '', status: 'All' });
    const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
    const assignmentsPerPage = 5;

    const handleAssignmentFilterChange = (key: 'search' | 'status', value: string) => {
        setAssignmentFilters(prev => ({ ...prev, [key]: value }));
        setCurrentAssignmentPage(1);
    };

    const filteredAssignments = React.useMemo(() => {
        return submittedAssignments.filter(assignment => {
            const searchMatch = assignmentFilters.search.trim().toLowerCase() === '' ||
                assignment.title.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()) ||
                assignment.course.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase());
            
            const statusMatch = assignmentFilters.status === 'All' || assignment.status === assignmentFilters.status;

            return searchMatch && statusMatch;
        });
    }, [submittedAssignments, assignmentFilters]);

    const totalAssignmentPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const paginatedAssignments = filteredAssignments.slice((currentAssignmentPage - 1) * assignmentsPerPage, currentAssignmentPage * assignmentsPerPage);

    const getStatusIcon = (status: SubmittedAssignment['status']) => {
        switch (status) {
            case 'Paid': return <CheckCircle className="mr-1 h-3 w-3" />;
            case 'Awaiting Payment': return <CircleDollarSign className="mr-1 h-3 w-3" />;
            case 'Pending Review': return <Hourglass className="mr-1 h-3 w-3" />;
            case 'Submitted': return <Hourglass className="mr-1 h-3 w-3" />;
            case 'Pending Submission': return <FilePenLine className="mr-1 h-3 w-3" />;
            default: return null;
        }
    };
    
    const getStatusBadgeVariant = (status: SubmittedAssignment['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400';
            case 'Awaiting Payment': return 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400';
            case 'Pending Review': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
            case 'Submitted': return 'bg-purple-500/20 text-purple-700 border-purple-500/30 dark:text-purple-400';
            case 'Pending Submission': return 'bg-slate-500/20 text-slate-700 border-slate-500/30 dark:text-slate-400';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Assignments</CardTitle>
                <CardDescription>Upload your work, track instructor feedback, and access paid solutions.</CardDescription>
            </CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or course..."
                        className="pl-8"
                        value={assignmentFilters.search}
                        onChange={(e) => handleAssignmentFilterChange('search', e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-1 w-full">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={assignmentFilters.status} onValueChange={(value) => handleAssignmentFilterChange('status', value)}>
                                <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Pending Submission">Pending Submission</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Pending Review">Pending Review</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Awaiting Payment">Awaiting Payment</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Paid">Paid</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button className="w-full" onClick={() => onOpenAssignmentDialog(null)}>
                        <UploadCloud className="mr-2"/>Upload
                    </Button>
                </div>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Price (R)</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingAssignments ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : paginatedAssignments.length > 0 ? (
                        paginatedAssignments.map((assignment) => (
                            <TableRow key={assignment.id}>
                                <TableCell>
                                    <div className="font-medium">{assignment.title}</div>
                                    <div className="text-sm text-muted-foreground">{assignment.course}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">{assignment.dueDate ? format(assignment.dueDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={"outline"} className={getStatusBadgeVariant(assignment.status)}>
                                        {getStatusIcon(assignment.status)}
                                        {assignment.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell font-semibold">{assignment.price !== null ? (assignment.price > 0 ? `R ${assignment.price.toFixed(2)}` : 'Free') : 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {assignment.status === 'Awaiting Payment' && assignment.price && assignment.price > 0 && (
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/payment?type=assignment&id=${assignment.id}&title=${encodeURIComponent(assignment.title)}&price=${assignment.price}`}>
                                                        <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}
                                            {assignment.status === 'Paid' && assignment.solutionUrl && (
                                                <DropdownMenuItem asChild>
                                                    <a href={assignment.solutionUrl!} download>
                                                        <Download className="mr-2 h-4 w-4" /> Download Solution
                                                    </a>
                                                </DropdownMenuItem>
                                            )}
                                             <DropdownMenuItem onClick={() => onOpenAssignmentDialog(assignment)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit Submission
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onSoftDelete(assignment.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Hide From View
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                You haven't submitted any assignments yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-sm text-muted-foreground">
                    Showing{" "}
                    <strong>
                        {filteredAssignments.length > 0 ? (currentAssignmentPage - 1) * assignmentsPerPage + 1 : 0}-
                        {Math.min(currentAssignmentPage * assignmentsPerPage, filteredAssignments.length)}
                    </strong>{" "}
                    of <strong>{filteredAssignments.length}</strong> assignments.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p - 1)} disabled={currentAssignmentPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p + 1)} disabled={currentAssignmentPage >= totalAssignmentPages}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}

    
