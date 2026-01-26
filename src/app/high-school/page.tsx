
'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { curriculumData } from '@/lib/data';
import { FunctionSquare, Rocket, Dna, BookOpen, Clapperboard, Play } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type VideoData = {
    id: string;
    title: string;
    url: string;
    duration?: number;
};

type Course = {
    id: string;
    title: string;
    subject: 'Mathematics' | 'Physical Sciences' | 'Life Sciences';
    grade: '10' | '11' | '12';
    thumbnail: string;
    videos: VideoData[];
};

type UserDoc = {
    id: string;
    fullName: string;
    role: 'student' | 'instructor' | 'admin' | 'tutor';
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const curriculumIcons: { [key: string]: React.ElementType } = {
    'Mathematics': FunctionSquare,
    'Physical Sciences': Rocket,
    'Life Sciences': Dna,
};

export default function HighSchoolPage() {
    const [allCourses, setAllCourses] = useState<Course[]>([]);
    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const [selectedCourseForPlayer, setSelectedCourseForPlayer] = useState<Course | null>(null);
    const [activeVideo, setActiveVideo] = useState<VideoData | undefined>(undefined);

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);

        const fetchCourses = async () => {
            try {
                const coursesQuery = query(collection(firestore, 'courses'), where('status', '==', 'Published'));
                const querySnapshot = await getDocs(coursesQuery);
                const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setAllCourses(fetchedCourses);
            } catch (error) {
                console.error("Error fetching published courses: ", error);
            }
        };

        fetchCourses();
    }, []);

    const handleCourseClick = (course: Course) => {
        setSelectedCourseForPlayer(course);
        if (course.videos && course.videos.length > 0) {
            setActiveVideo(course.videos[0]);
        }
        setIsVideoPlayerOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-1">
                <section id="curriculum" className="py-24 bg-muted animate-fade-in-up">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <Badge>High School</Badge>
                            <h1 className="text-4xl md:text-5xl font-headline font-bold my-4">Explore Our High School Curriculum</h1>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Our curriculum is expertly crafted and easy to use for high school students, covering all essential topics for Grades 10, 11, and 12.</p>
                        </div>
                        
                        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8">
                            {(Object.keys(curriculumData['12']) as Array<keyof typeof curriculumData['12']>).map((subject, index) => {
                                const Icon = curriculumIcons[subject];
                                return (
                                    <Card key={subject} className="animate-fade-in-up border transition-shadow duration-300 hover:shadow-xl" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                                        <CardHeader>
                                            <div className="flex items-center gap-4">
                                                {Icon && <Icon className="h-8 w-8 text-primary" />}
                                                <CardTitle className="text-2xl">{subject}</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Tabs defaultValue="12" className="w-full">
                                                <TabsList className="grid w-full grid-cols-3 border">
                                                    <TabsTrigger value="10">Grade 10</TabsTrigger>
                                                    <TabsTrigger value="11">Grade 11</TabsTrigger>
                                                    <TabsTrigger value="12">Grade 12</TabsTrigger>
                                                </TabsList>
                                                {(['10', '11', '12'] as const).map(grade => (
                                                    <TabsContent key={grade} value={grade} className="mt-4">
                                                        {(curriculumData[grade][subject] as any[]).map((chapter) => (
                                                            <div key={chapter.chapter} className="mb-4">
                                                                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                                    {chapter.chapter}
                                                                </h4>
                                                                <Accordion type="single" collapsible className="w-full pl-6">
                                                                    {chapter.topics.map((topic: string) => {
                                                                        const relevantCourses = allCourses.filter(course =>
                                                                            course.subject === subject &&
                                                                            course.grade === grade &&
                                                                            (course.title.toLowerCase().includes(topic.toLowerCase()) ||
                                                                                topic.toLowerCase().includes(course.title.toLowerCase()))
                                                                        );

                                                                        return (
                                                                            <AccordionItem value={topic} key={topic}>
                                                                                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                                                                                    {topic}
                                                                                </AccordionTrigger>
                                                                                <AccordionContent>
                                                                                    {relevantCourses.length > 0 ? (
                                                                                        <div className="grid grid-cols-1 gap-2 pt-2">
                                                                                            {relevantCourses.map(course => (
                                                                                                <div key={course.id} onClick={() => handleCourseClick(course)} className="flex items-center gap-3 p-2 rounded-md hover:bg-primary/10 cursor-pointer">
                                                                                                    <Image src={course.thumbnail} alt={course.title} width={80} height={45} className="rounded-md object-cover aspect-video" data-ai-hint="online course" />
                                                                                                    <div>
                                                                                                        <p className="font-semibold text-xs line-clamp-1">{course.title}</p>
                                                                                                        <p className="text-xs text-muted-foreground">{course.videos.length} lessons</p>
                                                                                                    </div>
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <p className="text-xs text-muted-foreground px-2 py-4 text-center">No specific courses for this topic yet.</p>
                                                                                    )}
                                                                                </AccordionContent>
                                                                            </AccordionItem>
                                                                        )
                                                                    })}
                                                                </Accordion>
                                                            </div>
                                                        ))}
                                                    </TabsContent>
                                                ))}
                                            </Tabs>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </div>
                </section>
                <Footer />
            </main>

            {selectedCourseForPlayer && (
                <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
                  <DialogContent className="max-w-4xl p-0">
                      <div className="relative aspect-video bg-black">
                          {activeVideo ? (
                              <video key={activeVideo.url} className="w-full h-full" controls autoPlay src={activeVideo.url}>
                                  Your browser does not support the video tag.
                              </video>
                          ) : (
                              <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-center p-4">
                                  <Play className="h-16 w-16 text-muted-foreground/50" />
                                  <p className="mt-4 text-lg font-semibold">Select a video to play</p>
                              </div>
                          )}
                      </div>
                      <div className="p-6">
                        <Button asChild><Link href={`/courses/${selectedCourseForPlayer.id}`}>Go to Full Course Page</Link></Button>
                      </div>
                  </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
