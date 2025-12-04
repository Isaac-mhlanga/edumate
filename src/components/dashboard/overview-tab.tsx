
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
import { studentData } from "@/lib/data";
import { ArrowRight, Award, BookOpen, CheckCircle, Search, Filter } from "lucide-react";
import { type Course, type SubmittedAssignment } from '@/app/dashboard/page';

interface OverviewTabProps {
    submittedAssignments: SubmittedAssignment[];
    allCourses: Course[];
    purchasedCourseIds: Set<string>;
}

export function OverviewTab({ submittedAssignments, allCourses, purchasedCourseIds }: OverviewTabProps) {
    const completedAssignmentsCount = submittedAssignments.filter(a => a.status === 'Paid').length;
    const certificatesEarned = 1; 

    const stats = [
        { title: "Courses in Progress", value: studentData.activeSubscriptions.length, icon: BookOpen },
        { title: "Completed Assignments", value: completedAssignmentsCount, icon: CheckCircle },
        { title: "Certificates Earned", value: certificatesEarned, icon: Award },
    ];

    const [purchasedCourseFilters, setPurchasedCourseFilters] = React.useState({ search: '', subject: 'All' });
    const [currentPurchasedCoursePage, setCurrentPurchasedCoursePage] = React.useState(1);
    const purchasedCoursesPerPage = 3;

    const handlePurchasedCourseFilterChange = (key: 'search' | 'subject', value: string) => {
        setPurchasedCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPurchasedCoursePage(1);
    };

    const purchasedCoursesWithDetails = React.useMemo(() => {
        return allCourses.filter(c => purchasedCourseIds.has(c.id));
    }, [allCourses, purchasedCourseIds]);

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

    return (
        <div className="space-y-8">
            <section className="grid gap-6 md:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
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
                <h2 className="text-xl font-semibold mb-4">Continue Learning</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {studentData.activeSubscriptions.map((sub) => (
                        <Card key={sub.id} className="flex flex-col">
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
                                    <Link href={`/courses/${allCourses.find(c => c.title.includes(sub.name.split(' - ')[1]))?.id || ''}?from=dashboard`}>
                                        Continue Learning <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
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
                                                <Link href={`/courses/${course.id}?from=dashboard`}>
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
                </Card>
            </section>
        </div>
    );
}
