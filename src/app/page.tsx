'use client';

import { EventDialog } from "@/components/event-dialog";
import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { PublicHeader } from "@/components/public-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { faqData } from "@/lib/data";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore, limit, orderBy, query, Timestamp, where } from "firebase/firestore";
import { Award, BookOpen, ChevronRight, GraduationCap, Handshake, Sparkle, Star, UserCog, Video, Clapperboard, Calendar, HelpCircle, Rocket, ArrowRight, Users, FilePenLine, Banknote, School } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { format } from 'date-fns';

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


export default function Home() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    const fetchCoursesAndUsers = async () => {
        setLoadingCourses(true);
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserDoc);
            const instructorMap = new Map(users.filter(u => u.role === 'instructor').map(i => [i.id, i.fullName]));

            const coursesQuery = query(collection(firestore, 'courses'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(3));
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
            console.error("Error fetching published courses: ", error);
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
    
    fetchCoursesAndUsers();
    fetchUpcomingEvents();
  }, []);
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };
  
  const services = [
    {
      icon: Users,
      title: "Tutorial Sessions",
      description: "One-on-one and group tutoring sessions designed to improve understanding and academic performance.",
    },
    {
      icon: FilePenLine,
      title: "Assignment & Project Assistance",
      description: "Guidance and support with school and university assignments and research projects.",
    },
    {
      icon: GraduationCap,
      title: "Career Guidance",
      description: "Personalized career advice, subject selection guidance, and future planning support.",
    },
    {
      icon: Award,
      title: "Bursary Applications",
      description: "Assistance with identifying and applying for bursaries and scholarships.",
    },
    {
      icon: Banknote,
      title: "NSFAS Bursary Applications",
      description: "Step-by-step support with NSFAS applications and documentation.",
    },
     {
      icon: School,
      title: "University Applications",
      description: "Guidance through the university application process, from choosing a course to final submission.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
             <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob -z-10"></div>
             <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob-2 -z-10"></div>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="z-10 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter mb-6">A Smarter Way to Learn</h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Excel with expert-led video courses, personalized tutoring, and comprehensive university, career, and bursary guidance.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                         <Button size="lg" asChild>
                           <Link href="/register">Get Started Free <ChevronRight className="ml-2" /></Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                           <Link href="/courses">Explore Courses</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <section className="py-24 bg-muted relative overflow-hidden">
           <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl animate-blob -z-10"></div>
           <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob-2 -z-10"></div>
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Services</h2>
              <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                Empowering students through academic support, career guidance, and funding assistance.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="text-center transition-all duration-300 bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1">
                  <CardHeader className="items-center">
                    <div className="bg-primary/10 text-primary rounded-full p-4">
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

        <section id="featured-courses" className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight mb-4">Featured Courses</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Explore our most popular courses and start learning today.</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loadingCourses ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-xl" />)
                    ) : (
                        allCourses.map((course, index) => (
                            <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: `${0.1 * index}s` }}>
                                <Link href={`/courses/${course.id}`} className="block">
                                    <div className="relative h-56 overflow-hidden">
                                        <Image
                                            src={course.thumbnail}
                                            alt={course.title}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint="online course"
                                        />
                                    </div>
                                </Link>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary">{course.subject}</Badge>
                                        <div className="flex items-center gap-1 text-sm text-amber-500">
                                            <Star className="w-4 h-4 fill-amber-400" />
                                            <span className="font-bold">{(course.rating || 0).toFixed(1)}</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl pt-2">{course.title}</CardTitle>
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
                                            <UserCog className="w-4 h-4" />
                                            <span>By {course.instructor}</span>
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </section>

        <section id="events" className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">Upcoming Events</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
                        Join our live sessions, workshops, and Q&A's.
                    </p>
                </div>
                {upcomingEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {upcomingEvents.map((event, index) => (
                            <Card key={event.id} className="group cursor-pointer" onClick={() => handleEventClick(event)}>
                                <CardHeader>
                                    <div className="flex items-center gap-4 text-primary mb-2">
                                        <Calendar className="h-6 w-6"/>
                                        <p className="font-bold text-lg">{format(new Date(event.start), 'MMMM d, yyyy')}</p>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{event.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground line-clamp-3">{event.scope || event.description}</p>
                                </CardContent>
                                <CardFooter>
                                    <div className="flex justify-between w-full items-center text-sm">
                                        <span className="font-semibold">{event.instructor}</span>
                                        <Badge variant="secondary">{event.subject} - Grade {event.grade}</Badge>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No upcoming events scheduled at the moment. Check back soon!</p>
                    </div>
                )}
                <div className="text-center mt-12">
                    <Button size="lg" asChild>
                        <Link href="/calendar">View Full Calendar <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </div>
            </div>
        </section>
        
        <section id="faq" className="py-24">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Have questions? We've got answers. If you can't find what you're looking for, feel free to contact us.</p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {faqData.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">{item.question}</AccordionTrigger>
                            <AccordionContent className="text-base text-muted-foreground">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
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
