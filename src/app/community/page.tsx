
'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionForm } from '@/components/community/question-form';
import { QuestionList } from '@/components/community/question-list';
import { CommentSection } from '@/components/community/comment-section';
import { type Question } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function CommunityPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);

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
              setSelectedQuestion(fetchedQuestions[0]);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [selectedQuestion]);

    const handleQuestionUpdate = (updatedQuestion: Question) => {
        setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        if (selectedQuestion?.id === updatedQuestion.id) {
            setSelectedQuestion(updatedQuestion);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-muted/30">
          <PublicHeader />
          <main className="flex-grow pt-16">
            <div className="container mx-auto py-8">
                 <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Community Forum</h1>
                    <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Ask questions, share knowledge, and connect with fellow students.</p>
                </div>
                <div className="grid lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-4">
                        <Card className="flex flex-col h-full">
                            <QuestionForm />
                            <Separator />
                            <QuestionList 
                                questions={questions} 
                                selectedQuestion={selectedQuestion}
                                onSelectQuestion={setSelectedQuestion} 
                                loading={loading}
                            />
                        </Card>
                    </div>
                    <div className="lg:col-span-8">
                       <Card className="min-h-[calc(100vh-20rem)]">
                         <CommentSection question={selectedQuestion} onUpdateQuestion={handleQuestionUpdate}/>
                       </Card>
                    </div>
                </div>
            </div>
          </main>
          <Footer />
        </div>
    );
}

export default CommunityPage;
