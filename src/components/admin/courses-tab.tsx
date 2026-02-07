
'use client';

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, CheckCircle, XCircle, Clock, Eye, X, Check, MoreVertical, Trash2, ChevronLeft, ChevronRight, BookOpen, Upload, Download } from "lucide-react";
import { type Course } from "@/app/admin/page";
import { Skeleton } from "../ui/skeleton";

interface AdminCoursesTabProps {
    courses: Course[];
    loading: boolean;
    onCourseAction: (course: Course, action: 'Approve' | 'Reject') => void;
    onPublishCourse: (course: Course) => void;
    onUnpublishCourse: (course: Course) => void;
}

export function AdminCoursesTab({ courses, loading, onCourseAction, onPublishCourse, onUnpublishCourse }: AdminCoursesTabProps) {
    const [courseFilters, setCourseFilters] = React.useState({ search: '', status: 'All' });
    const [currentCoursePage, setCurrentCoursePage] = React.useState(1);
    const coursesPerPage = 7;

    const handleCourseFilterChange = (key: keyof typeof courseFilters, value: string) => {
        setCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentCoursePage(1);
    };

    const filteredCourses = React.useMemo(() => {
        return courses.filter(course => {
            const searchMatch = courseFilters.search.trim().toLowerCase() === '' ||
                course.title.toLowerCase().includes(courseFilters.search.trim().toLowerCase()) ||
                course.instructor.toLowerCase().includes(courseFilters.search.trim().toLowerCase());
            const statusMatch = courseFilters.status === 'All' || course.status === courseFilters.status;
            return searchMatch && statusMatch;
        });
    }, [courses, courseFilters]);
    const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginatedCourses = filteredCourses.slice((currentCoursePage - 1) * coursesPerPage, currentCoursePage * coursesPerPage);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Course Review &amp; Management</CardTitle>
                <CardDescription>Approve, reject, and manage all courses on the platform.</CardDescription>
            </CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title or instructor..."
                        className="pl-8"
                        value={courseFilters.search}
                        onChange={(e) => handleCourseFilterChange('search', e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1 w-full md:w-auto">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span>Filter by Status</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={courseFilters.status} onValueChange={(value) => handleCourseFilterChange('status', value)}>
                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Published">Published</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Pending Approval">Pending Approval</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Draft">Draft</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead className="hidden sm:table-cell">Instructor</TableHead>
                        <TableHead className="hidden md:table-cell">Pricing (R)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="h-5 w-5" />
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-20" />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : paginatedCourses.map(course => (
                        <TableRow key={course.id}>
                            <TableCell>
                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                                    <div>
                                        <div className="font-medium">{course.title}</div>
                                        <div className="text-sm text-muted-foreground">{course.subject} - Grade {course.grade}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{course.instructor}</TableCell>
                            <TableCell className="hidden md:table-cell">{course.pricing.type === 'purchase' ? course.pricing.price?.toFixed(2) : 'Subscription'}</TableCell>
                            <TableCell>
                                <Badge variant={"outline"} className={
                                    course.status === 'Published' ? 'bg-green-500/20 text-green-700 border-green-500/30'
                                    : course.status === 'Rejected' ? 'bg-red-500/20 text-red-700 border-red-500/30'
                                    : course.status === 'Pending Approval' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
                                    : ''
                                }>
                                    {course.status === 'Published' && <CheckCircle className="mr-1 h-3 w-3"/>}
                                    {course.status === 'Rejected' && <XCircle className="mr-1 h-3 w-3"/>}
                                    {course.status === 'Pending Approval' && <Clock className="mr-1 h-3 w-3"/>}
                                    {course.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {course.status === 'Pending Approval' ? (
                                     <div className="flex gap-2 justify-end">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/instructor/courses/${course.id}?from=admin`}>
                                                <Eye className="h-4 w-4"/>
                                            </Link>
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50 hover:text-red-700" onClick={() => onCourseAction(course, 'Reject')}><X className="mr-1 h-3 w-3"/>Reject</Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onCourseAction(course, 'Approve')}><Check className="mr-1 h-3 w-3"/>Approve</Button>
                                    </div>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/instructor/courses/${course.id}?from=admin`}>
                                                    <Eye className="mr-2 h-4 w-4"/>Preview Course
                                                </Link>
                                            </DropdownMenuItem>
                                             {course.status === 'Published' ? (
                                                <DropdownMenuItem onClick={() => onUnpublishCourse(course)}>
                                                    <Download className="mr-2 h-4 w-4" /> Unpublish
                                                </DropdownMenuItem>
                                            ) : (
                                                <DropdownMenuItem onClick={() => onPublishCourse(course)}>
                                                    <Upload className="mr-2 h-4 w-4" /> Publish
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4 text-destructive"/>Delete Course</DropdownMenuItem>
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
                    Showing <strong>{(currentCoursePage - 1) * coursesPerPage + 1}-{Math.min(currentCoursePage * coursesPerPage, filteredCourses.length)}</strong> of <strong>{filteredCourses.length}</strong> courses.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p - 1)} disabled={currentCoursePage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p + 1)} disabled={currentCoursePage >= totalCoursePages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}
