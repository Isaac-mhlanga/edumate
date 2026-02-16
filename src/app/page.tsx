
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, PenSquare, Play, Clapperboard, Clock, Users, Calendar, Gift, ChevronRight, User, ChevronLeft, Banknote } from "lucide-react";
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
import { FaTiktok, FaYoutube, FaFacebook } from "react-icons/fa";

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
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 6;

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

  const totalPages = Math.ceil(allCourses.length / coursesPerPage);
  const paginatedCourses = allCourses.slice(
      (currentPage - 1) * coursesPerPage,
      currentPage * coursesPerPage
  );

  const formatDuration = (videos: VideoData[] = []) => {
      const totalSeconds = videos.reduce((acc, video) => acc + (video.duration || 0), 0);
      if (totalSeconds === 0) return null;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
      if (minutes > 0) return `${minutes}m`;
      return `${Math.round(totalSeconds)}s`;
  };

  const features = [
    {
      icon: <GraduationCap />,
      title: 'Expert-Led Video Lessons',
      description: 'Learn at your own pace with on-demand video lessons from subject-matter experts that make complex topics simple and clear.'
    },
    {
      icon: <Users />,
      title: 'One-on-One Tutoring',
      description: 'Get personalized help when you need it. Connect with our professional tutors for one-on-one sessions tailored to your learning style.'
    },
    {
      icon: <PenSquare />,
      title: 'Assignment &amp; Project Help',
      description: 'Stuck on an assignment? Get expert guidance for your school and university projects to understand the material and boost your grades.'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <PublicHeader />

      <main className="flex-1">
        <section id="home" className="relative py-24 md:py-32 lg:py-48 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10" />

          {/* Animated Background Icons Layer */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 overflow-hidden"
          >
            {/* Atom Icon */}
            <div className="absolute -top-10 -left-10 w-24 h-24 text-primary/10 animate-float-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-5.91-4.04-9.96-4.06-4.06-7.93-6.08-9.96-4.04-2.03 2.04-.02 5.91 4.04 9.96 4.06 4.06 7.93 6.08 9.96 4.04Z"/><path d="M3.8 3.8c-2.04 2.03-.02 5.91 4.04 9.96 4.06 4.06 7.93 6.08 9.96 4.04 2.03-2.04.02-5.91-4.04-9.96-4.06-4.06-7.93-6.08-9.96-4.04Z"/>
                </svg>
            </div>
            {/* DNA Icon */}
             <div className="absolute top-1/2 -right-12 w-28 h-28 text-primary/10 animate-float-2 opacity-50">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 14.5A8.5 8.5 0 0 1 15 4M9 20a8.5 8.5 0 0 1 11-10.5"/><path d="M15 4a8.5 8.5 0 0 0-11 10.5"/><path d="M9.5 20A8.5 8.5 0 0 0 20 9"/><path d="m7 11 1 1"/><path d="m16 8 1 1"/><path d="m12.5 15.5 1 1"/><path d="m8.5 4.5 1 1"/><path d="m15 13 1 1"/>
                </svg>
            </div>
            {/* Sigma Icon */}
            <div className="absolute -bottom-12 left-1/4 w-20 h-20 text-accent/20 animate-float-3 animate-spin-slow">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 7V4H6v3"/><path d="M6 20v-3h12v3"/><path d="M18 7 6 20"/>
                </svg>
            </div>
             {/* Flask Icon */}
            <div className="absolute bottom-1/4 -left-10 w-20 h-20 text-accent/10 animate-float-1 opacity-75">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 2h7"/><path d="M8.5 2v1.71c0 .9.58 1.69 1.43 1.95.85.26 1.71.26 2.56 0 .85-.26 1.43-1.05 1.43-1.95V2"/><path d="M3.29 12.46c.44-.94.7-1.46.7-2.46 0-1-.26-1.52-.7-2.46l-.06-.11A.5.5 0 0 1 3.5 7h17a.5.5 0 0 1 .27.92l-.06.11c-.44.94-.7 1.46-.7 2.46 0 1 .26 1.52.7 2.46l.06.11a.5.5 0 0 1-.27.92H3.5a.5.5 0 0 1-.27-.92l.06-.11Z"/><path d="M12 13V9"/><path d="M8.5 22h7"/>
                </svg>
            </div>
             {/* Plus Icon */}
            <div className="absolute top-10 right-10 w-16 h-16 text-primary/5 animate-spin-slow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
          </div>

          <div className="container mx-auto px-6 relative z-20">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-headline font-bold mb-6 animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-primary via-foreground to-primary animate-shimmer">
                Accessible, Quality Education for All
              </h1>
              <p
                className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                It’s simple. We give you the tools, you do the work. With easy-to-follow videos and expert help on demand, you can learn faster, smarter, and with less stress.
              </p>
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
                style={{ animationDelay: '0.4s' }}
              >
                <Button asChild size="lg">
                  <Link href="/register">
                    Get Started Free <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
              <div className="mt-8 text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center justify-center gap-x-6 gap-y-2 flex-wrap">
                  <span className="flex items-center gap-2">
                    <Play className="h-4 w-4 text-primary" />
                    On-demand Videos
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Expert Tutors
                  </span>
                  <span className="flex items-center gap-2">
                    <PenSquare className="h-4 w-4 text-primary" />
                    Assignment Help
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/40 animate-fade-in-up">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                <div>
                    <h3 className="text-4xl font-bold text-primary font-headline">95%</h3>
                    <p className="text-muted-foreground">Improved Scores</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-primary font-headline">2.3x</h3>
                    <p className="text-muted-foreground">Faster Learning</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-primary font-headline">10k+</h3>
                    <p className="text-muted-foreground">Happy Students</p>
                </div>
                <div>
                    <h3 className="text-4xl font-bold text-primary font-headline">Top 1%</h3>
                    <p className="text-muted-foreground">Expert Tutors</p>
                </div>
            </div>
          </div>
        </section>

        <section id="refer" className="py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
            <div className="container mx-auto px-6 relative">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="animate-fade-in-up">
                        <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">
                            Refer &amp; Earn
                        </h2>
                        <p className="text-lg text-muted-foreground mb-6">
                           Invite friends to Edumate Pro and earn R20 for each one who signs up. It's our way of saying thanks for helping our community grow.
                        </p>
                        <div className="flex items-center gap-4 mb-6">
                            <p className="text-sm font-medium">Share on:</p>
                            <div className="flex space-x-2">
                                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="TikTok"><FaTiktok /></a>
                                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="YouTube"><FaYoutube /></a>
                                <a href="#" className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground" aria-label="Facebook"><FaFacebook /></a>
                            </div>
                        </div>
                        <Button asChild size="lg">
                            <Link href="/register">
                                Sign Up and Get Referral Code <ArrowRight className="ml-2" />
                            </Link>
                        </Button>
                    </div>
                    <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-xl shadow-primary/10 transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 p-8 text-center">
                            <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6 border-2 border-primary/20">
                                <Gift className="w-10 h-10 text-primary" />
                            </div>
                            <CardTitle className="text-xl mb-2">
                                Share the Knowledge, Get Rewarded
                            </CardTitle>
                            <p className="text-5xl font-bold text-primary my-4">R20</p>
                            <p className="text-muted-foreground text-sm">
                                For every successful referral.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </section>

        <section id="features" className="py-24 bg-muted/70 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
          <div className="container mx-auto px-6 relative">
                 <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">
                      A Smarter Way to Learn
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                      It’s a simple, easy-to-use space designed to help you succeed. Here’s how our key features help you learn better.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <Card key={index} className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
                      <CardContent className="p-8 text-center flex flex-col items-center">
                        <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                            {React.cloneElement(feature.icon, { className: "w-8 h-8 text-primary" })}
                        </div>
                        <CardTitle className="text-xl mb-2">
                            {feature.title}
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            {feature.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
            </div>
        </section>

        <section id="guidance" className="py-24 bg-background">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">
                    Student Guidance Services
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                    Navigate your future with confidence. We offer expert guidance on university applications, funding, and career choices to help you succeed beyond the classroom.
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up" style={{ animationDelay: `0.2s` }}>
                        <CardContent className="p-8 text-center flex flex-col items-center">
                            <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                                <Banknote className="w-8 h-8 text-primary" />
                            </div>
                            <CardTitle className="text-xl mb-2">
                                Bursary &amp; NSFAS Guidance
                            </CardTitle>
                            <p className="text-muted-foreground text-sm">
                                Secure your funding with our expert help. We guide you through the entire application process for bursaries and NSFAS to maximize your chances.
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 group animate-fade-in-up" style={{ animationDelay: `0.3s` }}>
                        <CardContent className="p-8 text-center flex flex-col items-center">
                        <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6 border-2 border-primary/20 group-hover:border-primary/50 transition-colors">
                            <GraduationCap className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-xl mb-2">
                            University Career Guidance
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            Align your passions with a fulfilling career. Get personalized advice on choosing the right degree and university to achieve your long-term goals.
                        </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>

        <section id="courses" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="max-w-7xl mx-auto px-6 relative">
              <div className="text-center mb-12 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-headline font-bold my-4">Featured Courses</h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Jump into our most popular courses. These are hand-picked to give you the best start. Learn from experts and hit your goals.</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loadingCourses ? (
                  Array.from({length: 6}).map((_, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-lg border-border/20"><CardHeader><Skeleton className="h-48 w-full"/></CardHeader><CardContent className="pt-4"><Skeleton className="h-5 w-3/4 mb-2"/><Skeleton className="h-4 w-full"/></CardContent></Card>
                  ))
                ) : (
                    paginatedCourses.map((course, index) => (
                    <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${0.2 + (index % 3) * 0.1}s` }}>
                        <Link href={`/courses/${course.id}`} className="block">
                            <div className="relative h-48 overflow-hidden">
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
                            </div>
                            <CardTitle className="text-xl pt-2">{course.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
                            {course.instructor && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                    <User className="h-4 w-4" />
                                    <span>By {course.instructor}</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col items-start gap-4">
                            <div className="flex justify-between w-full text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clapperboard className="w-4 h-4" />
                                    <span>{course.videos.length} lessons</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatDuration(course.videos as VideoData[]) || 'N/A'}</span>
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
                    ))
                )}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center pt-12 animate-fade-in-up">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <span className="text-sm text-muted-foreground mx-4">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
              )}
          </div>
        </section>

        <section id="faq" className="py-24 bg-muted/70 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
            <div className="max-w-7xl mx-auto px-6 relative">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Got questions? We've got answers. Here are some common questions about our platform. If you can't find what you need, just ask!</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {faqData.map((faq, index) => (
                        <AccordionItem
                            value={`item-${index}`}
                            key={index}
                            className="border-none rounded-2xl bg-card/50 backdrop-blur-lg border border-border/20 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 animate-fade-in-up"
                            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
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
        
        <section id="contact" className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent"></div>
          {/* More Animated Blobs */}
          <div className="absolute -top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full animate-blob filter blur-3xl opacity-30" style={{animationDuration: '15s'}}></div>
          <div className="absolute -bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full animate-blob filter blur-3xl opacity-30" style={{animationDuration: '10s'}}></div>
          
          <div className="container mx-auto px-6 relative">
            <Card className="max-w-4xl mx-auto bg-card/50 backdrop-blur-lg border-border/20 shadow-xl shadow-primary/10 p-8 md:p-12 text-center transition-all duration-300 hover:shadow-primary/20 hover:-translate-y-1 animate-fade-in-up">
                <CardHeader className="p-0 mb-4">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold">
                        Begin Your Journey to Excellence
                    </h2>
                </CardHeader>
                <CardContent className="p-0 mb-8">
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Ready to get started? Join our community, unlock your potential, and start learning with our modern tools today.
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
