
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare, Play, Clock, BarChart2, User, Star, BadgeCheck, LogIn, Sigma, FunctionSquare, Compass, Pi, BarChartHorizontal, Orbit, Percent, Dices, BookCopy, Calculator, FlaskConical, Atom, ChevronRightIcon, X, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { instructorData, grade12Curriculum } from "@/lib/data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";


const courses = instructorData.courses;

const CoursesSection = ({ title, description, courses }: { title: string, description: string, courses: any[] }) => {
  const icons = {
    play: <Play className="w-4 h-4" />,
    clock: <Clock className="w-4 h-4" />,
    level: <BarChart2 className="w-4 h-4" />,
    person: <User className="w-5 h-5" />,
    star: <Star className="w-4 h-4 fill-current" />,
    enroll: <BadgeCheck className="w-5 h-5" />,
  };

  const formatPrice = (price?: number | null) => {
    if (price === 0) return 'Free';
    if (price) return `R ${price.toFixed(2)}`;
    return 'By Subscription';
  };

  const handleEnroll = (courseTitle: string) => {
    console.log(`Enrolling in ${courseTitle}`);
  };
  
  return (
    <>
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto">{description}</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
           <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-sm border-white/10 shadow-lg hover:shadow-primary/20 transition-all duration-300">
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
                    <span className="text-xl font-bold text-foreground">
                        {formatPrice(course.pricing.price)}
                    </span>
                    <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
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
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-80"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    Master Maths & Science
                </h1>
                <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    Ace your exams with our comprehensive video lessons, AI-powered tutors, and expert-led tutorials.
                </p>
                <div className="flex justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
                        <Link href="#courses">
                            Explore Courses <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-2 border-teal-500 text-teal-500 bg-transparent hover:bg-teal-500 hover:text-white transition-colors duration-300">
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
  const [selectedChapter, setSelectedChapter] = useState<typeof grade12Curriculum[0] | null>(null);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState('');


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

  const handleChapterClick = (chapter: typeof grade12Curriculum[0]) => {
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

  const curriculumChapters = [
      { title: 'Sequences & Series', icon: Sigma },
      { title: 'Functions', icon: FunctionSquare },
      { title: 'Finance', icon: Percent },
      { title: 'Trigonometry', icon: Compass },
      { title: 'Polynomials', icon: Pi },
      { title: 'Differential Calculus', icon: Calculator },
      { title: 'Analytical Geometry', icon: Orbit },
      { title: 'Euclidean Geometry', icon: BookCopy },
      { title: 'Statistics', icon: BarChartHorizontal },
      { title: 'Probability', icon: Dices },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-foreground">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-gray-850/80 backdrop-blur-sm border-b border-gray-700'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
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
                  className="text-gray-300 hover:text-primary font-medium transition-colors duration-300"
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
                <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <Link href="/register">Register</Link>
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
         <div>
          <Hero />
          
          <section className="py-16 bg-gray-850">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-400 font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="about" className="py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  The Future of Learning is Here
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                  Experience a revolutionary way to learn, powered by artificial intelligence and expert knowledge.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center p-8 bg-gray-850 border border-gray-700 shadow-lg hover:shadow-primary/20 hover:border-primary/50 transition-all duration-300">
                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section id="curriculum" className="py-20 bg-gray-850">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Explore Our Comprehensive Curriculum</h2>
                    <p className="text-lg text-gray-300 max-w-3xl mx-auto">Our Grade 12 curriculum is expertly crafted to cover all essential topics and prepare you for success.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {grade12Curriculum.map((chapter, index) => {
                      const Icon = curriculumChapters.find(c => c.title === chapter.chapter)?.icon || BookOpen;
                      return (
                        <Card key={index} onClick={() => handleChapterClick(chapter)} className="group p-4 text-center flex flex-col items-center justify-center aspect-square transition-all duration-300 bg-gray-900 border border-gray-700 hover:border-primary hover:shadow-lg hover:shadow-primary/10 cursor-pointer hover:-translate-y-2">
                            <Icon className="w-10 h-10 text-primary mb-3 transition-transform duration-300 group-hover:scale-110" />
                            <h3 className="text-sm font-semibold text-white leading-tight">{chapter.chapter}</h3>
                        </Card>
                      )
                    })}
                </div>
                <div className="text-center mt-12">
                     <Button asChild size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                        <Link href="/register">
                            View Full Curriculum 
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
          </section>

          <section id="courses" className="py-20 bg-gray-900">
            <div className="max-w-7xl mx-auto px-6">
              <CoursesSection
                title="Featured Courses"
                description="Hand-picked courses to help you excel in your studies."
                courses={allCourses}
              />
            </div>
          </section>

          <section id="contact" className="py-20 bg-gray-850">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <Card className="p-12 bg-gray-900 border border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Start Your Learning Journey Today
                </h2>
                <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students transforming their education with AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    <Link href="/register">
                        Start Free Trial
                    </Link>
                  </Button>
                  <Button size="lg" variant="secondary">
                    Book a Demo
                  </Button>
                </div>
                <p className="text-gray-400 mt-6 text-sm">
                  No credit card required • AI tutor included
                </p>
              </Card>
            </div>
          </section>
        </div>
      </main>

       <Dialog open={isCurriculumDialogOpen} onOpenChange={setIsCurriculumDialogOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col bg-gray-900 border-gray-700">
            <DialogHeader>
                <DialogTitle className="text-2xl text-white">{selectedChapter?.chapter}</DialogTitle>
                <DialogDescription>
                Explore the topics in this chapter. Click on a topic to see available courses.
                </DialogDescription>
                <button onClick={() => setIsCurriculumDialogOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <X />
                </button>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto -mx-6 px-6">
            <Accordion type="single" collapsible className="w-full">
              {selectedChapter?.topics.map((topic, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg hover:no-underline text-gray-200 border-b border-gray-700">
                    {topic}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                       {courses.slice(0,2).map(course => (
                           <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-gray-850 border border-gray-700">
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
                                <CardTitle className="text-base text-white">{course.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
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
                                <Separator className="bg-gray-700"/>
                                <div className="flex items-center justify-between w-full">
                                    <span className="font-bold text-lg text-white">
                                        {formatPrice(course.pricing.price)}
                                    </span>
                                    <Link href={`/instructor/courses/${course.id}`} passHref>
                                    <Button size="sm" variant="secondary" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
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
