

'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {

  const services = [
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Tutoring Services",
      description: "One-on-One & Group Tutoring for high school and university subjects, led by qualified instructors. Both in-person and online sessions are available.",
    },
    {
      icon: <PenSquare className="h-8 w-8 text-primary" />,
      title: "Assignment Help",
      description: "Support for coding projects, essays, and research papers. Work is delivered professionally with academic integrity and confidentiality.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Free & Paid Courses",
      description: "Access high-quality video lessons for various topics. Premium courses offer in-depth explanations, exercises, and downloadable materials.",
    },
     {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "Interactive Quizzes & Resources",
      description: "Practice what you learn with interactive quizzes and assignments. Unlock all resources with a monthly or annual subscription.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">Edumate Pro</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#services" className="text-sm font-medium hover:text-primary transition-colors">Services</Link>
            <Link href="/tutors" className="text-sm font-medium hover:text-primary transition-colors">Find a Tutor</Link>
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
        <section className="bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center py-20 md:py-32">
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">
                        Empower Your Learning Journey with Edumate
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        At Edumate, we provide a wide range of academic support and learning resources tailored for high school and university students.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" asChild>
                            <Link href="/register">Start Learning Today <ArrowRight className="ml-2"/></Link>
                        </Button>
                        <Button size="lg" variant="outline">
                            Explore Services
                        </Button>
                    </div>
                </div>
                 <div className="relative">
                    <div className="absolute -inset-4 bg-primary/10 rounded-full blur-3xl"></div>
                    <Image 
                        src="https://placehold.co/600x400.png"
                        alt="Student learning online"
                        width={600}
                        height={400}
                        className="rounded-xl shadow-2xl relative"
                        data-ai-hint="student learning online"
                    />
                </div>
            </div>
        </section>


        <section id="services" className="bg-muted/50 py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Our Services</h2>
              <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Our services are designed to empower students through flexible, high-quality, and affordable education solutions.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service, i) => (
                <div key={service.title}>
                    <Card className="text-left shadow-lg rounded-xl h-full border-t-4 border-t-primary">
                        <CardHeader>
                            <div className="bg-primary/10 p-3 rounded-full w-fit">
                                {service.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                            <p className="text-muted-foreground">{service.description}</p>
                        </CardContent>
                    </Card>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section className="bg-background py-16 md:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to Start?</h2>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Join thousands of students who are achieving their academic goals with Edumate Pro.</p>
                    <Button size="lg" className="mt-8" asChild>
                        <Link href="/register">Sign Up for Free</Link>
                    </Button>
                </div>
            </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
