'use client';
import { Whiteboard } from '@/components/whiteboard';
import withAuth from '@/components/with-auth';

function AdminWhiteboardPage() {
  return <Whiteboard />;
}

export default withAuth(AdminWhiteboardPage, ['admin']);
