
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(10, 'Question must be at least 10 characters.'),
  subject: z.enum(['Mathematics', 'Physical Sciences', 'Life Sciences']),
  grade: z.enum(['10', '11', '12']),
  file: z.instanceof(File).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      file: undefined,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const user = auth.currentUser;

    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to ask a question.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const firestore = getFirestore(app);
      const storage = getStorage(app);
      let fileUrl: string | undefined;
      let fileType: 'image' | 'pdf' | undefined;

      if (data.file) {
        const fileRef = ref(storage, `questions/${user.uid}/${Date.now()}-${data.file.name}`);
        await uploadBytes(fileRef, data.file);
        fileUrl = await getDownloadURL(fileRef);
        fileType = data.file.type.startsWith('image/') ? 'image' : 'pdf';
      }

      await addDoc(collection(firestore, 'questions'), {
        studentId: user.uid,
        studentName: user.displayName || 'Anonymous',
        studentAvatar: user.photoURL,
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
            </DialogHeader>
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField name="title" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl><Input placeholder="What's your question about?" {...field} /></FormControl>
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
                            <FormLabel>Question</FormLabel>
                            <FormControl><Textarea placeholder="Describe your question in detail..." rows={5} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="file" control={form.control} render={({ field }) => (
                        <FormItem>
                             <FormLabel>Attach a file (optional)</FormLabel>
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
                                        const file = e.target.files?.[0];
                                        field.onChange(file);
                                        setFileName(file ? file.name : null);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isSubmitting ? 'Posting...' : 'Post Question'}
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
