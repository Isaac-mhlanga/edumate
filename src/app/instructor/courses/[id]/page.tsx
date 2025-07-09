'use client';

import { AppLayout } from "@/components/app-layout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { instructorData } from "@/lib/data";
import { ArrowLeft, CheckCircle, Clapperboard, PlayCircle, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import React from "react";

export default function CoursePreviewPage() {
    const params = useParams();
    const courseId = params.id as string;
    const course = instructorData.courses.find(c => c.id === courseId);
    
    const [activeVideo, setActiveVideo] = React.useState(course?.videos[0]);

    if (!course) {
        notFound();
    }

    return (
        <AppLayout>
            <div className="space-y-6">
                 <div>
                    <Button variant="outline" asChild>
                        <Link href="/instructor?tab=courses">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Courses
                        </Link>
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden shadow-lg rounded-xl">
                            <CardHeader className="p-0">
                                <div className="aspect-video bg-muted flex items-center justify-center">
                                    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white">
                                        <PlayCircle className="h-16 w-16 text-white/50" />
                                        <p className="mt-2 text-lg font-semibold">{activeVideo?.title || 'Select a video to play'}</p>
                                        <p className="text-sm text-muted-foreground">Video Player Placeholder</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <Badge variant="secondary" className="mb-2">{course.subject} - Grade {course.grade}</Badge>
                                <CardTitle className="text-3xl">{course.title}</CardTitle>
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
