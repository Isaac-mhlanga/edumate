'use client';

import React, { useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Undo, Redo, Trash2, Download, Copy } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useDebouncedCallback } from 'use-debounce';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const ReactSketchCanvas = dynamic(() =>
  import('react-sketch-canvas').then((mod) => mod.ReactSketchCanvas),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
  }
);

interface WhiteboardProps {
    whiteboardId: string;
    userRole: 'instructor' | 'student' | 'admin';
}

export function Whiteboard({ whiteboardId, userRole }: WhiteboardProps) {
  const { resolvedTheme } = useTheme();
  const { toast } = useToast();
  const canvasRef = useRef<any>(null);
  const [strokeColor, setStrokeColor] = useState(resolvedTheme === 'dark' ? '#FFFFFF' : '#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const isUpdatingFromFirestore = useRef(false);
  const [shareableLink, setShareableLink] = useState('');

  const canvasBackgroundColor = resolvedTheme === 'dark' ? 'hsl(220 13% 18%)' : 'hsl(0 0% 100%)';
  
  useEffect(() => {
    setStrokeColor(resolvedTheme === 'dark' ? '#FFFFFF' : '#000000');
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setShareableLink(`${window.location.origin}/dashboard/whiteboard/${whiteboardId}`);
    }
  }, [whiteboardId]);

  // Firestore setup
  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const whiteboardDocRef = doc(firestore, 'whiteboards', whiteboardId);

    const unsubscribe = onSnapshot(whiteboardDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.paths && canvasRef.current) {
          isUpdatingFromFirestore.current = true;
          canvasRef.current.loadPaths(data.paths);
          setTimeout(() => {
             isUpdatingFromFirestore.current = false;
          }, 100);
        }
      }
    });

    return () => unsubscribe();
  }, [whiteboardId]);
  
  const updateFirestore = useDebouncedCallback(async (paths) => {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      const firestore = getFirestore(app);
      const whiteboardDocRef = doc(firestore, 'whiteboards', whiteboardId);
      await setDoc(whiteboardDocRef, { paths }, { merge: true });
    } catch (error) {
      console.error("Error updating whiteboard:", error);
    }
  }, 300);

  const handleCanvasUpdate = (updatedPaths: any) => {
    if (isUpdatingFromFirestore.current) {
        return;
    }
    updateFirestore(updatedPaths);
  };

  const handleClear = () => {
    if (userRole !== 'student') {
        canvasRef.current?.clearCanvas();
    }
  };
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();
  
  const handleExport = () => {
    canvasRef.current?.exportImage('png').then((data: string) => {
      const link = document.createElement('a');
      link.href = data;
      link.download = `whiteboard-${whiteboardId}.png`;
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
      <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-2">
        <Button variant="outline" size="sm" onClick={handleUndo}><Undo className="mr-2 h-4 w-4" />Undo</Button>
        <Button variant="outline" size="sm" onClick={handleRedo}><Redo className="mr-2 h-4 w-4" />Redo</Button>
        {userRole !== 'student' && <Button variant="outline" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4" />Clear</Button>}
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
        <div className="flex items-center gap-2 w-32">
            <label className="text-sm font-medium">Width:</label>
            <Slider
                min={1}
                max={20}
                step={1}
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
            />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>

        {userRole === 'instructor' && (
             <div className="ml-auto flex items-center gap-2">
                 <Input readOnly value={shareableLink} className="text-xs h-8 w-auto hidden sm:block" />
                 <Button variant="outline" size="sm" onClick={() => {
                     navigator.clipboard.writeText(shareableLink);
                     toast({ title: "Link Copied!", description: "Share this link with your students."});
                 }}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                </Button>
            </div>
        )}
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
          onUpdate={handleCanvasUpdate}
          readOnly={userRole === 'student'}
        />
      </div>
    </div>
  );
}
