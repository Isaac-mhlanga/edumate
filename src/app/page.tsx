'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Award, BookOpen, ChevronRight, Clapperboard, Star, UserCog, Video } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicHeader } from "@/components/public-header";
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Skeleton } from "@/components/ui/skeleton";
import { Rocket, GraduationCap } from "lucide-react";

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
  const [loadingCourses, setLoadingCourses] = useState(true);
  
  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    const fetchCoursesAndUsers = async () => {
        setLoadingCourses(true);
        try {
            const usersSnapshot = await getDocs(collection(firestore, 'users'));
            const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as UserDoc);
            const instructorMap = new Map(users.filter(u => u.role === 'instructor').map(i => [i.id, i.fullName]));

            const coursesQuery = query(collection(firestore, 'courses'), where('status', '==', 'Published'), orderBy('createdAt', 'desc'), limit(6));
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
    
    fetchCoursesAndUsers();
  }, []);

  const heroFeatures = [
      { icon: Clapperboard, text: "Online Course"},
      { icon: Video, text: "Live Webinar"},
      { icon: UserCog, text: "Career Mentoring"},
      { icon: Award, text: "Certification"},
  ]
  
  const aboutFeatures = [
      { icon: GraduationCap, title: "Online Courses", description: "Proin sodales feugiat odio curabitur curabitur." },
      { icon: Rocket, title: "Upgrade Personal Skill", description: "Proin sodales feugiat odio curabitur curabitur." },
      { icon: Award, title: "Certifications", description: "Proin sodales feugiat odio curabitur curabitur." },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main>
        <section className="relative bg-[#0EAB83] text-white pt-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-8 py-20">
                <div className="z-10 text-center lg:text-left">
                    <Badge variant="outline" className="bg-white/10 text-white border-white/20 mb-4">#FREE TRIAL 30 DAYS</Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Upgrade your skills and knowledge with our online course</h1>
                    <p className="text-lg opacity-80 mb-8">Unlock your potential with our 30-day free trial - sign up with your email today!</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                         <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-200">
                           <Link href="/register">Get Started Free <ChevronRight className="ml-2" /></Link>
                        </Button>
                    </div>
                </div>
                <div className="relative h-full hidden lg:block">
                     <Image src="https://picsum.photos/seed/h1/300/450" alt="Student with laptop" width={300} height={450} className="rounded-lg shadow-2xl absolute bottom-0 right-1/2 translate-x-1/4 z-10" data-ai-hint="student laptop"/>
                     <Image src="https://picsum.photos/seed/h2/300/450" alt="Student with clipboard" width={300} height={450} className="rounded-lg shadow-2xl absolute bottom-0 right-0" data-ai-hint="student notebook"/>
                </div>
            </div>
             <div className="absolute bottom-0 left-0 right-0 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 150">
                    <path fill="currentColor" d="M0,64L80,80C160,96,320,128,480,128C640,128,800,96,960,85.3C1120,75,1280,85,1360,90.7L1440,96L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" style={{transform: 'translateY(1px)', color: 'hsl(var(--background))'}}></path>
                </svg>
            </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
             <div className="bg-white rounded-lg shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                {heroFeatures.map(feature => (
                    <div key={feature.text} className="flex items-center gap-3">
                        <div className="bg-primary/10 text-primary p-3 rounded-lg"><feature.icon /></div>
                        <div>
                            <h3 className="font-semibold text-sm">{feature.text}</h3>
                            <p className="text-xs text-muted-foreground">pharetra dis.</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <section className="py-24">
            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 items-center gap-16">
                 <div className="relative">
                    <Image src="https://picsum.photos/seed/a1/500/500" alt="Student smiling" width={500} height={500} className="rounded-lg shadow-lg w-full" data-ai-hint="student laptop crossed legs" />
                    <div className="absolute -left-8 -top-8 bg-primary text-primary-foreground rounded-full h-28 w-28 flex flex-col items-center justify-center text-center p-4 shadow-xl">
                        <p className="text-3xl font-bold">7M+</p>
                        <p className="text-xs font-medium">Member Active</p>
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-bold text-primary uppercase mb-2">Who We Are</h3>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Primary Instruction, Higher Department Of Education</h2>
                    <p className="text-muted-foreground mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                    <div className="space-y-6">
                        {aboutFeatures.map(feature => (
                            <div key={feature.title} className="flex items-start gap-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-lg"><feature.icon/></div>
                                <div>
                                    <h4 className="font-bold">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        <section className="bg-cover bg-center text-white" style={{backgroundImage: "url('https://picsum.photos/seed/cta/1440/400')"}}>
            <div className="bg-[#1D2A5A]/80 py-24">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Start your learning journey today! Enroll now in our online course.</h2>
                    <p className="text-lg opacity-80 mb-8">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                    <Button size="lg" variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/courses">Discover More</Link>
                    </Button>
                </div>
            </div>
        </section>

        <section id="courses" className="py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6">
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold">Featured Courses</h2>
                <Button variant="outline" asChild>
                    <Link href="/courses">All Courses</Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loadingCourses ? (
                  Array.from({length: 4}).map((_, i) => (
                    <Card key={i}><CardHeader><Skeleton className="h-48 w-full"/></CardHeader><CardContent className="pt-4"><Skeleton className="h-5 w-3/4 mb-2"/><Skeleton className="h-4 w-full"/></CardContent></Card>
                  ))
                ) : (
                    allCourses.map((course) => (
                    <Card key={course.id} className="group overflow-hidden flex flex-col shadow-md hover:shadow-xl transition-all duration-300">
                        <CardHeader className="p-0 relative">
                            <Link href={`/courses/${course.id}`} className="block">
                                <Image
                                    src={course.thumbnail}
                                    alt={course.title}
                                    width={400}
                                    height={250}
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    data-ai-hint="online course"
                                />
                            </Link>
                             <Badge className="absolute top-3 left-3 text-base" variant="destructive">{course.pricing.type === 'purchase' ? `R${course.pricing.price}` : 'Free'}</Badge>
                        </CardHeader>
                        <CardContent className="p-4 flex-grow flex flex-col">
                           <div className="flex-grow">
                                <p className="text-primary text-sm font-semibold">{course.subject}</p>
                                <h3 className="font-bold text-lg mt-1 line-clamp-2">{course.title}</h3>
                                {course.rating && (
                                    <div className="flex items-center gap-1 text-sm mt-2 text-muted-foreground">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-500" />
                                        <span>({course.rating.toFixed(1)})</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t mt-4 pt-4">
                                <Button asChild className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
                                    <Link href={`/courses/${course.id}`}>Enroll Now</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    ))
                )}
              </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
