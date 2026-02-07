'use client';

import React from 'react';
import { type Question } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowUp, ArrowDown, MessageSquare, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';

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
  selectedQuestionId?: string;
}

function QuestionCard({ question, onQuestionSelect, isSelected }: { question: Question, onQuestionSelect?: (question: Question) => void, isSelected?: boolean }) {
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

    const firestore = getFirestore();
    const docRef = doc(firestore, 'questions', question.id);
    
    const isLiked = (question.likedBy || []).includes(user.uid);
    const newLikeCount = isLiked ? increment(-1) : increment(1);
    const likeUpdate = isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid);

    try {
      await updateDoc(docRef, {
        likeCount: newLikeCount,
        likedBy: likeUpdate,
      });
    } catch (error) {
      console.error("Error updating like:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.' });
    }
  };


  const contentSnippet = question.content.length > 150 
    ? `${question.content.substring(0, 150)}...`
    : question.content;

  return (
    <Card 
      onClick={() => onQuestionSelect?.(question)}
      className={cn("transition-all", onQuestionSelect && "cursor-pointer", isSelected ? "border-primary ring-1 ring-primary" : onQuestionSelect ? "hover:border-border" : "")}
    >
      <CardHeader className="flex-row justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={question.studentAvatar ?? undefined} />
            <AvatarFallback>{question.studentName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">Posted by {question.studentName}</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : '...'}</p>
      </CardHeader>
      <CardContent className="pl-16 space-y-2">
        <h3 className="font-bold text-lg">{question.title}</h3>
        <p className="text-muted-foreground text-sm">
          {contentSnippet}
          {question.content.length > 150 && <button className="text-primary font-semibold ml-1">see more</button>}
        </p>
      </CardContent>
      <CardFooter className="pl-16 flex justify-between">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2" onClick={handleLike}>
            <ArrowUp className={cn("h-4 w-4", user && (question.likedBy || []).includes(user.uid) && "text-primary")} /> 
            <span>{question.likeCount || 0}</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2">
            <ArrowDown className="h-4 w-4"/> <span>0</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
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
        <h2 className="text-lg font-semibold">Posts</h2>
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
        <h2 className="text-lg font-semibold">{questions.length > 0 ? `${questions.length} Posts` : ''}</h2>
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
