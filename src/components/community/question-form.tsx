
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
import { Loader2, Send, Paperclip, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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
  audience: z.enum(['High School', 'Varsity/College'], { required_error: "Please select an audience."}),
  subject: z.enum(['Mathematics', 'Physical Sciences', 'Life Sciences']).optional(),
  grade: z.enum(['10', '11', '12']).optional(),
  module: z.string().optional(),
  file: z.any().optional(),
  name: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email." }).optional(),
}).superRefine((data, ctx) => {
    if (data.audience === 'High School') {
        if (!data.subject) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Subject is required for High School questions.",
                path: ['subject'],
            });
        }
        if (!data.grade) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Grade is required for High School questions.",
                path: ['grade'],
            });
        }
    }
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
      name: '',
      email: '',
      module: '',
    },
  });

  const audience = form.watch('audience');

  const onSubmit = async (data: FormValues) => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const currentUser = auth.currentUser;

    if (!currentUser) {
        if (!data.name) {
            form.setError("name", { type: "manual", message: "Name is required to post as a guest." });
        }
        if (!data.email) {
            form.setError("email", { type: "manual", message: "Email is required to post as a guest." });
        }
        if (!data.name || !data.email) {
            return;
        }
    }
    
    setIsSubmitting(true);

    try {
      const firestore = getFirestore(app);
      const storage = getStorage(app);
      let fileUrl: string | undefined;
      let fileType: 'image' | 'pdf' | undefined;
      
      const file = data.file?.[0];
      if (file) {
        const fileRef = ref(storage, `questions/${currentUser?.uid || 'anonymous'}/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
        fileType = file.type.startsWith('image/') ? 'image' : 'pdf';
      }

      await addDoc(collection(firestore, 'questions'), {
        studentId: currentUser?.uid || 'anonymous',
        studentName: currentUser?.displayName || data.name,
        studentAvatar: currentUser?.photoURL || null,
        title: data.title,
        content: data.content,
        audience: data.audience,
        subject: data.subject || null,
        grade: data.grade || null,
        module: data.module || null,
        fileUrl,
        fileType,
        createdAt: serverTimestamp(),
        commentCount: 0,
        likeCount: 0,
        likedBy: [],
        dislikeCount: 0,
        dislikedBy: [],
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
                <Plus className="mr-2 h-4 w-4"/>
                Start a new topic
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
                <DialogTitle>Ask the Community</DialogTitle>
                <DialogDescription>Share your question with fellow learners and educators.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {!user && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                             <FormField name="name" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Name</FormLabel>
                                    <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="email" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Email</FormLabel>
                                    <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    )}
                    <FormField name="title" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Question Title</FormLabel>
                            <FormControl><Input placeholder="e.g., How to solve for x in this equation?" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                     <FormField
                        control={form.control}
                        name="audience"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                            <FormLabel>This question is for...</FormLabel>
                            <FormControl>
                                <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-4"
                                >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="High School" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    High School
                                    </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormControl>
                                    <RadioGroupItem value="Varsity/College" />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                    Varsity/College
                                    </FormLabel>
                                </FormItem>
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                    {audience === 'High School' && (
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
                    )}
                    
                    {audience === 'Varsity/College' && (
                         <FormField
                            control={form.control}
                            name="module"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Code/Name (Optional)</FormLabel>
                                    <FormControl><Input placeholder="e.g., COS101, Computer Science 1A" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

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
        </DialogContent>
    </Dialog>
  );
}

    