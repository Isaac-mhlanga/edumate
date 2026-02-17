'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { EnquiryDialog } from '@/components/enquiry-dialog';

export const PublicHeader = () => {
  const pathname = usePathname();
  const [isEnquiryDialogOpen, setIsEnquiryDialogOpen] = useState(false);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Tutors', href: '/tutors' },
    { name: 'High School', href: '/high-school' },
    { name: 'Varsity', href: '/varsity' },
    { name: 'Community', href: '/community' },
  ];

  return (
    <>
      <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center gap-2">
                <Icons.logo className="w-auto h-8 text-primary" />
              </Link>
              <nav className="hidden lg:flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link 
                      key={item.name} 
                      href={item.href} 
                      className={cn(
                          "text-sm font-medium transition-colors duration-300",
                          pathname === item.href ? 'text-primary' : 'text-foreground/80 hover:text-primary'
                      )}
                  >
                      {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="hidden lg:flex items-center gap-2">
                <Button variant="ghost" onClick={() => setIsEnquiryDialogOpen(true)}>
                    Contact Us
                </Button>
                <Button variant="ghost" asChild>
                    <Link href="/login">Log In</Link>
                </Button>
                <Button asChild>
                    <Link href="/register">Sign Up</Link>
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
                            <Link 
                                href={item.href} 
                                className={cn(
                                    "text-lg text-left font-medium transition-colors duration-300",
                                    pathname === item.href ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                                )}
                            >
                              {item.name}
                            </Link>
                        </SheetClose>
                      ))}
                    </div>
                     <div className="mt-auto border-t pt-6 flex flex-col gap-4">
                       <SheetClose asChild>
                        <Button variant="ghost" onClick={() => setIsEnquiryDialogOpen(true)} size="lg">Contact Us</Button>
                      </SheetClose>
                       <SheetClose asChild>
                        <Button variant="outline" asChild size="lg">
                          <Link href="/login">Log In</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild size="lg">
                          <Link href="/register">Sign Up</Link>
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
      <EnquiryDialog isOpen={isEnquiryDialogOpen} setIsOpen={setIsEnquiryDialogOpen} />
    </>
  );
};
