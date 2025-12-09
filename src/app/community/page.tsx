
'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe, doc, getDocs, writeBatch, deleteDoc, getDoc, increment } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionForm } from '@/components/community/question-form';
import { QuestionList } from '@/components/community/question-list';
import { CommentSection } from '@/components/community/comment-section';
import { type Question } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';
import withAuth from '@/components/with-auth';

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
        <div className="space-y-4">
             <div className="text-left mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Community Forum</h1>
                <p className="text-lg text-muted-foreground mt-1">Ask questions, share knowledge, and connect with fellow students.</p>
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
                   <Card className="min-h-[calc(100vh-16rem)]">
                     <CommentSection 
                        question={selectedQuestion} 
                        onUpdateQuestion={handleQuestionUpdate}
                        onDeleteQuestion={handleQuestionDelete}
                     />
                   </Card>
                </div>
            </div>
        </div>
    );
}

export default withAuth(CommunityPage, ['student', 'instructor', 'admin', 'tutor']);
