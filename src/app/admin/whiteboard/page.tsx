'use client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import React from 'react';
import withAuth from '@/components/with-auth';

function AdminWhiteboardPage() {
    const router = useRouter();
    const [sessionId, setSessionId] = React.useState('');

    const handleJoinSession = () => {
        if (sessionId.trim()) {
            router.push(`/admin/whiteboard/${sessionId.trim()}`);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 12rem)' }}>
            <Card className="text-center w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Monitor a Whiteboard Session</CardTitle>
                    <CardDescription>
                        Enter the ID of a live session to view its content in real-time.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex w-full items-center space-x-2">
                        <Input
                            placeholder="Enter session ID..."
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

export default withAuth(AdminWhiteboardPage, ['admin']);
