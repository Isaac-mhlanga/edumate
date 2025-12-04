
'use client';

import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarLucide } from "lucide-react";
import { type SubmittedAssignment } from '@/app/dashboard/page';

const assignmentFormSchema = z.object({
  title: z.string().min(1, "Assignment title is required."),
  course: z.string().min(1, "Course name is required."),
  dueDate: z.date({ required_error: "A due date is required." }),
  instructions: z.string().optional(),
  file: z.instanceof(File).refine(file => file.name.endsWith('.zip'), 'File must be a .zip archive.').optional(),
});
type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedAssignment: SubmittedAssignment | null;
    onSuccess: () => void;
}

export function AssignmentDialog({ isOpen, setIsOpen, selectedAssignment, onSuccess }: AssignmentDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    
    const form = useForm<AssignmentFormValues>({
      resolver: zodResolver(assignmentFormSchema),
      defaultValues: {
        title: '',
        course: '',
        instructions: '',
        file: undefined,
      },
    });

    React.useEffect(() => {
        if (selectedAssignment) {
            form.reset({
                title: selectedAssignment.title,
                course: selectedAssignment.course,
                dueDate: selectedAssignment.dueDate?.toDate(),
                instructions: selectedAssignment.instructions || '',
                file: undefined,
            });
             form.clearErrors();
        } else {
            form.reset({
                title: '', course: '', dueDate: undefined, instructions: '', file: undefined,
            });
             form.clearErrors();
        }
    }, [selectedAssignment, form, isOpen]);
    
    const handleAssignmentSubmit = async (data: AssignmentFormValues) => {
        setIsSubmitting(true);
        const app = getApps().length > 0 ? getApp() : initializeApp({});
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const storage = getStorage(app);
        
        const user = auth.currentUser;
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to submit an assignment.' });
            setIsSubmitting(false);
            return;
        }

        try {
            let downloadURL = selectedAssignment?.fileUrl;
            if (data.file) {
                 const storageRef = ref(storage, `assignments/${user.uid}/${Date.now()}-${data.file.name}`);
                 const uploadResult = await uploadBytes(storageRef, data.file);
                 downloadURL = await getDownloadURL(uploadResult.ref);
            }

            const assignmentData = {
                studentId: user.uid,
                studentName: user.displayName || 'Anonymous',
                title: data.title,
                course: data.course,
                instructions: data.instructions,
                dueDate: Timestamp.fromDate(data.dueDate),
                fileUrl: downloadURL!,
                status: 'Pending Review' as const,
                price: selectedAssignment ? selectedAssignment.price : null,
                solutionUrl: selectedAssignment ? selectedAssignment.solutionUrl : null,
            };

            if (selectedAssignment) {
                const assignmentRef = doc(firestore, 'assignments', selectedAssignment.id);
                await updateDoc(assignmentRef, { ...assignmentData, submittedAt: selectedAssignment.submittedAt });
                toast({ title: 'Success', description: 'Your assignment has been updated.' });
            } else { 
                await addDoc(collection(firestore, 'assignments'), { ...assignmentData, submittedAt: serverTimestamp() });
                toast({ title: 'Success', description: 'Your assignment has been submitted successfully.' });
            }
            onSuccess();
        } catch (error) {
            console.error("Error submitting assignment: ", error);
            toast({ variant: 'destructive', title: 'Submission Failed', description: 'There was an error submitting your assignment. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{selectedAssignment ? 'Edit' : 'Upload New'} Assignment</DialogTitle>
                    <DialogDescription>Fill in the details and upload your assignment file (must be a .zip).</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleAssignmentSubmit)} className="space-y-4 py-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Assignment Title</FormLabel>
                                <FormControl><Input placeholder="e.g. Chapter 5 Problem Set" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="course" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Course Name</FormLabel>
                                <FormControl><Input placeholder="e.g. Grade 12 Maths" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="dueDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Due Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                <CalendarLucide className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date() || date < new Date("1900-01-01")} initialFocus />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="instructions" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Extra Instructions</FormLabel>
                                <FormControl><Textarea placeholder="Any specific notes for the instructor?" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="file" render={({ field: { onChange, value, ...rest } }) => (
                            <FormItem>
                                <FormLabel>Assignment File (.zip) {selectedAssignment ? '(Optional: leave blank to keep existing file)' : ''}</FormLabel>
                                <FormControl><Input type="file" accept=".zip" onChange={(e) => onChange(e.target.files?.[0])} {...rest} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (selectedAssignment ? 'Updating...' : 'Submitting...') : (selectedAssignment ? 'Update Assignment' : 'Submit Assignment')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
