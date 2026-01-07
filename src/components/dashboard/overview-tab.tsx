
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ArrowRight, Award, BookOpen, CheckCircle, Clock, CreditCard, Search, Filter, Clapperboard, ArrowUpRight, FilePenLine } from "lucide-react";
import { type Course, type SubmittedAssignment } from '@/app/dashboard/page';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';

interface OverviewTabProps {
    submittedAssignments: SubmittedAssignment[];
    purchasedCourses: Course[];
    loading: boolean;
}

type VideoData = {
    id: string;
    title: string;
    url:string;
    duration?: number;
};

export function OverviewTab({ submittedAssignments, purchasedCourses, loading }: OverviewTabProps) {
    const stats = React.useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const coursesEnrolledThisMonth = purchasedCourses.filter(c => {
             // Assuming transactionDate is passed in a real scenario, but it's not on the Course type.
             // We'll use a random proxy for now, but this logic would need to be updated with real data.
             // For demonstration, let's assume `createdAt` exists on a transaction associated with the course.
             // Since we don't have that, we'll make a placeholder.
             // A better approach would be to join transaction data with course data.
            return true; 
        }).length;


        const assignmentsCompletedThisMonth = submittedAssignments.filter(a => {
            return a.status === 'Paid' && a.submittedAt.toDate().getMonth() === currentMonth && a.submittedAt.toDate().getFullYear() === currentYear;
        }).length;
        
        const pendingAssignments = submittedAssignments.filter(a => a.status === 'Pending Review' || a.status === 'Awaiting Payment' || a.status === 'Pending Submission').length;
        const newPendingThisMonth = submittedAssignments.filter(a => 
            (a.status === 'Pending Review' || a.status === 'Awaiting Payment' || a.status === 'Pending Submission') &&
            a.submittedAt.toDate().getMonth() === currentMonth && a.submittedAt.toDate().getFullYear() === currentYear
        ).length;


        return [
            { title: "Courses in Progress", value: purchasedCourses.length, icon: BookOpen, change: `+${coursesEnrolledThisMonth} this month` },
            { title: "Completed Assignments", value: submittedAssignments.filter(a => a.status === 'Paid').length, icon: CheckCircle, change: `+${assignmentsCompletedThisMonth} this month` },
            { title: "Pending Assignments", value: pendingAssignments, icon: FilePenLine, change: `+${newPendingThisMonth} this month` },
        ];
    }, [purchasedCourses, submittedAssignments]);


    const [purchasedCourseFilters, setPurchasedCourseFilters] = React.useState({ search: '', subject: 'All' });
    const [currentPurchasedCoursePage, setCurrentPurchasedCoursePage] = React.useState(1);
    const purchasedCoursesPerPage = 3;

    const handlePurchasedCourseFilterChange = (key: 'search' | 'subject', value: string) => {
        setPurchasedCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPurchasedCoursePage(1);
    };

    const filteredPurchasedCourses = React.useMemo(() => {
        return purchasedCourses.filter(course => {
            const searchMatch = purchasedCourseFilters.search.trim().toLowerCase() === '' ||
                course.title.toLowerCase().includes(purchasedCourseFilters.search.trim().toLowerCase());
            const subjectMatch = purchasedCourseFilters.subject === 'All' || course.subject === purchasedCourseFilters.subject;
            return searchMatch && subjectMatch;
        });
    }, [purchasedCourses, purchasedCourseFilters]);

    const totalPurchasedCoursePages = Math.ceil(filteredPurchasedCourses.length / purchasedCoursesPerPage);
    const paginatedPurchasedCourses = filteredPurchasedCourses.slice((currentPurchasedCoursePage - 1) * purchasedCoursesPerPage, currentPurchasedCoursePage * purchasedCoursesPerPage);
    const purchasedSubjects = ['All', ...Array.from(new Set(purchasedCourses.map(c => c.subject)))];

    const formatDuration = (videos: VideoData[] = []) => {
      const totalSeconds = videos.reduce((acc, video) => acc + (video.duration || 0), 0);
      if (totalSeconds === 0) return null;

      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);

      if (hours > 0) {
          return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
      }
      if (minutes > 0) {
          return `${minutes}m`;
      }
      return `${Math.round(totalSeconds)}s`;
    };

    return (
        <div className="space-y-8">
            <section className="grid gap-6 md:grid-cols-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                ) : (
                    stats.map((stat) => (
                        <Card key={stat.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground flex items-center">
                                    <span className="text-green-600 mr-1 flex items-center"><ArrowUpRight className="h-4 w-4"/> {stat.change}</span>
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </section>
            
            <section>
                <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
                {loading ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        <Skeleton className="h-64 rounded-xl" />
                        <Skeleton className="h-64 rounded-xl" />
                    </div>
                ) : purchasedCourses.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                        {purchasedCourses.slice(0, 2).map((course) => (
                            <Card key={course.id} className="flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-base truncate">{course.title}</CardTitle>
                                        <Badge>Enrolled</Badge>
                                    </div>
                                    <CardDescription>{course.subject} - Grade {course.grade}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-muted-foreground">You're making great progress. Keep going to master the material.</p>
                                </CardContent>
                                <CardFooter className="flex-col items-start pt-4 border-t">
                                    <div className="w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Progress</span>
                                            <span className="text-sm font-bold text-primary">{course.progress || 0}%</span>
                                        </div>
                                        <Progress value={course.progress || 0} className="h-2"/>
                                    </div>
                                    <Button className="mt-4 w-full" asChild>
                                        <Link href={`/dashboard/courses/${course.id}?from=dashboard`}>
                                            Continue Learning <ArrowRight className="ml-2 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <Card className="text-center py-12">
                        <CardContent>
                            <h3 className="text-lg font-semibold">Start Your Learning Journey</h3>
                            <p className="text-muted-foreground mt-2 mb-4">You haven't enrolled in any courses yet. Browse the catalog to find your next course!</p>
                            <Button asChild>
                                <Link href="/dashboard?tab=courses">
                                    Browse Courses
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </section>

            <section>
                <Card>
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
                        {loading ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({length:3}).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
                            </div>
                        ) : paginatedPurchasedCourses.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {paginatedPurchasedCourses.map((course) => (
                                     <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1">
                                        <Link href={`/dashboard/courses/${course.id}?from=dashboard`} className="block">
                                            <div className="relative h-48 overflow-hidden">
                                                <Image 
                                                src={course.thumbnail}
                                                alt={course.title}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint="online course"
                                                />
                                            </div>
                                        </Link>
                                        <CardHeader>
                                            <Badge variant="secondary">{course.subject}</Badge>
                                            <CardTitle className="text-base pt-2 truncate">{course.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                            {course.description}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-4">
                                            <div className="flex justify-between w-full text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clapperboard className="w-4 h-4" />
                                                    <span>{course.videos.length} lessons</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatDuration(course.videos as VideoData[]) || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <Button asChild className="w-full">
                                                <Link href={`/dashboard/courses/${course.id}?from=dashboard`}>Start Learning</Link>
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
                </Card>
            </section>
        </div>
    );
}
