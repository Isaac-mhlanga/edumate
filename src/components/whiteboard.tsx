'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Tldraw = dynamic(
  async () => (await import('tldraw')).Tldraw,
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full" />,
  }
);

export function Whiteboard() {
  return (
    <div style={{ height: 'calc(100vh - 10rem)' }} className="rounded-lg overflow-hidden">
      <Tldraw />
    </div>
  );
}
