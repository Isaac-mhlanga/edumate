'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuestionForm } from './question-form';
import { type Question } from '@/lib/types';
import React from 'react';

interface RightSidebarProps {
    questions: Question[];
}

export function RightSidebar({ questions }: RightSidebarProps) {
  const topMembers = React.useMemo(() => {
    const memberStats: { [key: string]: { name: string; avatar?: string | null; postCount: number } } = {};

    questions.forEach(question => {
      if (question.studentId === 'anonymous') return;

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
      .slice(0, 10)
      .map(member => ({
        name: member.name,
        score: `${member.postCount} posts`,
        avatar: member.avatar,
      }));
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
  
  const memberCount = new Set(questions.map(q => q.studentId).filter(id => id !== 'anonymous')).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold">Online</span>
        </div>
        <span className="text-sm font-semibold">{memberCount} members</span>
      </div>
      
      <QuestionForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-bold">Top Members</CardTitle>
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
                <span className="font-semibold text-muted-foreground">{member.score}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
          <CardTitle className="text-base font-bold">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => <Button key={tag} variant="outline" size="sm">{tag}</Button>)}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
