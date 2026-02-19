'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
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
        <Card className="text-center w-full max-w-lg">
            <CardHeader>
                <CardTitle className="text-2xl">Live Whiteboard Sessions</CardTitle>
                <CardDescription>
                    Start a new real-time whiteboard session to teach students online.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button size="lg" onClick={handleStartSession}>
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Start a New Session
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

export default withAuth(InstructorWhiteboardPage, ['instructor']);
