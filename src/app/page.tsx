
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, PenSquare, Play, Clock, Users, Wand2, Clapperboard, Rocket, Dna, X, ChevronRight, FunctionSquare, Menu, Calendar, ChevronLeft, Loader2, Sparkles, Info, ShieldCheck, Files, CheckCircle, Gift, Facebook, Youtube, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { faqData } from "@/lib/data";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/public-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { format } from "date-fns";
import { EventDialog } from "@/components/event-dialog";
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { event } from '@/components/google-analytics';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { type UpcomingEvent } from "@/lib/data";
import { FaTiktok, FaYoutube, FaFacebook } from "react-icons/fa";
import { cn } from "@/lib/utils";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type VideoData = {
    id: string;
    title: string;
    url:string;
    duration?: number;
    notesUrl?: string;
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
    status: 'Draft' | 'Published' | 'Pending Approval' | 'Rejected';
    videos: VideoData[];
    rating?: number;
    instructor?: string;
};

type UserDoc = {
    id: string;
    fullName: string;
    role: 'student' | 'instructor' | 'admin' | 'tutor';
};


export default function Home() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedCourseForPlayer, setSelectedCourseForPlayer] = useState<Course | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoData | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState('720p');
  const [isClient, setIsClient] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    const fetchCoursesAndUsers = async () => {
        setLoadingCourses(true);
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserDoc[];
            const instructorMap = new Map(users.filter(u => u.role === 'instructor').map(i => [i.id, i.fullName]));

            const coursesQuery = query(collection(firestore, 'courses'), where('status', '==', 'Published'));
            const querySnapshot = await getDocs(coursesQuery);
            const fetchedCourses = querySnapshot.docs.map(doc => {
                const courseData = { id: doc.id, ...doc.data() } as Course;
                return {
                    ...courseData,
                    instructor: instructorMap.get(courseData.instructorId) || 'Edumate Team'
                };
            });
            setAllCourses(fetchedCourses);
        } catch (error) {
            console.error("Error fetching published courses: ", error);
        } finally {
            setLoadingCourses(false);
        }
    };
    
    const fetchEvents = async () => {
        setLoadingEvents(true);
        try {
            const eventsQuery = query(collection(firestore, 'events'), orderBy('start', 'asc'));
            const querySnapshot = await getDocs(eventsQuery);
            const fetchedEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UpcomingEvent));
            setUpcomingEvents(fetchedEvents);
        } catch (error) {
            console.error("Error fetching events: ", error);
        } finally {
            setLoadingEvents(false);
        }
    };

    fetchCoursesAndUsers();
    fetchEvents();
  }, []);

  const features = [
    {
      icon: <GraduationCap className="w-8 h-8 text-primary" />,
      title: 'Expert-Led Video Lessons',
      description: 'Learn at your own pace with on-demand video lessons from subject-matter experts that make complex topics simple and clear.'
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'One-on-One Tutoring',
      description: 'Get personalized help when you need it. Connect with our professional tutors for one-on-one sessions tailored to your learning style.'
    },
    {
      icon: <PenSquare className="w-8 h-8 text-primary" />,
      title: 'Assignment & Project Help',
      description: 'Stuck on an assignment? Get expert guidance for your school and university projects to understand the material and boost your grades.'
    }
  ];

  const stats = [
    { number: '95%', label: 'Improved Scores' },
    { number: '2.3x', label: 'Faster Learning' },
    { number: '10k+', label: 'Happy Students' },
    { number: 'Top 1%', label: 'Expert Tutors' }
  ];

  const platformLabels: {[key: string]: string} = {
    youtube: 'YouTube',
    tiktok: 'TikTok',
    zoom: 'Zoom',
  };


  const handleCourseClick = (course: Course) => {
    setSelectedCourseForPlayer(course);
    if (course.videos && course.videos.length > 0) {
      setActiveVideo(course.videos[0]);
    }
    setIsVideoPlayerOpen(true);
  };

  const handleEventClick = (event: UpcomingEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleSummarize = async () => {
    toast({
        title: 'Feature Coming Soon!',
        description: 'Our team is hard at work on this AI-powered video analysis feature. Stay tuned!',
    });
  };


  useEffect(() => {
    if (selectedCourseForPlayer && selectedCourseForPlayer.videos.length > 0) {
      setActiveVideo(selectedCourseForPlayer.videos[0]);
    }
  }, [selectedCourseForPlayer]);

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
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 overflow-y-auto">
         <div className="md:block">
          <section id="home" className="relative py-24 md:py-32 overflow-hidden bg-background">
            <div className="absolute inset-0 -z-0 opacity-40 dark:opacity-30 backdrop-blur-xl">
                <div className="absolute bg-primary/10 w-[28rem] h-[28rem] rounded-[var(--radius)] -top-24 -left-24 float-1" />
                <div className="absolute bg-accent/10 w-96 h-96 rounded-[var(--radius)] -bottom-20 -right-24 float-2" />
                <div className="absolute bg-primary/5 w-64 h-64 rounded-[var(--radius)] bottom-1/3 right-1/4 float-3" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 leading-tight animate-fade-in-up bg-gradient-to-r from-primary via-foreground to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                  Unlock Your Academic Potential
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  Edumate Pro is the all-in-one platform designed to help you learn smarter, achieve higher grades, and build confidence.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <Button asChild size="lg">
                    <Link href="/courses" onClick={() => event({ action: 'click_courses', category: 'homepage', label: 'Hero Section Button' })}>
                        Explore Courses <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/tutors" onClick={() => event({ action: 'click_find_tutor', category: 'homepage', label: 'Hero Section Button' })}>Find a Tutor</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-medium text-base">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
           <section id="refer" className="py-24 bg-background">
            <div className="max-w-4xl mx-auto px-6 animate-fade-in-up">
              <div className="text-center">
                <div className="inline-block p-6 bg-primary/10 rounded-full text-primary mb-4">
                  <Gift className="w-16 h-16" />
                </div>
                <Badge>Refer &amp; Earn</Badge>
                <h2 className="text-3xl md:text-4xl font-headline font-bold my-3">
                  Share the Knowledge, Get Rewarded
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-2xl mx-auto">
                  Invite friends to Edumate Pro and earn R20 for each one who signs up. It's our way of saying thanks for growing our community.
                </p>
                <div className="flex justify-center space-x-4 mb-8">
                  <Link href="https://www.tiktok.com/@edumate.pro?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <FaTiktok className="h-5 w-5" />
                  </Link>
                  <Link href="https://www.youtube.com/channel/UCG91mxIVykFs-0L5FZNk01g" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <FaYoutube className="h-5 w-5" />
                  </Link>
                  <Link href="https://www.facebook.com/facebook" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="h-10 w-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
                    <FaFacebook className="h-5 w-5" />
                  </Link>
                </div>
                <Button size="lg" asChild>
                  <Link href="/register">
                    Sign Up &amp; Get Your Code{" "}
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          <section id="about" className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
               <div className="text-center mb-16 animate-fade-in-up">
                <Badge>About Us</Badge>
                <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">
                  Accessible, Quality Education for All
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  We believe that every student deserves the chance to succeed. Edumate Pro combines expert-led resources with smart technology to create a learning experience that's engaging, effective, and builds confidence.
                </p>
              </div>
              <div className="max-w-4xl mx-auto">
                  <div className="relative h-96 mb-12 rounded-lg overflow-hidden">
                      <Image 
                          src="https://picsum.photos/seed/about-us-image/600/800"
                          alt="Diverse group of students"
                          width={600}
                          height={800}
                          className="object-cover h-full w-full"
                          data-ai-hint="diverse students learning"
                      />
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                      <Card key={index} className="p-6 flex flex-col items-center text-center gap-4 animate-fade-in-up transition-shadow hover:shadow-xl hover:shadow-primary/10" style={{ animationDelay: `${0.2 + index * 0.2}s` }}>
                        <div className="inline-block bg-primary/10 text-primary p-4 rounded-full">
                            {feature.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">
                              {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                              {feature.description}
                            </p>
                        </div>
                      </Card>
                    ))}
                  </div>
              </div>
            </div>
          </section>

          <section id="events" className="py-24 bg-background">
              <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-12 animate-fade-in-up">
                      <Badge>Live Events</Badge>
                      <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Don't Miss Our Free Live Events</h2>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Join our free live classes and revision sessions. Ask questions, interact with top instructors, and get ready for your exams.</p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {loadingEvents ? Array.from({ length: 3 }).map((_, i) => (
                          <Card key={i}><Skeleton className="h-64 w-full"/></Card>
                      )) : upcomingEvents.slice(0,3).map((event, index) => (
                          <Card key={event.id} className="group flex flex-col animate-fade-in-up border transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10" style={{ animationDelay: `${0.1 * index}s` }}>
                              <CardHeader className="flex-row items-start gap-4">
                                  <div className="flex flex-col items-center justify-center p-3 rounded-md bg-muted text-muted-foreground w-20 border">
                                      <span className="text-sm font-bold uppercase">{isClient ? format(new Date(event.start), 'MMM') : ''}</span>
                                      <span className="text-3xl font-bold">{isClient ? format(new Date(event.start), 'd') : ''}</span>
                                  </div>
                                  <div className="flex-1">
                                      <Badge variant="secondary" className="mb-1">{event.subject} - Grade {event.grade}</Badge>
                                      <CardTitle className="text-xl line-clamp-2">{event.title}</CardTitle>
                                  </div>
                              </CardHeader>
                              <CardContent className="flex-grow space-y-3">
                                   <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <Info className="h-4 w-4 mt-0.5 shrink-0" />
                                        <p className="line-clamp-2">{event.scope}</p>
                                    </div>
                                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Clock className="h-4 w-4" />
                                      <span>
                                          {isClient ? format(new Date(event.start), 'p') : ''}
                                          {event.end && isClient && ` - ${format(new Date(event.end), 'p')}`}
                                      </span>
                                  </div>
                                   {event.platforms && event.platforms.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">Live on:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {event.platforms.map(p => <Badge key={p} variant="outline" className="text-xs">{platformLabels[p]}</Badge>)}
                                        </div>
                                    </div>
                                  )}
                              </CardContent>
                              <CardFooter>
                                  <Button variant="outline" className="w-full" onClick={() => handleEventClick(event)}>
                                      View Details <ChevronRight className="ml-2 h-4 w-4" />
                                  </Button>
                              </CardFooter>
                          </Card>
                      ))}
                  </div>
              </div>
          </section>

          <section id="courses" className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                  <Badge>Our Courses</Badge>
                  <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Explore Our Featured Courses</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Explore our most popular courses, designed by experts to help you master challenging subjects with confidence.</p>
                </div>
                 {loadingCourses ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {Array.from({ length: 3 }).map((_, i) => (
                           <Card key={i} className="bg-card animate-fade-in-up border">
                               <CardHeader className="p-0"><Skeleton className="h-48 w-full"/></CardHeader>
                               <CardContent className="pt-4 space-y-2"><Skeleton className="h-4 w-1/4"/><Skeleton className="h-5 w-3/4"/><Skeleton className="h-10 w-full"/></CardContent>
                               <CardFooter className="flex-col items-start gap-4">
                                   <Skeleton className="h-4 w-full"/>
                                   <Separator/>
                                   <div className="flex justify-between w-full">
                                       <Skeleton className="h-8 w-1/4"/>
                                       <Skeleton className="h-8 w-1/3"/>
                                   </div>
                               </CardFooter>
                           </Card>
                       ))}
                    </div>
                 ) : (
                    <Carousel
                      opts={{
                        align: "start",
                        loop: true,
                      }}
                      className="w-full"
                    >
                      <CarouselContent>
                        {allCourses.map((course, index) => (
                          <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                              <Card className="group overflow-hidden flex flex-col h-full bg-card border transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
                                <div onClick={() => handleCourseClick(course)} className="relative h-48 overflow-hidden cursor-pointer">
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
                                  </div>
                                  <CardTitle className="text-xl pt-2">{course.title}</CardTitle>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                  <p className="text-base text-muted-foreground line-clamp-3">
                                    {course.description}
                                  </p>
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
                                    <span className="text-2xl font-bold">
                                      {course.pricing.type === 'purchase' ? `R ${course.pricing.price}` : 'Free'}
                                    </span>
                                    <Button asChild size="sm">
                                      <Link href="/register">Enroll Now</Link>
                                    </Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="hidden lg:flex" />
                      <CarouselNext className="hidden lg:flex" />
                    </Carousel>
                )}
                 <div className="text-center mt-12 animate-fade-in-up">
                    <Button size="lg" asChild>
                        <Link href="/courses">
                            View All Courses <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </div>
            </div>
          </section>
          
          <section id="faq" className="py-24 bg-background">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Need Help?</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">Have questions? We've got answers.</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {faqData.map((item, index) => (
                         <Card key={index} className="overflow-hidden bg-card border transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
                            <AccordionItem value={`faq-${index}`} className="border-b-0">
                                <AccordionTrigger className="text-lg font-semibold hover:no-underline p-6 text-left">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-6 text-muted-foreground text-base">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        </Card>
                    ))}
                </Accordion>
            </div>
          </section>

          <section id="contact" className="py-24 bg-muted">
            <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
              <Card className="p-8 sm:p-12 bg-card border">
                <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">
                  Ready to Elevate Your Learning?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students achieving their academic goals. Sign up to start your journey with Edumate Pro today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register" onClick={() => event({ action: 'click_register', category: 'homepage', label: 'Footer CTA' })}>
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
          <div className="hidden md:block">
            <Footer />
          </div>
        </div>
      </main>

      {selectedCourseForPlayer && (
        <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
          <DialogContent className="max-w-6xl w-[95vw] h-auto sm:h-[90vh] flex flex-col p-0 gap-0">
              <div className="grid md:grid-cols-3 h-full overflow-hidden">
                <div className="md:col-span-2 h-full flex flex-col">
                  <div className="relative aspect-video bg-black">
                      {activeVideo ? (
                          <>
                              <video
                                  ref={videoRef}
                                  key={activeVideo.url}
                                  className="w-full h-full"
                                  controls
                                  controlsList="nodownload"
                                  autoPlay
                                  src={activeVideo.url}
                              >
                                  Your browser does not support the video tag.
                              </video>
                          </>
                      ) : (
                          <div className="w-full h-full bg-muted flex flex-col items-center justify-center text-center p-4">
                              <Play className="h-16 w-16 text-muted-foreground/50" />
                              <p className="mt-4 text-lg font-semibold">Select a video to play</p>
                          </div>
                      )}
                  </div>
                   <div className="p-6 space-y-2 overflow-y-auto">
                        <Badge variant="secondary" className="mb-2">{selectedCourseForPlayer.subject} - Grade {selectedCourseForPlayer.grade}</Badge>
                        <h2 className="text-2xl font-bold">{selectedCourseForPlayer.title}</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>By {selectedCourseForPlayer.instructor || 'Dr. Evelyn Reed'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">{selectedCourseForPlayer.description}</p>
                   </div>
                </div>
                <div className="md:col-span-1 bg-muted/50 flex flex-col h-full max-h-[90vh] sm:max-h-none">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Course Content</h3>
                  </div>
                   <div className="flex-1 overflow-y-auto">
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {selectedCourseForPlayer.videos.map((video, index) => (
                            <AccordionItem value={`item-${index}`} key={video.id} className="border-x-0 px-4">
                                <AccordionTrigger className={cn("text-left hover:no-underline", video.id === activeVideo?.id && "bg-primary/10 font-semibold")} onClick={() => setActiveVideo(video)}>
                                    <div className="flex items-center justify-between w-full gap-2">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Clapperboard className="h-5 w-5 text-muted-foreground flex-shrink-0"/>
                                            <span className="truncate text-sm">{video.title}</span>
                                        </div>
                                        {video.notesUrl && <FileText className="h-4 w-4 text-primary mr-2 flex-shrink-0" />}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pl-8 flex flex-col items-start gap-3">
                                        {video.notesUrl ? (
                                            <p className="text-xs text-muted-foreground italic">Full lesson notes are available upon enrollment.</p>
                                        ) : (
                                             <p className="text-xs text-muted-foreground italic">No notes for this lesson.</p>
                                        )}
                                    </div>
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

      <EventDialog
        event={selectedEvent}
        allEvents={upcomingEvents}
        isOpen={isEventDialogOpen}
        onClose={() => setIsEventDialogOpen(false)}
        onEventSelect={handleEventClick}
      />

    </div>
  );
}
