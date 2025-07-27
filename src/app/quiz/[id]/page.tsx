
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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
import { ArrowLeft, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clarifyQuestion } from '@/ai/flows/clarify-question';
import { gradeQuiz, GradeQuizInput, GradeQuizOutput } from '@/ai/flows/grade-quiz';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

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
  const [quizResult, setQuizResult] = useState<GradeQuizOutput | null>(null);

  const formSchema = quiz ? generateFormSchema(quiz.questions) : z.object({});
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, setUser);

    const fetchQuiz = async () => {
      if (!quizId) return;
      setLoading(true);
      const firestore = getFirestore(app);
      const quizRef = doc(firestore, 'quizzes', quizId);
      const docSnap = await getDoc(quizRef);
      if (docSnap.exists()) {
        setQuiz({ id: docSnap.id, ...docSnap.data() } as Quiz);
      }
      setLoading(false);
    };

    fetchQuiz();
    return () => unsubscribe();
  }, [quizId]);

  const handleGetHint = async (questionIndex: number, questionText: string) => {
    setIsHintLoading(true);
    setHint({ questionIndex, text: 'Thinking...' });
    try {
      const response = await clarifyQuestion({ question: questionText });
      setHint({ questionIndex, text: response.clarification });
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

    const submission: GradeQuizInput = {
      questionsAndAnswers: quiz.questions.map((q, i) => ({
        question: q.questionText,
        correctAnswer: q.correctAnswer,
        studentAnswer: data[`answer-${i}`],
      })),
    };

    try {
      const result = await gradeQuiz(submission);
      setQuizResult(result);
      
      // Save result to Firestore
      const firestore = getFirestore();
      await addDoc(collection(firestore, 'quizSubmissions'), {
          quizId,
          quizTitle: quiz.title,
          studentId: user.uid,
          studentEmail: user.email,
          submission,
          result,
          submittedAt: serverTimestamp(),
      });

      toast({ title: 'Quiz Graded!', description: `Your score is ${result.overallScore}%.` });

    } catch (error) {
      console.error('Error grading quiz:', error);
      toast({ variant: 'destructive', title: 'Grading Failed', description: 'There was an error grading your quiz.' });
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Card><CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (!quiz) {
    return <div>Quiz not found.</div>;
  }

  if (quizResult) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Quiz Results: {quiz.title}</CardTitle>
            <CardDescription className="text-lg">Overall Score: <span className="font-bold text-primary">{quizResult.overallScore}%</span></CardDescription>
            <p className="text-muted-foreground">{quizResult.summary}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {quizResult.gradedQuestions.map((gradedQ, index) => (
              <Card key={index} className={gradedQ.isCorrect ? 'border-green-500' : 'border-red-500'}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <p className="font-semibold"><InlineMath math={gradedQ.question} /></p>
                        {gradedQ.isCorrect ? <CheckCircle className="text-green-500" /> : <XCircle className="text-red-500" />}
                    </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">Your answer: <span className="font-medium">{submission.questionsAndAnswers[index].studentAnswer}</span></p>
                  <p className="text-sm mt-2">Feedback: <span className="text-muted-foreground">{gradedQ.feedback}</span></p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="mr-2" /> Back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{quiz.title}</CardTitle>
          <CardDescription>{quiz.subject} - Grade {quiz.grade}</CardDescription>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {quiz.questions.map((q, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <Label className="text-lg font-semibold flex justify-between items-center">
                  <span>Question {index + 1}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleGetHint(index, q.questionText)} disabled={isHintLoading}>
                    <Lightbulb className="mr-2 h-4 w-4" /> Get a hint
                  </Button>
                </Label>
                <div className="prose dark:prose-invert">
                    <BlockMath math={q.questionText} />
                </div>

                {hint?.questionIndex === index && (
                  <Alert className={isHintLoading ? 'animate-pulse' : ''}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Hint</AlertTitle>
                    <AlertDescription>{hint.text}</AlertDescription>
                  </Alert>
                )}

                <Controller
                  name={`answer-${index}`}
                  control={form.control}
                  render={({ field }) => (
                    <>
                      {q.type === 'multiple-choice' ? (
                        <RadioGroup onValueChange={field.onChange} value={field.value}>
                          {q.options?.map((opt, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={opt.text} id={`q${index}-opt${optIndex}`} />
                              <Label htmlFor={`q${index}-opt${optIndex}`} className="font-normal"><InlineMath math={opt.text} /></Label>
                            </div>
                          ))}
                        </RadioGroup>
                      ) : (
                        <Input placeholder="Your answer..." {...field} />
                      )}
                    </>
                  )}
                />
                <p className="text-sm font-medium text-destructive">{form.formState.errors[`answer-${index}`]?.message}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button type="submit" size="lg" disabled={isGrading}>
              {isGrading ? 'Grading...' : 'Submit Quiz'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default withAuth(QuizViewerPage, ['student', 'instructor', 'admin']);

    