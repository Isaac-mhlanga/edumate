
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Paperclip } from 'lucide-react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z.string().optional(),
  enquiry: z.string().min(10, 'Enquiry must be at least 10 characters long.'),
  file: z.any().optional(),
});

type EnquiryFormValues = z.infer<typeof formSchema>;

interface EnquiryDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function EnquiryDialog({ isOpen, setIsOpen }: EnquiryDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const form = useForm<EnquiryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '', phone: '', enquiry: '', file: undefined },
  });

  const onSubmit = async (data: EnquiryFormValues) => {
    setIsSubmitting(true);
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    try {
      let fileUrl: string | null = null;
      const file = data.file?.[0];
      if (file) {
        const fileRef = ref(storage, `enquiries/${Date.now()}-${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }
      
      const { file: _, ...enquiryData } = data;

      await addDoc(collection(firestore, 'enquiries'), {
        ...enquiryData,
        fileUrl,
        status: 'New',
        assigneeId: null,
        assigneeName: null,
        createdAt: serverTimestamp(),
      });

      toast({
        title: 'Enquiry Submitted!',
        description: "Thank you! Our team will get back to you shortly.",
      });
      form.reset();
      setFileName(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Could not submit your enquiry. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const fileRef = form.register("file");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Submit an Enquiry</DialogTitle>
          <DialogDescription>
            Have a question about our varsity and college assignment services? Fill out the form below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input placeholder="you@example.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField name="phone" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl><Input placeholder="+27 12 345 6789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField name="enquiry" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Your Enquiry</FormLabel>
                <FormControl><Textarea placeholder="Please describe your project or assignment requirements..." rows={5} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField name="file" control={form.control} render={({ field }) => (
                <FormItem>
                    <FormLabel>Attach a File (Optional)</FormLabel>
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" asChild>
                            <label htmlFor="enquiry-file-upload" className="cursor-pointer">
                                <Paperclip className="mr-2 h-4 w-4"/>
                                Choose File
                            </label>
                        </Button>
                        {fileName && <span className="text-sm text-muted-foreground">{fileName}</span>}
                    </div>
                    <FormControl>
                        <Input 
                            id="enquiry-file-upload"
                            type="file" 
                            className="hidden"
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
                {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
