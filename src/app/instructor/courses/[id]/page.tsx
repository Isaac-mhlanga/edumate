
'use client';

import { AppLayout } from "@/components/app-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { instructorData } from "@/lib/data";
import { ArrowLeft, CheckCircle, Clapperboard, PlayCircle, Settings, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useSearchParams } from "next/navigation";
import React from "react";

export default function CoursePreviewPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const courseId = params.id as string;
    const course = instructorData.courses.find(c => c.id === courseId);
    
    const [activeVideo, setActiveVideo] = React.useState(course?.videos[0]);
    const [quality, setQuality] = React.useState('720p');
    const [playbackRate, setPlaybackRate] = React.useState('1');
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = parseFloat(playbackRate);
        }
    }, [playbackRate]);

    if (!course) {
        notFound();
    }

    const from = searchParams.get('from');
    const backLink = from === 'dashboard' ? '/dashboard?tab=courses' : '/instructor?tab=courses';

    return (
        <AppLayout>
            <div className="space-y-6">
                 <div>
                    <Button variant="outline" asChild>
                        <Link href={backLink}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden shadow-lg rounded-xl">
                            <CardHeader className="p-0">
                                <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden">
                                    {activeVideo ? (
                                        <>
                                            <video
                                                ref={videoRef}
                                                key={activeVideo.id}
                                                className="w-full h-full"
                                                controls
                                                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
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
                                                        <DropdownMenuLabel>Quality</DropdownMenuLabel>
                                                        <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                                                            <DropdownMenuRadioItem value="1080p">1080p</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="720p">720p</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="480p">480p</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="360p">360p (Auto)</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
                                                        <DropdownMenuRadioGroup value={playbackRate} onValueChange={setPlaybackRate}>
                                                            <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="1">1x</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </>
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
                                        <CardTitle className="text-3xl">{course.title}</CardTitle>
                                    </div>
                                    {activeVideo && <h2 className="text-xl font-semibold text-right flex-shrink-0 pl-4">{activeVideo.title}</h2>}
                                </div>
                                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                        <span>4.8 (24 reviews)</span>
                                    </div>
                                    <span>{instructorData.enrolledStudents.length} students</span>
                                    <span>Created by {instructorData.name}</span>
                                </div>
                                <CardDescription className="mt-4 text-base">
                                    {course.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                         <Card className="shadow-lg rounded-xl">
                            <CardHeader>
                                <CardTitle>What you'll learn</CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                                    <p>Master the core concepts of {course.title.toLowerCase()}.</p>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                                    <p>Solve complex problems with confidence.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                                    <p>Prepare for Grade {course.grade} examinations.</p>
                                </div>
                                 <div className="flex items-start gap-3">
                                    <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                                    <p>Build a strong foundation in {course.subject.toLowerCase()}.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <Card className="overflow-hidden shadow-lg rounded-xl">
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
                                <Button size="lg" className="w-full">
                                    {course.pricing.type === 'free' ? 'Enroll for Free' : 'Buy Now'}
                                </Button>
                                <p className="text-xs text-muted-foreground text-center mt-2">30-Day Money-Back Guarantee</p>
                            </CardContent>
                        </Card>
                        <Card className="shadow-lg rounded-xl">
                            <CardHeader>
                                <CardTitle>Course Content</CardTitle>
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
                                                <p className="text-sm text-muted-foreground ml-8">
                                                    This is a brief description of the video lesson. Click to play.
                                                </p>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

    