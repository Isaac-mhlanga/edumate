'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, ArrowRight } from 'lucide-react';
import { type Question } from '@/lib/types';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import Link from 'next/link';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function CommunityPreview() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const q = query(collection(firestore, 'questions'), orderBy('createdAt', 'desc'), limit(3));

        const unsubscribe: Unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedQuestions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Question));
            setQuestions(fetchedQuestions);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching community questions:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <section id="community-preview" className="py-24">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-12 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tight mb-4">From the Community</h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">See what students are asking and get involved in the discussion.</p>
                </div>
                <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-lg" />)
                    ) : (
                        questions.map((question, index) => (
                            <Card key={question.id} className="animate-fade-in-up bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-primary/20 transition-shadow duration-300" style={{ animationDelay: `${0.1 * index}s` }}>
                                <CardHeader>
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-10 w-10 border">
                                            <AvatarImage src={question.studentAvatar} />
                                            <AvatarFallback>{question.studentName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <CardTitle className="text-base line-clamp-2">{question.title}</CardTitle>
                                            <CardDescription className="text-xs">
                                                Asked by {question.studentName} • {question.createdAt ? formatDistanceToNow(question.createdAt.toDate(), { addSuffix: true }) : ''}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground line-clamp-3">{question.content}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
                                    <div className="flex gap-4">
                                        <span className="flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" />{question.likeCount || 0}</span>
                                        <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" />{question.commentCount || 0}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/community">View <ArrowRight className="ml-1 h-4 w-4" /></Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>
                 <div className="text-center mt-12">
                    <Button size="lg" asChild>
                        <Link href="/community">
                            Ask a Question or View More
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
