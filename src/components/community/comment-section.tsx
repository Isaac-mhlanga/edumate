
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { type Question, type Comment } from '@/lib/types';
import { CardHeader, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, MessageSquare, Send, FileText, Download, Loader2, CornerUpLeft, Paperclip, X, User, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { getFirestore, collection, query, orderBy, onSnapshot, doc, writeBatch, serverTimestamp, arrayUnion, arrayRemove, increment, updateDoc, deleteDoc, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Role = 'student' | 'instructor' | 'admin' | 'tutor';

interface CommentSectionProps {
  question: Question | null;
  onUpdateQuestion: (question: Question) => void;
  onDeleteQuestion: (questionId: string) => void;
}

export function CommentSection({ question, onUpdateQuestion, onDeleteQuestion }: CommentSectionProps) {
  const { toast } = useToast();
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newCommentFile, setNewCommentFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyFile, setReplyFile] = useState<File | null>(null);

  const [editingComment, setEditingComment] = useState<{ id: string, content: string } | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<string[]>([]);

  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role as Role);
        }
      } else {
        setUserRole(null);
      }
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
    if (!question || (!content.trim() && !file)) return;
    
    setIsSubmitting(true);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    
    try {
        const batch = writeBatch(firestore);
        const commentRef = doc(collection(firestore, 'questions', question.id, 'comments'));
        
        const commentData: Partial<Comment> = {
            studentId: user?.uid,
            studentName: user?.displayName || 'Anonymous',
            studentAvatar: user?.photoURL ?? null,
            content: content,
            likeCount: 0,
            likedBy: [],
            parentId: parentId,
        };

        if (file) {
            const fileRef = ref(storage, `questions/${question.id}/comments/${commentRef.id}/${file.name}`);
            await uploadBytes(fileRef, file);
            commentData.fileUrl = await getDownloadURL(fileRef);
            commentData.fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
        }

        batch.set(commentRef, {
            ...commentData,
            createdAt: serverTimestamp()
        });
        
        if (!parentId) {
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
  
    const handleUpdateComment = async () => {
    if (!editingComment || !question) return;

    setIsSubmitting(true);
    const firestore = getFirestore();
    const commentRef = doc(firestore, 'questions', question.id, 'comments', editingComment.id);
    
    try {
      await updateDoc(commentRef, { content: editingComment.content });
      toast({ title: 'Comment updated!' });
      setEditingComment(null);
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not update your comment.' });
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
  
    const handleDelete = async (type: 'question' | 'comment', id: string) => {
    if (userRole !== 'admin') {
      toast({ variant: 'destructive', title: 'Permission Denied', description: 'You are not authorized to perform this action.' });
      return;
    }
    if (!question) return;
    
    const firestore = getFirestore();
    const storage = getStorage();

    if (type === 'question') {
        if (!window.confirm('Are you sure you want to delete this entire question and all its comments?')) return;
        try {
            const commentsQuery = query(collection(firestore, 'questions', id, 'comments'));
            const commentsSnapshot = await getDocs(commentsQuery);
            const batch = writeBatch(firestore);
            for (const commentDoc of commentsSnapshot.docs) {
                const commentData = commentDoc.data();
                if (commentData.fileUrl) {
                    try { await deleteObject(ref(storage, commentData.fileUrl)); } catch (e) { console.error(e); }
                }
                batch.delete(commentDoc.ref);
            }
            await batch.commit();

            if (question.fileUrl) {
                try { await deleteObject(ref(storage, question.fileUrl)); } catch (e) { console.error(e); }
            }
            await deleteDoc(doc(firestore, 'questions', id));
            onDeleteQuestion(id);
            toast({ title: 'Question Deleted', description: 'The question and all its comments have been removed.' });
        } catch (error) {
            console.error('Error deleting question:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete the question.' });
        }
    } else {
        const commentToDelete = comments.find(c => c.id === id);
        if (!commentToDelete) return;

        try {
             if (commentToDelete.fileUrl) {
                try { await deleteObject(ref(storage, commentToDelete.fileUrl)); } catch (e) { console.error(e); }
            }
            await deleteDoc(doc(firestore, 'questions', question.id, 'comments', id));

            const replies = comments.filter(c => c.parentId === id);
            if (replies.length > 0) {
                 const batch = writeBatch(firestore);
                 for (const reply of replies) {
                    if (reply.fileUrl) {
                        try { await deleteObject(ref(storage, reply.fileUrl)); } catch (e) { console.error(e); }
                    }
                    batch.delete(doc(firestore, 'questions', question.id, 'comments', reply.id));
                 }
                 await batch.commit();
            }
            if (!commentToDelete.parentId) {
                await updateDoc(doc(firestore, 'questions', question.id), { commentCount: increment(-1) });
            }
            toast({ title: 'Comment Deleted', description: 'The comment has been removed.' });
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete the comment.' });
        }
    }
  };

  const handleToggleComments = async (disabled: boolean) => {
    if (userRole !== 'admin' || !question) return;

    const firestore = getFirestore();
    const questionRef = doc(firestore, 'questions', question.id);
    try {
        await updateDoc(questionRef, { commentsDisabled: disabled });
        onUpdateQuestion({ ...question, commentsDisabled: disabled });
        toast({
            title: `Comments ${disabled ? 'Disabled' : 'Enabled'}`,
            description: `Comments have been ${disabled ? 'turned off' : 'turned on'} for this question.`,
        });
    } catch (error) {
        console.error('Error toggling comments:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not update the comment status.' });
    }
  };
  
  const toggleCollapse = (commentId: string) => {
    setCollapsedComments(prev => 
      prev.includes(commentId) ? prev.filter(id => id !== commentId) : [...prev, commentId]
    );
  };
  
  const getReplies = (commentId: string): Comment[] => {
    return comments
      .filter((comment) => comment.parentId === commentId)
      .sort((a, b) => a.createdAt.toDate().getTime() - b.createdAt.toDate().getTime());
  };
  
  const renderAttachment = (item: { fileUrl?: string | null, fileType?: 'image' | 'pdf' | undefined }) => {
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
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const replies = isReply ? [] : getReplies(comment.id);
    const isEditing = editingComment?.id === comment.id;
    const isCollapsed = collapsedComments.includes(comment.id);

    return (
        <div key={comment.id} className="flex items-start gap-3">
            <Avatar className={cn("h-9 w-9", isReply && "h-8 w-8")}>
                <AvatarImage src={comment.studentAvatar ?? undefined} />
                <AvatarFallback>{comment.studentName?.charAt(0) || 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground text-sm">{comment.studentName}</span>
                    <span>{comment.createdAt ? formatDistanceToNow(comment.createdAt.toDate(), { addSuffix: true }) : ''}</span>
                </div>

                {isEditing ? (
                    <div className="mt-2 space-y-2">
                        <Textarea 
                            value={editingComment.content} 
                            onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })} 
                            className="text-sm"
                            rows={3}
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingComment(null)}>Cancel</Button>
                            <Button size="sm" onClick={handleUpdateComment} disabled={isSubmitting}>
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm mt-1">{comment.content}</p>
                        {renderAttachment(comment)}
                    </>
                )}
                
                {!isEditing && (
                    <div className="flex items-center gap-1 mt-2">
                        <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-muted-foreground" onClick={() => handleLike('comment', comment.id)} disabled={!user}>
                            <ThumbsUp className={cn("h-4 w-4 mr-1", (comment.likedBy || []).includes(user?.uid || '') && "text-primary fill-primary/20")} /> {comment.likeCount || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs h-auto px-2 py-1 text-muted-foreground" onClick={() => { setReplyingTo(replyingTo === comment.id ? null : comment.id); setReplyContent(''); setReplyFile(null); }}>
                            <CornerUpLeft className="mr-1 h-3 w-3" />
                            Reply
                        </Button>
                        {user && user.uid === comment.studentId && (
                            <Button variant="ghost" size="sm" className="text-xs h-auto px-2 py-1 text-muted-foreground" onClick={() => setEditingComment({ id: comment.id, content: comment.content })}>
                                <Edit className="mr-1 h-3 w-3" />
                                Edit
                            </Button>
                        )}
                        {userRole === 'admin' && (
                            <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-destructive" onClick={() => handleDelete('comment', comment.id)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                )}

                {replyingTo === comment.id && (
                    <div className="mt-4 flex items-start gap-3">
                        <Avatar className="h-8 w-8 border">
                            {user ? <AvatarImage src={user.photoURL || undefined} /> : <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>}
                            <AvatarFallback>{user ? user.displayName?.charAt(0) : 'A'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                            <Textarea placeholder={`Replying to ${comment.studentName}...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} disabled={isSubmitting} className="text-sm" />
                            {replyFile && <div className="text-xs text-muted-foreground flex items-center justify-between">{replyFile.name} <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setReplyFile(null)}><X className="h-4 w-4"/></Button></div>}
                            <div className="flex justify-between items-center">
                                <Button type="button" variant="ghost" size="icon" asChild>
                                  <label htmlFor={`reply-file-${comment.id}`} className={cn("cursor-pointer")}>
                                      <Paperclip className="h-4 w-4"/>
                                  </label>
                                </Button>
                                <Input id={`reply-file-${comment.id}`} type="file" className="hidden" onChange={e => setReplyFile(e.target.files?.[0] || null)} />

                                <div className="flex justify-end gap-2">
                                    <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                                    <Button size="sm" onClick={() => handlePostComment(replyContent, comment.id, replyFile)} disabled={isSubmitting || (!replyContent.trim() && !replyFile)}>
                                        {isSubmitting ? 'Replying...' : 'Reply'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {replies.length > 0 && (
                    <div className="mt-4">
                        <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => toggleCollapse(comment.id)}>
                            {isCollapsed ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronUp className="h-4 w-4 mr-1" />}
                            {isCollapsed ? `Show ${replies.length} replies` : 'Hide replies'}
                        </Button>

                        {!isCollapsed && (
                             <div className="mt-2 space-y-4 pl-4 border-l">
                                {replies.map(reply => renderComment(reply, true))}
                            </div>
                        )}
                    </div>
                )}
            </div>
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

  return (
    <div className="flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
            <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold">{question.title}</h2>
                {userRole === 'admin' && (
                    <div className="flex items-center space-x-2">
                        <Label htmlFor="disable-comments" className="text-xs text-muted-foreground">Disable Comments</Label>
                        <Switch
                            id="disable-comments"
                            checked={question.commentsDisabled}
                            onCheckedChange={handleToggleComments}
                        />
                    </div>
                )}
            </div>
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
                 <p className="text-sm whitespace-pre-wrap mt-2">{question.content}</p>
                 {renderAttachment(question)}
                 
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Button variant="ghost" size="sm" className="text-xs h-auto p-1" onClick={() => handleLike('question', question.id)} disabled={!user}>
                            <ThumbsUp className={cn("h-4 w-4 mr-1", user && (question.likedBy || []).includes(user.uid) && "text-primary fill-primary/20")} />
                            {question.likeCount || 0}
                        </Button>
                         <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" /> {question.commentCount || 0}
                        </div>
                    </div>
                     {userRole === 'admin' && (
                        <Button variant="ghost" size="sm" className="text-xs h-auto p-1 text-destructive" onClick={() => handleDelete('question', question.id)}>
                            <Trash2 className="h-4 w-4 mr-1" /> Delete Question
                        </Button>
                    )}
                </div>

                 <Separator />

                 <div className="space-y-4">
                    <h3 className="font-semibold text-sm">{question.commentCount || 0} Answers</h3>
                    {loadingComments ? (
                        <p className="text-muted-foreground text-sm">Loading comments...</p>
                    ) : topLevelComments.length > 0 ? (
                        topLevelComments.map(comment => renderComment(comment))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">No answers yet. Be the first to reply!</p>
                    )}
                 </div>
            </CardContent>
        </ScrollArea>
        <CardContent className="flex-shrink-0 border-t pt-4">
             {question.commentsDisabled ? (
                <div className="text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    Comments have been disabled for this question.
                </div>
            ) : (
                <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9 mt-1 border">
                        {user ? <AvatarImage src={user.photoURL || undefined} /> : <AvatarFallback><User className="h-4 w-4"/></AvatarFallback>}
                        <AvatarFallback>{user ? user.displayName?.charAt(0) : 'A'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Textarea 
                            placeholder="Add your answer..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isSubmitting}
                            className="text-sm"
                        />
                        {newCommentFile && <div className="text-xs text-muted-foreground flex items-center justify-between">{newCommentFile.name} <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setNewCommentFile(null)}><X className="h-4 w-4"/></Button></div>}
                        <div className="flex justify-between items-center">
                            <Button type="button" variant="ghost" size="icon" asChild>
                            <label htmlFor="comment-file" className={cn("cursor-pointer")}>
                                <Paperclip className="h-4 w-4"/>
                            </label>
                            </Button>
                            <Input id="comment-file" type="file" className="hidden" onChange={e => setNewCommentFile(e.target.files?.[0] || null)} />
                            <Button size="sm" onClick={() => handlePostComment(newComment, null, newCommentFile)} disabled={isSubmitting || (!newComment.trim() && !newCommentFile)}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Send className="mr-2 h-4 w-4" />
                                Post Answer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </CardContent>
    </div>
  );
}

    