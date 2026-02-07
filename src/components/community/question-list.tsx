
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
import { getFirestore, doc, updateDoc, increment, arrayUnion, arrayRemove, writeBatch } from 'firebase/firestore';
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

  const handleVote = async (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to vote.' });
      return;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const docRef = doc(firestore, 'questions', question.id);

    const isLiked = (question.likedBy || []).includes(user.uid);
    const isDisliked = (question.dislikedBy || []).includes(user.uid);
    
    const batch = writeBatch(firestore);

    if (voteType === 'up') {
        if (isLiked) { // undo upvote
            batch.update(docRef, { likeCount: increment(-1), likedBy: arrayRemove(user.uid) });
        } else { // new upvote
            batch.update(docRef, { likeCount: increment(1), likedBy: arrayUnion(user.uid) });
            if (isDisliked) { // remove downvote if it exists
                batch.update(docRef, { dislikeCount: increment(-1), dislikedBy: arrayRemove(user.uid) });
            }
        }
    } else { // voteType === 'down'
        if (isDisliked) { // undo downvote
            batch.update(docRef, { dislikeCount: increment(-1), dislikedBy: arrayRemove(user.uid) });
        } else { // new downvote
            batch.update(docRef, { dislikeCount: increment(1), dislikedBy: arrayUnion(user.uid) });
            if (isLiked) { // remove upvote if it exists
                batch.update(docRef, { likeCount: increment(-1), likedBy: arrayRemove(user.uid) });
            }
        }
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error updating vote:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process your vote.' });
    }
  };


  const contentSnippet = question.content.length > 150 
    ? `${question.content.substring(0, 150)}...`
    : question.content;

  return (
     <Card 
      onClick={() => onQuestionSelect?.(question)}
      className={cn("flex transition-all", onQuestionSelect && "cursor-pointer", isSelected ? "border-primary ring-1 ring-primary" : onQuestionSelect ? "hover:border-border" : "")}
    >
        <div className="flex flex-col items-center bg-muted/50 p-2 border-r">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleVote(e, 'up')}>
                <ArrowUp className={cn("h-5 w-5", user && (question.likedBy || []).includes(user.uid) && "text-primary fill-primary")} /> 
            </Button>
            <span className="font-bold text-sm my-1">{ (question.likeCount || 0) - (question.dislikeCount || 0) }</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => handleVote(e, 'down')}>
                <ArrowDown className={cn("h-5 w-5", user && (question.dislikedBy || []).includes(user.uid) && "text-destructive fill-destructive")} />
            </Button>
        </div>

        <div className="flex-1">
            <CardHeader className="flex-row justify-between items-start pb-2">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={question.studentAvatar ?? undefined} />
                        <AvatarFallback>{question.studentName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Posted by {question.studentName}</p>
                        <p className="text-xs text-muted-foreground">{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : '...'}</p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-2 py-2">
                <h3 className="font-bold text-lg">{question.title}</h3>
                <p className="text-muted-foreground text-sm">
                {contentSnippet}
                {question.content.length > 150 && <button className="text-primary font-semibold ml-1">see more</button>}
                </p>
            </CardContent>
            <CardFooter className="py-2">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" /> 
                    <span>{question.commentCount || 0} Comments</span>
                </Button>
            </CardFooter>
        </div>
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
