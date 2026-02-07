'use client';

import React from 'react';
import { type Question } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '../ui/badge';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface QuestionListProps {
  questions: Question[];
  loading: boolean;
  onQuestionSelect?: (question: Question) => void;
  selectedQuestionId?: string | null; // New prop
}

function QuestionCard({ question, onQuestionSelect, isSelected }: { question: Question, onQuestionSelect?: (question: Question) => void, isSelected: boolean }) {
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to like a post.' });
      return;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const docRef = doc(firestore, 'questions', question.id);
    
    const likedBy = question.likedBy || [];
    const isLiked = likedBy.includes(user.uid);

    try {
        await updateDoc(docRef, {
            likeCount: increment(isLiked ? -1 : 1),
            likedBy: isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        });
    } catch (error) {
      console.error("Error updating like:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.' });
    }
  };

  const contentSnippet = question.content.length > 100 
    ? `${question.content.substring(0, 100)}...`
    : question.content;
  
  const tags = [question.audience, question.subject, question.grade ? `Grade ${question.grade}` : null, question.module].filter(Boolean);

  return (
     <button 
      onClick={() => onQuestionSelect?.(question)}
      className={cn(
        "w-full text-left p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors duration-200",
        isSelected && "bg-muted"
      )}
    >
        <div className="flex items-center gap-3 mb-2">
            <Avatar className="h-8 w-8">
                <AvatarImage src={question.studentAvatar ?? undefined} />
                <AvatarFallback>{question.studentName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div>
                <p className="text-sm font-semibold">{question.studentName || 'Anonymous'}</p>
                <p className="text-xs text-muted-foreground">{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : '...'}</p>
            </div>
        </div>
        <div className="space-y-2">
            <h3 className="font-semibold text-md leading-snug line-clamp-2">{question.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
              {contentSnippet}
            </p>
        </div>
        <div className="flex justify-between items-center mt-3">
             <div className="flex flex-wrap gap-1">
                {tags.slice(0, 2).map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <ThumbsUp className="h-4 w-4" /> 
                    <span>{question.likeCount || 0}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" /> 
                    <span>{question.commentCount || 0}</span>
                </div>
            </div>
        </div>
    </button>
  );
}


export function QuestionList({ questions, loading, onQuestionSelect, selectedQuestionId }: QuestionListProps) {
  if (loading) {
    return (
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4 space-y-2">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
            </div>
        ))}
      </div>
    )
  }

  return (
    <div className="divide-y">
        {questions.length > 0 ? (
            questions.map(q => <QuestionCard key={q.id} question={q} onQuestionSelect={onQuestionSelect} isSelected={q.id === selectedQuestionId} />)
        ) : (
             <div className="text-center py-24 text-muted-foreground">
                <h3 className="text-lg font-semibold">No Questions Yet</h3>
                <p>Be the first to start a conversation!</p>
            </div>
        )}
    </div>
  );
}
