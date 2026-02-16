'use client';

import { CommunityPreview } from "@/components/community-preview";
import { EnquiryDialog } from "@/components/enquiry-dialog";
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
import { Award, BookOpen, ChevronRight, GraduationCap, Handshake, ShieldCheck, Sparkle, Star, UserCog, Video, Clapperboard, Calendar, HelpCircle, Rocket } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

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
  const [isEnquiryDialogOpen, setIsEnquiryDialogOpen] = useState(false);

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

  const heroFeatures = [
      { icon: Clapperboard, text: "Video Lessons"},
      { icon: UserCog, text: "Expert Tutors"},
      { icon: GraduationCap, text: "Career Guidance"},
      { icon: ShieldCheck, text: "Bursary Applications"},
  ]
  
  const aboutFeatures = [
      { icon: BookOpen, title: "CAPS & IEB Aligned", description: "Our curriculum covers all key topics for Grade 10-12 Maths, Physical Sciences, and Life Sciences." },
      { icon: Rocket, title: "University Support", description: "Specialized assistance for varsity students in IT, Computer Science, and Information Security modules." },
      { icon: Award, title: "Proven Results", description: "Join thousands of students who have improved their grades and secured their academic future." },
  ]
  
  const services = [
      {
          icon: GraduationCap,
          title: "University Career Guidance",
          description: "Align your academic path with your career goals. We help you explore degree options and understand university requirements for a successful future."
      },
      {
          icon: ShieldCheck,
          title: "Bursary & NSFAS Applications",
          description: "Get step-by-step guidance to ensure your application is accurate, complete, and submitted on time to maximize your chances of securing funding."
      },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
             <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob -z-10"></div>
             <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-4000 -z-10"></div>
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-12">
                <div className="z-10 text-center lg:text-left animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-semibold mb-6">A Smarter Way to Learn</h1>
                    <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">Unlock your potential with expert-led video courses, personalized tutoring, and university application guidance.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                         <Button size="lg" asChild>
                           <Link href="/register">Get Started Free <ChevronRight className="ml-2" /></Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                           <Link href="/courses">Explore Courses</Link>
                        </Button>
                    </div>
                </div>
                <div className="relative h-full hidden lg:block">
                    <div className="relative w-full aspect-[4/3]">
                        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern -z-10"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/20 rounded-full blur-3xl"></div>

                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                           {heroFeatures.map((feature, i) => (
                                <div key={feature.text} className={`absolute animate-float-${i+1}`}>
                                    <div className="bg-card/80 backdrop-blur-md p-3 rounded-lg shadow-lg flex items-center gap-3">
                                        <div className="bg-primary/10 text-primary p-2 rounded-md"><feature.icon className="h-5 w-5"/></div>
                                        <p className="font-semibold text-sm pr-2">{feature.text}</p>
                                    </div>
                                </div>
                           ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
         <section className="py-16 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 items-center">
                    {services.map((service, index) => (
                        <div key={index} className="flex items-start gap-4 p-6 rounded-lg transition-all duration-300">
                            <div className="bg-primary/10 text-primary p-4 rounded-full">
                                <service.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold font-headline">{service.title}</h3>
                                <p className="text-muted-foreground mt-1">{service.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="events" className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-semibold mb-4">Upcoming Events</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Join our live sessions, workshops, and Q&As, and career guidance sessions to boost your learning.</p>
                </div>
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcomingEvents.map((event, index) => (
                        <Card key={event.id} onClick={() => handleEventClick(event)} className="group overflow-hidden flex flex-col cursor-pointer hover:shadow-primary/20 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <CardHeader className="p-0">
                                <div className="relative h-48 bg-muted flex items-center justify-center">
                                    <Calendar className="w-16 h-16 text-muted-foreground/30" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                                        <h3 className="font-semibold text-lg text-white line-clamp-2">{event.title}</h3>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <div className="flex justify-between items-center text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> <span>{new Date(event.start).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric'})}</span></div>
                                    <Badge variant="secondary">{event.subject}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{event.scope}</p>
                            </CardContent>
                             <CardFooter className="p-4 border-t">
                                <span className="text-primary font-semibold text-sm group-hover:underline">View Details <ArrowRight className="inline-block ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
                 <EventDialog 
                    event={selectedEvent}
                    allEvents={upcomingEvents}
                    isOpen={isEventDialogOpen} 
                    onClose={() => setIsEventDialogOpen(false)}
                    onEventSelect={(event) => setSelectedEvent(event)}
                />
            </div>
        </section>
        
        <CommunityPreview />

      </main>
      
      <Footer />
       <EnquiryDialog isOpen={isEnquiryDialogOpen} setIsOpen={setIsEnquiryDialogOpen} />
    </div>
  );
}
