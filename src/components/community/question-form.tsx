
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, Paperclip } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  content: z.string().min(10, 'Question must be at least 10 characters.'),
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
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      toast({ variant: 'destructive', title: 'Not authenticated', description: 'You must be logged in to ask a question.' });
      setIsSubmitting(false);
      return;
    }

    try {
      const firestore = getFirestore();
      const storage = getStorage();
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
        fileUrl,
        fileType,
        createdAt: serverTimestamp(),
        commentCount: 0,
        likeCount: 0,
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
            <div className="p-4">
                <Button className="w-full">
                    <Send className="mr-2 h-4 w-4"/>
                    Ask a Question
                </Button>
            </div>
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
                            Post Question
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    </Dialog>
  );
}
