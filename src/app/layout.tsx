
'use client'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import React from 'react';
import 'katex/dist/katex.min.css';

const noLayoutRoutes = ['/', '/login', '/register', '/forgot-password', '/tutors', '/community'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isCoursePage = /^\/courses\/.+/.test(pathname);
  const showAppLayout = !noLayoutRoutes.includes(pathname) && !isCoursePage;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Edumate Pro</title>
        <meta name="description" content="A futuristic, professional, and student-focused multi-tenant educational web app offering video lessons, tutoring services, and paid assignments." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0KOVEMmg9ikOAiqRT5bDLA+UY+qCFs1IIF1oFHbkdsUgUjdVYEzpv" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
          {showAppLayout ? <AppLayout>{children}</AppLayout> : children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
