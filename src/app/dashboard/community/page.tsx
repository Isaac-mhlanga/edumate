'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, onSnapshot, Unsubscribe, doc, getDoc, getDocs, writeBatch, Timestamp } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { QuestionList } from '@/components/community/question-list';
import { type Question, type Comment } from '@/lib/types';
import withAuth from '@/components/with-auth';
import { CommentSection } from '@/components/community/comment-section';
import { useToast } from '@/hooks/use-toast';
import { RightSidebar } from '@/components/community/right-sidebar';
import { QuestionForm } from '@/components/community/question-form';
import { Sheet, SheetContent } from '@/components/ui/sheet';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function CommunityDashboardPage() {
    const { toast } = useToast();
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
            
            if (selectedQuestion) {
                // If a question was selected, make sure it's up-to-date
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
        const firestore = getFirestore();
        const storage = getStorage();
        const questionRef = doc(firestore, 'questions', questionId);

        if (!window.confirm("Are you sure you want to delete this question and all its comments? This action cannot be undone.")) {
            return;
        }

        try {
            const questionSnap = await getDoc(questionRef);
            if (!questionSnap.exists()) return;
            const questionData = questionSnap.data() as Question;

            if (questionData.fileUrl) {
                try { await deleteObject(ref(storage, questionData.fileUrl)); } catch (e) { console.error("Failed to delete question file, it may not exist.", e); }
            }

            const commentsRef = collection(firestore, 'questions', questionId, 'comments');
            const commentsSnapshot = await getDocs(commentsRef);
            const batch = writeBatch(firestore);
            
            for (const commentDoc of commentsSnapshot.docs) {
                const commentData = commentDoc.data() as Comment;
                if (commentData.fileUrl) {
                    try { await deleteObject(ref(storage, commentData.fileUrl)); } catch (e) { console.error("Failed to delete comment file, it may not exist.", e); }
                }
                batch.delete(commentDoc.ref);
            }

            batch.delete(questionRef);
            await batch.commit();

            toast({ title: "Question Deleted", description: "The question and all its content have been removed." });
            
            setSelectedQuestion(null);
        } catch (error) {
            console.error("Error deleting question:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete the question.' });
        }
    };


    return (
        <>
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
                <div className="min-w-0">
                    <div className="mb-6">
                        <QuestionForm />
                    </div>
                    <QuestionList 
                        questions={questions} 
                        loading={loading}
                        onQuestionSelect={setSelectedQuestion}
                    />
                </div>
                <aside className="hidden xl:block">
                    <RightSidebar questions={questions} />
                </aside>
            </div>
             <Sheet open={!!selectedQuestion} onOpenChange={(open) => !open && setSelectedQuestion(null)}>
                <SheetContent className="w-full max-w-full sm:max-w-2xl p-0">
                    <CommentSection
                        question={selectedQuestion}
                        onUpdateQuestion={handleUpdateQuestion}
                        onDeleteQuestion={handleDeleteQuestion}
                        dashboardView={true}
                    />
                </SheetContent>
            </Sheet>
        </>
    );
}

export default withAuth(CommunityDashboardPage, ['student', 'varsity-student', 'instructor', 'admin', 'tutor']);
