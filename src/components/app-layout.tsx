
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
} from 'lucide-react';
import { Icons } from './icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const menuItems = [
  {
    href: '/dashboard',
    label: 'Student Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/instructor',
    label: 'Instructor Dashboard',
    icon: Users,
  },
  {
    href: '/admin',
    label: 'Admin Dashboard',
    icon: Shield,
  },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
            <div className='flex items-center gap-3 w-full p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center'>
                <Avatar className="h-9 w-9">
                    <AvatarImage src="https://placehold.co/100x100.png" alt="@student" />
                    <AvatarFallback>SP</AvatarFallback>
                </Avatar>
                <div className='flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden'>
                    <span className='font-medium text-sm truncate'>Admin User</span>
                    <span className='text-xs text-muted-foreground truncate'>admin@edumate.pro</span>
                </div>
            </div>
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
                        asChild
                        tooltip={{ children: 'Logout', side: 'right' }}
                        >
                        <Link href="#">
                            <LogOut />
                            <span>Logout</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b bg-card px-6">
            <SidebarTrigger />
            <Button variant="ghost" size="icon" aria-label="Toggle dark mode">
                <Moon className="h-5 w-5" />
            </Button>
        </header>
        <main className="flex-1 p-6 md:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
