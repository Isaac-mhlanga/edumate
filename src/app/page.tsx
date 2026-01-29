'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, PenSquare, Play, Clapperboard, Clock, Users, Calendar, Gift, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PublicHeader } from "@/components/public-header";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { faqData } from "@/lib/data";
import { CommunityPreview } from "@/components/community-preview";

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
    
    fetchCoursesAndUsers();
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section id="home" className="relative py-24 md:py-32 lg:py-48 text-center">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background"></div>
          <Image
            src="https://picsum.photos/seed/apple/1920/1080"
            alt="Hero background"
            fill
            className="object-cover -z-10 opacity-10"
            data-ai-hint="abstract background gradient"
          />
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 animate-shimmer bg-clip-text text-transparent">
                Accessible, Quality Education for All
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Edumate Pro is a futuristic, professional, and student-focused educational platform offering video lessons, tutoring services, and paid assignments.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/register">
                      Get Started Free <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24 bg-muted">
            <div className="max-w-7xl mx-auto px-6">
                 <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">
                      A Smarter Way to Learn
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      Our platform is designed with features that empower students and educators alike.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="p-6 flex flex-col items-center text-center gap-4 bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                      <div className="inline-block bg-primary/10 text-primary p-4 rounded-full">
                          {feature.icon}
                      </div>
                      <div>
                          <h3 className="text-xl font-bold mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground">
                            {feature.description}
                          </p>
                      </div>
                    </Card>
                  ))}
                </div>
            </div>
        </section>

        <section id="courses" className="py-24">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Featured Courses</h2>
                <p className="text-lg text-muted-foreground">Explore our most popular courses to get started.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loadingCourses ? (
                  Array.from({length: 3}).map((_, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-lg border-border/20"><CardHeader><Skeleton className="h-48 w-full"/></CardHeader><CardContent className="pt-4"><Skeleton className="h-5 w-3/4 mb-2"/><Skeleton className="h-4 w-full"/></CardContent></Card>
                  ))
                ) : (
                  allCourses.slice(0, 3).map(course => (
                    <Card key={course.id} className="group overflow-hidden bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
                      <CardHeader className="p-0">
                        <Link href={`/courses/${course.id}`}>
                            <Image src={course.thumbnail} alt={course.title} width={600} height={400} className="w-full aspect-video object-cover transition-transform group-hover:scale-105" data-ai-hint="online course" />
                        </Link>
                      </CardHeader>
                      <CardContent className="p-4">
                         <Badge variant="secondary">{course.subject}</Badge>
                         <CardTitle className="text-xl mt-2">{course.title}</CardTitle>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                         <Button asChild className="w-full">
                           <Link href={`/courses/${course.id}`}>View Course</Link>
                         </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
          </div>
        </section>

        <section id="faq" className="py-24">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">Have questions? We've got answers.</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqData.map((faq, index) => (
                        <AccordionItem
                            value={`item-${index}`}
                            key={index}
                            className="border-none rounded-2xl bg-card/50 backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden"
                        >
                            <AccordionTrigger className="text-left p-6 text-base font-semibold hover:no-underline">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6 pt-0">
                                <p className="text-muted-foreground">{faq.answer}</p>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
        
        <section id="refer" className="py-24">
            <div className="max-w-4xl mx-auto px-6">
                <Card className="grid md:grid-cols-2 items-center overflow-hidden bg-card/50 backdrop-blur-lg border-border/20 shadow-xl shadow-primary/10">
                    <CardContent className="p-8 md:p-12">
                        <Badge variant="secondary" className="mb-4">Refer & Earn</Badge>
                        <h2 className="text-3xl font-bold mb-4">Share the Knowledge, Get Rewarded</h2>
                        <p className="text-muted-foreground mb-6">
                            Love Edumate Pro? Invite your friends to join and you'll both get rewarded. For every friend who signs up with your unique referral link, you'll earn credits toward your next purchase.
                        </p>
                        <Button asChild>
                            <Link href="/register">
                                Start Earning Now <ChevronRight className="ml-2" />
                            </Link>
                        </Button>
                    </CardContent>
                    <div className="hidden md:flex h-full w-full items-center justify-center p-8 bg-primary/10">
                        <Gift className="h-32 w-32 text-primary opacity-50" />
                    </div>
                </Card>
            </div>
        </section>
        
        <CommunityPreview />

        <section id="contact" className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
          <div className="container mx-auto px-6 relative">
            <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-lg border-border/20 shadow-xl shadow-primary/10 p-8 md:p-12 text-center">
                <CardHeader className="p-0 mb-4">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">
                        Begin Your Journey to Excellence
                    </h2>
                </CardHeader>
                <CardContent className="p-0 mb-8">
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Join a community of forward-thinkers. Sign up now to unlock your full potential and access our suite of futuristic learning tools.
                    </p>
                </CardContent>
                <CardFooter className="p-0 flex justify-center">
                    <Button size="lg" asChild>
                        <Link href="/register">
                            Get Started Now <ArrowRight className="ml-2" />
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
