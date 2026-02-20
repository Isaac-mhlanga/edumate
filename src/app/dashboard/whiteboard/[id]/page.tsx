'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';
import { useParams } from 'next/navigation';

function StudentLiveWhiteboardPage() {
  const params = useParams();
  const whiteboardId = params.id as string;
  return <Whiteboard whiteboardId={whiteboardId} userRole="student" />;
}

export default withAuth(StudentLiveWhiteboardPage, ['student']);
