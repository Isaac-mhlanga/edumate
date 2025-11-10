'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Wand2, RefreshCw, Lightbulb, ChevronRight, BrainCircuit, Bot } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { extractQuestionsFromPapers, type ExtractedQuestion } from '@/ai/flows/extract-questions-from-papers';
import { solveQuestionPaper, SolveQuestionPaperInput } from '@/ai/flows/solve-question-paper';
import { clarifyQuestion } from '@/ai/flows/clarify-question';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

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
    const { toast } = useToast();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
        setExtractedQuestions([]);
        setSolutions({});
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
        setProgress(10);

        try {
            const fileDataUris = await Promise.all(files.map(readFileAsDataURI));
            setProgress(30);

            const response = await extractQuestionsFromPapers({ paperDataUris: fileDataUris });
            setProgress(70);
            
            setExtractedQuestions(response.questions);
            toast({ title: 'Extraction Complete', description: `Found ${response.questions.length} questions.` });

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Extraction Failed', description: 'Could not extract questions from the provided document(s).' });
        } finally {
            setIsExtracting(false);
            setProgress(100);
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

        setSolutions(prev => ({ ...prev, [questionId]: { ...currentSolution, isClarifying: true, clarification: 'Thinking...' } }));
        try {
            const result = await clarifyQuestion({ question: text });
            setSolutions(prev => ({ ...prev, [questionId]: { ...currentSolution, isClarifying: false, clarification: result.clarification } }));
        } catch (error) {
            console.error('Error clarifying:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate a clarification.' });
            setSolutions(prev => ({ ...prev, [questionId]: { ...currentSolution, isClarifying: false } }));
        }
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center text-2xl"><Wand2 className="mr-3 h-6 w-6 text-primary"/> AI Tutor Studio</CardTitle>
                    <CardDescription>Upload a past paper or worksheet, and let the AI break it down, solve it, and explain it to you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div {...getRootProps()} className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/50'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="h-12 w-12 text-muted-foreground mb-4"/>
                        <p className="text-lg font-semibold">
                            {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select'}
                        </p>
                        <p className="text-sm text-muted-foreground">PDF or Image files, up to 5 files</p>
                    </div>

                    {files.length > 0 && (
                        <div className="space-y-2">
                             <h4 className="font-semibold">Selected Files:</h4>
                            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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

                </CardContent>
                <CardFooter>
                    <Button onClick={handleExtract} disabled={files.length === 0 || isExtracting}>
                        {isExtracting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin"/> Extracting Topics</> : <><BrainCircuit className="mr-2 h-4 w-4"/> Extract Topics</>}
                    </Button>
                </CardFooter>
            </Card>

            {extractedQuestions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Topics</CardTitle>
                        <CardDescription>Here are the topics found in your document. Click on one to get a detailed explanation and solution.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            {extractedQuestions.map((q, index) => (
                                <AccordionItem value={q.id} key={q.id}>
                                    <AccordionTrigger>
                                        <div className="flex items-center gap-4 text-left">
                                             <span className="text-primary font-bold">{index + 1}.</span>
                                            <span><InlineMath math={q.text} /></span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="space-y-4 pt-4">
                                        {solutions[q.id] ? (
                                            solutions[q.id].isGenerating ? (
                                                <div className="flex items-center justify-center p-8 space-x-2 text-muted-foreground">
                                                    <RefreshCw className="h-5 w-5 animate-spin" />
                                                    <span>Generating solution...</span>
                                                </div>
                                            ) : (
                                                <div className="prose prose-sm dark:prose-invert max-w-none">
                                                    <h4>Explanation:</h4>
                                                     <div dangerouslySetInnerHTML={{ __html: solutions[q.id].explanation.replace(/\\\[/g, '<div class="math-block">').replace(/\\\]/g, '</div>').replace(/\\\(/g, '<span class="math-inline">').replace(/\\\)/g, '</span>') }} />

                                                    <BlockMath math={solutions[q.id].finalAnswer} />
                                                    
                                                     <div className="mt-6 not-prose flex flex-col gap-4">
                                                        <Button variant="link" onClick={() => handleClarify(q.id, solutions[q.id].explanation)} disabled={solutions[q.id].isClarifying} className="p-0 h-auto justify-start">
                                                            <Lightbulb className="mr-2 h-4 w-4"/> Explain this like I'm 5
                                                        </Button>
                                                        {solutions[q.id].isClarifying && <p className="text-sm text-muted-foreground">Thinking...</p>}
                                                        {solutions[q.id].clarification && (
                                                            <div className="p-4 bg-muted rounded-lg text-sm">
                                                                <p>{solutions[q.id].clarification}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <Button onClick={() => handleSolveQuestion(q)}>
                                                <Bot className="mr-2"/> Explain this Topic
                                            </Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
