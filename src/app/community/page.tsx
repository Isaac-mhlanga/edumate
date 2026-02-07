'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionList } from '@/components/community/question-list';
import { type Question } from '@/lib/types';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { CommentSection } from '@/components/community/comment-section';
import { Card } from '@/components/ui/card';
import { QuestionForm } from '@/components/community/question-form';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    const [loading, setLoading] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

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
            
            if (!selectedQuestion && fetchedQuestions.length > 0) {
                setSelectedQuestion(fetchedQuestions[0]);
            } else if (selectedQuestion) {
                 const updatedSelected = fetchedQuestions.find(q => q.id === selectedQuestion.id);
                 setSelectedQuestion(updatedSelected || null);
            }

            setLoading(false);
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedQuestion]);

    const handleUpdateQuestion = (updatedQuestion: Question) => {
        setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        if (selectedQuestion?.id === updatedQuestion.id) {
            setSelectedQuestion(updatedQuestion);
        }
    };

    const handleDeleteQuestion = async (questionId: string) => {
        setSelectedQuestion(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-1">
                <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12 pt-24 h-full">
                     <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-[calc(100vh-14rem)]">
                        <Card className="flex flex-col h-full">
                            <div className="p-4 border-b">
                                <QuestionForm />
                            </div>
                            <ScrollArea className="flex-1">
                                <QuestionList 
                                    questions={questions} 
                                    loading={loading}
                                    onQuestionSelect={setSelectedQuestion}
                                    selectedQuestionId={selectedQuestion?.id || null}
                                />
                            </ScrollArea>
                        </Card>
                        <div className="h-full">
                            <CommentSection
                                question={selectedQuestion}
                                onUpdateQuestion={handleUpdateQuestion}
                                onDeleteQuestion={handleDeleteQuestion}
                                dashboardView={false}
                            />
                        </div>
                     </div>
                </div>
            </main>
            <div className="hidden md:block">
                <Footer />
            </div>
        </div>
    );
}
