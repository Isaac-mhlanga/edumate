'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';

function TutorWhiteboardPage() {
  return <Whiteboard />;
}

export default withAuth(TutorWhiteboardPage, ['tutor']);
