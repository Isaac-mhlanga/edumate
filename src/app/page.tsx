
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare, Play, Clock, Star, Users, Wand2, Clapperboard, Rocket, Dna, X, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { instructorData, grade12MathsCurriculum, grade12PhysicsCurriculum, grade12LifeSciencesCurriculum } from "@/lib/data";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/public-header";


const courses = instructorData.courses;

const CoursesSection = ({ title, description, courses, onCourseClick }: { title: string, description: string, courses: any[], onCourseClick: (course: any) => void }) => {
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
            <div className="relative h-48 overflow-hidden cursor-pointer" onClick={() => onCourseClick(course)}>
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
                        <Link href={`/courses/${course.id}`}>Enroll Now</Link>
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
                        Explore Courses <ArrowRight className="ml-2" />
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

const CurriculumDialog = ({ isOpen, onOpenChange, activeCurriculum, setActiveCurriculum }: { isOpen: boolean, onOpenChange: (open: boolean) => void, activeCurriculum: string, setActiveCurriculum: (value: string) => void }) => {
  const mathsCurriculumChapters = [
      { title: 'Paper 1', icon: BookOpen },
      { title: 'Paper 2', icon: BookOpen },
  ];

  const physicsCurriculumChapters = [
      { title: "Paper 1: Physics", icon: Rocket, category: "Physics" },
      { title: "Paper 2: Chemistry", icon: Clapperboard, category: "Chemistry" },
  ];
  
  const lifeSciencesCurriculumChapters = [
      { title: "Paper 1", icon: BookOpen },
      { title: "Paper 2", icon: Dna },
  ];

  let currentCurriculumData;
  let currentChapterIcons;

  switch (activeCurriculum) {
      case 'physical-sciences':
      currentCurriculumData = grade12PhysicsCurriculum;
      currentChapterIcons = physicsCurriculumChapters;
      break;
      case 'life-sciences':
          currentCurriculumData = grade12LifeSciencesCurriculum;
          currentChapterIcons = lifeSciencesCurriculumChapters;
          break;
      default:
      currentCurriculumData = grade12MathsCurriculum;
      currentChapterIcons = mathsCurriculumChapters;
      break;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Explore Our Comprehensive Curriculum</DialogTitle>
          <DialogDescription>Our Grade 12 curriculum is expertly crafted to cover all essential topics and prepare you for success.</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Tabs value={activeCurriculum} onValueChange={setActiveCurriculum} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="maths">Maths</TabsTrigger>
              <TabsTrigger value="physical-sciences">Physical Sciences</TabsTrigger>
              <TabsTrigger value="life-sciences">Life Sciences</TabsTrigger>
            </TabsList>
            
            <Accordion type="single" collapsible className="w-full">
              {currentCurriculumData.map((item, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                    {item.chapter}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pl-4 pt-2">
                      {item.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-center">
                          <ChevronRightIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                            {topic}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};


export default function Home() {
  const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);
  const [activeCurriculum, setActiveCurriculum] = useState('maths');
  
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedCourseForPlayer, setSelectedCourseForPlayer] = useState<any>(null);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const allCourses = courses.slice(0, 6);

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

  const mathsCurriculumChapters = [
      { title: 'Paper 1', icon: BookOpen },
      { title: 'Paper 2', icon: BookOpen },
  ];
  
  const physicsCurriculumChapters = [
      { title: "Paper 1: Physics", icon: Rocket, category: "Physics" },
      { title: "Paper 2: Chemistry", icon: Clapperboard, category: "Chemistry" },
  ];
  
  const lifeSciencesCurriculumChapters = [
      { title: "Paper 1", icon: BookOpen },
      { title: "Paper 2", icon: Dna },
  ];

  let currentCurriculumData;
  let currentChapterIcons;

  switch (activeCurriculum) {
    case 'physical-sciences':
      currentCurriculumData = grade12PhysicsCurriculum;
      currentChapterIcons = physicsCurriculumChapters;
      break;
    case 'life-sciences':
        currentCurriculumData = grade12LifeSciencesCurriculum;
        currentChapterIcons = lifeSciencesCurriculumChapters;
        break;
    default:
      currentCurriculumData = grade12MathsCurriculum;
      currentChapterIcons = mathsCurriculumChapters;
      break;
  }

  const handleCourseClick = (course: any) => {
    setSelectedCourseForPlayer(course);
    setActiveVideo(course.videos[0]);
    setIsVideoPlayerOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="flex-grow pt-20">
         <div>
          <Hero onExploreClick={() => setIsCurriculumOpen(true)} />
          
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
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Our Grade 12 curriculum is expertly crafted to cover all essential topics and prepare you for success.</p>
                </div>
                 <Tabs value={activeCurriculum} onValueChange={setActiveCurriculum} className="w-full max-w-lg mx-auto mb-8">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="maths">Maths</TabsTrigger>
                        <TabsTrigger value="physical-sciences">Physical Sciences</TabsTrigger>
                        <TabsTrigger value="life-sciences">Life Sciences</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="flex justify-center flex-wrap gap-4">
                    {currentCurriculumData.map((chapter, index) => {
                      const Icon = currentChapterIcons.find(c => c.title === chapter.chapter)?.icon || BookOpen;
                      return (
                        <Card 
                            key={index} 
                            asChild
                            className="group p-4 text-center flex flex-col items-center justify-center aspect-square transition-all duration-300 bg-card border hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer hover:-translate-y-2 w-48"
                        >
                            <Link href="/dashboard?tab=courses">
                                <div className="p-3 bg-primary/10 rounded-full mb-3 transition-colors duration-300 group-hover:bg-primary/20">
                                    <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                                </div>
                                <h3 className="text-sm font-semibold leading-tight">{chapter.chapter}</h3>
                                {'category' in chapter && (
                                    <Badge variant="outline" className="mt-2 text-xs">{chapter.category}</Badge>
                                )}
                            </Link>
                        </Card>
                      )
                    })}
                </div>
                <div className="text-center mt-12">
                     <Button onClick={() => setIsCurriculumOpen(true)} size="lg">
                        View Full Curriculum 
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
          </section>

          <section id="courses" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <CoursesSection
                title="Featured Courses"
                description="Hand-picked courses to help you excel in your studies."
                courses={allCourses}
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

      <CurriculumDialog isOpen={isCurriculumOpen} onOpenChange={setIsCurriculumOpen} activeCurriculum={activeCurriculum} setActiveCurriculum={setActiveCurriculum} />
      
      {selectedCourseForPlayer && (
        <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
          <DialogContent className="sm:max-w-5xl p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2">
                 <div className="relative aspect-video bg-black">
                  {activeVideo && (
                    <video key={activeVideo.url} className="w-full h-full" controls autoPlay src={activeVideo.url}>
                      Your browser does not support the video tag.
                    </video>
                  )}
                 </div>
              </div>
              <div className="lg:col-span-1 flex flex-col">
                <div className="p-6">
                    <Badge variant="secondary" className="mb-2">{selectedCourseForPlayer.subject} - Grade {selectedCourseForPlayer.grade}</Badge>
                    <h3 className="text-2xl font-bold">{selectedCourseForPlayer.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                            <span>{selectedCourseForPlayer.rating || '4.8'}</span>
                        </div>
                        <span>by {selectedCourseForPlayer.instructor || 'Dr. Evelyn Reed'}</span>
                    </div>
                </div>
                <div className="flex-grow p-6 pt-0 overflow-y-auto">
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {selectedCourseForPlayer.videos.map((video: any, index: number) => (
                            <AccordionItem value={`item-${index}`} key={video.id}>
                                <AccordionTrigger 
                                    className="text-left hover:no-underline"
                                    onClick={() => setActiveVideo(video)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Clapperboard className="h-5 w-5 text-muted-foreground"/>
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
               <div className="p-6 border-t">
                  <Button asChild size="lg" className="w-full">
                    <Link href={`/courses/${selectedCourseForPlayer.id}`}>Enroll Now</Link>
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}
