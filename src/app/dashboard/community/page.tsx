'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionList } from '@/components/community/question-list';
import { type Question } from '@/lib/types';
import withAuth from '@/components/with-auth';
import { RightSidebar } from '@/components/community/right-sidebar';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function CommunityDashboardPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
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
        }, (error) => {
            console.error("Error fetching questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div className="min-w-0">
                 <div className="mb-4">
                    <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                    <p className="text-lg text-muted-foreground mt-1">Ask questions, share knowledge, and connect with fellow students.</p>
                </div>
                <QuestionList questions={questions} loading={loading} />
            </div>
            <aside className="hidden lg:block">
                <RightSidebar />
            </aside>
        </div>
    );
}

export default withAuth(CommunityDashboardPage, ['student', 'varsity-student', 'instructor', 'admin', 'tutor']);
