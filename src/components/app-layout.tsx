
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
  Shield,
  BookOpen,
  UserCircle,
  FilePenLine,
  ReceiptText,
  CreditCard,
  Banknote,
  GraduationCap,
  MessageSquare,
  Calendar,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { Icons } from './icons';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { ThemeToggle } from './theme-toggle';
import { getAuth, onAuthStateChanged, signOut, type User, type Auth } from 'firebase/auth';
import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';

// Define the configuration directly for client-side use.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Role = 'student' | 'instructor' | 'admin' | 'tutor';

// This is a mock function. In a real app, you'd get this from Firestore or a custom claim.
const getUserRole = (user: User | null): Role | null => {
    if (!user || !user.email) return null;
    
    // Check localStorage first
    const storedRole = localStorage.getItem(`userRole-${user.uid}`);
    if (storedRole) return storedRole as Role;

    // Fallback to email check if not in localStorage
    if (user.email.includes('admin')) return 'admin';
    if (user.email.includes('instructor')) return 'instructor';
    if (user.email.includes('tutor')) return 'tutor';
    return 'student';
};

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  basePath: string;
  tab: string;
}

const studentMenuItems: MenuItem[] = [
  { href: '/dashboard?tab=overview', label: 'Overview', icon: LayoutDashboard, basePath: '/dashboard', tab: 'overview' },
  { href: '/dashboard?tab=courses', label: 'Course Catalog', icon: BookOpen, basePath: '/dashboard', tab: 'courses' },
  { href: '/dashboard?tab=assignments', label: 'Assignments', icon: FilePenLine, basePath: '/dashboard', tab: 'assignments' },
  { href: '/dashboard?tab=transactions', label: 'Transactions', icon: ReceiptText, basePath: '/dashboard', tab: 'transactions' },
  { href: '/dashboard?tab=subscriptions', label: 'Subscriptions', icon: CreditCard, basePath: '/dashboard', tab: 'subscriptions' },
];

const instructorMenuItems: MenuItem[] = [
  { href: '/instructor?tab=overview', label: 'Overview', icon: LayoutDashboard, basePath: '/instructor', tab: 'overview' },
  { href: '/instructor?tab=courses', label: 'Courses', icon: GraduationCap, basePath: '/instructor', tab: 'courses' },
  { href: '/instructor?tab=assignments', label: 'Assignments', icon: FilePenLine, basePath: '/instructor', tab: 'assignments' },
  { href: '/instructor?tab=students', label: 'Students', icon: Users, basePath: '/instructor', tab: 'students' },
  { href: '/instructor?tab=earnings', label: 'Earnings', icon: Banknote, basePath: '/instructor', tab: 'earnings' },
];

const adminMenuItems: MenuItem[] = [
  { href: '/admin?tab=overview', label: 'Overview', icon: LayoutDashboard, basePath: '/admin', tab: 'overview' },
  { href: '/admin?tab=users', label: 'Users', icon: Users, basePath: '/admin', tab: 'users' },
  { href: '/admin?tab=courses', label: 'Courses', icon: BookOpen, basePath: '/admin', tab: 'courses' },
  { href: '/admin?tab=assignments', label: 'Assignments', icon: FilePenLine, basePath: '/admin', tab: 'assignments' },
  { href: '/admin?tab=payouts', label: 'Payouts', icon: Banknote, basePath: '/admin', tab: 'payouts' },
  { href: '/admin?tab=subscriptions', label: 'Subscriptions', icon: CreditCard, basePath: '/admin', tab: 'subscriptions' },
];

const tutorMenuItems: MenuItem[] = [
  { href: '/tutor?tab=overview', label: 'Overview', icon: LayoutDashboard, basePath: '/tutor', tab: 'overview' },
  { href: '/tutor?tab=profile', label: 'Profile', icon: UserCircle, basePath: '/tutor', tab: 'profile' },
  { href: '/tutor?tab=bookings', label: 'Bookings', icon: Calendar, basePath: '/tutor', tab: 'bookings' },
  { href: '/tutor?tab=messages', label: 'Messages', icon: MessageSquare, basePath: '/tutor', tab: 'messages' },
];


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  const [auth, setAuth] = React.useState<Auth | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [userRole, setUserRole] = React.useState<Role | null>(null);
  
  React.useEffect(() => {
    // Initialize Firebase on the client
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, (currentUser) => {
      setUser(currentUser);
      setUserRole(getUserRole(currentUser));
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

  const getMenuItems = () => {
    switch(userRole) {
      case 'student': return studentMenuItems;
      case 'instructor': return instructorMenuItems;
      case 'admin': return adminMenuItems;
      case 'tutor': return tutorMenuItems;
      default: return [];
    }
  }

  const menuItems = getMenuItems();
  const currentTab = searchParams.get('tab') || 'overview';
  const isSettingsPage = pathname === '/settings';

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
                  isActive={pathname.startsWith(item.basePath) && currentTab === item.tab}
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
                        isActive={isSettingsPage}
                        tooltip={{ children: 'Settings', side: 'right' }}
                        >
                        <Link href="/settings">
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
