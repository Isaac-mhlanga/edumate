
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreVertical, User, MessageSquare, Trash2 } from 'lucide-react';
import { type EnrolledStudent } from '@/app/instructor/page';

interface InstructorStudentsTabProps {
    students: EnrolledStudent[];
    loading: boolean;
    onStudentAction: (student: EnrolledStudent, action: 'view' | 'unenroll' | 'delete') => void;
}

export function InstructorStudentsTab({ students, loading, onStudentAction }: InstructorStudentsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>My Students</CardTitle>
                <CardDescription>View and manage students enrolled in your courses.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="hidden sm:table-cell">Enrolled In</TableHead>
                            <TableHead className="hidden md:table-cell">Progress</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-1">
                                                <Skeleton className="h-5 w-24" />
                                                <Skeleton className="h-4 w-32" />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-full" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : students.length > 0 ? (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{student.name}</div>
                                                <div className="text-sm text-muted-foreground">{student.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{student.course}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Progress value={student.progress} className="h-2 w-20" />
                                            <span className="text-sm font-semibold">{student.progress}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onStudentAction(student, 'view')}><User className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                                                <DropdownMenuItem><MessageSquare className="mr-2 h-4 w-4"/>Message</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onStudentAction(student, 'unenroll')} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Unenroll</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                    You have no students enrolled yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
             {students.length > 0 && (
                <CardFooter>
                    <div className="text-sm text-muted-foreground">
                        Showing <strong>{students.length}</strong> students.
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
