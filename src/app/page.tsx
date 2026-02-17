'use client';

import { CommunityPreview } from "@/components/community-preview";
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
import { Award, BookOpen, ChevronRight, GraduationCap, Handshake, Sparkle, Star, UserCog, Video, Clapperboard, Calendar, HelpCircle, Rocket, ArrowRight } from "lucide-react";
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
      { icon: Award, text: "Bursary Applications"},
  ]
  

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />
      <main>
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-24 overflow-hidden">
             <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob -z-10"></div>
             <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob animation-delay-4000 -z-10"></div>
            <div className="max-w-7xl mx-auto px-6 text-center">
                <div className="z-10 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold tracking-tighter mb-6">A Smarter Way to Learn</h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">Unlock your potential with expert-led video courses, personalized tutoring, university application guidance, and bursary application assistance.</p>
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
      </main>
      <Footer />
    </div>
  );
}
