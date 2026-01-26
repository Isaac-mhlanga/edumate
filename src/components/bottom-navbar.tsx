'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  basePath: string;
  tab?: string;
}

interface BottomNavbarProps {
    menuItems: MenuItem[];
}

export function BottomNavbar({ menuItems }: BottomNavbarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    const isCurrentPage = (item: MenuItem) => {
        if (item.tab) {
            return pathname.startsWith(item.basePath) && (currentTab === item.tab || (!currentTab && item.tab === 'overview'));
        }
        return pathname === item.basePath;
    };

    // Take the first 5 items for the bottom nav
    const navItems = menuItems.slice(0, 5);

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
            <div className="flex justify-around items-center h-full">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors w-full h-full",
                            isCurrentPage(item) && "text-primary"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
