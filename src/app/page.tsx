
'use client';

import { EventDialog } from "@/components/event-dialog";
import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { faqData, subscriptionPlans } from "@/lib/data";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, orderBy, query, Timestamp, where, limit, getDoc, doc } from "firebase/firestore";
import { Award, BookOpen, ChevronRight, GraduationCap, Handshake, Sparkle, Star, Video, Clapperboard, Calendar, HelpCircle, Rocket, ArrowRight, Users, FilePenLine, Banknote, School, Clock, User, Gift, Sparkles as SparklesIcon, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from 'date-fns';
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FaTiktok, FaYoutube, FaFacebook, FaTwitter } from "react-icons/fa";
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
    createdAt: Timestamp;
};

type UserDoc = {
    id: string;
    fullName: string;
    role: 'student' | 'instructor' | 'admin' | 'tutor';
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color?: string;
  description?: string;
  instructor?: string;
  grade?: string;
  subject?: string;
  scope?: string;
  platforms?: ('tiktok' | 'youtube' | 'zoom')[];
};

type Promotion = {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    icon?: string;
};


const testimonials = [
  {
    quote: "I was really struggling to keep up with my Master's in Data Science. The concepts were tough and the assignments felt overwhelming. Edumate was a lifesaver. The tutors didn't just give me answers; they walked me through the problems and helped me actually understand the material.",
    name: "Mukhetwa",
    role: "MSc Data Science Student | University of Johannesburg",
  },
  {
    quote: "Edumate gave me amazing help with my assignments. Their expert support made a huge difference in my understanding. I highly recommend them as mentors who go the extra mile for students. Thank you for the incredible support!",
    name: "Bontle Mahlango",
    role: "Student | University of Johannesburg",
  }
];


