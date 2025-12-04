
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, Eye, CheckCircle, DollarSign, Hourglass, ChevronLeft, ChevronRight } from "lucide-react";
import { type Assignment } from "@/app/admin/page";

interface AdminAssignmentsTabProps {
    assignments: Assignment[];
    onOpenAssignmentReview: (assignment: Assignment) => void;
}

export function AdminAssignmentsTab({ assignments, onOpenAssignmentReview }: AdminAssignmentsTabProps) {
    const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '', instructor: 'All' });
    const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
    const assignmentsPerPage = 7;

    const handleAssignmentFilterChange = (key: keyof typeof assignmentFilters, value: string) => {
        setAssignmentFilters(prev => ({ ...prev, [key]: value }));
        setCurrentAssignmentPage(1);
    };

    const filteredAssignments = React.useMemo(() => {
        return assignments.filter(assignment => {
            const searchMatch = assignmentFilters.search.trim().toLowerCase() === '' ||
                assignment.assignmentTitle.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()) ||
                assignment.studentName.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase());
            const instructorMatch = assignmentFilters.instructor === 'All' || assignment.instructor === assignmentFilters.instructor;
            return searchMatch && instructorMatch;
        });
    }, [assignments, assignmentFilters]);
    const totalAssignmentPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const paginatedAssignments = filteredAssignments.slice((currentAssignmentPage - 1) * assignmentsPerPage, currentAssignmentPage * assignmentsPerPage);
    const assignmentInstructors = ['All', ...Array.from(new Set(assignments.map(a => a.instructor)))];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Assignments Oversight</CardTitle>
                <CardDescription>Monitor all submitted assignments for quality and pricing fairness.</CardDescription>
            </CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by assignment or student..."
                        className="pl-8"
                        value={assignmentFilters.search}
                        onChange={(e) => handleAssignmentFilterChange('search', e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1 w-full md:w-auto">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span>Filter by Instructor</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Instructor</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={assignmentFilters.instructor} onValueChange={(value) => handleAssignmentFilterChange('instructor', value)}>
                            {assignmentInstructors.map(instructor => (
                                <DropdownMenuRadioItem key={instructor} value={instructor}>{instructor}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Assignment</TableHead>
                        <TableHead className="hidden sm:table-cell">Student</TableHead>
                        <TableHead className="hidden md:table-cell">Instructor</TableHead>
                        <TableHead>Price (R)</TableHead>
                        <TableHead className="hidden lg:table-cell">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedAssignments.map(assignment => (
                        <TableRow key={assignment.id}>
                            <TableCell>
                                <div className="font-medium">{assignment.assignmentTitle}</div>
                                <div className="text-xs text-muted-foreground">{assignment.course}</div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{assignment.studentName}</TableCell>
                            <TableCell className="hidden md:table-cell">{assignment.instructor}</TableCell>
                            <TableCell className="font-semibold">{assignment.price ? assignment.price.toFixed(2) : 'N/A'}</TableCell>
                            <TableCell className="hidden lg:table-cell">
                                <Badge
                                    variant={"outline"}
                                    className={
                                        assignment.status === 'Paid' ? 'bg-green-500/20 text-green-700'
                                        : assignment.status === 'Awaiting Payment' ? 'bg-blue-500/20 text-blue-700'
                                        : 'bg-yellow-500/20 text-yellow-700'
                                    }
                                >
                                    {assignment.status === 'Paid' && <CheckCircle className="mr-1 h-3 w-3" />}
                                    {assignment.status === 'Awaiting Payment' && <DollarSign className="mr-1 h-3 w-3" />}
                                    {assignment.status === 'Pending Review' && <Hourglass className="mr-1 h-3 w-3" />}
                                    {assignment.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => onOpenAssignmentReview(assignment)}>
                                    <Eye className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">View</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{(currentAssignmentPage - 1) * assignmentsPerPage + 1}-{Math.min(currentAssignmentPage * assignmentsPerPage, filteredAssignments.length)}</strong> of <strong>{filteredAssignments.length}</strong> assignments.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p - 1)} disabled={currentAssignmentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p + 1)} disabled={currentAssignmentPage >= totalAssignmentPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}
