
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ListFilter, ChevronLeft, ChevronRight, Clapperboard, Clock } from "lucide-react";
import { type Course } from '@/app/dashboard/page';
import { Separator } from '../ui/separator';

interface CoursesTabProps {
    allCourses: Course[];
    loadingCourses: boolean;
    onFreeEnrollment: (course: Course) => void;
}

type VideoData = {
    id: string;
    title: string;
    url:string;
    duration?: number;
};

export function CoursesTab({ allCourses, loadingCourses, onFreeEnrollment }: CoursesTabProps) {
    const [courseFilters, setCourseFilters] = React.useState({ search: '', subject: 'All', grade: 'All' });
    const [currentCoursePage, setCurrentCoursePage] = React.useState(1);
    const coursesPerPage = 6;

    const handleCourseFilterChange = (key: 'search' | 'subject' | 'grade', value: string) => {
        setCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentCoursePage(1);
    };

    const filteredCourses = React.useMemo(() => {
        return allCourses.filter(course => {
            const searchMatch = courseFilters.search.trim().toLowerCase() === '' ||
                course.title.toLowerCase().includes(courseFilters.search.trim().toLowerCase());
            const subjectMatch = courseFilters.subject === 'All' || course.subject === courseFilters.subject;
            const gradeMatch = courseFilters.grade === 'All' || course.grade === courseFilters.grade;
            return searchMatch && subjectMatch && gradeMatch;
        });
    }, [allCourses, courseFilters]);

    const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginatedCourses = filteredCourses.slice((currentCoursePage - 1) * coursesPerPage, currentCoursePage * coursesPerPage);
    const allSubjects = ['All', 'Maths', 'Physical Sciences'];
    const allGrades = ['All', '10', '11', '12'];
    
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
        <Card>
            <CardHeader>
                <CardTitle>Course Catalog</CardTitle>
                <CardDescription>Browse our full library of expert-led courses.</CardDescription>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-4 border-t">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search courses..."
                            className="pl-8"
                            value={courseFilters.search}
                            onChange={(e) => handleCourseFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Subject</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Subject</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={courseFilters.subject} onValueChange={(value) => handleCourseFilterChange('subject', value)}>
                                    {allSubjects.map(subject => <DropdownMenuRadioItem key={subject} value={subject}>{subject}</DropdownMenuRadioItem>)}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Grade</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Grade</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={courseFilters.grade} onValueChange={(value) => handleCourseFilterChange('grade', value)}>
                                    {allGrades.map(grade => <DropdownMenuRadioItem key={grade} value={grade}>{grade === 'All' ? 'All' : `Grade ${grade}`}</DropdownMenuRadioItem>)}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loadingCourses ? (
                   <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({length: 6}).map((_, i) => (
                            <Card key={i}><CardHeader><Skeleton className="h-40 w-full" /></CardHeader><CardContent className="space-y-2 pt-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                        ))}
                    </div>
                ) : paginatedCourses.length > 0 ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCourses.map((course) => (
                            <Card key={course.id} className="overflow-hidden group flex flex-col">
                                <CardHeader className="p-0">
                                    <Link href={`/courses/${course.id}?from=dashboard`}>
                                        <Image src={course.thumbnail} alt={course.title} width={600} height={400} className="aspect-video object-cover transition-transform group-hover:scale-105" data-ai-hint="online course" />
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <Badge variant="secondary" className="mb-2">{course.subject}</Badge>
                                    <h3 className="font-semibold text-base truncate">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                                </CardContent>
                                <CardFooter className="p-4 pt-0 flex-col items-start gap-4">
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
                                    {course.pricing.type === 'free' ? (
                                        <Button className="w-full" variant="secondary" onClick={() => onFreeEnrollment(course)}>Enroll for Free</Button>
                                    ) : (
                                        <Button className="w-full" asChild>
                                            <Link href={`/payment?type=course&id=${course.id}&title=${course.title}&price=${course.pricing.price}`}>
                                                {`Buy for R ${course.pricing.price}`}
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-semibold">No Courses Found</h3>
                        <p>Try adjusting your filters.</p>
                    </div>
                )}
            </CardContent>
             <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{paginatedCourses.length > 0 ? (currentCoursePage - 1) * coursesPerPage + 1 : 0}-{Math.min(currentCoursePage * coursesPerPage, filteredCourses.length)}</strong> of <strong>{filteredCourses.length}</strong> courses.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p - 1)} disabled={currentCoursePage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p + 1)} disabled={currentCoursePage >= totalCoursePages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}
