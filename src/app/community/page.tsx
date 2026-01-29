
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe, doc, getDocs, writeBatch, deleteDoc, getDoc, increment } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionForm } from '@/components/community/question-form';
import { QuestionList } from '@/components/community/question-list';
import { CommentSection } from '@/components/community/comment-section';
import { type Question } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { cn } from '@/lib/utils';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function CommunityPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const questionsPerPage = 5;

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const q = query(collection(firestore, 'questions'), orderBy('createdAt', 'desc'));

        const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedQuestions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Question));
            setQuestions(fetchedQuestions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredQuestions = useMemo(() => {
        return questions.filter(question => 
            question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [questions, searchTerm]);
    
    const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
    const paginatedQuestions = filteredQuestions.slice(
        (currentPage - 1) * questionsPerPage,
        currentPage * questionsPerPage
    );


    const handleQuestionUpdate = (updatedQuestion: Question) => {
        setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        if (selectedQuestion?.id === updatedQuestion.id) {
            setSelectedQuestion(updatedQuestion);
        }
    };

    const handleQuestionDelete = async (deletedQuestionId: string) => {
        const firestore = getFirestore();
        try {
            const commentsRef = collection(firestore, 'questions', deletedQuestionId, 'comments');
            const commentsSnapshot = await getDocs(commentsRef);
            const batch = writeBatch(firestore);
            commentsSnapshot.forEach(commentDoc => {
                batch.delete(commentDoc.ref);
            });
            await batch.commit();
            
            await deleteDoc(doc(firestore, 'questions', deletedQuestionId));

            const newQuestions = questions.filter(q => q.id !== deletedQuestionId);
            setQuestions(newQuestions);
            
            if (selectedQuestion?.id === deletedQuestionId) {
                setSelectedQuestion(newQuestions.length > 0 ? newQuestions[0] : null);
            }
        } catch (error) {
            console.error("Error deleting question and its comments: ", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 pt-24 space-y-8">
                     <div className="text-left">
                        <h1 className="text-4xl font-bold tracking-tight">Community Forum</h1>
                        <p className="text-lg text-muted-foreground mt-2">Ask questions, share knowledge, and connect with fellow learners.</p>
                    </div>
                    <Card className="flex flex-col md:flex-row h-full min-h-[calc(100vh-20rem)] shadow-lg">
                        <div className={cn("w-full md:w-[350px] border-b md:border-r md:border-b-0 flex flex-col", selectedQuestion && "hidden md:flex")}>
                            <div className="p-4 border-b">
                                <QuestionForm />
                                <div className="relative mt-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="Search questions..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                            <QuestionList 
                                questions={paginatedQuestions} 
                                selectedQuestion={selectedQuestion}
                                onSelectQuestion={setSelectedQuestion} 
                                loading={loading}
                            />
                            {totalPages > 1 && (
                                <div className="p-2 border-t flex justify-center items-center gap-2 mt-auto">
                                    <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                                    <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                                    <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                                </div>
                            )}
                        </div>
                        <div className={cn("flex-1 flex flex-col", !selectedQuestion && "hidden md:flex")}>
                             {selectedQuestion && (
                                <div className="flex items-center p-2 border-b md:hidden">
                                    <Button variant="ghost" size="icon" onClick={() => setSelectedQuestion(null)}>
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <h3 className="font-semibold truncate ml-2">Discussion</h3>
                                </div>
                            )}
                            <CommentSection 
                                question={selectedQuestion} 
                                onUpdateQuestion={handleQuestionUpdate}
                                onDeleteQuestion={handleQuestionDelete}
                            />
                        </div>
                    </Card>
                </div>
                 <div className="hidden md:block">
                    <Footer />
                </div>
            </main>
        </div>
    );
}
