
'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ListFilter, Clapperboard, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type VideoData = {
    id: string;
    title: string;
    url: string;
    duration?: number;
};

type Course = {
    id: string;
    instructorId: string;
    title: string;
    description: string;
    subject: 'Mathematics' | 'Physical Sciences' | 'Life Sciences';
    grade: '10' | '11' | '12';
    thumbnail: string;
    pricing: {
        type: 'free' | 'purchase' | 'subscription';
        price?: number;
    };
    status: 'Published';
    videos: VideoData[];
    rating?: number;
    instructor?: string;
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function CoursesPage() {
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [filters, setFilters] = useState({ search: '', subject: 'All', grade: 'All' });

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);

        const fetchCourses = async () => {
            setLoadingCourses(true);
            try {
                const coursesQuery = query(collection(firestore, 'courses'), where('status', '==', 'Published'));
                const querySnapshot = await getDocs(coursesQuery);
                const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setAllCourses(fetchedCourses);
            } catch (error) {
                console.error("Error fetching courses: ", error);
            } finally {
                setLoadingCourses(false);
            }
        };

        fetchCourses();
    }, []);

    const handleFilterChange = (key: 'search' | 'subject' | 'grade', value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const filteredCourses = React.useMemo(() => {
        return allCourses.filter(course => {
            const searchMatch = filters.search.trim().toLowerCase() === '' || course.title.toLowerCase().includes(filters.search.trim().toLowerCase());
            const subjectMatch = filters.subject === 'All' || course.subject === filters.subject;
            const gradeMatch = filters.grade === 'All' || course.grade === filters.grade;
            return searchMatch && subjectMatch && gradeMatch;
        });
    }, [allCourses, filters]);

    const formatDuration = (videos: VideoData[] = []) => {
      const totalSeconds = videos.reduce((acc, video) => acc + (video.duration || 0), 0);
      if (totalSeconds === 0) return null;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
      if (minutes > 0) return `${minutes}m`;
      return `${Math.round(totalSeconds)}s`;
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-1">
                <section className="py-24 bg-muted animate-fade-in-up">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold">Course Catalog</h1>
                            <p className="text-lg text-muted-foreground mt-2">Find the perfect course to excel in your studies.</p>
                        </div>
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="relative flex-1 w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search courses..."
                                            className="pl-10"
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Select value={filters.subject} onValueChange={(value) => handleFilterChange('subject', value)}>
                                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Subjects</SelectItem>
                                                <SelectItem value="Mathematics">Mathematics</SelectItem>
                                                <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                                <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filters.grade} onValueChange={(value) => handleFilterChange('grade', value)}>
                                            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Grades</SelectItem>
                                                <SelectItem value="10">Grade 10</SelectItem>
                                                <SelectItem value="11">Grade 11</SelectItem>
                                                <SelectItem value="12">Grade 12</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {loadingCourses ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i}><CardHeader><Skeleton className="h-40 w-full" /></CardHeader><CardContent className="space-y-2 pt-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent><CardFooter><Skeleton className="h-10 w-full" /></CardFooter></Card>
                                ))}
                            </div>
                        ) : filteredCourses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredCourses.map((course) => (
                                    <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card border transition-shadow duration-300 hover:shadow-xl">
                                        <Link href={`/courses/${course.id}`} className="block">
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
                                            <div className="flex justify-between items-start">
                                                <Badge variant="secondary">{course.subject}</Badge>
                                            </div>
                                            <CardTitle className="text-base pt-2 truncate">{course.title}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                                        </CardContent>
                                        <CardFooter className="flex-col items-start gap-4">
                                            <div className="flex justify-between w-full text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <Clapperboard className="w-4 h-4" />
                                                    <span>{course.videos.length} lessons</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{formatDuration(course.videos) || 'N/A'}</span>
                                                </div>
                                            </div>
                                            <Separator />
                                            <div className="flex items-center justify-between w-full">
                                                <span className="text-xl font-bold">
                                                    {course.pricing.type === 'purchase' ? `R ${course.pricing.price}` : 'Free'}
                                                </span>
                                                <Button asChild size="sm">
                                                    <Link href={`/courses/${course.id}`}>View Course</Link>
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                <h3 className="text-lg font-semibold">No Courses Found</h3>
                                <p>Try adjusting your search filters.</p>
                            </div>
                        )}
                    </div>
                </section>
                <Footer />
            </main>
        </div>
    );
}
