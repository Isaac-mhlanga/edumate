'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, BarChart, Percent, Users } from 'lucide-react';
import { type Quiz, type QuizSubmission } from '@/app/instructor/page';

interface InstructorQuizzesTabProps {
    quizzes: Quiz[];
    quizSubmissions: QuizSubmission[];
    loading: boolean;
}

export function InstructorQuizzesTab({ quizzes, quizSubmissions, loading }: InstructorQuizzesTabProps) {
    
    const getQuizStats = (quizId: string) => {
        const relevantSubmissions = quizSubmissions.filter(s => s.quizId === quizId);
        const submissionCount = relevantSubmissions.length;
        if (submissionCount === 0) {
            return {
                averageScore: 0,
                participants: 0,
            };
        }
        // const totalScore = relevantSubmissions.reduce((acc, s) => acc + s.result.overallScore, 0);
        // const averageScore = totalScore / submissionCount;
        return {
            // averageScore: Math.round(averageScore),
            averageScore: 0, // AI grading removed
            participants: submissionCount,
        };
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>My Quizzes</CardTitle>
                    <CardDescription>Create, manage, and view results for your quizzes.</CardDescription>
                </div>
                <Button asChild>
                    <Link href="/instructor/quizzes/create">
                        <PlusCircle className="mr-2"/> Create New Quiz
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Quiz Title</TableHead>
                            <TableHead className="hidden sm:table-cell">Details</TableHead>
                            <TableHead className="hidden md:table-cell text-center">Participants</TableHead>
                            <TableHead className="hidden md:table-cell text-center">Avg. Score</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                             Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                                    <TableCell className="hidden md:table-cell text-center"><Skeleton className="h-5 w-10 mx-auto" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                            ))
                        ) : quizzes.length > 0 ? (
                            quizzes.map((quiz) => {
                                const stats = getQuizStats(quiz.id);
                                return (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.title}</TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant="secondary">{quiz.subject} - Grade {quiz.grade}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center font-medium">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Users className="h-3.5 w-3.5 text-muted-foreground"/> {stats.participants}
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-center font-bold text-primary">
                                        <div className="flex items-center justify-center gap-1.5">
                                            {stats.averageScore}%
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/quiz/${quiz.id}`}>
                                                <BarChart className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">View Results</span>
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )})
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    You haven't created any quizzes yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            {quizzes.length > 0 && (
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{quizzes.length}</strong> quizzes.
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
