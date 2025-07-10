import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, GraduationCap, Laptop, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
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

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Edumate Pro</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
        </nav>
        <Button asChild>
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </header>

      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
              Unlock Your Potential.
              <span className="block text-primary">Future-Proof Your Skills.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Edumate Pro provides a modern, engaging platform for students to excel in Maths and Physical Sciences.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">Explore Courses</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="bg-card py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed</h2>
              <p className="text-lg text-muted-foreground mt-2">Our platform is designed to support your learning journey.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="text-center shadow-lg rounded-xl border-t-4 border-t-primary">
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
              ))}
            </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
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
        </section>

      </main>

      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Icons.logo className="h-6 w-6 text-primary" />
            <span className="text-md font-semibold">Edumate Pro</span>
          </div>
          <p className="text-sm text-muted-foreground mt-4 sm:mt-0">
            &copy; {new Date().getFullYear()} Edumate Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
