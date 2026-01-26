'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import withAuth from '@/components/with-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, Lightbulb, CheckCircle, XCircle, Check, Award, ChevronLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Option = { text: string };
type Question = {
  type: 'multiple-choice' | 'short-answer';
  questionText: string;
  options?: Option[];
  correctAnswer: string;
};
type Quiz = {
  id: string;
  title: string;
  subject: string;
  grade: string;
  questions: Question[];
};
type SubmissionHistory = {
    id: string;
    submittedAt: Timestamp;
    result: {
        overallScore: number;
    };
}

const generateFormSchema = (questions: Question[]) => {
  const schemaObject = questions.reduce((acc, _, index) => {
    acc[`answer-${index}`] = z.string().min(1, 'Please provide an answer.');
    return acc;
  }, {} as Record<string, z.ZodString>);
  return z.object(schemaObject);
};

function QuizViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const quizId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [hint, setHint] = useState<{ questionIndex: number; text: string } | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState<SubmissionHistory[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const formSchema = quiz ? generateFormSchema(quiz.questions) : z.object({});
  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange'
  });
  
  const answers = form.watch();
  const answeredQuestionsCount = Object.values(answers).filter(Boolean).length;
  const progress = quiz ? (answeredQuestionsCount / quiz.questions.length) * 100 : 0;

  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const firestore = getFirestore(app);

    const fetchQuizAndHistory = async (currentUser: User) => {
      if (!quizId) return;
      setLoading(true);
      
      // Fetch quiz data
      const quizRef = doc(firestore, 'quizzes', quizId);
      const docSnap = await getDoc(quizRef);
      if (docSnap.exists()) {
        setQuiz({ id: docSnap.id, ...docSnap.data() } as Quiz);
      }
      
      // Fetch submission history
      const submissionsQuery = query(
        collection(firestore, 'quizSubmissions'),
        where('quizId', '==', quizId),
        where('studentId', '==', currentUser.uid),
        orderBy('submittedAt', 'desc')
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      // const history = submissionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubmissionHistory[];
      // setSubmissionHistory(history);

      setLoading(false);
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser)
        if (currentUser) {
            fetchQuizAndHistory(currentUser)
        } else {
            setLoading(false)
        }
    });
    
    return () => unsubscribe();
  }, [quizId]);

  const handleGetHint = async (questionIndex: number, questionText: string) => {
    setIsHintLoading(true);
    setHint({ questionIndex, text: 'Thinking...' });
    try {
      // AI functionality removed. You can replace this with a static hint system.
      // For now, we'll show a "feature not available" message.
      setHint({ questionIndex, text: "The AI hint feature is currently unavailable." });
    } catch (error) {
      console.error('Error getting hint:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not get a hint at this time.' });
      setHint(null);
    } finally {
      setIsHintLoading(false);
    }
  };

  const onSubmit = async (data: Record<string, string>) => {
    if (!quiz || !user) return;
    setIsGrading(true);

    toast({
        title: "Submission Received",
        description: "AI grading is currently disabled. We have received your submission.",
    });

    setIsGrading(false);
  };

  if (loading) {
    return (
      <div className="flex h-full gap-8">
        <div className="w-1/4 hidden lg:block"><Skeleton className="h-full w-full" /></div>
        <div className="flex-1"><Skeleton className="h-full w-full" /></div>
      </div>
    );
  }

  if (!quiz) {
    return <div>Quiz not found.</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <div className="flex flex-1 gap-8 h-full">
        {/* Left Panel - Navigation */}
        <Card className="w-1/4 hidden lg:flex flex-col">
            <CardHeader>
                <CardTitle className="text-xl">{quiz.title}</CardTitle>
                <CardDescription>{quiz.subject} - Grade {quiz.grade}</CardDescription>
                 {submissionHistory.length > 0 && (
                    <Alert className="mt-2 text-sm">
                        <RefreshCw className="h-4 w-4" />
                        <AlertTitle>Welcome Back!</AlertTitle>
                        <AlertDescription>
                            This is attempt #{submissionHistory.length + 1}. Your best score is {Math.max(...submissionHistory.map(s => s.result.overallScore)) || 0}%.
                        </AlertDescription>
                    </Alert>
                )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{answeredQuestionsCount} / {quiz.questions.length}</span>
                    </div>
                    <Progress value={progress} />
                </div>
                <Separator />
                <div className="space-y-2">
                    <Label>Questions</Label>
                    <div className="grid grid-cols-5 gap-2">
                        {quiz.questions.map((_, index) => (
                            <Button
                                key={index}
                                variant={currentQuestionIndex === index ? 'default' : (answers[`answer-${index}`] ? 'secondary' : 'outline')}
                                size="icon"
                                onClick={() => setCurrentQuestionIndex(index)}
                                className="h-9 w-9"
                            >
                                {index + 1}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardContent>
             <CardFooter>
                 <Button variant="outline" onClick={() => router.push('/instructor?tab=quizzes')}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> End Quiz
                 </Button>
            </CardFooter>
        </Card>

        {/* Right Panel - Question */}
        <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col">
                <CardHeader>
                    <CardTitle className="text-2xl">Question {currentQuestionIndex + 1} of {quiz.questions.length}</CardTitle>
                </CardHeader>
                 <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
                    <CardContent className="flex-1 space-y-6">
                        <div className="prose dark:prose-invert max-w-none text-xl">
                            <BlockMath math={currentQuestion.questionText} />
                        </div>
                         <Button type="button" variant="link" size="sm" onClick={() => handleGetHint(currentQuestionIndex, currentQuestion.questionText)} disabled={isHintLoading} className="p-0 h-auto">
                            <Lightbulb className="mr-2 h-4 w-4" /> I'm stuck, get a hint
                        </Button>

                        {hint?.questionIndex === currentQuestionIndex && (
                          <Alert className={isHintLoading ? 'animate-pulse' : ''}>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Hint</AlertTitle>
                            <AlertDescription>{hint.text}</AlertDescription>
                          </Alert>
                        )}
                        
                        <Separator />

                        <Controller
                          name={`answer-${currentQuestionIndex}`}
                          control={form.control}
                          render={({ field }) => (
                            <>
                              {currentQuestion.type === 'multiple-choice' ? (
                                <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {currentQuestion.options?.map((opt, optIndex) => (
                                    <Label key={optIndex} htmlFor={`q${currentQuestionIndex}-opt${optIndex}`} 
                                        className={cn(
                                            "flex items-center gap-4 rounded-md border p-4 cursor-pointer transition-all hover:border-primary",
                                            field.value === opt.text && "border-primary ring-2 ring-primary"
                                        )}>
                                      <RadioGroupItem value={opt.text} id={`q${currentQuestionIndex}-opt${optIndex}`} className="h-5 w-5"/>
                                      <span className="font-normal text-base"><InlineMath math={opt.text} /></span>
                                      <span className="ml-auto font-semibold text-muted-foreground">{'ABCD'[optIndex]}</span>
                                    </Label>
                                  ))}
                                </RadioGroup>
                              ) : (
                                <div>
                                    <Label className="mb-2 block">Your Answer</Label>
                                    <Input placeholder="Type your answer here..." {...field} className="text-lg h-12" />
                                </div>
                              )}
                            </>
                          )}
                        />
                        <p className="text-sm font-medium text-destructive">{form.formState.errors[`answer-${currentQuestionIndex}`]?.message}</p>

                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-between items-center">
                        <Button type="button" variant="outline" onClick={() => setCurrentQuestionIndex(p => p - 1)} disabled={currentQuestionIndex === 0}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>
                        {currentQuestionIndex < quiz.questions.length - 1 ? (
                            <Button type="button" onClick={() => setCurrentQuestionIndex(p => p + 1)}>
                                Next Question <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                             <Button type="submit" size="lg" disabled={isGrading || answeredQuestionsCount < quiz.questions.length}>
                                {isGrading ? 'Submitting...' : 'Submit Quiz'}
                             </Button>
                        )}
                    </CardFooter>
                </form>
            </Card>
        </div>
    </div>
  );
}

export default withAuth(QuizViewerPage, ['student', 'instructor', 'admin']);
