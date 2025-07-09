
'use client';

import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { studentData } from "@/lib/data";
import { ArrowRight, Award, BookOpen, CheckCircle, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, Download, Edit, FilePenLine, Hourglass, ListFilter, Search, UploadCloud } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

type SubmittedAssignment = (typeof studentData.submittedAssignments)[0];

export default function DashboardPage() {
    const completedAssignmentsCount = studentData.submittedAssignments.filter(a => a.status === 'Paid').length;
    const certificatesEarned = 1; 

    const stats = [
        { title: "Courses in Progress", value: studentData.activeSubscriptions.length, icon: BookOpen },
        { title: "Completed Assignments", value: completedAssignmentsCount, icon: CheckCircle },
        { title: "Certificates Earned", value: certificatesEarned, icon: Award },
    ];
    
    // State for assignments filtering and pagination
    const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '', status: 'All' });
    const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
    const assignmentsPerPage = 5;

    const handleAssignmentFilterChange = (key: 'search' | 'status', value: string) => {
        setAssignmentFilters(prev => ({ ...prev, [key]: value }));
        setCurrentAssignmentPage(1);
    };

    const filteredAssignments = React.useMemo(() => {
        return studentData.submittedAssignments.filter(assignment => {
            const searchMatch = assignmentFilters.search.trim().toLowerCase() === '' ||
                assignment.title.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()) ||
                assignment.course.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase());
            
            const statusMatch = assignmentFilters.status === 'All' || assignment.status === assignmentFilters.status;

            return searchMatch && statusMatch;
        });
    }, [assignmentFilters]);

    const totalAssignmentPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const paginatedAssignments = filteredAssignments.slice((currentAssignmentPage - 1) * assignmentsPerPage, currentAssignmentPage * assignmentsPerPage);

    const getStatusIcon = (status: SubmittedAssignment['status']) => {
        switch (status) {
            case 'Paid': return <CheckCircle className="mr-1 h-3 w-3" />;
            case 'Awaiting Payment': return <CircleDollarSign className="mr-1 h-3 w-3" />;
            case 'Submitted': return <Hourglass className="mr-1 h-3 w-3" />;
            case 'Pending Submission': return <FilePenLine className="mr-1 h-3 w-3" />;
            default: return null;
        }
    };
    
    const getStatusBadgeVariant = (status: SubmittedAssignment['status']) => {
        switch (status) {
            case 'Paid': return 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400';
            case 'Awaiting Payment': return 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400';
            case 'Submitted': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
            case 'Pending Submission': return 'bg-slate-500/20 text-slate-700 border-slate-500/30 dark:text-slate-400';
            default: return 'outline';
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {studentData.name.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground">Let's continue your learning journey.</p>
                </div>

                <section className="grid gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="shadow-md rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>
                
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {studentData.activeSubscriptions.map((sub) => (
                            <Card key={sub.id} className="shadow-md rounded-xl flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>{sub.name}</CardTitle>
                                        <Badge>Subscribed</Badge>
                                    </div>
                                    <CardDescription>Expires on: {sub.expires}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                   <p className="text-sm text-muted-foreground">You're making great progress. Keep going to master the material and achieve your goals.</p>
                                </CardContent>
                                <CardFooter className="flex-col items-start pt-4 border-t">
                                    <div className="w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Progress</span>
                                            <span className="text-sm font-bold text-primary">{sub.progress}%</span>
                                        </div>
                                        <Progress value={sub.progress} className="h-2"/>
                                    </div>
                                    <Button className="mt-4 w-full">
                                        Continue Learning <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <Card className="shadow-md rounded-xl">
                        <CardHeader>
                            <CardTitle>My Assignments</CardTitle>
                            <CardDescription>Upload your work, track instructor feedback, and access paid solutions.</CardDescription>
                        </CardHeader>
                        <div className="flex items-center justify-between gap-2 p-4 border-y">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by title or course..."
                                    className="pl-8"
                                    value={assignmentFilters.search}
                                    onChange={(e) => handleAssignmentFilterChange('search', e.target.value)}
                                />
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-1">
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
                                        <DropdownMenuRadioItem value="Submitted">Submitted</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Awaiting Payment">Awaiting Payment</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Paid">Paid</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button><UploadCloud className="mr-2"/>Upload Assignment</Button>
                                </DialogTrigger>
                                <DialogContent>
                                     <DialogHeader>
                                        <DialogTitle>Upload New Assignment</DialogTitle>
                                        <DialogDescription>Select the course and upload your assignment file.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Assignment Title</Label>
                                            <Input placeholder="e.g. Chapter 5 Problem Set" />
                                        </div>
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="dropzone-file-student" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                    <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-muted-foreground">PDF, DOCX, or JPG</p>
                                                </div>
                                                <Input id="dropzone-file-student" type="file" className="hidden" />
                                            </label>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost">Cancel</Button>
                                        <Button>Submit Assignment</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Assignment</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Price (R)</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell><Badge variant="outline">{assignment.course}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant={"outline"} className={getStatusBadgeVariant(assignment.status)}>
                                                {getStatusIcon(assignment.status)}
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{assignment.price ? assignment.price.toFixed(2) : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            {assignment.status === 'Pending Submission' && <Button variant="secondary" size="sm"><Edit className="mr-2 h-3.5 w-3.5"/>Submit Now</Button>}
                                            {assignment.status === 'Submitted' && <span className="text-sm text-muted-foreground">Awaiting Review</span>}
                                            {assignment.status === 'Awaiting Payment' && <Button asChild size="sm"><Link href="/payment"><CreditCard className="mr-2 h-3.5 w-3.5" />Pay Now</Link></Button>}
                                            {assignment.status === 'Paid' && <Button asChild variant="secondary" size="sm"><a href={assignment.solutionUrl} download><Download className="mr-2 h-3.5 w-3.5" />Download Solution</a></Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <CardFooter className="flex items-center justify-between py-4">
                            <div className="text-xs text-muted-foreground">
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
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">My Course Library</h2>
                        <Button variant="outline">View All</Button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studentData.purchasedCourses.map((course) => (
                            <Card key={course.id} className="shadow-md rounded-xl overflow-hidden group">
                                <CardHeader className="p-0">
                                    <div className="bg-primary/10 aspect-video flex items-center justify-center">
                                       <Image src="https://placehold.co/600x400.png" alt={course.name} width={600} height={400} className="w-full h-full object-cover transition-transform group-hover:scale-105" data-ai-hint="online course abstract" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                                    <h3 className="font-semibold text-lg">{course.name}</h3>
                                    <Button variant="link" className="p-0 h-auto mt-2 as-child">
                                        <Link href="#">
                                            Start Learning <ArrowRight className="ml-1 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

            </div>
        </AppLayout>
    );
}

    

    