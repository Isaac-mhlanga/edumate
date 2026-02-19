'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';

function StudentWhiteboardPage() {
  return <Whiteboard />;
}

export default withAuth(StudentWhiteboardPage, ['student']);
