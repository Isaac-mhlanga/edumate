
'use client';

import React, { useState, useEffect } from 'react';
import withAuth from '@/components/with-auth';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionForm } from '@/components/community/question-form';
import { QuestionList } from '@/components/community/question-list';
import { CommentSection } from '@/components/community/comment-section';
import { type Question } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Separator } from '@/components/ui/separator';

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
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="h-[calc(100vh-10rem)]">
            <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
                <ResizablePanel defaultSize={35} minSize={25} maxSize={45}>
                    <div className="flex flex-col h-full">
                        <QuestionForm />
                        <Separator />
                        <QuestionList 
                            questions={questions} 
                            selectedQuestion={selectedQuestion}
                            onSelectQuestion={setSelectedQuestion} 
                            loading={loading}
                        />
                    </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={65}>
                    <CommentSection question={selectedQuestion} />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}

export default withAuth(CommunityPage, ['student', 'instructor', 'admin', 'tutor']);
