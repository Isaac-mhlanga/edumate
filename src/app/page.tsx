
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare, Play, Clock, Star, BadgeCheck, LogIn, Sigma, FunctionSquare, Compass, Pi, BarChartHorizontal, Orbit, Percent, Dices, BookCopy, Calculator, FlaskConical, Atom, ChevronRightIcon, X, Users, Waves, CircuitBoard, Rocket, Dna } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { instructorData, grade12MathsCurriculum, grade12PhysicsCurriculum, grade12LifeSciencesCurriculum } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const courses = instructorData.courses;

const CoursesSection = ({ title, description, courses }: { title: string, description: string, courses: any[] }) => {
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
           <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card shadow-lg hover:shadow-primary/20 transition-all duration-300">
            <div className="relative h-48 overflow-hidden">
              <Image 
                src={course.thumbnail}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="online course"
              />
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
                        <Link href={`/instructor/courses/${course.id}`}>Enroll Now</Link>
                    </Button>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
};


const Hero = () => {
  return (
    <section id="home" className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gray-900 opacity-80"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Master Maths & Science
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    Ace your exams with our comprehensive video lessons, AI-powered tutors, and expert-led tutorials.
                </p>
                <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <Button asChild size="lg">
                        <Link href="#courses">
                            Explore Courses <ArrowRight className="ml-2" />
                        </Link>
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
  const [scrolled, setScrolled] = React.useState(false);
  const [isCurriculumDialogOpen, setIsCurriculumDialogOpen] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<(typeof grade12MathsCurriculum[0] | typeof grade12PhysicsCurriculum[0] | typeof grade12LifeSciencesCurriculum[0]) | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');
  const [activeCurriculum, setActiveCurriculum] = useState('maths');


  const formatPrice = (price?: number | null) => {
    if (price === 0) return 'Free';
    if (price) return `R ${price.toFixed(2)}`;
    return 'By Subscription';
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleChapterClick = (chapter: (typeof grade12MathsCurriculum[0] | typeof grade12PhysicsCurriculum[0] | typeof grade12LifeSciencesCurriculum[0])) => {
    setSelectedChapter(chapter);
    setIsCurriculumDialogOpen(true);
  };

  const handlePlayVideo = (videoUrl: string) => {
    setSelectedVideoUrl(videoUrl);
    setIsVideoPlayerOpen(true);
  };


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
      { title: 'Paper 2', icon: BookCopy },
  ];
  
  const physicsCurriculumChapters = [
      { title: "Paper 1: Physics", icon: Rocket, category: "Physics" },
      { title: "Paper 2: Chemistry", icon: FlaskConical, category: "Chemistry" },
  ];
  
  const lifeSciencesCurriculumChapters = [
      { title: "Paper 1", icon: Users },
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-sm border-b border-border'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">
                  EDUMATE
                </span>
              </Link>
            </div>
            
             <nav className="hidden md:flex space-x-8">
              {[
                { name: 'Home', id: 'home' },
                { name: 'Courses', id: 'courses' },
                { name: 'About', id: 'about' },
                { name: 'Contact', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="text-muted-foreground hover:text-primary font-medium transition-colors duration-300"
                >
                  {item.name}
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Register</Link>
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
         <div>
          <Hero />
          
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
                  <Card key={index} className="text-center p-8 bg-card border shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300">
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

                <div className="flex justify-center gap-4">
                    {currentCurriculumData.map((chapter, index) => {
                      const Icon = currentChapterIcons.find(c => c.title === chapter.chapter)?.icon || BookOpen;
                      return (
                        <Card 
                            key={index} 
                            onClick={() => handleChapterClick(chapter)} 
                            className="group p-4 text-center flex flex-col items-center justify-center aspect-square transition-all duration-300 bg-card border hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer hover:-translate-y-2 w-48"
                        >
                             <div className="p-3 bg-primary/10 rounded-full mb-3 transition-colors duration-300 group-hover:bg-primary/20">
                                <Icon className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                            </div>
                            <h3 className="text-sm font-semibold leading-tight">{chapter.chapter}</h3>
                            {'category' in chapter && (
                                <Badge variant="outline" className="mt-2 text-xs">{chapter.category}</Badge>
                            )}
                        </Card>
                      )
                    })}
                </div>
                <div className="text-center mt-12">
                     <Button asChild size="lg">
                        <Link href="/register">
                            View Full Curriculum 
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
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

       <Dialog open={isCurriculumDialogOpen} onOpenChange={setIsCurriculumDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-card border-border">
            <DialogHeader>
                <DialogTitle className="text-2xl">{selectedChapter?.chapter}</DialogTitle>
                <DialogDescription>
                Explore the topics in this chapter. Click on a topic to see available courses.
                </DialogDescription>
                <button onClick={() => setIsCurriculumDialogOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X />
                </button>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <Accordion type="single" collapsible className="w-full">
              {selectedChapter?.topics.map((topic, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:no-underline border-b">
                    {topic}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                       {courses.slice(0,2).map(course => (
                           <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-background shadow-lg hover:shadow-primary/20 transition-all duration-300">
                           <button onClick={() => handlePlayVideo('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4')} className="relative h-40 overflow-hidden cursor-pointer">
                              <Image 
                                src={course.thumbnail}
                                alt={course.title}
                                fill
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint="online course"
                              />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-12 h-12 text-white" />
                               </div>
                            </button>
                            <CardHeader>
                                <CardTitle className="text-base">{course.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
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
                                <Separator/>
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-bold text-lg">
                                        {formatPrice(course.pricing.price)}
                                    </span>
                                    <Link href={`/instructor/courses/${course.id}`} passHref>
                                    <Button size="sm">
                                        Enroll Now <ArrowRight className="ml-1 h-4 w-4" />
                                    </Button>
                                    </Link>
                                </div>
                              </CardFooter>
                          </Card>
                       ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
        <DialogContent className="max-w-4xl p-0 border-0 bg-black">
            <video src={selectedVideoUrl} controls autoPlay className="w-full rounded-lg">
                Your browser does not support the video tag.
            </video>
        </DialogContent>
      </Dialog>


      <Footer />
    </div>
  );
}



