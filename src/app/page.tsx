
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare, Play, Clock, Star, Users, Wand2, Clapperboard, Rocket, Dna, X, ChevronRightIcon, FunctionSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { instructorData, grade12MathsCurriculum, grade12PhysicsCurriculum, grade12LifeSciencesCurriculum } from "@/lib/data";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/public-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";

type VideoData = {
    id: string;
    title: string;
    url:string;
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
    duration?: string;
    rating?: number;
    instructor?: string;
};


const CoursesSection = ({ title, description, courses, onCourseClick }: { title: string, description: string, courses: any[], onCourseClick: (course: Course) => void }) => {
  const formatPrice = (price?: number | null) => {
    if (price === 0) return 'Free';
    if (price) return `R ${price.toFixed(2)}`;
    return 'By Subscription';
  };
  
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{description}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
           <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2">
            <div onClick={() => onCourseClick(course)} className="relative h-48 overflow-hidden cursor-pointer">
              <Image 
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="online course"
              />
               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-12 h-12 text-white" />
               </div>
            </div>

            <CardHeader>
                <div className="flex justify-between items-start">
                    <Badge variant="secondary">{course.subject}</Badge>
                    <div className="flex items-center gap-1 text-sm text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{course.rating || 4.8}</span>
                    </div>
                </div>
                <CardTitle className="text-lg pt-2">{course.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {course.description}
              </p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                <div className="flex justify-between w-full text-sm text-muted-foreground">
                     <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        <span>{course.videos.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration || '8h'}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between w-full">
                    <span className="text-xl font-bold">
                        {formatPrice(course.pricing.price)}
                    </span>
                     <Button asChild size="sm">
                        <Link href="/register">Enroll Now</Link>
                    </Button>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};


const Hero = ({ onExploreClick }: { onExploreClick: () => void }) => {
  return (
    <section id="home" className="relative py-20 md:py-32 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-radial from-background to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Master Maths & Science
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    Ace your exams with our comprehensive video lessons, AI-powered tutors, and expert-led tutorials.
                </p>
                <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <Button onClick={onExploreClick} size="lg">
                        Explore Curriculum <ArrowRight className="ml-2" />
                    </Button>
                    <Button asChild size="lg" variant="outline">
                        <Link href="/tutors">Find a Tutor</Link>
                    </Button>
                </div>
            </div>
        </div>
    </section>
  );
};


export default function Home() {
  const allCourses = instructorData.courses as Course[];

  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedCourseForPlayer, setSelectedCourseForPlayer] = useState<Course | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoData | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState('720p');

  const features = [
    {
      icon: <Bot className="w-8 h-8 text-primary" />,
      title: 'AI-Powered Learning',
      description: 'Adaptive AI tutors that personalize your learning path and clarify complex topics 24/7.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'One-on-One Sessions',
      description: 'Book personal tutoring sessions with subject-matter experts tailored to your specific needs.'
    },
    {
      icon: <PenSquare className="w-8 h-8 text-primary" />,
      title: 'Exam Preparation',
      description: 'Access comprehensive test prep materials, past papers, and expert guidance to ace your exams.'
    }
  ];

  const stats = [
    { number: '95%', label: 'Improved Scores' },
    { number: '2.3x', label: 'Faster Learning' },
    { number: '24/7', label: 'AI Tutor Access' },
    { number: '10k+', label: 'Happy Students' }
  ];
  
  const curriculumData = {
    'Maths': { icon: FunctionSquare, data: grade12MathsCurriculum },
    'Physical Sciences': { icon: Rocket, data: grade12PhysicsCurriculum },
    'Life Sciences': { icon: Dna, data: grade12LifeSciencesCurriculum },
  };

  const getCoursesForTopic = (topic: string, subject: 'Maths' | 'Physical Sciences' | 'Life Sciences') => {
    const searchTerms = topic.toLowerCase().replace(/[-&,]/g, ' ').split(' ').filter(term => term.length > 2);
    return allCourses.filter(course => 
      course.subject === subject && 
      searchTerms.some(term => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term)
      )
    );
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourseForPlayer(course);
    if (course.videos && course.videos.length > 0) {
      setActiveVideo(course.videos[0]);
    }
    setIsVideoPlayerOpen(true);
  };

  useEffect(() => {
    if (selectedCourseForPlayer && selectedCourseForPlayer.videos.length > 0) {
      setActiveVideo(selectedCourseForPlayer.videos[0]);
    }
  }, [selectedCourseForPlayer]);
  
  const scrollToCurriculum = () => {
    const curriculumSection = document.getElementById('curriculum');
    if (curriculumSection) {
      curriculumSection.scrollIntoView({ behavior: 'smooth' });
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="flex-grow pt-20">
         <div>
          <Hero onExploreClick={scrollToCurriculum} />
          
          <section className="py-16 bg-muted/20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="about" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  The Future of Learning is Here
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Experience a revolutionary way to learn, powered by artificial intelligence and expert knowledge.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center p-8 bg-card border shadow-lg hover:shadow-card-glow hover:border-primary/50 transition-all duration-300">
                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
          
           <section id="curriculum" className="py-20 bg-muted/20">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Comprehensive Curriculum</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Our Grade 12 curriculum is expertly crafted to cover all essential topics. Find courses that match your needs.</p>
                </div>
                
                <Tabs defaultValue="Maths" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-8">
                        {Object.entries(curriculumData).map(([subject, { icon: Icon }]) => (
                            <TabsTrigger key={subject} value={subject} className="gap-2">
                                <Icon /> {subject}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {Object.entries(curriculumData).map(([subject, { data: chapters }]) => (
                        <TabsContent key={subject} value={subject}>
                             <Accordion type="multiple" className="w-full space-y-4">
                                {chapters.map((chapter, index) => (
                                    <Card key={index} className="overflow-hidden">
                                        <AccordionItem value={`item-${index}`} className="border-b-0">
                                            <AccordionTrigger className="text-lg font-semibold hover:no-underline p-6 bg-card">
                                                {chapter.chapter}
                                            </AccordionTrigger>
                                            <AccordionContent className="p-6">
                                                <ul className="space-y-4">
                                                    {chapter.topics.map((topic, topicIndex) => {
                                                        const relatedCourses = getCoursesForTopic(topic, subject as any);
                                                        return (
                                                            <li key={topicIndex}>
                                                                <div className="flex items-center">
                                                                    <ChevronRightIcon className="h-4 w-4 mr-2 text-primary" />
                                                                    <span className="font-medium text-muted-foreground">{topic}</span>
                                                                </div>
                                                                {relatedCourses.length > 0 && (
                                                                    <div className="pl-6 mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        {relatedCourses.map(course => (
                                                                            <Card key={course.id} className="flex items-center gap-4 p-3 bg-muted/50">
                                                                                <Image src={course.thumbnail} alt={course.title} width={120} height={68} className="rounded-md object-cover aspect-video" />
                                                                                <div className="flex-1">
                                                                                    <h4 className="font-semibold text-sm">{course.title}</h4>
                                                                                    <p className="text-xs text-muted-foreground">{course.videos.length} lessons</p>
                                                                                </div>
                                                                                <Button size="sm" variant="ghost" onClick={() => handleCourseClick(course)}>Preview</Button>
                                                                            </Card>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Card>
                                ))}
                            </Accordion>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
          </section>


          <section id="courses" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <CoursesSection
                title="Featured Courses"
                description="Hand-picked courses to help you excel in your studies."
                courses={allCourses.slice(0, 6)}
                onCourseClick={handleCourseClick}
              />
            </div>
          </section>

          <section id="contact" className="py-20 bg-muted/20">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <Card className="p-12 bg-card border">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Start Your Learning Journey Today
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students transforming their education with AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register">
                        Start Free Trial
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary">
                    Book a Demo
                  </Button>
                </div>
                <p className="text-muted-foreground mt-6 text-sm">
                  No credit card required • AI tutor included
                </p>
              </Card>
            </div>
          </section>
        </div>
      </main>

      {selectedCourseForPlayer && (
        <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
          <DialogContent className="max-w-6xl h-[90vh] flex flex-col p-0">
              <div className="grid md:grid-cols-3 h-full">
                <div className="md:col-span-2 h-full flex flex-col">
                  <div className="relative aspect-video bg-black rounded-tl-lg overflow-hidden">
                      {activeVideo ? (
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
                      ) : (
                          <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-center p-4">
                              <Play className="h-16 w-16 text-muted-foreground/50" />
                              <p className="mt-4 text-lg font-semibold">Select a video to play</p>
                          </div>
                      )}
                  </div>
                   <div className="p-6 space-y-2">
                        <Badge variant="secondary" className="mb-2">{selectedCourseForPlayer.subject} - Grade {selectedCourseForPlayer.grade}</Badge>
                        <h2 className="text-2xl font-bold">{selectedCourseForPlayer.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                <span>{selectedCourseForPlayer.rating || '4.8'} (24 reviews)</span>
                            </div>
                            <span>{selectedCourseForPlayer.instructor || 'Dr. Evelyn Reed'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">{selectedCourseForPlayer.description}</p>
                   </div>
                </div>
                <div className="md:col-span-1 bg-muted/50 flex flex-col h-full rounded-r-lg">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Course Content</h3>
                  </div>
                   <div className="flex-1 overflow-y-auto">
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {selectedCourseForPlayer.videos.map((video, index) => (
                            <AccordionItem value={`item-${index}`} key={video.id} className="border-x-0 px-4">
                                <AccordionTrigger className="text-left hover:no-underline" onClick={() => setActiveVideo(video)}>
                                    <div className="flex items-start gap-3">
                                        <Clapperboard className="h-5 w-5 text-muted-foreground mt-1"/>
                                        <span>{index + 1}. {video.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-sm text-muted-foreground ml-8">Click to play this lesson.</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                  </div>
                   <DialogFooter className="p-6 border-t">
                     <Button asChild size="lg" className="w-full">
                       <Link href="/register">Enroll Now</Link>
                     </Button>
                  </DialogFooter>
                </div>
              </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}

    