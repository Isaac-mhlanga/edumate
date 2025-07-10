
'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Moon,
  Shield,
  BookOpen,
  UserCircle,
} from 'lucide-react';
import { Icons } from './icons';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { getAuth, onAuthStateChanged, signOut, type User, type Auth } from 'firebase/auth';
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Student Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/instructor',
    label: 'Instructor Dashboard',
    icon: BookOpen,
  },
  {
    href: '/tutor',
    label: 'Tutor Dashboard',
    icon: UserCircle,
  },
  {
    href: '/admin',
    label: 'Admin Dashboard',
    icon: Shield,
  },
];

// Define the configuration directly for client-side use.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [auth, setAuth] = React.useState<Auth | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Initialize Firebase on the client
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      router.push('/login');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "An error occurred while logging out.",
      });
    }
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2.5">
              <Icons.logo className="h-7 w-7 text-primary" />
              <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
                Edumate Pro
              </span>
            </Link>
          </SidebarHeader>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{
                    children: item.label,
                    side: 'right',
                  }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          {loading ? (
             <div className='flex items-center gap-3 w-full p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'>
                 <SidebarMenuSkeleton showIcon={true} />
             </div>
          ) : user ? (
            <div className='flex items-center gap-3 w-full p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'>
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className='flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden'>
                    <span className='font-medium text-sm truncate'>{user.displayName ?? 'User'}</span>
                    <span className='text-xs text-muted-foreground truncate'>{user.email}</span>
                </div>
            </div>
          ) : (
             <div className='flex items-center gap-3 w-full p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'>
                <Button asChild className="w-full group-data-[collapsible=icon]:w-auto">
                  <Link href="/login">Login</Link>
                </Button>
            </div>
          )}
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip={{ children: 'Settings', side: 'right' }}
                        >
                        <Link href="#">
                            <Settings />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        onClick={handleLogout}
                        tooltip={{ children: 'Logout', side: 'right' }}
                        >
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <SidebarTrigger />
            <ThemeToggle />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
