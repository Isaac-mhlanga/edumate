'use client'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import React, { Suspense } from 'react';
import 'katex/dist/katex.min.css';
import { Skeleton } from '@/components/ui/skeleton';
import { GoogleAnalytics } from '@/components/google-analytics';
import Script from 'next/script';

const noLayoutRoutes = ['/', '/login', '/register', '/forgot-password', '/tutors', '/community'];

const AppLoadingSkeleton = () => (
    <div className="space-y-8 p-4 md:p-6 lg:p-8">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
        </div>
        <Skeleton className="h-96 w-full rounded-lg" />
    </div>
);


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
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0KOVEMmg9ikOAiqRT5bDLA+UY+qCFs1IIF1oFHbkdsUgUjdVYEzpv" crossOrigin="anonymous" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning={true}>
        <div id="fb-root"></div>
        <Script
          id="facebook-sdk"
          src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"
          strategy="afterInteractive"
        />
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <Suspense fallback={<AppLoadingSkeleton />}>
              <GoogleAnalytics />
              {showAppLayout ? <AppLayout>{children}</AppLayout> : children}
            </Suspense>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
