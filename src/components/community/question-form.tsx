
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Send, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long.').max(150, 'Title cannot exceed 150 characters.'),
  content: z.string().min(10, 'Question must be at least 10 characters long.'),
  subject: z.enum(['Mathematics', 'Physical Sciences', 'Life Sciences'], { required_error: "Please select a subject."}),
  grade: z.enum(['10', '11', '12'], { required_error: "Please select a grade."}),
  file: z.any().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [user, setUser] = useState<import('firebase/auth').User | null>(null);

  React.useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return () => unsubscribe();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      file: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to ask a question.' });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const firestore = getFirestore(app);
      const storage = getStorage(app);
      let fileUrl: string | undefined;
      let fileType: 'image' | 'pdf' | undefined;
      
      const file = data.file?.[0];
      if (file) {
        const fileRef = ref(storage, `questions/${currentUser.uid}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
        fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      }

      await addDoc(collection(firestore, 'questions'), {
        studentId: currentUser.uid,
        studentName: currentUser.displayName || 'Anonymous',
        studentAvatar: currentUser.photoURL,
        title: data.title,
        content: data.content,
        subject: data.subject,
        grade: data.grade,
        fileUrl,
        fileType,
        createdAt: serverTimestamp(),
        commentCount: 0,
        likeCount: 0,
        likedBy: [],
      });

      toast({ title: 'Question posted!', description: 'Your question is now live for the community.' });
      form.reset();
      setFileName(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to post your question.' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fileRef = form.register("file");

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
            <Button className="w-full">
                <Send className="mr-2 h-4 w-4"/>
                Ask a Question
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Ask the Community</DialogTitle>
                <DialogDescription>Share your question with fellow learners and educators.</DialogDescription>
            </DialogHeader>
             {!user ? (
                 <Alert>
                    <AlertTitle>You're not logged in!</AlertTitle>
                    <AlertDescription>
                        Please log in or create an account to ask a question.
                        <div className="flex gap-2 mt-4">
                            <Button asChild size="sm"><Link href="/login">Log In</Link></Button>
                            <Button asChild size="sm" variant="outline"><Link href="/register">Register</Link></Button>
                        </div>
                    </AlertDescription>
                </Alert>
             ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField name="title" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Question Title</FormLabel>
                                <FormControl><Input placeholder="e.g., How to solve for x in this equation?" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select subject"/></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                                            <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                            <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="grade" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Grade</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="10">Grade 10</SelectItem>
                                            <SelectItem value="11">Grade 11</SelectItem>
                                            <SelectItem value="12">Grade 12</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                        <FormField name="content" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Question</FormLabel>
                                <FormControl><Textarea placeholder="Provide as much detail as possible..." rows={5} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="file" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Attach an image or PDF (optional)</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" asChild>
                                        <label htmlFor="file-upload" className="cursor-pointer">
                                            <Paperclip className="mr-2 h-4 w-4"/>
                                            Choose File
                                        </label>
                                    </Button>
                                    {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
                                </div>
                                <FormControl>
                                    <Input 
                                        id="file-upload"
                                        type="file" 
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        {...fileRef}
                                        onChange={e => {
                                            field.onChange(e.target.files);
                                            setFileName(e.target.files?.[0]?.name || null);
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Posting...' : 'Post Question'}
                            </Button>
                        </div>
                    </form>
                </Form>
             )}
        </DialogContent>
    </Dialog>
  );
}
