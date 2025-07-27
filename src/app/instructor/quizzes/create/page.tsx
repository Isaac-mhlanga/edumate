
'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PlusCircle, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import withAuth from '@/components/with-auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, type User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import Link from 'next/link';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required.'),
});

const questionSchema = z.object({
  type: z.enum(['multiple-choice', 'short-answer']),
  questionText: z.string().min(1, 'Question text is required.'),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().min(1, 'A correct answer must be provided.'),
});

const quizFormSchema = z.object({
  title: z.string().min(1, 'Quiz title is required.'),
  subject: z.enum(['Maths', 'Physical Sciences', 'Life Sciences']),
  grade: z.enum(['10', '11', '12']),
  questions: z.array(questionSchema).min(1, 'At least one question is required.'),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

function CreateQuizPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: '',
      subject: 'Maths',
      grade: '12',
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const addQuestion = (type: 'multiple-choice' | 'short-answer') => {
    if (type === 'multiple-choice') {
      append({
        type: 'multiple-choice',
        questionText: '',
        options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
        correctAnswer: '',
      });
    } else {
      append({
        type: 'short-answer',
        questionText: '',
        correctAnswer: '',
      });
    }
  };

  const onSubmit = async (data: QuizFormValues) => {
    const user = auth.currentUser;
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a quiz.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, 'quizzes'), {
        ...data,
        instructorId: user.uid,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Quiz Created!', description: `The quiz "${data.title}" has been successfully saved.` });
      router.push('/instructor?tab=quizzes');
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to create quiz. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" asChild>
          <Link href="/instructor?tab=quizzes">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quizzes
          </Link>
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Create New Quiz</CardTitle>
              <CardDescription>Build a new quiz for your students. Add questions and define the correct answers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl><Input placeholder="e.g., Algebra Basics Quiz" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="subject" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Maths">Maths</SelectItem>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
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
            </CardContent>
          </Card>

          {fields.map((field, index) => (
            <Card key={field.id}>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name={`questions.${index}.questionText`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question Text</FormLabel>
                      <FormControl>
                        <Textarea placeholder="What is 2 + 2? For formulas, use LaTeX, e.g., \\frac{a}{b}" {...field} />
                      </FormControl>
                       <div className="text-sm text-muted-foreground p-2 bg-muted rounded-md">
                          <strong>Preview: </strong><InlineMath math={field.value || "Your formula preview..."} />
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {field.type === 'multiple-choice' ? (
                  <div className="space-y-4">
                    <FormLabel>Options (select the correct one)</FormLabel>
                    <Controller
                        name={`questions.${index}.correctAnswer`}
                        control={form.control}
                        render={({ field: radioField }) => (
                            <RadioGroup onValueChange={radioField.onChange} value={radioField.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, optionIndex) => (
                                    <FormField
                                        key={optionIndex}
                                        control={form.control}
                                        name={`questions.${index}.options.${optionIndex}.text`}
                                        render={({ field: textField }) => (
                                            <FormItem className="flex items-center gap-2 space-y-0">
                                                <FormControl>
                                                   <RadioGroupItem value={textField.value} id={`${field.id}-option-${optionIndex}`} />
                                                </FormControl>
                                                <Input placeholder={`Option ${optionIndex + 1}`} {...textField} />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </RadioGroup>
                        )}
                    />
                     <FormMessage>{form.formState.errors.questions?.[index]?.correctAnswer?.message}</FormMessage>
                  </div>
                ) : (
                  <FormField
                    control={form.control}
                    name={`questions.${index}.correctAnswer`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correct Answer</FormLabel>
                        <FormControl><Input placeholder="Enter the correct answer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="pt-6 flex flex-col sm:flex-row gap-4">
              <Button type="button" variant="outline" className="w-full" onClick={() => addQuestion('multiple-choice')}>
                <PlusCircle className="mr-2" /> Add Multiple Choice
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => addQuestion('short-answer')}>
                <PlusCircle className="mr-2" /> Add Short Answer
              </Button>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Quiz'}
                </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}

export default withAuth(CreateQuizPage, ['instructor']);

    