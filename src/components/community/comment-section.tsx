
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Question, type Comment } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Send, FileText, Download, Loader2, CornerUpLeft, Paperclip, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { getFirestore, collection, query, where, orderBy, onSnapshot, doc, writeBatch, serverTimestamp, arrayUnion, arrayRemove, increment, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

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
  const [newCommentFile, setNewCommentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);

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

  const handlePostComment = async (content: string, parentId: string | null, file: File | null) => {
    if (!user) {
        toast({ title: 'Please log in', description: 'You need to be logged in to post a comment.' });
        return;
    }
    if (!question || (!content.trim() && !file)) return;
    
    setIsSubmitting(true);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    try {
      const batch = writeBatch(firestore);
      const commentRef = doc(collection(firestore, 'questions', question.id, 'comments'));
      
      let fileUrl: string | undefined;
      let fileType: 'image' | 'pdf' | undefined;

      if (file) {
        const fileRef = ref(storage, `questions/${question.id}/comments/${commentRef.id}/${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
        fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      }

      batch.set(commentRef, {
          studentId: user.uid,
          studentName: user.displayName || 'Anonymous',
          studentAvatar: user.photoURL,
          content: content,
          fileUrl,
          fileType,
          createdAt: serverTimestamp(),
          likeCount: 0,
          likedBy: [],
          parentId: parentId,
      });
      
      if (!parentId) { // Only increment comment count for top-level comments
          const questionRef = doc(firestore, 'questions', question.id);
          batch.update(questionRef, { commentCount: increment(1) });
      }

      await batch.commit();
      
      if (parentId) {
          setReplyContent('');
          setReplyFile(null);
          setReplyingTo(null);
      } else {
          setNewComment('');
          setNewCommentFile(null);
      }
    } catch(error) {
        console.error("Error posting comment:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not post your comment.' });
    } finally {
        setIsSubmitting(false);
    }
  };

 const handleLike = async (type: 'question' | 'comment', id: string) => {
    if (!user) {
      toast({ title: 'Please log in', description: 'You need to be logged in to like a post.' });
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
    
    const likedBy = currentDoc.likedBy || [];
    const isLiked = likedBy.includes(user.uid);
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
                likeCount: (question.likeCount || 0) + (isLiked ? -1 : 1),
                likedBy: isLiked ? (question.likedBy || []).filter(uid => uid !== user.uid) : [...(question.likedBy || []), user.uid],
            });
        } else {
            setComments(prev => prev.map(c => c.id === id ? {
                ...c,
                likeCount: (c.likeCount || 0) + (isLiked ? -1 : 1),
                likedBy: isLiked ? (c.likedBy || []).filter(uid => uid !== user.uid) : [...(c.likedBy || []), user.uid],
            } : c));
        }

    } catch (error) {
      console.error("Error updating like:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not process your like.' });
    }
  };

  const renderAttachment = (item: { fileUrl?: string, fileType?: 'image' | 'pdf' }) => {
    if (!item.fileUrl) return null;
    return (
      <div className="space-y-2 rounded-lg border p-3 mt-2">
        <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Attached File
            </h4>
            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                <Download className="h-3 w-3" />
                Download
            </a>
        </div>
        {item.fileType === 'image' ? (
            <div className="relative w-full">
                <Image src={item.fileUrl} alt="Attached image" width={0} height={0} sizes="100vw" className="object-contain rounded-md w-full h-auto" />
            </div>
        ) : item.fileType === 'pdf' ? (
            <div className="w-full aspect-[4/5]">
                <iframe src={item.fileUrl} className="w-full h-full rounded-md border" title="Attached PDF"></iframe>
            </div>
        ) : (
            <p className="text-xs text-muted-foreground">File type not supported for preview. Please download to view.</p>
        )}
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 text-center text-muted-foreground">
        <MessageSquare className="h-16 w-16 mb-4" />
        <h2 className="text-xl font-semibold">Select a Question</h2>
        <p>Choose a question from the list to see the discussion.</p>
      </div>
    );
  }

  const topLevelComments = comments.filter(comment => !comment.parentId);
  const getReplies = (commentId: string) => {
    return comments.filter(comment => comment.parentId === commentId);
  }

  return (
    <div className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
            <CardTitle className="text-lg">{question.title}</CardTitle>
             <div className="flex items-center gap-3 pt-2 text-xs text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.studentAvatar} />
                  <AvatarFallback>{question.studentName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-foreground">{question.studentName}</span>
                <span>•</span>
                <span>{question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : ''}</span>
              </div>
        </CardHeader>
        <ScrollArea className="flex-grow">
            <CardContent className="space-y-4">
                 <p className="text-sm whitespace-pre-wrap">{question.content}</p>
                 {renderAttachment(question)}
                 
                 <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={() => handleLike('question', question.id)}>
                        <ThumbsUp className={cn("h-4 w-4 mr-1", user && (question.likedBy || []).includes(user.uid) && "text-primary fill-primary/20")} />
                        {question.likeCount || 0}
                    </Button>
                     <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" /> {question.commentCount || 0}
                    </div>
                </div>

                 <Separator />

                 <div className="space-y-4">
                    <h3 className="font-semibold text-sm">{question.commentCount || 0} Answers</h3>
                    {loadingComments ? (
                        <p className="text-muted-foreground text-sm">Loading comments...</p>
                    ) : topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => (
                            <div key={comment.id}>
                                <div className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.studentAvatar} />
                                        <AvatarFallback>{comment.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span className="font-semibold text-foreground text-sm">{comment.studentName}</span>
                                            <span>{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                                        </div>
                                        <p className="text-sm mt-1">{comment.content}</p>
                                        {renderAttachment(comment)}
                                        <div className="flex items-center gap-1 mt-1">
                                            <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-muted-foreground" onClick={() => handleLike('comment', comment.id)}>
                                                <ThumbsUp className={cn("h-4 w-4 mr-1", user && (comment.likedBy || []).includes(user.uid) && "text-primary fill-primary/20")} /> {comment.likeCount || 0}
                                            </Button>
                                            <Button variant="outline" size="sm" className="text-xs h-auto px-2 py-1" onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(''); setReplyFile(null); }}>
                                                <CornerUpLeft className="mr-1 h-3 w-3" />
                                                Reply
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                                {replyingTo === comment.id && (
                                    <div className="ml-11 mt-2 flex items-start gap-3">
                                         <Avatar className="h-8 w-8 border">
                                            <AvatarImage src={user?.photoURL || undefined} />
                                            <AvatarFallback>{user ? user.displayName?.charAt(0) : 'Ed'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-2">
                                            <Textarea placeholder={`Replying to ${comment.studentName}...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} disabled={isSubmitting || !user} className="text-sm" />
                                            {replyFile && <div className="text-xs text-muted-foreground flex items-center justify-between">{replyFile.name} <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setReplyFile(null)}><X className="h-4 w-4"/></Button></div>}
                                            <div className="flex justify-between items-center">
                                                <Button type="button" variant="ghost" size="icon" asChild>
                                                  <label htmlFor={`reply-file-${comment.id}`} className="cursor-pointer"><Paperclip className="h-4 w-4"/></label>
                                                </Button>
                                                <Input id={`reply-file-${comment.id}`} type="file" className="hidden" onChange={e => setReplyFile(e.target.files?.[0] || null)} />

                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                                    <Button size="sm" onClick={() => handlePostComment(replyContent, comment.id, replyFile)} disabled={isSubmitting || (!replyContent.trim() && !replyFile) || !user}>
                                                        {isSubmitting ? 'Replying...' : 'Reply'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="ml-7 mt-2 space-y-2 pl-4 border-l">
                                    {getReplies(comment.id).map(reply => (
                                        <div key={reply.id} className="flex items-start gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={reply.studentAvatar} />
                                                <AvatarFallback>{reply.studentName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span className="font-semibold text-foreground text-sm">{reply.studentName}</span>
                                                    <span>{reply.createdAt ? formatDistanceToNow(reply.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                                                </div>
                                                <p className="text-sm mt-1">{reply.content}</p>
                                                {renderAttachment(reply)}
                                                 <div className="flex items-center gap-1 mt-1">
                                                    <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-muted-foreground" onClick={() => handleLike('comment', reply.id)}>
                                                        <ThumbsUp className={cn("h-4 w-4 mr-1", user && (reply.likedBy || []).includes(user.uid) && "text-primary fill-primary/20")} /> {reply.likeCount || 0}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                        placeholder={user ? "Add your answer..." : "Please log in to post an answer."}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={isSubmitting || !user}
                        className="text-sm"
                    />
                    {newCommentFile && <div className="text-xs text-muted-foreground flex items-center justify-between">{newCommentFile.name} <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setNewCommentFile(null)}><X className="h-4 w-4"/></Button></div>}
                    <div className="flex justify-between items-center">
                        <Button type="button" variant="ghost" size="icon" asChild>
                          <label htmlFor="comment-file" className="cursor-pointer"><Paperclip className="h-4 w-4"/></label>
                        </Button>
                        <Input id="comment-file" type="file" className="hidden" onChange={e => setNewCommentFile(e.target.files?.[0] || null)} />
                        <Button size="sm" onClick={() => handlePostComment(newComment, null, newCommentFile)} disabled={isSubmitting || (!newComment.trim() && !newCommentFile) || !user}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="mr-2 h-4 w-4" />
                            Post Answer
                        </Button>
                    </div>
                </div>
            </div>
        </CardContent>
    </div>
  );
}
