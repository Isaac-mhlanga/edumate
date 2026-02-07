'use client';

import React from 'react';
import { type Question } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
  onQuestionSelect?: (question: Question) => void;
  selectedQuestionId?: string;
}

function QuestionCard({ question, onQuestionSelect, isSelected }: { question: Question, onQuestionSelect?: (question: Question) => void, isSelected?: boolean }) {
  return (
    <Card 
      onClick={() => onQuestionSelect?.(question)}
      className={cn("transition-all", onQuestionSelect && "cursor-pointer", isSelected ? "border-primary ring-1 ring-primary" : onQuestionSelect ? "hover:border-border" : "")}
    >
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
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
            <ThumbsUp className="h-4 w-4"/> <span>{question.likeCount || 0}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {question.commentCount || 0}</span>
        </div>
      </CardFooter>
    </Card>
  );
}


export function QuestionList({ questions, loading, onQuestionSelect, selectedQuestionId }: QuestionListProps) {
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
                {questions.map(q => <QuestionCard key={q.id} question={q} onQuestionSelect={onQuestionSelect} isSelected={q.id === selectedQuestionId} />)}
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
