
'use client'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { usePathname } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import React from 'react';

// export const metadata: Metadata = {
//   title: 'Edumate Pro',
//   description: 'A futuristic, professional, and student-focused multi-tenant educational web app offering video lessons, tutoring services, and paid assignments.',
// };

const noLayoutRoutes = ['/', '/login', '/register', '/tutors', '/forgot-password'];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const showAppLayout = !noLayoutRoutes.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Edumate Pro</title>
        <meta name="description" content="A futuristic, professional, and student-focused multi-tenant educational web app offering video lessons, tutoring services, and paid assignments." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
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