export default function Home() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    const fetchCoursesAndUsers = async () => {
        setLoadingCourses(true);
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserDoc);
            const instructorMap = new Map(users.filter(u => u.role === 'instructor').map(i => [i.id, i.fullName]));

            const coursesQuery = query(collection(firestore, 'courses'));
            const querySnapshot = await getDocs(coursesQuery);
            const fetchedCourses = querySnapshot.docs.map(doc => {
                const courseData = { id: doc.id, ...doc.data() } as Course;
                return {
                    ...courseData,
                    instructor: instructorMap.get(courseData.instructorId) || 'Edumate Team',
                    rating: 4.2 + (Math.random() * 0.7) // Add random rating
                };
            });
            setAllCourses(fetchedCourses);
        } catch (error) {
            console.error("Error fetching courses: ", error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const fetchUpcomingEvents = async () => {
        try {
            const eventsQuery = query(collection(firestore, "events"), where('start', '>=', new Date().toISOString()), orderBy('start', 'asc'), limit(3));
            const querySnapshot = await getDocs(eventsQuery);
            const fetchedEvents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
            setUpcomingEvents(fetchedEvents);
        } catch (error) {
            console.error("Error fetching upcoming events: ", error);
        }
    };

    const fetchPromotion = async () => {
        try {
            const promoRef = doc(firestore, 'promotions', 'homepage-banner');
            const docSnap = await getDoc(promoRef);
            if (docSnap.exists()) {
                setPromotion(docSnap.data() as Promotion);
            }
        } catch (error) {
            console.error("Error fetching promotion:", error);
        }
    };
    
    fetchCoursesAndUsers();
    fetchUpcomingEvents();
    fetchPromotion();
  }, []);
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const services = [
    {
      icon: Users,
      title: "Private & Group Tutoring",
      description: "Get the focused attention you need to ace your exams. Our expert tutors offer personalized one-on-one and group sessions to help you master tough subjects and boost your confidence.",
    },
    {
      icon: FilePenLine,
      title: "Assignment Help",
      description: "Don't let difficult assignments hold you back. Our specialists provide clear, detailed guidance to help you understand complex topics, structure your work, and submit high-quality assignments with confidence.",
    },
    {
      icon: GraduationCap,
      title: "Career Guidance",
      description: "Not sure which career path is right for you? We offer personalized guidance sessions to help you identify your strengths, choose the right subjects, and map out a clear path to your dream job.",
    },
    {
      icon: Award,
      title: "Bursary Applications",
      description: "Securing funding for your studies can be challenging. We guide you through the process, helping you find the right bursaries and prepare a standout application so you can focus on what matters: your education.",
    },
    {
      icon: Banknote,
      title: "NSFAS Applications",
      description: "The NSFAS application process can be confusing. Our team provides step-by-step support, ensuring your documents are in order and your application is submitted correctly and on time.",
    },
     {
      icon: School,
      title: "Varsity Applications",
      description: "Get into the university of your choice with our expert support. We provide hands-on assistance with your applications, helping you choose the right courses and write compelling motivation letters that get you noticed.",
    },
  ];

  const formatDuration = (videos: VideoData[] = []) => {
      const totalSeconds = videos.reduce((acc, video) => acc + (video.duration || 0), 0);
      if (totalSeconds === 0) return null;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
      if (minutes > 0) return `${minutes}m`;
      return `${Math.round(totalSeconds)}s`;
    };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden bg-background">
             <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5"></div>
             <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob"></div>
             <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob-2"></div>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="z-10 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter mb-6 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
                        Unlock Your Academic Success
                    </h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                       Edumate is your all-in-one partner for academic excellence. We provide high-quality video lessons for Grade 10-12 Maths and Sciences, expert one-on-one tutoring, and dedicated support for university and bursary applications. Our mission is to make top-tier education accessible and affordable for every South African student, helping you achieve your dreams.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <Button size="lg" asChild className="animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-primary via-primary/80 to-primary">
                           <Link href="/register">Get Started Free <ChevronRight className="ml-2" /></Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                           <Link href="/courses">Explore Courses</Link>
                        </Button>
                    </div>
                     {promotion && (
                        <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                            <Link href={promotion.buttonLink} target="_blank" rel="noopener noreferrer"
                                className="group relative block rounded-lg bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/10 transition-shadow duration-300 overflow-hidden p-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-shrink-0 bg-primary/10 text-primary p-3 rounded-full">
                                        {promotion.icon === 'tiktok' ? <FaTiktok className="h-6 w-6" /> : <SparklesIcon className="h-6 w-6" />}
                                    </div>
                                    <div className="flex-1 min-w-0 overflow-hidden">
                                        <div className="flex animate-marquee whitespace-nowrap">
                                            <span className="font-semibold mx-4">{promotion.title}: {promotion.description}</span>
                                            <span className="font-semibold mx-4">{promotion.title}: {promotion.description}</span>
                                            <span className="font-semibold mx-4">{promotion.title}: {promotion.description}</span>
                                            <span className="font-semibold mx-4">{promotion.title}: {promotion.description}</span>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block">
                                        <Button variant="ghost" size="sm" className="group-hover:text-primary">
                                            {promotion.buttonText}
                                            <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>

        <section id="stats" className="py-16 bg-muted animate-fade-in-up">
            <div className="max-w-5xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="space-y-2">
                        <Users className="h-10 w-10 text-primary mx-auto" />
                        <p className="text-4xl font-bold">150+</p>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Students Supported</p>
                    </div>
                    <div className="space-y-2">
                        <Rocket className="h-10 w-10 text-primary mx-auto" />
                        <p className="text-4xl font-bold">95%</p>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Pass Rate</p>
                    </div>
                    <div className="space-y-2">
                        <Star className="h-10 w-10 text-primary mx-auto" />
                        <p className="text-4xl font-bold">4.8/5</p>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Average Rating</p>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-24 bg-background relative overflow-hidden">
           <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl animate-blob -z-10"></div>
           <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-blob-2 -z-10"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12 animate-fade-in-up">
              <Badge>What We Offer</Badge>
              <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Our Services</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We offer a complete support system for your academic journey. From mastering tough subjects with expert tutors to navigating the complexities of university applications, our services are designed to give you the confidence and tools you need to succeed.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="text-center transition-all duration-300 bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 hover:-translate-y-2">
                  <CardHeader className="items-center">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary rounded-xl p-4 border border-primary/20">
                      <service.icon className="h-8 w-8" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section id="pricing" className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Pricing</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Choose Your Plan</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Select the perfect plan to kickstart your learning journey and unlock your full potential.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {subscriptionPlans.map((plan, index) => (
                        <Card key={plan.id} className={cn("flex flex-col animate-fade-in-up", plan.name === 'Pro' ? 'border-2 border-primary shadow-card-glow' : 'bg-card/50 backdrop-blur-lg border-border/20 shadow-lg')} style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    {plan.name === 'Pro' && <Badge>Most Popular</Badge>}
                                </div>
                                <p className="text-4xl font-bold pt-4">R{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0"/>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button asChild size="lg" className="w-full" variant={plan.name === 'Pro' ? 'default' : 'outline'}>
                                    <Link href="/register">Choose Plan</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        <section id="refer-earn" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Get Rewarded</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Refer &amp; Earn</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Love using Edumate? Share the love! For every friend who signs up using your unique referral link, we'll give you R20 as a thank you.
                    </p>
                </div>
                <div className="max-w-4xl mx-auto">
                    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-xl shadow-primary/10 overflow-hidden">
                        <div className="md:grid md:grid-cols-2 items-center">
                            <div className="p-8">
                                <div className="bg-primary/10 text-primary p-4 rounded-full inline-block mb-6 border border-primary/20">
                                    <Gift className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-headline font-bold">Get R20 for Every Friend</h3>
                                <p className="text-muted-foreground mt-2">
                                   It's that simple! Share your unique link and start earning rewards today.
                                </p>
                                 <Button size="lg" asChild className="mt-6">
                                    <Link href="/dashboard/referrals">
                                        Get Your Referral Link <ArrowRight className="ml-2" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="bg-muted/50 p-8 text-center">
                                <h4 className="font-semibold text-base text-foreground mb-4">Share on Social Media</h4>
                                <div className="flex justify-center space-x-4">
                                    <a href="https://www.tiktok.com/@edumate.pro" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="TikTok"><FaTiktok /></a>
                                    <a href="https://www.youtube.com/channel/UCG91mxIVykFs-0L5FZNk01g" target="_blank" rel="noopener noreferrer" className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="YouTube"><FaYoutube /></a>
                                    <a href="#" className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Facebook"><FaFacebook /></a>
                                    <a href="#" className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Twitter"><FaTwitter /></a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>

        <section id="featured-courses" className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Top Picks</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight my-4">Featured Courses</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Check out the expert-led video courses our students are loving right now.</p>
                </div>
                {loadingCourses ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)}
                    </div>
                ) : allCourses.length > 0 ? (
                    <Carousel
                        opts={{ align: "start", loop: true }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-2">
                            {allCourses.map((course, index) => (
                                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-2">
                                    <div className="p-1 h-full">
                                        <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                                            <Link href={`/courses/${course.id}`} className="block">
                                                <div className="relative h-56 overflow-hidden">
                                                    <Image
                                                        src={course.thumbnail}
                                                        alt={course.title}
                                                        fill
                                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                                        data-ai-hint="online course"
                                                    />
                                                     <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                     <Badge variant="secondary" className="absolute top-3 left-3">{course.subject}</Badge>
                                                </div>
                                            </Link>
                                            <CardHeader>
                                                <div className="flex justify-between items-center text-xs text-muted-foreground pt-1">
                                                    <span className="font-semibold">By {course.instructor}</span>
                                                    <div className="flex items-center gap-1 text-sm text-primary">
                                                        <Star className="w-4 h-4 fill-primary" />
                                                        <span className="font-bold">{(course.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                <CardTitle className="text-lg pt-2 line-clamp-2">{course.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-grow">
                                                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
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
                                                        <Link href={`/courses/${course.id}`}>View Course</Link>
                                                    </Button>
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="ml-10" />
                        <CarouselNext className="mr-10"/>
                    </Carousel>
                ) : (
                    <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-semibold">No Featured Courses Available</h3>
                        <p>Check back later for new courses, or make sure you have courses set to "Published" in your instructor dashboard.</p>
                    </div>
                )}
            </div>
        </section>

        <section id="events" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Live Sessions</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Upcoming Events</h2>
                    <p className="text-lg text-muted-foreground">
                        Join our free live classes, workshops, and Q&amp;A sessions to boost your knowledge and engage with our learning community.
                    </p>
                </div>
                {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map((event, index) => (
                             <Card key={event.id} className="group cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 bg-card/50" onClick={() => handleEventClick(event)}>
                                <div className="flex">
                                    <div className="flex flex-col items-center justify-center w-24 bg-gradient-to-br from-primary/10 to-primary/20 p-4 text-primary-foreground border-r border-primary/20">
                                        <span className="text-3xl font-bold text-primary">{format(new Date(event.start), 'd')}</span>
                                        <span className="text-sm font-semibold tracking-wider uppercase text-primary/80">{format(new Date(event.start), 'MMM')}</span>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <Badge variant="outline">{event.subject}</Badge>
                                        <h3 className="font-semibold mt-2 line-clamp-2">{event.title}</h3>
                                        <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{format(new Date(event.start), 'p')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4" />
                                                <span>By {event.instructor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-12">
                        <p>No upcoming events scheduled at the moment. Check back soon!</p>
                    </div>
                )}
            </div>
        </section>
        
        <section id="faq" className="py-24 bg-muted">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Need Help?</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight my-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">We've got answers to your most common questions. If you don't see your question here, just ask!</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqData.map((item, index) => (
                        <AccordionItem 
                            key={index} 
                            value={`item-${index}`} 
                            className="border-none bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-px rounded-lg"
                        >
                            <AccordionTrigger className="text-base font-semibold text-left hover:no-underline p-6 text-foreground tracking-subtle">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground px-6">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>

        <section id="testimonials" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <Badge>Success Stories</Badge>
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">What Our Students Are Saying</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Hear from students who are acing their studies with Edumate.
                    </p>
                </div>
                <Carousel
                    plugins={[
                        Autoplay({
                            delay: 7000,
                            stopOnInteraction: true,
                        }),
                    ]}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <CarouselContent>
                        {testimonials.map((testimonial, index) => (
                            <CarouselItem key={index}>
                                <div className="p-1 h-full">
                                    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg h-full flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                                        <CardContent className="p-8 text-center flex-grow flex items-center justify-center">
                                            <p className="text-lg font-medium text-foreground italic">
                                                "{testimonial.quote}"
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex flex-col items-center gap-4 pt-6 border-t">
                                            <div className="text-center">
                                                <p className="font-bold text-lg">{testimonial.name}</p>
                                                <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                                            </div>
                                            <Icons.logo className="h-6 w-auto opacity-50" />
                                        </CardFooter>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-[-50px] hidden sm:flex" />
                    <CarouselNext className="right-[-50px] hidden sm:flex" />
                </Carousel>
            </div>
        </section>

      </main>
      <Footer />
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
