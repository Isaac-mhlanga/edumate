'use client';

import React, { useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Undo, Trash2 } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

// Dynamically import to ensure it only runs on the client
const ReactSketchCanvas = dynamic(() =>
  import('react-sketch-canvas').then((mod) => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
  }
);

export function Whiteboard() {
  const { resolvedTheme } = useTheme();
  const canvasRef = useRef<any>(null);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };
  
  // Determine colors based on the resolved theme to avoid issues with 'system'
  const strokeColor = resolvedTheme === 'dark' ? '#FFFFFF' : '#000000';
  const canvasColor = resolvedTheme === 'dark' ? 'hsl(220 13% 18%)' : 'hsl(0 0% 100%)';


  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2">
        <Button variant="outline" size="sm" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Clear
        </Button>
        <Button variant="outline" size="sm" onClick={handleUndo}>
          <Undo className="mr-2 h-4 w-4" />
          Undo
        </Button>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border">
        {/* We need to conditionally render or key-change the canvas on theme change, 
            as it doesn't dynamically update colors. */}
        <ReactSketchCanvas
          key={resolvedTheme}
          ref={canvasRef}
          width="100%"
          height="100%"
          strokeWidth={4}
          strokeColor={strokeColor}
          canvasColor={canvasColor}
        />
      </div>
    </div>
  );
}
