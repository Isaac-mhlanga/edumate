'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';
import { useParams } from 'next/navigation';

function VarsityLiveWhiteboardPage() {
  const params = useParams();
  const whiteboardId = params.id as string;
  return <Whiteboard whiteboardId={whiteboardId} userRole="varsity-student" />;
}

export default withAuth(VarsityLiveWhiteboardPage, ['varsity-student']);
