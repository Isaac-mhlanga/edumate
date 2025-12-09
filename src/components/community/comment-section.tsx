
'use client';

import React from 'react';
import { type Question, type Comment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Send, FileText } from 'lucide-react';
import { formatDistanceToNow from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface CommentSectionProps {
  question: Question | null;
}

export function CommentSection({ question }: CommentSectionProps) {
  if (!question) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center text-muted-foreground">
        <MessageSquare className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold">Select a Question</h2>
        <p>Choose a question from the list to see the discussion.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
            <CardTitle>{question.title}</CardTitle>
             <div className="flex items-center gap-3 pt-2 text-sm text-muted-foreground">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={question.studentAvatar} />
                  <AvatarFallback>{question.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{question.studentName}</span>
                <span>•</span>
                <span>{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : ''}</span>
              </div>
        </CardHeader>
        <ScrollArea className="flex-grow">
            <CardContent className="space-y-4">
                 <p className="text-base whitespace-pre-wrap">{question.content}</p>
                 {question.fileUrl && (
                    <a 
                        href={question.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                        <FileText className="h-4 w-4" />
                        View Attached File
                    </a>
                 )}
                 <Separator />
                 <div className="text-sm text-muted-foreground">
                    Placeholder for comments...
                 </div>
            </CardContent>
        </ScrollArea>
        <CardContent className="flex-shrink-0 border-t pt-4">
            <div className="flex items-start gap-3">
                 <Avatar className="h-9 w-9 mt-1">
                    {/* Fallback for current user */}
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea placeholder="Add a comment..." />
                    <div className="flex justify-end">
                        <Button size="sm">
                            <Send className="mr-2 h-4 w-4"/>
                            Post
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </div>
  );
}
