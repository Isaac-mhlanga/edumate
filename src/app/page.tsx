

'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, GraduationCap, Laptop, MapPin, Search, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <Laptop className="h-8 w-8 text-primary" />,
      title: "Video Lessons",
      description: "Access a vast library of expert-led video lessons for Grades 10, 11, and 12 Maths & Physical Sciences.",
    },
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Tutoring Services",
      description: "Connect with experienced tutors for personalized one-on-one or group sessions to boost your understanding.",
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Paid Assignments",
      description: "Get help with challenging assignments and receive detailed feedback from our qualified instructors.",
    },
  ];

  const handleTutorSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const subject = formData.get('subject');
    const grade = formData.get('grade');
    const location = formData.get('location');

    const params = new URLSearchParams();
    if (subject) params.append('subject', subject.toString());
    if (grade) params.append('grade', grade.toString());
    if (location) params.append('location', location.toString());

    router.push(`/tutors?${params.toString()}`);
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Edumate Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#tutors" className="text-sm font-medium hover:text-primary transition-colors">Find a Tutor</Link>
            <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
          </nav>
          <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                  <Link href="/register">Get Started</Link>
              </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative flex items-center justify-center h-[60vh] md:h-[80vh] overflow-hidden text-white">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
          >
            <source src="https://cdn.pixabay.com/video/2020/05/01/39906-419032601_large.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <div className="relative z-20 text-center p-4">
              <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
                  Unlock Your Potential.
                  <span className="block text-primary">Future-Proof Your Skills.</span>
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
                  Edumate Pro provides a modern, engaging platform for students to excel in Maths and Physical Sciences.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000">
                  <Button size="lg" asChild>
                    <Link href="/dashboard?tab=courses">Explore Courses</Link>
                  </Button>
                  <Button size="lg" variant="secondary" asChild>
                      <Link href="#features">Learn More</Link>
                  </Button>
              </div>
          </div>
        </section>


        <section id="features" className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
              <p className="text-lg text-muted-foreground mt-2">Our platform is designed to support your learning journey.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, i) => (
                <div key={feature.title} className="animate-in fade-in slide-in-from-bottom-12" style={{animationDelay: `${i * 150}ms`, animationFillMode: 'backwards'}}>
                    <Card className="text-center shadow-lg rounded-xl border-t-4 border-t-primary h-full">
                    <CardHeader className="items-center">
                        <div className="bg-primary/10 p-4 rounded-full">
                        {feature.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                    </Card>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="tutors" className="py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold">Find Your Perfect Tutor</h2>
                    <p className="text-lg text-muted-foreground mt-2">Get personalized help from our network of expert tutors.</p>
                </div>
                 <form onSubmit={handleTutorSearch}>
                    <Card className="max-w-4xl mx-auto p-4 md:p-6 shadow-xl rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-4 items-end gap-4">
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Subject</label>
                                    <Select name="subject">
                                        <SelectTrigger><SelectValue placeholder="e.g. Maths" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Maths">Maths</SelectItem>
                                            <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Grade</label>
                                    <Select name="grade">
                                        <SelectTrigger><SelectValue placeholder="e.g. Grade 12" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Grade 10</SelectItem>
                                            <SelectItem value="11">Grade 11</SelectItem>
                                            <SelectItem value="12">Grade 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input name="location" placeholder="e.g. Cape Town" className="pl-10" />
                                </div>
                            </div>
                            <Button type="submit" size="lg" className="h-14 md:h-auto">
                                <Search className="mr-2 h-5 w-5" />
                                Search
                            </Button>
                        </div>
                    </Card>
                </form>
            </div>
        </section>
        
        <section className="bg-card py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Learn on Your Terms</h2>
                        <p className="text-muted-foreground mb-6">Our platform is built to be flexible and accessible, so you can learn whenever and wherever you want.</p>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-secondary mt-1 shrink-0" />
                                <span><span className="font-semibold">AI-Powered Summaries:</span> Quickly grasp key concepts from any lesson with intelligent, auto-generated summaries.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-secondary mt-1 shrink-0" />
                                <span><span className="font-semibold">Personalized Dashboards:</span> Track your progress, manage subscriptions, and view your entire learning history in one place.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-secondary mt-1 shrink-0" />
                                <span><span className="font-semibold">Seamless Payments:</span> Securely pay for courses, assignments, and tutoring sessions with our integrated payment system.</span>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <Image 
                            src="https://placehold.co/600x400.png"
                            alt="Student learning online"
                            width={600}
                            height={400}
                            className="rounded-xl shadow-2xl"
                            data-ai-hint="student learning"
                        />
                    </div>
                </div>
            </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}