'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { QuestionForm } from './question-form';
import { type Question } from '@/lib/types';
import React from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { Skeleton } from '../ui/skeleton';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


interface RightSidebarProps {
    questions: Question[];
}

export function RightSidebar({ questions }: RightSidebarProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const topMembers = React.useMemo(() => {
    const memberStats: { [key: string]: { name: string; avatar?: string | null; postCount: number } } = {};

    questions.forEach(question => {
      if (!question.studentId || question.studentId === 'anonymous') return;

      if (!memberStats[question.studentId]) {
        memberStats[question.studentId] = {
          name: question.studentName,
          avatar: question.studentAvatar,
          postCount: 0,
        };
      }
      memberStats[question.studentId].postCount++;
    });

    return Object.values(memberStats)
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, 5);
  }, [questions]);
  
  const popularTags = React.useMemo(() => {
    const tagCounts: { [key: string]: number } = {};
    questions.forEach(q => {
      if (q.subject) {
        tagCounts[q.subject] = (tagCounts[q.subject] || 0) + 1;
      }
      if (q.grade) {
        const gradeTag = `Grade ${q.grade}`;
        tagCounts[gradeTag] = (tagCounts[gradeTag] || 0) + 1;
      }
      if (q.module) {
        tagCounts[q.module] = (tagCounts[q.module] || 0) + 1;
      }
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag, _]) => tag);
  }, [questions]);
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Authors</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {topMembers.map(member => (
                <li key={member.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar ?? undefined} />
                        <AvatarFallback>{member.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{member.name}</span>
                    </div>
                    <span className="font-semibold text-muted-foreground">{member.postCount} posts</span>
                </li>
                ))}
            </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="text-base">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => <Button key={tag} variant="secondary" size="sm" className="bg-muted/50 text-muted-foreground hover:bg-muted">{tag}</Button>)}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
