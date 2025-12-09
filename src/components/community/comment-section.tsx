
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Question, type Comment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Send, FileText, Download, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, writeBatch, serverTimestamp, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface CommentSectionProps {
  question: Question | null;
  onUpdateQuestion: (question: Question) => void;
}

export function CommentSection({ question, onUpdateQuestion }: CommentSectionProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!question) {
        setComments([]);
        return;
    };

    setLoadingComments(true);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const q = query(
        collection(firestore, 'questions', question.id, 'comments'), 
        orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
        setComments(fetchedComments);
        setLoadingComments(false);
    }, (error) => {
        console.error("Error fetching comments:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load comments.' });
        setLoadingComments(false);
    });

    return () => unsubscribe();
  }, [question, toast]);

  const handlePostComment = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to comment.' });
        return;
    }
    if (!question || !newComment.trim()) return;
    
    setIsSubmitting(true);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    
    const batch = writeBatch(firestore);
    
    const commentRef = doc(collection(firestore, 'questions', question.id, 'comments'));
    batch.set(commentRef, {
        studentId: user.uid,
        studentName: user.displayName || 'Anonymous',
        studentAvatar: user.photoURL,
        content: newComment,
        createdAt: serverTimestamp(),
        likeCount: 0,
        likedBy: [],
        parentId: null,
    });
    
    const questionRef = doc(firestore, 'questions', question.id);
    batch.update(questionRef, { commentCount: increment(1) });

    try {
        await batch.commit();
        setNewComment('');
    } catch(error) {
        console.error("Error posting comment:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not post your comment.' });
    } finally {
        setIsSubmitting(false);
    }
  };

 const handleLike = async (type: 'question' | 'comment', id: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to like.' });
      return;
    }
    if (!question) return;

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    let docRef;
    let currentDoc: Question | Comment | undefined;

    if (type === 'question') {
        docRef = doc(firestore, 'questions', id);
        currentDoc = question;
    } else {
        docRef = doc(firestore, 'questions', question.id, 'comments', id);
        currentDoc = comments.find(c => c.id === id);
    }

    if (!currentDoc) return;
    
    const isLiked = currentDoc.likedBy.includes(user.uid);
    const newLikeCount = isLiked ? increment(-1) : increment(1);
    const likeUpdate = isLiked ? arrayRemove(user.uid) : arrayUnion(user.uid);

    try {
        await updateDoc(docRef, {
            likeCount: newLikeCount,
            likedBy: likeUpdate,
        });

        // Optimistically update UI
        if (type === 'question') {
            onUpdateQuestion({
                ...question,
                likeCount: question.likeCount + (isLiked ? -1 : 1),
                likedBy: isLiked ? question.likedBy.filter(uid => uid !== user.uid) : [...question.likedBy, user.uid],
            });
        } else {
            setComments(prev => prev.map(c => c.id === id ? {
                ...c,
                likeCount: c.likeCount + (isLiked ? -1 : 1),
                likedBy: isLiked ? c.likedBy.filter(uid => uid !== user.uid) : [...c.likedBy, user.uid],
            } : c));
        }

    } catch (error) {
      console.error("Error updating like:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.' });
    }
  };


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
            <CardContent className="space-y-6">
                 <p className="text-base whitespace-pre-wrap">{question.content}</p>
                 
                 {question.fileUrl && (
                    <div className="space-y-2 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                             <h4 className="font-semibold text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Attached File
                            </h4>
                            <a 
                                href={question.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                                <Download className="h-3 w-3" />
                                Download
                            </a>
                        </div>

                        {question.fileType === 'image' ? (
                            <div className="relative w-full">
                                <Image 
                                    src={question.fileUrl} 
                                    alt="Attached image" 
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    className="object-contain rounded-md w-full h-auto"
                                />
                            </div>
                        ) : question.fileType === 'pdf' ? (
                             <div className="w-full aspect-[4/5]">
                                <iframe 
                                    src={question.fileUrl} 
                                    className="w-full h-full rounded-md border"
                                    title="Attached PDF"
                                ></iframe>
                            </div>
                        ) : (
                             <p className="text-xs text-muted-foreground">File type not supported for preview. Please download to view.</p>
                        )}
                    </div>
                 )}
                 
                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={() => handleLike('question', question.id)} disabled={!user}>
                        <ThumbsUp className={cn("h-4 w-4 mr-2", user && question.likedBy.includes(user.uid) && "text-primary fill-primary/20")} />
                        {question.likeCount}
                    </Button>
                     <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> {question.commentCount}
                    </div>
                </div>

                 <Separator />

                 <div className="space-y-4">
                    <h3 className="font-semibold">{question.commentCount} Answers</h3>
                    {loadingComments ? (
                        <p className="text-muted-foreground">Loading comments...</p>
                    ) : comments.length > 0 ? (
                        comments.map(comment => (
                            <div key={comment.id} className="flex items-start gap-3">
                                <Avatar className="h-9 w-9">
                                    <AvatarImage src={comment.studentAvatar} />
                                    <AvatarFallback>{comment.studentName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-semibold text-foreground">{comment.studentName}</span>
                                        <span>{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                                    </div>
                                    <p className="text-sm">{comment.content}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => handleLike('comment', comment.id)} disabled={!user}>
                                            <ThumbsUp className={cn("h-4 w-4 mr-1", user && comment.likedBy.includes(user.uid) && "text-primary fill-primary/20")} /> {comment.likeCount}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-muted-foreground">Reply</Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No answers yet. Be the first to reply!</p>
                    )}
                 </div>
            </CardContent>
        </ScrollArea>
        <CardContent className="flex-shrink-0 border-t pt-4">
            <div className="flex items-start gap-3">
                 <Avatar className="h-9 w-9 mt-1">
                    <AvatarImage src={user?.photoURL || undefined} />
                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea 
                        placeholder="Add your answer..." 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmitting || !user}
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handlePostComment} disabled={isSubmitting || !newComment.trim() || !user}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Post Answer
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </div>
  );
}
