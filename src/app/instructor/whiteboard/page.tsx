'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';

function InstructorWhiteboardPage() {
  return <Whiteboard />;
}

export default withAuth(InstructorWhiteboardPage, ['instructor']);
