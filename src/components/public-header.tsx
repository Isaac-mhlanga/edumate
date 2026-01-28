
'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { LogIn, Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';

export const PublicHeader = () => {
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

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Tutors', href: '/tutors' },
    { name: 'High School', href: '/high-school' },
    { name: 'Varsity', href: '/varsity' },
    { name: 'Community', href: '/community' },
  ];

  return (
     <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300 bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="w-auto h-8" />
              </Link>
            </div>
            
             <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 space-x-8">
              {navItems.map((item) => (
                <Link key={item.name} href={item.href} className="text-muted-foreground hover:text-primary font-medium transition-colors duration-300">
                    {item.name}
                </Link>
              ))}
            </nav>
            
            <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Register</Link>
                </Button>
            </div>

            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <nav className="flex flex-col h-full">
                    <div className="flex items-center justify-between border-b pb-4">
                       <Link href="/" className="flex items-center gap-2">
                          <Icons.logo className="w-auto h-8" />
                        </Link>
                    </div>
                    <div className="flex flex-col gap-4 py-8">
                      {navItems.map((item) => (
                        <SheetClose asChild key={item.name}>
                            <Link href={item.href} className="text-lg text-left text-muted-foreground hover:text-primary font-medium transition-colors duration-300">
                              {item.name}
                            </Link>
                        </SheetClose>
                      ))}
                    </div>
                     <div className="mt-auto border-t pt-6 flex flex-col gap-4">
                      <SheetClose asChild>
                        <Button variant="outline" asChild size="lg">
                          <Link href="/login">Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild size="lg">
                          <Link href="/register">Register</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
  );
};
