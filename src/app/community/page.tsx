
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
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';

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
            if (fetchedQuestions.length > 0 && !selectedQuestion) {
              setSelectedQuestion(fetchedQuestions.find(q => q.title.toLowerCase().includes(searchTerm.toLowerCase())) || fetchedQuestions[0]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedQuestion, searchTerm]);

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
            // Delete all comments within the question's subcollection
            const commentsRef = collection(firestore, 'questions', deletedQuestionId, 'comments');
            const commentsSnapshot = await getDocs(commentsRef);
            const batch = writeBatch(firestore);
            commentsSnapshot.forEach(commentDoc => {
                batch.delete(commentDoc.ref);
            });
            await batch.commit();
            
            // Delete the question itself
            await deleteDoc(doc(firestore, 'questions', deletedQuestionId));

            setQuestions(prev => prev.filter(q => q.id !== deletedQuestionId));
            if (selectedQuestion?.id === deletedQuestionId) {
                const currentIndex = questions.findIndex(q => q.id === deletedQuestionId);
                if (questions.length > 1) {
                    const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
                    setSelectedQuestion(questions[newIndex] || null);
                } else {
                    setSelectedQuestion(null);
                }
            }
        } catch (error) {
            console.error("Error deleting question and its comments: ", error);
        }
    };


    return (
        <div className="bg-background text-foreground">
            <PublicHeader />
            <main className="max-w-7xl mx-auto px-6 py-12 pt-24 space-y-6">
                 <div className="text-left">
                    <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                    <p className="text-lg text-muted-foreground mt-1">Ask questions, share knowledge, and connect with fellow students.</p>
                </div>
                <Card className="flex flex-col md:flex-row h-full min-h-[calc(100vh-16rem)]">
                    <div className="w-full md:w-1/3 border-b md:border-r md:border-b-0">
                        <div className="p-4 border-b">
                            <QuestionForm />
                            <div className="relative mt-4">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search questions..."
                                    className="pl-8"
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
                            <div className="p-2 border-t flex justify-center items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>
                                <span className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</span>
                                <Button size="sm" variant="ghost" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                            </div>
                        )}
                    </div>
                    <div className="w-full md:w-2/3">
                        <CommentSection 
                            question={selectedQuestion} 
                            onUpdateQuestion={handleQuestionUpdate}
                            onDeleteQuestion={handleQuestionDelete}
                        />
                    </div>
                </Card>
            </main>
            <Footer />
        </div>
    );
}
