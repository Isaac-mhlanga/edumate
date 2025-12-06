
'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Wand2, RefreshCw, Lightbulb, BrainCircuit, Bot, Loader2, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { extractQuestionsFromPapers, type ExtractedQuestion } from '@/ai/flows/extract-questions-from-papers';
import { solveQuestionPaper, SolveQuestionPaperInput } from '@/ai/flows/solve-question-paper';
import { clarifyQuestion } from '@/ai/flows/clarify-question';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getFirestore, doc, onSnapshot, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useRouter } from 'next/navigation';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type Solution = {
    questionId: string;
    explanation: string;
    finalAnswer: string;
    isGenerating?: boolean;
    isClarifying?: boolean;
    clarification?: string;
};

export default function AiTutorPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [extractedQuestions, setExtractedQuestions] = useState<ExtractedQuestion[]>([]);
    const [solutions, setSolutions] = useState<Record<string, Solution>>({});
    const [isExtracting, setIsExtracting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
    
    const { toast } = useToast();
    const router = useRouter();
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        setExtractedQuestions([]);
        setSolutions({});
        setSelectedQuestionId(null);
        setProgress(0);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] },
        maxFiles: 5,
    });
    
    const readFileAsDataURI = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleExtract = async () => {
        if (files.length === 0) {
            toast({ variant: 'destructive', title: 'No files selected', description: 'Please select one or more files to extract questions from.' });
            return;
        }

        setIsExtracting(true);
        setExtractedQuestions([]);
        setSelectedQuestionId(null);
        setProgress(10);

        try {
            const fileDataUris = await Promise.all(files.map(readFileAsDataURI));
            setProgress(30);

            const response = await extractQuestionsFromPapers({ paperDataUris: fileDataUris });
            setProgress(70);
            
            // Track usage
            const auth = getAuth();
            if (auth.currentUser) {
                const firestore = getFirestore();
                await addDoc(collection(firestore, 'aiTutorUsage'), {
                    userId: auth.currentUser.uid,
                    timestamp: serverTimestamp(),
                    fileCount: files.length,
                    questionCount: response.questions.length,
                });
            }

            setExtractedQuestions(response.questions);
            if (response.questions.length > 0) {
                setSelectedQuestionId(response.questions[0].id);
                handleSolveQuestion(response.questions[0]);
            }
            toast({ title: 'Extraction Complete', description: `Found ${response.questions.length} questions.` });

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not extract questions from the provided document(s).' });
        } finally {
            setIsExtracting(false);
            setProgress(100);
        }
    };

    const handleSelectQuestion = (question: ExtractedQuestion) => {
        setSelectedQuestionId(question.id);
        if (!solutions[question.id]) {
            handleSolveQuestion(question);
        }
    };

    const handleSolveQuestion = async (question: ExtractedQuestion) => {
        setSolutions(prev => ({ ...prev, [question.id]: { questionId: question.id, explanation: '', finalAnswer: '', isGenerating: true } }));
        try {
            const input: SolveQuestionPaperInput = {
                questionText: question.text,
                diagramDescription: question.diagramDescription,
            };
            const result = await solveQuestionPaper(input);
            setSolutions(prev => ({ ...prev, [question.id]: { ...result, questionId: question.id, isGenerating: false } }));
        } catch (error) {
            console.error('Error solving question:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a solution for this question.' });
             setSolutions(prev => ({ ...prev, [question.id]: { ...prev[question.id], isGenerating: false } }));
        }
    };
    
    const handleClarify = async (questionId: string, text: string) => {
        const currentSolution = solutions[questionId];
        if (!currentSolution) return;

        setSolutions(prev => ({ ...prev, [questionId]: { ...currentSolution, isClarifying: true, clarification: undefined } }));
        try {
            const result = await clarifyQuestion({ question: text });
            setSolutions(prev => ({ ...prev, [questionId]: { ...currentSolution, isClarifying: false, clarification: result.clarification } }));
        } catch (error) {
            console.error('Error clarifying:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a clarification.' });
            setSolutions(prev => ({ ...prev, [questionId]: { ...currentSolution, isClarifying: false } }));
        }
    };

    const selectedSolution = useMemo(() => {
        if (!selectedQuestionId) return null;
        return solutions[selectedQuestionId];
    }, [selectedQuestionId, solutions]);

    const selectedQuestion = useMemo(() => {
        if (!selectedQuestionId) return null;
        return extractedQuestions.find(q => q.id === selectedQuestionId);
    }, [selectedQuestionId, extractedQuestions]);

    return (
        <div className="min-h-screen bg-muted/20">
            <div className="container mx-auto py-8">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold tracking-tight flex items-center justify-center gap-3">
                        <Wand2 className="h-10 w-10 text-primary"/> AI Tutor Studio
                    </h1>
                    <p className="text-lg text-muted-foreground mt-2">Upload a past paper or worksheet, and let the AI break it down, solve it, and explain it to you.</p>
                </div>
            
                <div className={cn("grid gap-8", extractedQuestions.length > 0 ? "lg:grid-cols-3" : "lg:grid-cols-1")}>
                    <div className={cn("space-y-6", extractedQuestions.length > 0 ? "lg:col-span-1" : "lg:col-span-1")}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">1. Upload Document</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div {...getRootProps()} className={cn(`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors`, isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50')}>
                                    <input {...getInputProps()} />
                                    <UploadCloud className="h-10 w-10 text-muted-foreground mb-3"/>
                                    <p className="text-base font-semibold">
                                        {isDragActive ? 'Drop the files here...' : 'Drag & drop or click to upload'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">PDF or Image files, up to 5 files</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex-col items-stretch gap-4">
                                {files.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-sm">Selected Files:</h4>
                                        <ul className="grid grid-cols-1 gap-2">
                                            {files.map(file => (
                                                <li key={file.name} className="flex items-center gap-2 p-2 bg-muted rounded-md text-sm">
                                                    <FileText className="h-5 w-5 shrink-0"/>
                                                    <span className="truncate">{file.name}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {isExtracting && <Progress value={progress} className="w-full" />}
                                <Button onClick={handleExtract} disabled={files.length === 0 || isExtracting} size="lg" className="w-full">
                                    {isExtracting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Analyzing Document</> : <><BrainCircuit className="mr-2 h-4 w-4"/> Extract Topics</>}
                                </Button>
                            </CardFooter>
                        </Card>

                        {extractedQuestions.length > 0 && (
                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">2. Select a Topic</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto">
                                    {extractedQuestions.map((q, index) => (
                                        <button
                                            key={q.id}
                                            onClick={() => handleSelectQuestion(q)}
                                            className={cn(
                                                "flex items-start text-left gap-3 p-3 rounded-lg border transition-colors w-full",
                                                selectedQuestionId === q.id 
                                                    ? "bg-primary/10 border-primary" 
                                                    : "bg-muted/50 hover:bg-muted"
                                            )}
                                        >
                                            <span className="text-primary font-bold mt-0.5">{index + 1}.</span>
                                            <span className="flex-1"><InlineMath math={q.text} /></span>
                                            {(solutions[q.id] && !solutions[q.id].isGenerating) && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                                            {solutions[q.id]?.isGenerating && <Loader2 className="h-5 w-5 text-muted-foreground animate-spin mt-0.5" />}
                                        </button>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    
                    <div className="lg:col-span-2">
                        {selectedQuestion ? (
                             <Card className="sticky top-8">
                                <CardHeader>
                                    <CardTitle className="text-lg">3. Learn & Understand</CardTitle>
                                    <CardDescription>AI-generated explanation for the selected topic.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4 max-h-[75vh] overflow-y-auto">
                                    {selectedSolution?.isGenerating ? (
                                        <div className="space-y-6 p-4">
                                            <Skeleton className="h-6 w-1/4" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>
                                            <Skeleton className="h-8 w-1/2" />
                                        </div>
                                    ) : selectedSolution ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <h4>Explanation:</h4>
                                            <div dangerouslySetInnerHTML={{ __html: selectedSolution.explanation }} />

                                            <h4>Final Answer:</h4>
                                            <BlockMath math={selectedSolution.finalAnswer} />
                                            
                                            <div className="mt-6 not-prose flex flex-col gap-4">
                                                <Button variant="link" onClick={() => handleClarify(selectedSolution.questionId, selectedSolution.explanation)} disabled={selectedSolution.isClarifying} className="p-0 h-auto justify-start text-base">
                                                    <Lightbulb className="mr-2 h-4 w-4"/> Explain this like I'm 5
                                                </Button>
                                                {selectedSolution.isClarifying && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                                        <span>Generating simpler explanation...</span>
                                                    </div>
                                                )}
                                                {selectedSolution.clarification && (
                                                    <Alert>
                                                        <Lightbulb className="h-4 w-4" />
                                                        <AlertTitle>Simplified Explanation</AlertTitle>
                                                        <AlertDescription>
                                                            {selectedSolution.clarification}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
                                            <p>Select a topic to see the explanation.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ) : !isExtracting && files.length > 0 ? (
                             <Card className="flex flex-col items-center justify-center text-center p-12 h-full">
                                <CardHeader>
                                    <CardTitle>Ready to Go!</CardTitle>
                                    <CardDescription>Click the "Extract Topics" button to let the AI analyze your document.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <BrainCircuit className="h-16 w-16 text-muted-foreground"/>
                                </CardContent>
                            </Card>
                        ) : (
                             <Card className="flex flex-col items-center justify-center text-center p-12 h-full">
                                <CardHeader>
                                    <CardTitle>Your AI Learning Space</CardTitle>
                                    <CardDescription>Upload a document to get started. The AI will break it down into topics for you to explore.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Bot className="h-16 w-16 text-muted-foreground"/>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

    
