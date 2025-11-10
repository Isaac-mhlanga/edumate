
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const services = [
    {
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: "Tutoring Services",
      description: "One-on-One & Group Tutoring for high school and university subjects, led by qualified instructors.",
    },
    {
      icon: <PenSquare className="h-8 w-8 text-primary" />,
      title: "Assignment Help",
      description: "Support for coding projects, essays, and research papers. Work is delivered professionally with academic integrity.",
    },
    {
      icon: <BookOpen className="h-8 w-8 text-primary" />,
      title: "Free & Paid Courses",
      description: "Access high-quality video lessons for various topics. Premium courses offer in-depth explanations and exercises.",
    },
     {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "Interactive Quizzes & Resources",
      description: "Practice what you learn with interactive quizzes. Unlock all resources with a monthly or annual subscription.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground animate-fade-in-up">
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/98 backdrop-blur-md shadow-lg dark:bg-gray-900/80' 
          : 'bg-white/95 backdrop-blur-md dark:bg-gray-900/80'
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">EDUMATE</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              {[
                { name: 'Home', id: 'home' },
                { name: 'Courses', id: 'services' },
                { name: 'About', id: 'about' },
                { name: 'Contact', id: 'contact' }
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.id)}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium transition-colors duration-300 relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </nav>
            
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                    <Link href="/register">Register</Link>
                </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-20">
        <section id="home" className="relative overflow-hidden">
             <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center py-24 md:py-32">
                <div className="space-y-6 text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight">
                        Unlock Your Potential, Master Your Future.
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0">
                        Edumate provides a universe of learning resources tailored for ambitious students. Dive into expert-led courses, get personalized tutoring, and conquer your assignments.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                        <Button size="lg" asChild className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            <Link href="/register">Start Learning Today <ArrowRight className="ml-2"/></Link>
                        </Button>
                    </div>
                </div>
                 <div className="relative">
                    <div className="absolute -inset-8 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
                    <Image 
                        src="https://placehold.co/600x400.png"
                        alt="Student interacting with a futuristic learning interface"
                        width={600}
                        height={400}
                        className="rounded-2xl shadow-2xl relative"
                        data-ai-hint="student futuristic learning"
                    />
                </div>
            </div>
        </section>


        <section id="services" className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">A Complete Learning Ecosystem</h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">From one-on-one tutoring to comprehensive assignment help, we provide the tools you need to excel.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {services.map((service) => (
                <Card key={service.title} className="text-center border-t-4 border-primary hover:-translate-y-2 hover:shadow-card-glow">
                    <CardHeader className="items-center">
                        <div className="bg-primary/10 p-4 rounded-full">
                            {service.icon}
                        </div>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                        <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                        <p className="text-muted-foreground flex-grow">{service.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section id="contact" className="py-20 md:py-28 bg-muted/20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl md:text-4xl font-bold">Ready to Start?</h2>
                    <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">Join thousands of students who are achieving their academic goals with Edumate Pro.</p>
                    <Button size="lg" className="mt-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow" asChild>
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
