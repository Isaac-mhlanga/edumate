
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, PenSquare, Play, Clapperboard, Clock, Users } from "lucide-react";
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
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1 overflow-x-hidden">
        <section id="home" className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-[-1] opacity-20"
            src="https://cdn.pixabay.com/video/2023/11/13/188825-883244621_large.mp4"
          />
          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-7xl font-headline font-bold mb-6 leading-tight animate-fade-in-up bg-gradient-to-r from-primary via-foreground to-accent bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                The Future of Learning is Here.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                Edumate Pro combines cutting-edge technology with expert-led instruction to create a seamless, intelligent learning experience.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button asChild size="lg" className="shadow-lg shadow-primary/20">
                  <Link href="/courses">
                      Explore Courses <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                 <div className="text-center mb-16 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">
                      A Smarter Way to Learn
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      Our platform is designed with features that empower students and educators alike.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="p-6 flex flex-col items-center text-center gap-4 animate-fade-in-up bg-transparent border-border/50" style={{ animationDelay: `${0.2 + index * 0.2}s` }}>
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
        </section>

        <section id="courses" className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Featured Courses</h2>
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
                    opts={{ align: "start", loop: true }}
                    className="w-full"
                  >
                    <CarouselContent>
                      {allCourses.map((course) => (
                        <CarouselItem key={course.id} className="md:basis-1/2 lg:basis-1/3">
                          <div className="p-1">
                            <Card className="group overflow-hidden flex flex-col h-full bg-card border-border/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1">
                              <Link href={`/courses/${course.id}`} className="block">
                                  <div className="relative h-48 overflow-hidden">
                                      <Image 
                                        src={course.thumbnail}
                                        alt={course.title}
                                        fill
                                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="online course"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                      <div className="absolute bottom-4 left-4">
                                        <Badge variant="secondary">{course.subject}</Badge>
                                      </div>
                                  </div>
                              </Link>
                              <CardHeader>
                                <CardTitle className="text-lg pt-2">{course.title}</CardTitle>
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
                    <CarouselPrevious className="hidden lg:flex" />
                    <CarouselNext className="hidden lg:flex" />
                  </Carousel>
              )}
               <div className="text-center mt-16 animate-fade-in-up">
                  <Button size="lg" variant="outline" asChild>
                      <Link href="/courses">
                          View All Courses <ArrowRight className="ml-2" />
                      </Link>
                  </Button>
              </div>
          </div>
        </section>

        <section id="contact" className="py-24">
            <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
              <Card className="p-8 sm:p-12 bg-card/50 border-border/50">
                <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">
                  Ready to Elevate Your Learning?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students achieving their academic goals. Sign up to start your journey with Edumate Pro today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register">
                        Start for Free
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </section>
      </main>
      
      <Footer />
    </div>
  );
}
