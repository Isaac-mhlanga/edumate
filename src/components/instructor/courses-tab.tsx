'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, PlusCircle, CheckCircle, XCircle, Clock, Edit, Trash2, Eye, Upload, Download } from 'lucide-react';
import { type Course } from '@/app/instructor/page';

interface InstructorCoursesTabProps {
    courses: Course[];
    loading: boolean;
    onAddNewCourse: () => void;
    onEditCourse: (course: Course) => void;
    onDeleteCourse: (course: Course) => void;
    onPublishCourse: (course: Course) => void;
    onUnpublishCourse: (course: Course) => void;
}

export function InstructorCoursesTab({
    courses,
    loading,
    onAddNewCourse,
    onEditCourse,
    onDeleteCourse,
    onPublishCourse,
    onUnpublishCourse,
}: InstructorCoursesTabProps) {
    const getStatusBadge = (status: Course['status']) => {
        switch (status) {
            case 'Published':
                return <Badge variant="outline" className="bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400"><CheckCircle className="mr-1 h-3 w-3"/>Published</Badge>;
            case 'Rejected':
                return <Badge variant="outline" className="bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400"><XCircle className="mr-1 h-3 w-3"/>Rejected</Badge>;
            case 'Pending Approval':
                return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
            case 'Draft':
                return <Badge variant="secondary"><Edit className="mr-1 h-3 w-3"/>Draft</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Courses</CardTitle>
                    <CardDescription>Manage your course content and student access.</CardDescription>
                </div>
                <Button onClick={onAddNewCourse}>
                    <PlusCircle className="mr-2"/> Add New Course
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Course</TableHead>
                            <TableHead className="hidden sm:table-cell">Details</TableHead>
                            <TableHead className="hidden md:table-cell">Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-16 w-28 rounded-md" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-5 w-40" />
                                                <Skeleton className="h-4 w-24" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-28" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : courses.length > 0 ? (
                            courses.map((course) => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Image src={course.thumbnail} alt={course.title} width={112} height={63} className="rounded-md object-cover aspect-video bg-muted" data-ai-hint="online course abstract" />
                                            <div>
                                                <div className="font-medium">{course.title}</div>
                                                <div className="text-xs text-muted-foreground">{course.videos.length} lessons</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                        {course.subject} - Grade {course.grade}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        {getStatusBadge(course.status)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild><Link href={`/instructor/courses/${course.id}`} className="text-xs"><Eye className="mr-2 h-4 w-4"/>Preview</Link></DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEditCourse(course)} className="text-xs"><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                {course.status === 'Draft' && <DropdownMenuItem onClick={() => onPublishCourse(course)} className="text-xs"><CheckCircle className="mr-2 h-4 w-4"/>Publish</DropdownMenuItem>}
                                                {course.status === 'Published' && <DropdownMenuItem onClick={() => onUnpublishCourse(course)} className="text-xs"><Download className="mr-2 h-4 w-4"/>Unpublish</DropdownMenuItem>}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive focus:text-destructive text-xs" onClick={() => onDeleteCourse(course)}><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    You haven't created any courses yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
