
'use client';

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clapperboard, PlayCircle, Settings, Sparkles, Star, Download, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Footer } from '@/components/footer';
import { PublicHeader } from '@/components/public-header';

type VideoData = {
    id: string;
    title: string;
    url:string;
    notesUrl?: string;
    duration?: number;
};

type Course = {
    id: string;
    instructorId: string;
    title: string;
    description: string;
    subject: 'Maths' | 'Physical Sciences' | 'Life Sciences';
    grade: '10' | '11' | '12';
    thumbnail: string;
    pricing: {
        type: 'free' | 'purchase' | 'subscription';
        price?: number;
    };
    status: 'Draft' | 'Published' | 'Pending Approval' | 'Rejected';
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

export default function PublicCoursePage() {
    const params = useParams();
    const { toast } = useToast();
    const courseId = params.id as string;
    const [course, setCourse] = React.useState<Course | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [activeVideo, setActiveVideo] = React.useState<VideoData | undefined>(undefined);
    const [quality, setQuality] = React.useState('720p');
    const [playbackRate, setPlaybackRate] = React.useState('1');
    const videoRef = React.useRef<HTMLVideoElement>(null);

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
    
    if (loading) {
        return (
            <div className="bg-background text-foreground">
                <PublicHeader />
                <main className="max-w-7xl mx-auto px-6 py-12 pt-24 space-y-6">
                    <div><Skeleton className="h-10 w-40" /></div>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Card><CardHeader><Skeleton className="h-96 w-full" /></CardHeader><CardContent className="pt-4 space-y-2"><Skeleton className="h-8 w-3/4" /><Skeleton className="h-5 w-full" /></CardContent></Card>
                        </div>
                        <div className="lg:col-span-1 space-y-6">
                            <Card><Skeleton className="h-64 w-full" /></Card>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    if (!course) {
        notFound();
    }

    const isYouTube = activeVideo?.url.includes('youtube.com/embed');
    
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
        <div className="bg-background text-foreground">
             <PublicHeader />
             <main className="max-w-7xl mx-auto px-6 py-12 pt-24 space-y-6">
                <div>
                    <Button variant="outline" asChild>
                        <Link href="/#courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to All Courses
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
                                            <Button variant="outline" asChild>
                                                <a href={activeVideo.notesUrl} target="_blank" rel="noopener noreferrer">
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Notes
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden shadow-lg rounded-lg">
                            <Image
                                src={course.thumbnail}
                                alt={course.title}
                                width={600}
                                height={400}
                                className="w-full aspect-video object-cover"
                                data-ai-hint="online course abstract"
                            />
                            <CardContent className="p-4">
                               <h3 className="text-2xl font-bold mb-2">
                                    {course.pricing.type === 'purchase' ? `R ${course.pricing.price}` : course.pricing.type === 'free' ? 'Free' : 'Included in Subscription'}
                                </h3>
                                <Button asChild size="lg" className="w-full">
                                    <Link href="/register">
                                        {course.pricing.type === 'free' ? 'Enroll for Free' : 'Buy Now'}
                                    </Link>
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mt-2">30-Day Money-Back Guarantee</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg rounded-lg">
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
                                <CardDescription>{course.videos.length} lessons</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                                    {course.videos.map((video, index) => (
                                        <AccordionItem value={`item-${index}`} key={video.id} className="border-x-0 px-4">
                                            <AccordionTrigger className="text-left hover:no-underline" onClick={() => setActiveVideo(video)}>
                                                <div className="flex items-center gap-3">
                                                    <Clapperboard className="h-5 w-5 text-muted-foreground"/>
                                                    <span>{index + 1}. {video.title}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="pl-8 flex flex-col items-start gap-2">
                                                     <p className="text-sm text-muted-foreground">Click the trigger above to play this lesson.</p>
                                                     <Button variant="link" size="sm" className="p-0 h-auto text-sm" onClick={handleSummarize}>
                                                        <Sparkles className="mr-2 h-4 w-4" /> Summarize with AI
                                                    </Button>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

    

    
