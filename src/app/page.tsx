
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare, Play, Clock, Star, Users, Wand2, Clapperboard, Rocket, Dna, X, ChevronRightIcon, FunctionSquare, Menu, Calendar, ChevronLeft, Loader2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { faqData, upcomingEvents, UpcomingEvent, curriculumData } from "@/lib/data";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublicHeader } from "@/components/public-header";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { format } from "date-fns";
import { EventDialog } from "@/components/event-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { summarizeLesson } from "@/ai/flows/summarize-lesson";

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


const Hero = ({ onExploreClick }: { onExploreClick: () => void }) => {
  return (
    <section id="home" className="relative py-20 md:py-32 overflow-hidden text-center bg-background">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-0"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-red-400" style={{ animationDelay: '0.2s' }}>
            Master Maths & Science
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            Ace your exams with our comprehensive video lessons, AI-powered tutors, and expert-led tutorials.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <Button onClick={onExploreClick} size="lg" className="w-full sm:w-auto">
              Explore Curriculum <ArrowRight className="ml-2" />
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/tutors">Find a Tutor</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};


export default function Home() {
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [currentCoursePage, setCurrentCoursePage] = useState(1);
  const coursesPerPage = 6;
  
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedCourseForPlayer, setSelectedCourseForPlayer] = useState<Course | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(null);
  const [activeVideo, setActiveVideo] = useState<VideoData | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState('720p');
  const [isClient, setIsClient] = useState(false);
  
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizedVideoId, setSummarizedVideoId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    const fetchCourses = async () => {
        setLoadingCourses(true);
        try {
            const coursesQuery = query(collection(firestore, 'courses'), where('status', '==', 'Published'));
            const querySnapshot = await getDocs(coursesQuery);
            const fetchedCourses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
            setAllCourses(fetchedCourses);
        } catch (error) {
            console.error("Error fetching published courses: ", error);
        } finally {
            setLoadingCourses(false);
        }
    };
    
    fetchCourses();
  }, []);

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
  
  const curriculumIcons = {
    'Mathematics': FunctionSquare,
    'Physical Sciences': Rocket,
    'Life Sciences': Dna,
  };

  const getCoursesForTopic = (topic: string, subject: keyof typeof curriculumData) => {
    const searchTerms = topic.toLowerCase().replace(/[-&,]/g, ' ').split(' ').filter(term => term.length > 2);
    return allCourses.filter(course => 
      course.subject === subject && 
      searchTerms.some(term => 
        course.title.toLowerCase().includes(term) || 
        course.description.toLowerCase().includes(term)
      )
    );
  };

  const handleCourseClick = (course: Course) => {
    setSelectedCourseForPlayer(course);
    if (course.videos && course.videos.length > 0) {
      setActiveVideo(course.videos[0]);
    }
    setSummary(null);
    setSummarizedVideoId(null);
    setIsVideoPlayerOpen(true);
  };

  const handleEventClick = (event: UpcomingEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleSummarize = async (video: VideoData, course: Course) => {
      if (!video || !course) return;
      setIsSummarizing(true);
      setSummary(null);
      setSummarizedVideoId(video.id);

      try {
          const result = await summarizeLesson({
              lessonTitle: video.title,
              lessonDescription: 'A video about ' + video.title, // Placeholder
              transcript: '...', // Placeholder for transcript
              courseContext: course.description,
              studentPreviousActivity: 'Watched introduction', // Placeholder
          });
          setSummary(result.summary);
          toast({
              title: 'Summary Generated!',
              description: 'The AI-powered summary is now available.',
          });
      } catch (error) {
          console.error("Error summarizing lesson:", error);
          toast({
              variant: 'destructive',
              title: 'Summarization Failed',
              description: 'Could not generate a summary for this lesson.',
          });
      } finally {
          setIsSummarizing(false);
      }
  };


  useEffect(() => {
    if (selectedCourseForPlayer && selectedCourseForPlayer.videos.length > 0) {
      setActiveVideo(selectedCourseForPlayer.videos[0]);
    }
  }, [selectedCourseForPlayer]);
  
  const scrollToCurriculum = () => {
    const curriculumSection = document.getElementById('curriculum');
    if (curriculumSection) {
      curriculumSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Pagination logic for courses
  const totalCoursePages = Math.ceil(allCourses.length / coursesPerPage);
  const paginatedCourses = allCourses.slice(
    (currentCoursePage - 1) * coursesPerPage,
    currentCoursePage * coursesPerPage
  );

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

      <main className="flex-grow pt-16">
         <div>
          <Hero onExploreClick={scrollToCurriculum} />
          
          <section className="py-16 bg-muted/50">
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.number}
                    </div>
                    <div className="text-muted-foreground font-medium">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="about" className="py-20">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16 animate-fade-in-up">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  The Future of Learning is Here
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Experience a revolutionary way to learn, powered by artificial intelligence and expert knowledge.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="text-center p-8 bg-card border-transparent shadow-lg hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.2}s` }}>
                    <div className="inline-block bg-primary/10 text-primary p-4 rounded-full mb-6">
                        {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </section>
          
           <section id="curriculum" className="py-20 bg-muted/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Our Comprehensive Curriculum</h2>
                    <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Our Grade 12 curriculum is expertly crafted to cover all essential topics. Find courses that match your needs.</p>
                </div>
                
                <Tabs defaultValue="Mathematics" className="w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 mb-8 h-auto sm:h-12">
                        {Object.entries(curriculumData).map(([subject, data]) => {
                            const Icon = curriculumIcons[subject as keyof typeof curriculumIcons];
                            return (
                                <TabsTrigger key={subject} value={subject} className="gap-2 text-base py-3 h-full">
                                    {Icon && <Icon className="h-5 w-5"/>} {subject}
                                </TabsTrigger>
                            )
                        })}
                    </TabsList>
                    
                    {Object.entries(curriculumData).map(([subject, chapters]) => (
                        <TabsContent key={subject} value={subject}>
                             <Accordion type="multiple" className="w-full space-y-4">
                                {chapters.map((chapter, index) => (
                                    <Card key={index} className="overflow-hidden bg-card shadow-md">
                                        <AccordionItem value={`item-${index}`} className="border-b-0">
                                            <AccordionTrigger className="text-lg font-semibold hover:no-underline p-6">
                                                {chapter.chapter}
                                            </AccordionTrigger>
                                            <AccordionContent className="p-6 pt-0">
                                                <Accordion type="multiple" className="w-full space-y-2">
                                                    {chapter.topics.map((topic, topicIndex) => {
                                                        const relatedCourses = getCoursesForTopic(topic, subject as any);
                                                        return (
                                                            <AccordionItem value={`topic-${topicIndex}`} key={topicIndex} className="border rounded-md bg-background/50">
                                                                <AccordionTrigger className="text-base font-medium hover:no-underline px-4 py-3 text-left">
                                                                    {topic}
                                                                </AccordionTrigger>
                                                                <AccordionContent className="px-4 pb-4">
                                                                     {relatedCourses.length > 0 ? (
                                                                        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t">
                                                                            {relatedCourses.map(course => (
                                                                                <Card key={course.id} className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-muted/50 hover:bg-muted transition-colors">
                                                                                    <Image src={course.thumbnail} alt={course.title} width={120} height={68} className="rounded-md object-cover aspect-video w-full sm:w-[120px] shrink-0" data-ai-hint="online course abstract" />
                                                                                    <div className="flex-1 text-left">
                                                                                        <h4 className="font-semibold text-sm">{course.title}</h4>
                                                                                        <p className="text-xs text-muted-foreground">{course.videos.length} lessons</p>
                                                                                    </div>
                                                                                    <Button size="sm" variant="ghost" onClick={() => handleCourseClick(course)}>Preview</Button>
                                                                                </Card>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <p className="text-sm text-muted-foreground pt-4 border-t">No courses available for this topic yet.</p>
                                                                    )}
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        );
                                                    })}
                                                </Accordion>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Card>
                                ))}
                            </Accordion>
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
          </section>

            <section id="events" className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12 animate-fade-in-up">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Upcoming Events</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Join our live classes and revision sessions to boost your preparation.</p>
                    </div>
                    <Card className="animate-fade-in-up shadow-lg" style={{ animationDelay: '0.2s' }}>
                        <CardContent className="p-0">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Event</TableHead>
                                        <TableHead className="hidden md:table-cell">Date</TableHead>
                                        <TableHead className="hidden sm:table-cell">Subject</TableHead>
                                        <TableHead className="text-right"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {upcomingEvents.map((event) => (
                                        <TableRow key={event.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEventClick(event)}>
                                            <TableCell>
                                                <div className="font-medium">{event.title}</div>
                                                <div className="text-sm text-muted-foreground md:hidden">
                                                    {isClient ? format(new Date(event.start), 'eee, MMM d, p') : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">{isClient ? format(new Date(event.start), 'eeee, MMMM d, yyyy') : ''}</TableCell>
                                            <TableCell className="hidden sm:table-cell"><Badge variant="outline">Grade {event.grade} {event.subject}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                 <Button variant="ghost" size="sm">
                                                    View Details <ChevronRightIcon className="ml-2 h-4 w-4" />
                                                 </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </section>

          <section id="courses" className="py-20 bg-muted/50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Courses</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hand-picked courses to help you excel in your studies.</p>
                </div>
                 {loadingCourses ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {Array.from({ length: 6 }).map((_, i) => (
                           <Card key={i} className="bg-card shadow-lg animate-fade-in-up">
                               <CardHeader className="p-0"><Skeleton className="h-48 w-full"/></CardHeader>
                               <CardContent className="pt-4 space-y-2">
                                   <Skeleton className="h-4 w-1/4"/>
                                   <Skeleton className="h-5 w-3/4"/>
                                   <Skeleton className="h-10 w-full"/>
                               </CardContent>
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
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedCourses.map((course, index) => (
                            <Card key={course.id} className="group overflow-hidden flex flex-col h-full bg-card shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: `${0.2 + index * 0.1}s` }}>
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
                                    <span className="text-xl font-bold">
                                        {course.pricing.type === 'purchase' ? `R ${course.pricing.price}`: 'Free'}
                                    </span>
                                    <Button asChild size="sm">
                                        <Link href="/register">Enroll Now</Link>
                                    </Button>
                                </div>
                            </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
                 {totalCoursePages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-12">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentCoursePage(p => p - 1)}
                            disabled={currentCoursePage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous Page</span>
                        </Button>
                        <span className="text-sm text-muted-foreground">
                            Page {currentCoursePage} of {totalCoursePages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentCoursePage(p => p + 1)}
                            disabled={currentCoursePage >= totalCoursePages}
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next Page</span>
                        </Button>
                    </div>
                )}
            </div>
          </section>

          <section id="faq" className="py-20">
            <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">Have questions? We've got answers.</p>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    {faqData.map((item, index) => (
                         <Card key={index} className="overflow-hidden bg-card shadow-md">
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

          <section id="contact" className="py-20 bg-muted/50">
            <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
              <Card className="p-8 sm:p-12 bg-card border-transparent shadow-2xl shadow-primary/10">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Start Your Learning Journey Today
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students transforming their education with AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild>
                    <Link href="/register">
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
        </div>
      </main>

      {selectedCourseForPlayer && (
        <Dialog open={isVideoPlayerOpen} onOpenChange={setIsVideoPlayerOpen}>
          <DialogContent className="max-w-6xl w-[95vw] h-auto sm:h-[90vh] flex flex-col p-0 gap-0">
              <div className="grid md:grid-cols-3 h-full overflow-hidden">
                <div className="md:col-span-2 h-full flex flex-col">
                  <div className="relative aspect-video bg-black rounded-tl-lg overflow-hidden">
                      {activeVideo ? (
                          <>
                              <video
                                  ref={videoRef}
                                  key={activeVideo.url}
                                  className="w-full h-full"
                                  controls
                                  autoPlay
                                  src={activeVideo.url}
                              >
                                  Your browser does not support the video tag.
                              </video>
                              <div className="absolute bottom-4 right-4 z-10">
                                  <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                          <Button variant="secondary" size="icon" className="text-white bg-black/50 hover:bg-black/80 border-white/20">
                                              <Settings className="h-5 w-5" />
                                              <span className="sr-only">Video Settings</span>
                                          </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                          <DropdownMenuRadioGroup value={quality} onValueChange={setQuality}>
                                              <DropdownMenuRadioItem value="1080p">1080p</DropdownMenuRadioItem>
                                              <DropdownMenuRadioItem value="720p">720p</DropdownMenuRadioItem>
                                              <DropdownMenuRadioItem value="480p">480p</DropdownMenuRadioItem>
                                              <DropdownMenuRadioItem value="360p">360p (Auto)</DropdownMenuRadioItem>
                                          </DropdownMenuRadioGroup>
                                      </DropdownMenuContent>
                                  </DropdownMenu>
                              </div>
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
                            <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                <span>{selectedCourseForPlayer.rating || '4.8'} (24 reviews)</span>
                            </div>
                            <span>{selectedCourseForPlayer.instructor || 'Dr. Evelyn Reed'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground pt-2">{selectedCourseForPlayer.description}</p>
                   </div>
                </div>
                <div className="md:col-span-1 bg-muted/50 flex flex-col h-full rounded-r-lg max-h-[90vh] sm:max-h-none">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Course Content</h3>
                  </div>
                   <div className="flex-1 overflow-y-auto">
                    <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                        {selectedCourseForPlayer.videos.map((video, index) => (
                            <AccordionItem value={`item-${index}`} key={video.id} className="border-x-0 px-4">
                                <AccordionTrigger className="text-left hover:no-underline" onClick={() => setActiveVideo(video)}>
                                    <div className="flex items-start gap-3">
                                        <Clapperboard className="h-5 w-5 text-muted-foreground mt-1"/>
                                        <span>{index + 1}. {video.title}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="pl-8 flex flex-col items-start gap-3">
                                      <Button variant="link" size="sm" className="p-0 h-auto text-sm" onClick={() => handleSummarize(video, selectedCourseForPlayer)} disabled={isSummarizing && summarizedVideoId === video.id}>
                                          {isSummarizing && summarizedVideoId === video.id ? (
                                              <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Summarizing...</>
                                          ) : (
                                              <><Sparkles className="mr-2 h-4 w-4" /> Summarize with AI</>
                                          )}
                                      </Button>
                                      {summarizedVideoId === video.id && isSummarizing && <Skeleton className="h-16 w-full" />}
                                      {summarizedVideoId === video.id && summary && (
                                        <Alert>
                                            <Sparkles className="h-4 w-4" />
                                            <AlertTitle>AI Summary</AlertTitle>
                                            <AlertDescription>{summary}</AlertDescription>
                                        </Alert>
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

      <Link href="https://wa.me/27123456789" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 bg-green-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-transform hover:scale-110">
        <FaWhatsapp className="w-7 h-7" />
        <span className="sr-only">Chat on WhatsApp</span>
      </Link>
      
      <Footer />
    </div>
  );
}
