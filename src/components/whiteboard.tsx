'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Undo, Redo, Trash2, Download } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

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
  const [strokeColor, setStrokeColor] = useState(resolvedTheme === 'dark' ? '#FFFFFF' : '#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);

  const canvasBackgroundColor = resolvedTheme === 'dark' ? 'hsl(220 13% 18%)' : 'hsl(0 0% 100%)';
  
  React.useEffect(() => {
    setStrokeColor(resolvedTheme === 'dark' ? '#FFFFFF' : '#000000');
  }, [resolvedTheme]);


  const handleClear = () => canvasRef.current?.clearCanvas();
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  
  const handleExport = () => {
    canvasRef.current?.exportImage('png').then((data: string) => {
      const link = document.createElement('a');
      link.href = data;
      link.download = 'whiteboard-export.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch((e: any) => {
      console.error(e);
    });
  };
  
  const colors = ['#000000', '#FF0000', '#0000FF', '#008000', '#FFFF00', '#FFFFFF'];
  if (resolvedTheme === 'dark') {
    colors[0] = '#FFFFFF';
    colors[5] = '#000000';
  }


  return (
    <div className="flex flex-col gap-4" style={{ height: 'calc(100vh - 10rem)' }}>
      <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-card p-2">
        <Button variant="outline" size="sm" onClick={handleUndo}><Undo className="mr-2 h-4 w-4" />Undo</Button>
        <Button variant="outline" size="sm" onClick={handleRedo}><Redo className="mr-2 h-4 w-4" />Redo</Button>
        <Button variant="outline" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4" />Clear</Button>
        <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Color:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" style={{ backgroundColor: strokeColor }} />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2">
                <div className="flex gap-1">
                  {colors.map(color => (
                    <Button
                      key={color}
                      size="icon"
                      className="h-6 w-6"
                      style={{ backgroundColor: color }}
                      onClick={() => setStrokeColor(color)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
        </div>
        <div className="flex items-center gap-2 w-40">
            <label className="text-sm font-medium">Width:</label>
            <Slider
                min={1}
                max={20}
                step={1}
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
            />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="ml-auto">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border">
        <ReactSketchCanvas
          key={`${resolvedTheme}-${strokeColor}-${strokeWidth}`} // Re-render when props change
          ref={canvasRef}
          width="100%"
          height="100%"
          strokeWidth={strokeWidth}
          strokeColor={strokeColor}
          canvasColor={canvasBackgroundColor}
        />
      </div>
    </div>
  );
}
