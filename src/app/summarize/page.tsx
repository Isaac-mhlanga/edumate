'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { summarizeLesson, SummarizeLessonOutput } from '@/ai/flows/summarize-lesson';

const formSchema = z.object({
    lessonTitle: z.string().min(1, 'Lesson title is required.'),
    lessonDescription: z.string(),
    transcript: z.string().min(1, 'Transcript is required.'),
    courseContext: z.string(),
    studentPreviousActivity: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

const mockData = {
    lessonTitle: "Introduction to Quantum Mechanics",
    lessonDescription: "A beginner-friendly introduction to the core concepts of quantum mechanics, including wave-particle duality and the uncertainty principle.",
    transcript: "Welcome to our first lesson on quantum mechanics. Today, we'll explore the fascinating world of particles at the subatomic level. The key takeaway is that particles can behave as both waves and particles, a concept known as wave-particle duality. This has profound implications. Another fundamental concept is Heisenberg's Uncertainty Principle, which states that we cannot simultaneously know the exact position and momentum of a particle. These ideas form the foundation of modern physics and have led to technologies like lasers and semiconductors. In the next lesson, we will dive deeper into the Schrödinger equation.",
    courseContext: "Grade 12 Physical Sciences - Modern Physics Module",
    studentPreviousActivity: "Completed lessons on classical mechanics and electromagnetism. Showed interest in wave optics."
};

export default function SummarizePage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState<SummarizeLessonOutput | null>(null);
    const { toast } = useToast();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ...mockData
        },
    });

    const onSubmit = async (values: FormValues) => {
        setIsLoading(true);
        setResult(null);
        try {
            const summaryResult = await summarizeLesson(values);
            setResult(summaryResult);
        } catch (error) {
            console.error("Summarization error:", error);
            toast({
                title: "Error",
                description: "Failed to generate summary. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        AI Lesson Summarizer
                    </h1>
                    <p className="text-muted-foreground">
                        Generate a concise summary of any video lesson using AI.
                    </p>
                </div>
                
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <Card className="shadow-md rounded-xl">
                        <CardHeader>
                            <CardTitle>Lesson Details</CardTitle>
                            <CardDescription>Provide the lesson information to be summarized. We've pre-filled it with an example.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="lessonTitle"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Lesson Title</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="transcript"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Transcript</FormLabel>
                                                <FormControl>
                                                    <Textarea {...field} rows={8} />
                                                </FormControl>
                                                 <FormDescription>
                                                    The full transcript of the video lesson.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" disabled={isLoading} className="w-full">
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                        ) : (
                                            <><Wand2 className="mr-2 h-4 w-4" /> Generate Summary</>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                     <Card className="shadow-md rounded-xl sticky top-24">
                        <CardHeader>
                            <CardTitle>Generated Summary</CardTitle>
                            <CardDescription>The AI-generated summary will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent className="min-h-[24rem] flex items-center justify-center">
                            {isLoading && (
                                <div className="text-center text-muted-foreground">
                                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                                    <p>Summarizing... please wait.</p>
                                </div>
                            )}
                            {!isLoading && !result && (
                                <div className="text-center text-muted-foreground">
                                    <Wand2 className="h-10 w-10 mx-auto mb-2" />
                                    <p>Your summary is just a click away.</p>
                                </div>
                            )}
                            {result && (
                                <div className="space-y-4">
                                    <p className="text-base leading-relaxed">{result.summary}</p>
                                    <p className="text-sm text-muted-foreground pt-4 border-t">
                                        <strong>Progress Note:</strong> {result.progress}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
