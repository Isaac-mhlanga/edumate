
'use client';

import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { instructorData } from "@/lib/data";
import { ArrowRight, BookOpen, Bot, GraduationCap, PenSquare, Play, Clock, BarChart2, User, Star, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const courses = instructorData.courses;

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
     <section id="home" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-12 items-center py-24 md:py-32">
            <div className="space-y-6 text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter leading-tight text-white">
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
                    src="https://picsum.photos/seed/1/600/400"
                    alt="Student interacting with a futuristic learning interface"
                    width={600}
                    height={400}
                    className="rounded-2xl shadow-2xl relative"
                    data-ai-hint="student futuristic learning"
                />
            </div>
        </div>
    </section>
  )
}

const CoursesSection = ({ title, description, courses }: { title: string, description: string, courses: any[] }) => {
  const icons = {
    play: <Play className="w-4 h-4" />,
    clock: <Clock className="w-4 h-4" />,
    level: <BarChart2 className="w-4 h-4" />,
    person: <User className="w-5 h-5" />,
    star: <Star className="w-4 h-4 fill-current" />,
    enroll: <BadgeCheck className="w-5 h-5" />,
  };

  const formatPrice = (price?: number | null) => {
    if (price === 0) return 'Free';
    if (price) return `R ${price.toFixed(2)}`;
    return 'By Subscription';
  };

  const handleEnroll = (courseTitle: string) => {
    console.log(`Enrolling in ${courseTitle}`);
  };
  
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-emerald-900/40 to-slate-900/80 backdrop-blur-3xl"></div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">{description}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map(course => (
            <div key={course.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col h-full hover:border-emerald-400/30">
              <div className="relative h-40 overflow-hidden">
                <Image 
                  src={course.thumbnail}
                  alt={course.title}
                  width={400}
                  height={225}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="online course"
                />
                
                <div className="absolute top-3 left-3">
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    {course.subject}
                  </span>
                </div>

                {course.isPopular && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
                    Popular
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-emerald-100 transition-colors duration-300">
                  {course.title}
                </h3>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2 flex-grow">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                  <div className="flex items-center gap-2 text-emerald-300">
                    {icons.play}
                    <span>{course.videos.length} lessons</span>
                  </div>
                  <div className="flex items-center gap-2 text-teal-300">
                    {icons.clock}
                    <span>{course.duration || '8h'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-300">
                    {icons.level}
                    <span>{course.level || 'All'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg">
                      {icons.person}
                    </div>
                    <span className="text-sm text-gray-200 font-medium">
                      {course.instructor || 'Expert'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-300">
                    {icons.star}
                    <span className="text-sm font-bold">
                      {course.rating || 4.8}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 mb-4"></div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      {formatPrice(course.pricing.price)}
                    </span>
                    {course.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatPrice(course.originalPrice)}
                      </span>
                    )}
                  </div>
                   <Link href={`/instructor/courses/${course.id}`} passHref>
                    <button 
                      onClick={() => handleEnroll(course.title)}
                      className="group relative bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                      <span className="relative flex items-center gap-2">
                        {icons.enroll}
                        Enroll
                      </span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


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

  const allCourses = courses.slice(0, 6); // Show 6 courses for 2 rows of 3

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: 'AI-Powered Learning',
      description: 'Adaptive AI tutors that personalize your learning'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      title: 'One-on-One Sessions',
      description: 'Personal tutoring tailored to your needs'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Exam Preparation',
      description: 'Comprehensive test prep with expert guidance'
    }
  ];

  const stats = [
    { number: '95%', label: 'Improved Scores' },
    { number: '2.3x', label: 'Faster Learning' },
    { number: '24/7', label: 'AI Tutor' },
    { number: '10k+', label: 'Students' }
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
                { name: 'Courses', id: 'courses' },
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900">
          <Hero />
          
          {/* Green Glass Stats Section */}
          <section className="py-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 backdrop-blur-3xl"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-500">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-300 font-medium text-sm">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Green Glass Features Section */}
          <section id="courses" className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  The Future of Learning is Here
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Experience education powered by artificial intelligence
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative p-8 bg-slate-800/50 backdrop-blur-md border border-white/10 rounded-2xl hover:border-white/20 transition-all duration-500">
                      <div className="text-emerald-400 mb-6 group-hover:scale-110 transition-transform duration-300">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Courses Section with Distinct Background */}
          <CoursesSection
            title="Recently Added Courses"
            description="Fresh content to keep you updated with the latest learning materials"
            courses={allCourses}
          />

          {/* Green Glass CTA Section */}
          <section id="about" className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-3xl"></div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 hover:border-white/20 transition-all duration-500">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                  Start Your AI Learning Journey
                </h2>
                <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of students transforming their education with AI
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="group relative px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold text-lg hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 shadow-2xl hover:shadow-3xl">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <span className="relative">Start Free Trial</span>
                  </button>
                  <button className="px-8 py-4 border-2 border-white/30 text-white rounded-xl font-semibold text-lg hover:border-white hover:bg-white/10 transition-all duration-300">
                    Book Demo
                  </button>
                </div>
                <p className="text-gray-400 mt-6 text-sm">
                  No credit card required • AI tutor included
                </p>
              </div>
            </div>
          </section>

          {/* Green Floating AI Elements */}
          <div className="fixed top-1/4 left-10 w-2 h-2 bg-emerald-400 rounded-full animate-pulse opacity-60"></div>
          <div className="fixed top-1/3 right-20 w-1 h-1 bg-teal-400 rounded-full animate-pulse opacity-40"></div>
          <div className="fixed bottom-1/4 left-1/4 w-1 h-1 bg-green-400 rounded-full animate-pulse opacity-50"></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

    