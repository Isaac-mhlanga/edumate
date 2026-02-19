
'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Undo,
  Redo,
  Trash2,
  Download,
  Copy,
  Palette,
  Minus,
  Plus,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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

const ReactSketchCanvas = dynamic(
  () => import('react-sketch-canvas').then((mod) => mod.ReactSketchCanvas),
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
  const isUpdatingFromFirestore = useRef(false);
  const [shareableLink, setShareableLink] = useState('');

  const [strokeColor, setStrokeColor] = useState('#FFFFFF');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);

  // Audio and Recording State
  const [isMicOn, setIsMicOn] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const canvasBackgroundColor = resolvedTheme === 'dark' ? 'hsl(220 13% 18%)' : 'hsl(0 0% 100%)';

  useEffect(() => {
    setStrokeColor(resolvedTheme === 'dark' ? '#FFFFFF' : '#000000');
  }, [resolvedTheme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const link =
        userRole === 'instructor'
          ? `${window.location.origin}/dashboard/whiteboard/${whiteboardId}`
          : userRole === 'admin'
          ? `${window.location.origin}/admin/whiteboard/${whiteboardId}`
          : `${window.location.origin}/student/whiteboard/${whiteboardId}`;
      setShareableLink(link);
    }
  }, [whiteboardId, userRole]);

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
      console.error('Error updating whiteboard:', error);
    }
  }, 300);

  const handleCanvasUpdate = (updatedPaths: any) => {
    if (isUpdatingFromFirestore.current || userRole === 'student') {
      return;
    }
    updateFirestore(updatedPaths);
  };
  
  const toggleMicrophone = async () => {
    if (isMicOn) {
      audioStreamRef.current?.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
      setIsMicOn(false);
      toast({ title: 'Microphone Off' });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;
        setIsMicOn(true);
        toast({ title: 'Microphone On', description: 'Students can now hear you.' });
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast({ variant: 'destructive', title: 'Mic Access Denied', description: 'Please allow microphone access in your browser.' });
      }
    }
  };

  const startRecording = useCallback(async () => {
    if (!canvasRef.current) return;
    
    const canvasStream = canvasRef.current.getCanvas().captureStream(30);
    const streams: MediaStreamTrack[] = [...canvasStream.getTracks()];

    if (isMicOn && audioStreamRef.current) {
        streams.push(...audioStreamRef.current.getAudioTracks());
    }

    const combinedStream = new MediaStream(streams);
    mediaRecorderRef.current = new MediaRecorder(combinedStream, {
        mimeType: 'video/webm',
    });

    recordedChunksRef.current = [];
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `whiteboard-session-${whiteboardId}.webm`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
    toast({ title: 'Recording Started', description: 'Whiteboard and audio are being recorded.' });
  }, [isMicOn, whiteboardId, toast]);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    toast({ title: 'Recording Stopped', description: 'Your recording is being downloaded.' });
  }, []);

  const handleClear = () => canvasRef.current?.clearCanvas();
  const handleUndo = () => canvasRef.current?.undo();
  const handleRedo = () => canvasRef.current?.redo();

  const handleExport = () => {
    canvasRef.current
      ?.exportImage('png')
      .then((data: string) => {
        const link = document.createElement('a');
        link.href = data;
        link.download = `whiteboard-export-${whiteboardId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((e: any) => console.error(e));
  };
  
  const colors = resolvedTheme === 'dark'
    ? ['#FFFFFF', '#FF5252', '#448AFF', '#00E676', '#FFFF00', '#000000']
    : ['#000000', '#FF5252', '#448AFF', '#00E676', '#FFFF00', '#FFFFFF'];

  const isTeacher = userRole === 'instructor' || userRole === 'admin';

  return (
    <div className="relative w-full h-full">
      {/* Collapsible Toolbar */}
      <div
        className={`absolute top-0 left-0 z-10 h-full p-2 transition-transform duration-300 ease-in-out ${
          isToolbarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col gap-2 rounded-lg border bg-card p-2 shadow-lg">
          <Button variant="outline" size="sm" onClick={handleUndo}><Undo className="mr-2 h-4 w-4" />Undo</Button>
          <Button variant="outline" size="sm" onClick={handleRedo}><Redo className="mr-2 h-4 w-4" />Redo</Button>
          {isTeacher && <Button variant="outline" size="sm" onClick={handleClear}><Trash2 className="mr-2 h-4 w-4" />Clear</Button>}
          <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Color</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-7 w-7" style={{ backgroundColor: strokeColor }} />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1">
                <div className="flex gap-1">
                  {colors.map((color) => (<Button key={color} size="icon" className="h-6 w-6" style={{ backgroundColor: color }} onClick={() => setStrokeColor(color)}/>))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Width</label>
            <Slider min={1} max={20} step={1} value={[strokeWidth]} onValueChange={(v) => setStrokeWidth(v[0])} />
          </div>

          <div className="mt-auto space-y-2">
            {isTeacher && (
              <>
                <Button variant={isMicOn ? 'secondary' : 'outline'} size="sm" onClick={toggleMicrophone}>
                  {isMicOn ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isMicOn ? 'Mute' : 'Unmute'}
                </Button>
                <Button variant={isRecording ? 'destructive' : 'outline'} size="sm" onClick={isRecording ? stopRecording : startRecording}>
                  {isRecording ? <VideoOff className="mr-2 h-4 w-4" /> : <Video className="mr-2 h-4 w-4" />}
                  {isRecording ? 'Stop' : 'Record'}
                </Button>
                 <Button variant="outline" size="sm" onClick={() => {
                     navigator.clipboard.writeText(shareableLink);
                     toast({ title: "Link Copied!", description: "Share this link with your students."});
                 }}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Toolbar Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-2 z-20 h-10 w-10 transition-all duration-300 ease-in-out"
        style={{ left: isToolbarOpen ? 'calc(10rem + 16px)' : '8px' }}
        onClick={() => setIsToolbarOpen(!isToolbarOpen)}
      >
        {isToolbarOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      {/* Canvas */}
      <div className="h-full w-full rounded-lg overflow-hidden border">
        <ReactSketchCanvas
          key={`${resolvedTheme}-${strokeColor}-${strokeWidth}`} // Re-render on prop change
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
