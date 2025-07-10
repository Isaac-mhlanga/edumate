
'use client';

import { AppLayout } from "@/components/app-layout";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { instructorData, studentData } from "@/lib/data";
import { ArrowRight, Award, Banknote, BookOpen, CheckCircle, ChevronLeft, ChevronRight, CircleDollarSign, CreditCard, Download, Edit, FilePenLine, Filter, GraduationCap, Hourglass, ListFilter, MoreVertical, ReceiptText, Search, ShieldCheck, SlidersHorizontal, Star, Undo2, UploadCloud, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";
import withAuth from "@/components/with-auth";

type SubmittedAssignment = (typeof studentData.submittedAssignments)[0];
type Transaction = (typeof studentData.transactions)[0];

function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const currentTab = searchParams.get('tab') || 'overview';

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

    // State for transactions filtering and pagination
    const [transactionFilters, setTransactionFilters] = React.useState({ search: '', type: 'All' });
    const [currentTransactionPage, setCurrentTransactionPage] = React.useState(1);
    const transactionsPerPage = 5;
    const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);

    // State for courses filtering and pagination
    const [courseFilters, setCourseFilters] = React.useState({ search: '', subject: 'All', grade: 'All', status: 'All' });
    const [currentCoursePage, setCurrentCoursePage] = React.useState(1);
    const coursesPerPage = 6;
    
    // State for "My Purchased Courses" section on Overview tab
    const [purchasedCourseFilters, setPurchasedCourseFilters] = React.useState({ search: '', subject: 'All' });
    const [currentPurchasedCoursePage, setCurrentPurchasedCoursePage] = React.useState(1);
    const purchasedCoursesPerPage = 3;


    const handleAssignmentFilterChange = (key: 'search' | 'status', value: string) => {
        setAssignmentFilters(prev => ({ ...prev, [key]: value }));
        setCurrentAssignmentPage(1);
    };

     const handleTransactionFilterChange = (key: 'search' | 'type', value: string) => {
        setTransactionFilters(prev => ({ ...prev, [key]: value }));
        setCurrentTransactionPage(1);
    };
    
    const handleCourseFilterChange = (key: 'search' | 'subject' | 'grade' | 'status', value: string) => {
        setCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentCoursePage(1);
    };
    
    const handlePurchasedCourseFilterChange = (key: 'search' | 'subject', value: string) => {
        setPurchasedCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPurchasedCoursePage(1);
    };

    const handleRefundRequest = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsRefundDialogOpen(true);
    };

    const confirmRefundRequest = () => {
        if (!selectedTransaction) return;
        toast({
            title: "Refund Request Submitted",
            description: `Your refund request for "${selectedTransaction.item}" has been submitted for review.`,
        });
        setIsRefundDialogOpen(false);
        setSelectedTransaction(null);
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

    const filteredTransactions = React.useMemo(() => {
        return studentData.transactions.filter(transaction => {
            const searchMatch = transactionFilters.search.trim().toLowerCase() === '' ||
                transaction.item.toLowerCase().includes(transactionFilters.search.trim().toLowerCase());
            
            const typeMatch = transactionFilters.type === 'All' || transaction.type === transactionFilters.type;

            return searchMatch && typeMatch;
        });
    }, [transactionFilters]);

    const totalTransactionPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentTransactionPage - 1) * transactionsPerPage, currentTransactionPage * transactionsPerPage);
    
    const allCourses = instructorData.courses;
    const purchasedCourseIds = new Set(studentData.purchasedCourses.map(c => c.id));

    const filteredCourses = React.useMemo(() => {
        return allCourses.filter(course => {
            const searchMatch = courseFilters.search.trim().toLowerCase() === '' ||
                course.title.toLowerCase().includes(courseFilters.search.trim().toLowerCase());

            const subjectMatch = courseFilters.subject === 'All' || course.subject === courseFilters.subject;
            
            const gradeMatch = courseFilters.grade === 'All' || course.grade === courseFilters.grade;
            
            const purchased = purchasedCourseIds.has(course.id);
            const statusMatch = courseFilters.status === 'All' ||
                (courseFilters.status === 'Purchased' && purchased) ||
                (courseFilters.status === 'Not Purchased' && !purchased);

            return searchMatch && subjectMatch && gradeMatch && statusMatch;
        });
    }, [allCourses, courseFilters, purchasedCourseIds]);
    
    const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginatedCourses = filteredCourses.slice((currentCoursePage - 1) * coursesPerPage, currentCoursePage * coursesPerPage);

    const purchasedCoursesWithDetails = React.useMemo(() => {
        return instructorData.courses.filter(c => purchasedCourseIds.has(c.id));
    }, [purchasedCourseIds]);

    const filteredPurchasedCourses = React.useMemo(() => {
        return purchasedCoursesWithDetails.filter(course => {
            const searchMatch = purchasedCourseFilters.search.trim().toLowerCase() === '' ||
                course.title.toLowerCase().includes(purchasedCourseFilters.search.trim().toLowerCase());
            const subjectMatch = purchasedCourseFilters.subject === 'All' || course.subject === purchasedCourseFilters.subject;
            return searchMatch && subjectMatch;
        });
    }, [purchasedCoursesWithDetails, purchasedCourseFilters]);

    const totalPurchasedCoursePages = Math.ceil(filteredPurchasedCourses.length / purchasedCoursesPerPage);
    const paginatedPurchasedCourses = filteredPurchasedCourses.slice((currentPurchasedCoursePage - 1) * purchasedCoursesPerPage, currentPurchasedCoursePage * purchasedCoursesPerPage);
    const purchasedSubjects = ['All', ...Array.from(new Set(purchasedCoursesWithDetails.map(c => c.subject)))];


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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {studentData.name.split(' ')[0]}!</h1>
                <p className="text-muted-foreground">Let's continue your learning journey.</p>
            </div>

            <div className="pt-6">
                {currentTab === 'overview' && (
                    <div className="space-y-8">
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
                                            <Button className="mt-4 w-full" asChild>
                                                <Link href={`/instructor/courses/${allCourses.find(c => c.title.includes(sub.name.split(' - ')[1]))?.id || ''}?from=dashboard`}>
                                                    Continue Learning <ArrowRight className="ml-2 h-4 w-4"/>
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>

                        <section>
                            <Card className="shadow-md rounded-xl">
                                <CardHeader>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                            <CardTitle>My Purchased Courses</CardTitle>
                                            <CardDescription>Courses you have enrolled in. Find all courses in the catalog.</CardDescription>
                                        </div>
                                        <Button variant="outline" asChild><Link href="/dashboard?tab=courses">View Full Catalog</Link></Button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4">
                                        <div className="relative flex-1 w-full">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search my courses..."
                                                className="pl-8"
                                                value={purchasedCourseFilters.search}
                                                onChange={(e) => handlePurchasedCourseFilterChange('search', e.target.value)}
                                            />
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline" className="gap-1 w-full sm:w-auto">
                                                    <Filter className="h-3.5 w-3.5" />
                                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                                        Subject
                                                    </span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Filter by Subject</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuRadioGroup value={purchasedCourseFilters.subject} onValueChange={(value) => handlePurchasedCourseFilterChange('subject', value)}>
                                                    {purchasedSubjects.map(subject => (
                                                        <DropdownMenuRadioItem key={subject} value={subject}>{subject}</DropdownMenuRadioItem>
                                                    ))}
                                                </DropdownMenuRadioGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {paginatedPurchasedCourses.length > 0 ? (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {paginatedPurchasedCourses.map((course) => (
                                                <Card key={course.id} className="overflow-hidden group flex flex-col h-full">
                                                    <CardHeader className="p-0">
                                                        <div className="bg-primary/10 aspect-video flex items-center justify-center">
                                                            <Image src={course.thumbnail} alt={course.title} width={600} height={400} className="w-full h-full object-cover transition-transform group-hover:scale-105" data-ai-hint="online course abstract" />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="p-4 flex-grow">
                                                        <Badge variant="secondary" className="mb-2">{course.subject}</Badge>
                                                        <h3 className="font-semibold text-lg">{course.title}</h3>
                                                    </CardContent>
                                                    <CardFooter className="p-4 pt-0">
                                                        <Button variant="link" className="p-0 h-auto as-child">
                                                            <Link href={`/instructor/courses/${course.id}?from=dashboard`}>
                                                                Start Learning <ArrowRight className="ml-1 h-4 w-4"/>
                                                            </Link>
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                            <h3 className="text-lg font-semibold">No Courses Found</h3>
                                            <p className="max-w-md mx-auto">{purchasedCourseFilters.search || purchasedCourseFilters.subject !== 'All' ? 'Try adjusting your search or filters.' : 'You haven\'t purchased any courses yet. Browse the catalog to start learning!'}</p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                                    <div className="text-xs text-muted-foreground">
                                        Showing{" "}
                                        <strong>
                                            {filteredPurchasedCourses.length > 0 ? (currentPurchasedCoursePage - 1) * purchasedCoursesPerPage + 1 : 0}-
                                            {Math.min(currentPurchasedCoursePage * purchasedCoursesPerPage, filteredPurchasedCourses.length)}
                                        </strong>{" "}
                                        of <strong>{filteredPurchasedCourses.length}</strong> courses.
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPurchasedCoursePage(p => p - 1)} disabled={currentPurchasedCoursePage === 1}>
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Prev
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => setCurrentPurchasedCoursePage(p => p + 1)} disabled={currentPurchasedCoursePage >= totalPurchasedCoursePages}>
                                            Next
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        </section>
                    </div>
                )}

                {currentTab === 'courses' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Catalog</CardTitle>
                            <CardDescription>Browse our available courses and start your learning adventure.</CardDescription>
                        </CardHeader>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-4 border-y">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by course title..."
                                    className="pl-8"
                                    value={courseFilters.search}
                                    onChange={(e) => handleCourseFilterChange('search', e.target.value)}
                                />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="gap-1 w-full sm:w-auto">
                                        <SlidersHorizontal className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                            Filter
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80" align="end">
                                    <div className="space-y-4">
                                        <h4 className="font-medium leading-none">Filter Courses</h4>
                                        <div className="space-y-2">
                                            <Label htmlFor="status-filter">Status</Label>
                                            <Select value={courseFilters.status} onValueChange={(value) => handleCourseFilterChange('status', value)}>
                                                <SelectTrigger id="status-filter">
                                                    <SelectValue placeholder="Filter by Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Courses</SelectItem>
                                                    <SelectItem value="Purchased">My Courses</SelectItem>
                                                    <SelectItem value="Not Purchased">Not Purchased</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="subject-filter">Subject</Label>
                                            <Select value={courseFilters.subject} onValueChange={(value) => handleCourseFilterChange('subject', value)}>
                                                <SelectTrigger id="subject-filter">
                                                    <SelectValue placeholder="Filter by Subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Subjects</SelectItem>
                                                    <SelectItem value="Maths">Maths</SelectItem>
                                                    <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="grade-filter">Grade</Label>
                                            <Select value={courseFilters.grade} onValueChange={(value) => handleCourseFilterChange('grade', value)}>
                                                <SelectTrigger id="grade-filter">
                                                    <SelectValue placeholder="Filter by Grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="All">All Grades</SelectItem>
                                                    <SelectItem value="10">Grade 10</SelectItem>
                                                    <SelectItem value="11">Grade 11</SelectItem>
                                                    <SelectItem value="12">Grade 12</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <CardContent className="pt-6">
                            {paginatedCourses.length > 0 ? (
                            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {paginatedCourses.map((course) => (
                                <Card key={course.id} className="shadow-md rounded-xl overflow-hidden group flex flex-col">
                                    <CardHeader className="p-0">
                                        <div className="bg-primary/10 aspect-video flex items-center justify-center">
                                            <Image src={course.thumbnail} alt={course.title} width={600} height={400} className="w-full h-full object-cover transition-transform group-hover:scale-105" data-ai-hint="online course abstract"/>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="p-4 flex-grow">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="secondary">{course.subject}</Badge>
                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500"/>
                                                <span>4.8</span>
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-lg mt-2">{course.title}</h3>
                                        <p className="text-xs text-muted-foreground mt-1">By {instructorData.name}</p>
                                        <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{course.description}</p>
                                    </CardContent>
                                    <CardFooter className="flex-col items-stretch p-4 bg-muted/50">
                                        {purchasedCourseIds.has(course.id) ? (
                                            <Button asChild>
                                                <Link href={`/instructor/courses/${course.id}?from=dashboard`}>
                                                    Go to Course <ArrowRight className="ml-2 h-4 w-4"/>
                                                </Link>
                                            </Button>
                                        ) : (
                                            <>
                                                <h4 className="text-xl font-bold text-center mb-2">
                                                    {course.pricing.type === 'purchase' ? `R ${course.pricing.price}` : 'By Subscription'}
                                                </h4>
                                                <Button asChild>
                                                    <Link href="/payment">
                                                        {course.pricing.type === 'purchase' ? 'Buy Now' : 'Subscribe'}
                                                    </Link>
                                                </Button>
                                            </>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                            </div>
                            ) : (
                                <div className="text-center py-16 text-muted-foreground">
                                    <h3 className="text-lg font-semibold">No Courses Found</h3>
                                    <p>Try adjusting your search or filter criteria.</p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                            <div className="text-xs text-muted-foreground">
                                Showing{" "}
                                <strong>
                                    {filteredCourses.length > 0 ? (currentCoursePage - 1) * coursesPerPage + 1 : 0}-
                                    {Math.min(currentCoursePage * coursesPerPage, filteredCourses.length)}
                                </strong>{" "}
                                of <strong>{filteredCourses.length}</strong> courses.
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p - 1)} disabled={currentCoursePage === 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p + 1)} disabled={currentCoursePage >= totalCoursePages}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                )}

                {currentTab === 'assignments' && (
                     <Card className="shadow-md rounded-xl">
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
                                            <DropdownMenuRadioItem value="Submitted">Submitted</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Awaiting Payment">Awaiting Payment</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Paid">Paid</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="w-full"><UploadCloud className="mr-2"/>Upload</Button>
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
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Assignment</TableHead>
                                    <TableHead className="hidden sm:table-cell">Course</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden md:table-cell">Price (R)</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell className="hidden sm:table-cell"><Badge variant="outline">{assignment.course}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant={"outline"} className={getStatusBadgeVariant(assignment.status)}>
                                                {getStatusIcon(assignment.status)}
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell font-semibold">{assignment.price ? assignment.price.toFixed(2) : 'N/A'}</TableCell>
                                        <TableCell className="text-right">
                                            {assignment.status === 'Pending Submission' && <Button variant="secondary" size="sm"><Edit className="mr-0 sm:mr-2 h-3.5 w-3.5"/><span className="hidden sm:inline">Submit Now</span></Button>}
                                            {assignment.status === 'Submitted' && <span className="text-sm text-muted-foreground">Awaiting Review</span>}
                                            {assignment.status === 'Awaiting Payment' && <Button asChild size="sm"><Link href="/payment"><CreditCard className="mr-0 sm:mr-2 h-3.5 w-3.5" /><span className="hidden sm:inline">Pay Now</span></Link></Button>}
                                            {assignment.status === 'Paid' && <Button asChild variant="secondary" size="sm"><a href={assignment.solutionUrl} download><Download className="mr-0 sm:mr-2 h-3.5 w-3.5" /><span className="hidden sm:inline">Download</span></a></Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
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
                )}

                {currentTab === 'transactions' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>A log of all your purchases and refunds.</CardDescription>
                        </CardHeader>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by item..."
                                    className="pl-8"
                                    value={transactionFilters.search}
                                    onChange={(e) => handleTransactionFilterChange('search', e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-1 w-full md:w-auto">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter by Type</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={transactionFilters.type} onValueChange={(value) => handleTransactionFilterChange('type', value)}>
                                        <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Course">Course</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Assignment">Assignment</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Subscription">Subscription</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                                    <TableHead className="hidden md:table-cell">Date</TableHead>
                                    <TableHead>Amount (R)</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.item}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <Badge variant="outline" className="gap-1.5">
                                                {transaction.type === 'Course' && <GraduationCap className="h-3 w-3" />}
                                                {transaction.type === 'Assignment' && <ReceiptText className="h-3 w-3" />}
                                                {transaction.type === 'Subscription' && <Banknote className="h-3 w-3" />}
                                                {transaction.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">{transaction.date}</TableCell>
                                        <TableCell className={`font-semibold ${transaction.status === 'Refunded' ? 'text-red-600' : ''}`}>
                                            {transaction.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {transaction.status !== 'Refunded' && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <ReceiptText className="mr-2 h-4 w-4"/>View Receipt
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleRefundRequest(transaction)} className="text-destructive focus:text-destructive">
                                                            <Undo2 className="mr-2 h-4 w-4"/>Request Refund
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                            <div className="text-xs text-muted-foreground">
                                Showing{" "}
                                <strong>
                                    {filteredTransactions.length > 0 ? (currentTransactionPage - 1) * transactionsPerPage + 1 : 0}-
                                    {Math.min(currentTransactionPage * transactionsPerPage, filteredTransactions.length)}
                                </strong>{" "}
                                of <strong>{filteredTransactions.length}</strong> transactions.
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentTransactionPage(p => p - 1)} disabled={currentTransactionPage === 1}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setCurrentTransactionPage(p => p + 1)} disabled={currentTransactionPage >= totalTransactionPages}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                )}
                
                {currentTab === 'subscriptions' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Current Plan</CardTitle>
                                <CardDescription>Your primary subscription for accessing course content.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Card className="bg-primary/5 border-primary">
                                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
                                        <div>
                                            <CardTitle className="text-2xl">{studentData.currentSubscription.planName}</CardTitle>
                                            <CardDescription>Next payment on {studentData.currentSubscription.nextBillingDate}</CardDescription>
                                        </div>
                                        <div className="text-right mt-4 sm:mt-0">
                                            <p className="text-3xl font-bold">R{studentData.currentSubscription.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                        </div>
                                    </CardHeader>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="destructive">Cancel Subscription</Button>
                                    </CardFooter>
                                </Card>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader>
                                <CardTitle>Available Plans</CardTitle>
                                <CardDescription>Choose a plan that best fits your learning needs.</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                {studentData.availablePlans.map(plan => (
                                    <Card key={plan.id} className="flex flex-col">
                                        <CardHeader>
                                            <div className="flex justify-between items-center">
                                                <CardTitle>{plan.name}</CardTitle>
                                                <ShieldCheck className="w-6 h-6 text-secondary"/>
                                            </div>
                                            <p className="text-3xl font-bold pt-4">R{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-green-500"/>
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                        <CardFooter>
                                            <Button className="w-full" disabled={plan.id === studentData.currentSubscription.planId}>
                                                {plan.id === studentData.currentSubscription.planId ? 'Current Plan' : 'Change Plan'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <AlertDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Request a Refund</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for your refund request for <strong>"{selectedTransaction?.item}"</strong>. Our team will review it shortly.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Textarea placeholder="Type your reason here..." />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRefundRequest}>Submit Request</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default withAuth(DashboardPage, ['student']);
