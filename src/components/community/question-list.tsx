'use client';

import React from 'react';
import { type Question } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, MoreHorizontal, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
}

function QuestionCard({ question }: { question: Question }) {
  return (
    <Card>
      <CardHeader className="flex-row gap-4 items-center">
        <Avatar className="h-10 w-10">
          <AvatarImage src={question.studentAvatar} />
          <AvatarFallback>{question.studentName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{question.studentName}</p>
          <p className="text-xs text-muted-foreground">{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : '...'}</p>
        </div>
      </CardHeader>
      <CardContent className="pl-16">
        <h3 className="font-bold text-lg mb-2">{question.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{question.content}</p>
      </CardContent>
      <CardFooter className="pl-16 flex justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-muted-foreground">
            <ThumbsUp className="h-4 w-4"/> {question.likeCount || 0}
          </Button>
           <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-muted-foreground">
            <ThumbsDown className="h-4 w-4"/> 60
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
             <MoreHorizontal className="h-4 w-4"/>
          </Button>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
           <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> 2K</span>
          <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {question.commentCount || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
}


export function QuestionList({ questions, loading }: QuestionListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/4 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
        <h2 className="text-lg font-semibold">{questions.length} Posts</h2>
        {questions.length > 0 ? (
            <div className="space-y-4">
                {questions.map(q => <QuestionCard key={q.id} question={q} />)}
            </div>
        ) : (
             <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                <h3 className="text-lg font-semibold">No Questions Found</h3>
                <p>Try adjusting your search or be the first to ask!</p>
            </div>
        )}
        {questions.length > 0 && (
            <div className="text-center pt-4">
                <Button variant="outline">See more</Button>
            </div>
        )}
    </div>
  );
}
