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
}

function QuestionCard({ question, onQuestionSelect }: { question: Question, onQuestionSelect?: (question: Question) => void }) {
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

  const contentSnippet = question.content.length > 180 
    ? `${question.content.substring(0, 180)}...`
    : question.content;
  
  const tags = [question.audience, question.subject, question.grade ? `Grade ${question.grade}` : null, question.module].filter(Boolean);

  return (
     <Card 
      onClick={() => onQuestionSelect?.(question)}
      className="bg-card text-card-foreground shadow-none rounded-lg border-b p-6 hover:bg-muted/50 cursor-pointer transition-colors duration-200"
    >
        <CardHeader className="p-0 mb-4 flex-row justify-between items-start">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={question.studentAvatar ?? undefined} />
                    <AvatarFallback>{question.studentName?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold">{question.studentName || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : '...'}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0 space-y-3">
            <h3 className="font-bold text-lg leading-snug">{question.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {contentSnippet}
            </p>
            <div className="flex flex-wrap gap-2">
                {tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
        </CardContent>
        <CardFooter className="p-0 pt-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2 -ml-2 h-8" onClick={handleLike}>
                    <ThumbsUp className={cn("h-4 w-4", user && (question.likedBy || []).includes(user.uid) && "text-primary fill-primary/20")} /> 
                    <span>{question.likeCount || 0}</span>
                </Button>
                <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" /> 
                    <span>{question.commentCount || 0}</span>
                </div>
            </div>
        </CardFooter>
    </Card>
  );
}


export function QuestionList({ questions, loading, onQuestionSelect }: QuestionListProps) {
  if (loading) {
    return (
      <div className="bg-card rounded-lg border">
        {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-48 w-full bg-muted/50" />)}
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border divide-y">
        {questions.length > 0 ? (
            questions.map(q => <QuestionCard key={q.id} question={q} onQuestionSelect={onQuestionSelect} />)
        ) : (
             <div className="text-center py-24 text-muted-foreground">
                <h3 className="text-lg font-semibold">No Questions Yet</h3>
                <p>Be the first to start a conversation!</p>
            </div>
        )}
    </div>
  );
}
