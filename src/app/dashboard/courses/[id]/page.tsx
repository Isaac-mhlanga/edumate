'use client';

import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clapperboard, PlayCircle, Settings, Sparkles, Star, Download, Loader2, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import withAuth from "@/components/with-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type VideoData = {
    id: string;
    title: string;
    url: string;
    notesUrl?: string;
    duration?: number;
};

type Course = {
    id: string;
    instructorId: string;
    title: string;
    description: string;
    subject: 'Maths' | 'Physical Sciences';
    grade: '10' | '11' | '12';
    thumbnail: string;
    pricing: {
        type: 'free' | 'purchase' | 'subscription';
        price?: number;
    };
    status: 'Draft' | 'Published' | 'Pending Approval' | 'Rejected';
    videos: VideoData[];
    instructor?: string;
    rating?: number;
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function StudentCoursePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const courseId = params.id as string;
    const [course, setCourse] = React.useState<Course | null>(null);
    const [loading, setLoading] = React.useState(true);
    
    const [activeVideo, setActiveVideo] = React.useState<VideoData | undefined>(undefined);
    const [quality, setQuality] = React.useState('720p');
    const [playbackRate, setPlaybackRate] = React.useState('1');
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [isNotesOpen, setIsNotesOpen] = React.useState(false);

    const [currentPage, setCurrentPage] = React.useState(1);
    const videosPerPage = 10;

    React.useEffect(() => {
        const fetchCourse = async () => {
            if (!courseId) return;
            setLoading(true);
            const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
            const courseRef = doc(firestore, 'courses', courseId);
            const docSnap = await getDoc(courseRef);

            if (docSnap.exists()) {
                const courseData = { id: docSnap.id, ...docSnap.data() } as Course;
                setCourse(courseData);
                if (courseData.videos && courseData.videos.length > 0) {
                    setActiveVideo(courseData.videos[0]);
                }
            } else {
                console.error("No such course!");
            }
            setLoading(false);
        };
        fetchCourse();
    }, [courseId]);

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = parseFloat(playbackRate);
        }
    }, [playbackRate]);

    const handleSummarize = async () => {
        toast({
            title: 'Feature Coming Soon!',
            description: 'Our team is hard at work on this AI-powered video analysis feature. Stay tuned!',
        });
    };

    const from = searchParams.get('from');
    let backLink = '/dashboard?tab=courses';
    if (from === 'dashboard') {
        backLink = '/dashboard?tab=courses';
    }

    if (loading) {
        return (
             <div className="space-y-6">
                <div><Skeleton className="h-10 w-40" /></div>
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                         <Card><CardHeader><Skeleton className="h-96 w-full" /></CardHeader><CardContent className="pt-4 space-y-2"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-full" /></CardContent></Card>
                    </div>
                     <div className="lg:col-span-1 space-y-6">
                        <Card><Skeleton className="h-64 w-full" /></Card>
                    </div>
                </div>
            </div>
        )
    }

    if (!course) {
        notFound();
    }
    
    const totalPages = Math.ceil(course.videos.length / videosPerPage);
    const paginatedVideos = course.videos.slice(
        (currentPage - 1) * videosPerPage,
        currentPage * videosPerPage
    );

    const isYouTube = activeVideo?.url.includes('youtube.com/embed');


    return (
        <div className="space-y-4">
             <div className="mb-2">
                <Button variant="link" asChild className="p-0 text-sm h-auto">
                    <Link href={backLink}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="overflow-hidden shadow-lg rounded-lg">
                        <CardHeader className="p-0">
                            <div className="relative aspect-video bg-black rounded-t-lg overflow-hidden">
                                {activeVideo ? (
                                     isYouTube ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={activeVideo.url}
                                            title={activeVideo.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                    <>
                                        <video
                                            ref={videoRef}
                                            key={activeVideo.url}
                                            className="w-full h-full"
                                            controls
                                            autoPlay
                                            src={activeVideo.url}
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                        <div className="absolute bottom-4 right-4 z-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="secondary" size="icon" className="text-white bg-black/50 hover:bg-black/80 border-white/20">
                                                        <Settings className="h-5 w-5" />
                                                        <span className="sr-only">Video Settings</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                                                        <DropdownMenuRadioItem value="1080p">1080p</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="720p">720p</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="480p">480p</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="360p">360p (Auto)</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </>
                                    )
                                ) : (
                                    <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-center p-4">
                                        <PlayCircle className="h-16 w-16 text-muted-foreground/50" />
                                        <p className="mt-4 text-lg font-semibold">Select a video to play</p>
                                        <p className="text-sm text-muted-foreground">Choose a lesson from the "Course Content" list.</p>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge variant="secondary" className="mb-2">{course.subject} - Grade {course.grade}</Badge>
                                    <CardTitle className="text-xl">{course.title}</CardTitle>
                                </div>
                                {activeVideo && <h2 className="text-xl font-semibold text-right flex-shrink-0 pl-4">{activeVideo.title}</h2>}
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                    <span>{course.rating || '4.8'} (24 reviews)</span>
                                </div>
                                <span>{course.instructor || 'Dr. Evelyn Reed'}</span>
                            </div>
                            <CardDescription className="mt-4 text-base">
                                {course.description}
                            </CardDescription>
                            <div className="mt-4 pt-4 border-t space-y-4">
                                <div className="flex items-center gap-2">
                                     {activeVideo?.notesUrl && (
                                        <Button variant="outline" onClick={() => setIsNotesOpen(true)}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            View Notes
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="shadow-lg rounded-lg">
                        <CardHeader>
                            <CardTitle>Course Content</CardTitle>
                            <CardDescription>
                                {course.videos.length} lessons
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                                {paginatedVideos.map((video, index) => {
                                    const originalIndex = (currentPage - 1) * videosPerPage + index;
                                    return (
                                        <AccordionItem value={`item-${originalIndex}`} key={video.id} className="border-x-0 px-4">
                                            <AccordionTrigger className="text-left hover:no-underline" onClick={() => setActiveVideo(video)}>
                                                <div className="flex items-center justify-between w-full">
                                                    <div className="flex items-center gap-3">
                                                        <Clapperboard className="h-5 w-5 text-muted-foreground"/>
                                                        <span>{originalIndex + 1}. {video.title}</span>
                                                    </div>
                                                    {video.notesUrl && <FileText className="h-4 w-4 text-primary mr-2" />}
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="p-0"></AccordionContent>
                                        </AccordionItem>
                                    )
                                })}
                            </Accordion>
                        </CardContent>
                        {totalPages > 1 && (
                            <CardFooter className="flex justify-between items-center pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
            <Dialog open={isNotesOpen} onOpenChange={setIsNotesOpen}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Lesson Notes: {activeVideo?.title}</DialogTitle>
                        <DialogDescription>
                            Scroll to view the document. You can also download it from within the PDF viewer.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="h-full border rounded-md overflow-hidden">
                        {activeVideo?.notesUrl && (
                            <iframe 
                                src={activeVideo.notesUrl}
                                className="w-full h-full"
                                title={`Notes for ${activeVideo.title}`}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withAuth(StudentCoursePage, ['student']);
