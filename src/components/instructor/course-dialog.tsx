
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, Youtube, Upload, Paperclip, Loader2, Link as LinkIcon, FileText, Replace, GripVertical } from 'lucide-react';
import { type Course, type VideoData, type Quiz } from '@/app/instructor/page';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';
import { cn } from '@/lib/utils';

const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(video.duration);
        };
        video.onerror = reject;
        video.src = window.URL.createObjectURL(file);
    });
};

const courseFormSchema = z.object({
  title: z.string().min(1, "Course title is required."),
  description: z.string().min(1, "Description is required."),
  subject: z.enum(['Mathematics', 'Physical Sciences', 'Life Sciences']),
  paper: z.enum(['P1', 'P2']),
  grade: z.enum(['10', '11', '12']),
  pricingModel: z.enum(['free', 'purchase']),
  price: z.number().nullable().optional(),
  thumbnail: z.any().optional(),
  videoUploads: z.array(z.object({
    title: z.string().min(1, "Video title is required."),
    source: z.enum(['upload', 'youtube']),
    file: z.any().optional(),
    fileDuration: z.number().optional(),
    youtubeUrl: z.string().optional(),
    notesFile: z.any().optional(),
    quizId: z.string().optional(),
  })).optional(),
}).refine(data => {
    if (data.pricingModel === 'purchase') {
        return data.price !== null && data.price !== undefined && data.price > 0;
    }
    return true;
}, {
    message: "Price is required for purchasable courses.",
    path: ["price"],
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

// Extend VideoData to include local file references for replacement
type EditableVideoData = VideoData & {
    newVideoFile?: File;
    newVideoDuration?: number;
    newYoutubeUrl?: string;
    newVideoSource?: 'upload' | 'youtube';
};

interface CourseDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedCourse: Course | null;
    quizzes: Quiz[];
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    submissionProgress: number;
}

export function CourseDialog({ isOpen, setIsOpen, selectedCourse, quizzes, onSubmit, isSubmitting, submissionProgress }: CourseDialogProps) {
    const [existingVideos, setExistingVideos] = useState<EditableVideoData[]>([]);
    const dragVideo = useRef<number | null>(null);
    const dragOverVideo = useRef<number | null>(null);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseFormSchema),
        defaultValues: {
            title: '',
            description: '',
            subject: 'Mathematics',
            paper: 'P1',
            grade: '12',
            pricingModel: 'free',
            price: null,
            videoUploads: [],
        },
    });

    const { fields, append, remove, control } = useFieldArray({
        control: form.control,
        name: 'videoUploads',
    });

    const pricingModel = form.watch('pricingModel');

    useEffect(() => {
        if (isOpen && selectedCourse) {
            form.reset({
                title: selectedCourse.title,
                description: selectedCourse.description,
                subject: selectedCourse.subject,
                paper: selectedCourse.paper,
                grade: selectedCourse.grade,
                pricingModel: selectedCourse.pricing.type,
                price: selectedCourse.pricing.price,
                videoUploads: [],
            });
            setExistingVideos(selectedCourse.videos || []);
        } else {
            form.reset({
                title: '',
                description: '',
                subject: 'Mathematics',
                paper: 'P1',
                grade: '12',
                pricingModel: 'free',
                price: null,
                videoUploads: [],
            });
            setExistingVideos([]);
        }
    }, [selectedCourse, form, isOpen]);

    const handleExistingVideoChange = (videoId: string, field: 'notesFile' | 'quizId' | 'newVideoFile' | 'newYoutubeUrl' | 'newVideoSource' | 'newVideoDuration', value: any) => {
        setExistingVideos(prevVideos => 
            prevVideos.map(video => 
                video.id === videoId ? { ...video, [field]: value } : video
            )
        );
    };

    const handleDeleteExistingVideo = (videoId: string) => {
        setExistingVideos(prevVideos => prevVideos.filter(video => video.id !== videoId));
    };

    const handleFormSubmit = (data: CourseFormValues) => {
        const submissionData = {
            ...data,
            existingVideos,
            originalVideos: selectedCourse?.videos || []
        };
        onSubmit(submissionData);
    };

    const handleDragSort = () => {
        if (dragVideo.current === null || dragOverVideo.current === null) return;
        const videosClone = [...existingVideos];
        const draggedItem = videosClone.splice(dragVideo.current, 1)[0];
        videosClone.splice(dragOverVideo.current, 0, draggedItem);
        setExistingVideos(videosClone);
        dragVideo.current = null;
        dragOverVideo.current = null;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{selectedCourse ? 'Edit' : 'Create New'} Course</DialogTitle>
                    <DialogDescription>Fill in the details for your course. You can add or edit videos below.</DialogDescription>
                </DialogHeader>
                {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center gap-4 py-16">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <h3 className="text-lg font-medium">Processing Course...</h3>
                        <p className="text-sm text-muted-foreground">Please wait while we upload and save your course.</p>
                        <div className="w-full max-w-sm space-y-2">
                             <Progress value={submissionProgress} />
                             <p className="text-center text-xs font-semibold">{Math.round(submissionProgress)}%</p>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="title" render={({ field }) => (
                                        <FormItem><FormLabel>Course Title</FormLabel><FormControl><Input placeholder="e.g. Grade 12 Calculus" {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="description" render={({ field }) => (
                                        <FormItem><FormLabel>Course Description</FormLabel><FormControl><Textarea placeholder="Describe what students will learn in this course." {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField control={form.control} name="thumbnail" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Course Thumbnail {selectedCourse ? '(Leave blank to keep current)' : ''}</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="image/*" onChange={e => field.onChange(e.target.files?.[0])} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <FormField control={form.control} name="subject" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Subject</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                                                        <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                                        <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                                                    </SelectContent>
                                                </Select><FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="paper" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Paper</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="P1">P1</SelectItem>
                                                        <SelectItem value="P2">P2</SelectItem>
                                                    </SelectContent>
                                                </Select><FormMessage />
                                            </FormItem>
                                        )}/>
                                        <FormField control={form.control} name="grade" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Grade</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="10">Grade 10</SelectItem>
                                                        <SelectItem value="11">Grade 11</SelectItem>
                                                        <SelectItem value="12">Grade 12</SelectItem>
                                                    </SelectContent>
                                                </Select><FormMessage />
                                            </FormItem>
                                        )}/>
                                    </div>
                                    <FormField control={form.control} name="pricingModel" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pricing Model</FormLabel>
                                            <FormControl>
                                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-2 gap-4">
                                                    <Label className="flex items-center gap-2 rounded-md border p-4 cursor-pointer has-[:checked]:border-primary"><RadioGroupItem value="free" /> Free</Label>
                                                    <Label className="flex items-center gap-2 rounded-md border p-4 cursor-pointer has-[:checked]:border-primary"><RadioGroupItem value="purchase" /> One-Time Purchase</Label>
                                                </RadioGroup>
                                            </FormControl><FormMessage />
                                        </FormItem>
                                    )}/>
                                    {pricingModel === 'purchase' && (
                                        <FormField control={form.control} name="price" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price (R)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="e.g. 499" value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} />
                                                </FormControl><FormMessage />
                                            </FormItem>
                                        )}/>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {selectedCourse && existingVideos.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-medium mb-4">Existing Videos</h3>
                                    <div className="space-y-4">
                                        {existingVideos.map((video, index) => (
                                            <div 
                                                key={video.id} 
                                                className="p-4 border rounded-lg space-y-3 bg-muted/30 relative flex items-start gap-2"
                                                draggable
                                                onDragStart={() => (dragVideo.current = index)}
                                                onDragEnter={() => (dragOverVideo.current = index)}
                                                onDragEnd={handleDragSort}
                                                onDragOver={(e) => e.preventDefault()}
                                            >
                                                <div className="cursor-move pt-1 text-muted-foreground">
                                                    <GripVertical className="h-5 w-5" />
                                                </div>
                                                <div className='flex-1'>
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-semibold pr-10">{video.title}</p>
                                                        <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-7 w-7" onClick={() => handleDeleteExistingVideo(video.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                                    </div>
                                                    
                                                    {video.newVideoSource ? (
                                                        <div className='space-y-2'>
                                                            {video.newVideoSource === 'upload' ? (
                                                                <FormItem>
                                                                    <FormLabel>New Video File</FormLabel>
                                                                    <FormControl><Input type="file" accept="video/*" onChange={async (e) => {
                                                                        const file = e.target.files?.[0];
                                                                        handleExistingVideoChange(video.id, 'newVideoFile', file);
                                                                        if (file) {
                                                                            const duration = await getVideoDuration(file);
                                                                            handleExistingVideoChange(video.id, 'newVideoDuration', duration);
                                                                        }
                                                                    }} /></FormControl>
                                                                </FormItem>
                                                            ) : (
                                                                <FormItem>
                                                                    <FormLabel>New YouTube URL</FormLabel>
                                                                    <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." onChange={e => handleExistingVideoChange(video.id, 'newYoutubeUrl', e.target.value)} /></FormControl>
                                                                </FormItem>
                                                            )}
                                                            <Button type="button" size="sm" variant="ghost" onClick={() => handleExistingVideoChange(video.id, 'newVideoSource', undefined)}>Cancel Replace</Button>
                                                        </div>
                                                    ) : (
                                                        <Button type="button" size="sm" variant="outline" onClick={() => handleExistingVideoChange(video.id, 'newVideoSource', video.url.includes('youtube') ? 'youtube' : 'upload')}>
                                                            <Replace className="mr-2 h-4 w-4" /> Replace Video
                                                        </Button>
                                                    )}

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t mt-3">
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-sm"><Paperclip className="h-4 w-4"/> Lesson Notes</FormLabel>
                                                            {video.notesUrl && (
                                                                <div className="flex items-center gap-2 text-xs">
                                                                    <FileText className="h-4 w-4 text-primary"/>
                                                                    <a href={video.notesUrl} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{video.notesUrl.split('%2F').pop()?.split('?')[0]}</a>
                                                                </div>
                                                            )}
                                                            <FormControl>
                                                                <Input type="file" accept=".pdf" className="text-xs" onChange={e => handleExistingVideoChange(video.id, 'notesFile', e.target.files?.[0])} />
                                                            </FormControl>
                                                        </FormItem>
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-sm"><LinkIcon className="h-4 w-4"/> Linked Quiz</FormLabel>
                                                            <Select onValueChange={(value) => handleExistingVideoChange(video.id, 'quizId', value)} defaultValue={video.quizId || undefined}>
                                                                <FormControl><SelectTrigger><SelectValue placeholder="Select a quiz to link..." /></SelectTrigger></FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="none">No Quiz</SelectItem>
                                                                    {quizzes.map(quiz => <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        </FormItem>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator className="my-6" />
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-medium mb-4">Add New Videos</h3>
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="p-4 border rounded-lg space-y-4 relative">
                                            <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            <FormField control={form.control} name={`videoUploads.${index}.title`} render={({ field }) => (
                                                <FormItem><FormLabel>Video Title</FormLabel><FormControl><Input placeholder={`Lesson ${existingVideos.length + index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>
                                            )}/>
                                            <Controller control={form.control} name={`videoUploads.${index}.source`} render={({ field: { onChange, value } }) => (
                                                <RadioGroup onValueChange={onChange} value={value} className="grid grid-cols-2 gap-2">
                                                    <Label className="flex items-center justify-center gap-2 rounded-md border p-3 cursor-pointer has-[:checked]:border-primary text-sm"><RadioGroupItem value="upload" /><Upload className="h-4 w-4 mr-1"/>Upload File</Label>
                                                    <Label className="flex items-center justify-center gap-2 rounded-md border p-3 cursor-pointer has-[:checked]:border-primary text-sm"><RadioGroupItem value="youtube" /><Youtube className="h-4 w-4 mr-1"/>YouTube Link</Label>
                                                </RadioGroup>
                                            )}/>
                                            
                                            {form.watch(`videoUploads.${index}.source`) === 'upload' && (
                                                <FormField control={control} name={`videoUploads.${index}.file`} render={({ field: { onChange } }) => (
                                                    <FormItem><FormLabel>Video File</FormLabel><FormControl><Input type="file" accept="video/*" onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        onChange(file);
                                                        if (file) {
                                                            const duration = await getVideoDuration(file);
                                                            form.setValue(`videoUploads.${index}.fileDuration`, duration);
                                                        }
                                                    }} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            )}
                                            {form.watch(`videoUploads.${index}.source`) === 'youtube' && (
                                                <FormField control={form.control} name={`videoUploads.${index}.youtubeUrl`} render={({ field }) => (
                                                    <FormItem><FormLabel>YouTube URL</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>
                                                )}/>
                                            )}
                                            <FormField control={form.control} name={`videoUploads.${index}.notesFile`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2"><Paperclip className="h-4 w-4"/> Lesson Notes (Optional PDF)</FormLabel>
                                                    <FormControl><Input type="file" accept=".pdf" onChange={e => field.onChange(e.target.files?.[0])} /></FormControl><FormMessage />
                                                </FormItem>
                                            )}/>
                                            <FormField control={form.control} name={`videoUploads.${index}.quizId`} render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Link Quiz (Optional)</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a quiz to link..."/></SelectTrigger></FormControl>
                                                        <SelectContent>
                                                            {quizzes.map(quiz => <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}/>
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" onClick={() => append({ title: '', source: 'upload', file: undefined, youtubeUrl: '', notesFile: undefined, quizId: undefined })}>
                                        <PlusCircle className="mr-2" />Add Video
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button type="submit">{selectedCourse ? 'Save Changes' : 'Create Course'}</Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
