
'use client';

import React from 'react';
import { type Question } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface QuestionListProps {
  questions: Question[];
  selectedQuestion: Question | null;
  onSelectQuestion: (question: Question) => void;
  loading: boolean;
}

export function QuestionList({ questions, selectedQuestion, onSelectQuestion, loading }: QuestionListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <QuestionSkeleton key={i} />)
        ) : questions.length > 0 ? (
          questions.map(q => (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className={cn(
                'w-full text-left p-3 rounded-lg border transition-colors',
                selectedQuestion?.id === q.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={q.studentAvatar} />
                  <AvatarFallback>{q.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold">{q.studentName}</p>
                    <p className="text-xs text-muted-foreground">
                        {q.createdAt ? formatDistanceToNow(q.createdAt.toDate(), { addSuffix: true }) : '...'}
                    </p>
                </div>
              </div>
              <p className="font-semibold mb-2">{q.title}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="h-3 w-3" /> {q.likeCount || 0}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {q.commentCount || 0}</span>
              </div>
            </button>
          ))
        ) : (
             <div className="text-center py-16 text-muted-foreground">
                <h3 className="text-lg font-semibold">No Questions Yet</h3>
                <p>Be the first to ask a question!</p>
            </div>
        )}
      </div>
    </ScrollArea>
  );
}


function QuestionSkeleton() {
    return (
        <div className="p-3 rounded-lg border">
             <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
              </div>
            <Skeleton className="h-5 w-3/4 mb-2" />
            <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-8" />
            </div>
        </div>
    )
}
