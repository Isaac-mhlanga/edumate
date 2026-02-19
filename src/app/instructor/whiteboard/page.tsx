'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import withAuth from '@/components/with-auth';

function InstructorWhiteboardPage() {
  const router = useRouter();

  const handleStartSession = () => {
    const sessionId = nanoid(10); // Generate a unique 10-character ID
    router.push(`/instructor/whiteboard/${sessionId}`);
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
                <CardTitle className="text-3xl font-headline">Create a New Canvas</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                    Start a real-time collaborative whiteboard session. Your next great idea is just a click away.
                </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
                <Button size="lg" onClick={handleStartSession} className="animate-shimmer bg-gradient-to-r from-primary via-primary/80 to-primary bg-[length:200%_100%]">
                    Launch Magic Board
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

export default withAuth(InstructorWhiteboardPage, ['instructor']);
