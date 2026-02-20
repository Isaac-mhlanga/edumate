'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import withAuth from '@/components/with-auth';
import React from 'react';

function StudentWhiteboardPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = React.useState('');

  const handleStartSession = () => {
    const newSessionId = nanoid(10);
    router.push(`/dashboard/whiteboard/${newSessionId}`);
  };

  const handleJoinSession = () => {
    if (sessionId.trim()) {
        router.push(`/dashboard/whiteboard/${sessionId.trim()}`);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 12rem)' }}>
        <Card className="text-center w-full max-w-lg bg-card/50 backdrop-blur-lg border-border/20 shadow-xl shadow-primary/10 overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
            <CardHeader className="relative z-10">
                <div className="mb-4 flex justify-center">
                    <div className="bg-primary/10 text-primary rounded-full p-4 border border-primary/20">
                         <Wand2 className="h-10 w-10" />
                    </div>
                </div>
                <CardTitle className="text-3xl font-headline">Collaborative Whiteboard</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    Start a new session to brainstorm and collaborate in real-time, or join an existing one.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4 pt-6">
                <Button size="lg" onClick={handleStartSession} className="w-full animate-shimmer bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%]">
                    Start a New Session
                </Button>
                <div className="flex w-full items-center space-x-2 pt-4">
                    <Input
                        placeholder="Enter session ID to join..."
                        value={sessionId}
                        onChange={(e) => setSessionId(e.target.value)}
                    />
                    <Button onClick={handleJoinSession}>Join Session</Button>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}

export default withAuth(StudentWhiteboardPage, ['student']);
