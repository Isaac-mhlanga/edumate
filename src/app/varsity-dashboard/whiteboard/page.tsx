'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';

function VarsityWhiteboardPage() {
  return <Whiteboard />;
}

export default withAuth(VarsityWhiteboardPage, ['varsity-student']);
