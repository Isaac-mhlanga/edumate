'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles as SparklesIcon } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import { Skeleton } from './ui/skeleton';

type Promotion = {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    icon?: string;
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function PromotionBanner() {
    const [promotion, setPromotion] = useState<Promotion | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);

        const fetchPromotion = async () => {
            setLoading(true);
            try {
                const promoRef = doc(firestore, 'promotions', 'homepage-banner');
                const docSnap = await getDoc(promoRef);
                if (docSnap.exists()) {
                    setPromotion(docSnap.data() as Promotion);
                }
            } catch (error) {
                console.error("Error fetching promotion:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPromotion();
    }, []);

    if (loading) {
        return (
            <div className="bg-background/95 sticky top-[65px] z-40 border-b backdrop-blur-xl p-2">
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }
    
    if (!promotion) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 sticky top-[65px] z-40 border-b border-primary/20 backdrop-blur-xl overflow-hidden shadow-inner">
            <Link href={promotion.buttonLink} target="_blank" rel="noopener noreferrer"
                className="group relative block p-2">
                <div className="flex items-center justify-center space-x-4">
                    <div className="flex-shrink-0 text-primary p-2 rounded-full">
                        {promotion.icon === 'tiktok' ? <FaTiktok className="h-5 w-5" /> : <SparklesIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
                            <span className="font-semibold text-sm mx-4">{promotion.title}: {promotion.description}</span>
                            <span className="font-semibold text-sm mx-4" aria-hidden="true">{promotion.title}: {promotion.description}</span>
                            <span className="font-semibold text-sm mx-4" aria-hidden="true">{promotion.title}: {promotion.description}</span>
                            <span className="font-semibold text-sm mx-4" aria-hidden="true">{promotion.title}: {promotion.description}</span>
                        </div>
                    </div>
                    <div className="hidden sm:block">
                        <Button variant="ghost" size="sm" className="text-foreground group-hover:text-primary h-auto py-1 px-3 text-xs rounded-full">
                            {promotion.buttonText}
                            <ArrowRight className="ml-2 h-3 w-3 transform transition-transform group-hover:translate-x-1" />
                        </Button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
