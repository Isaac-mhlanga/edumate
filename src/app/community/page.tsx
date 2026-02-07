'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionList } from '@/components/community/question-list';
import { type Question } from '@/lib/types';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { LeftSidebar } from '@/components/community/left-sidebar';
import { RightSidebar } from '@/components/community/right-sidebar';


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
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            <PublicHeader />
            <main className="flex-1">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12 pt-24">
                     <p className="text-sm text-muted-foreground mb-4">Forum / Technology / Computer / Latest</p>
                     <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr_300px] gap-8">
                        <aside className="hidden lg:block">
                           <LeftSidebar />
                        </aside>
                        <div className="min-w-0">
                           <QuestionList questions={questions} loading={loading} />
                        </div>
                         <aside className="hidden xl:block">
                           <RightSidebar questions={questions} />
                        </aside>
                     </div>
                </div>
                 <div className="hidden md:block">
                    <Footer />
                </div>
            </main>
        </div>
    );
}
