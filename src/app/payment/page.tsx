
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore, doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Lock, Calendar, ShieldCheck, User } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function PaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [user, setUser] = useState<User | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const paymentType = searchParams.get('type');
    const itemId = searchParams.get('id');
    const itemTitle = searchParams.get('title');
    const itemPrice = searchParams.get('price');

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handlePayment = async () => {
        if (!user || !itemId || !paymentType || !itemTitle || !itemPrice) {
            toast({ variant: 'destructive', title: 'Error', description: 'Missing payment details. Please try again from the previous page.' });
            return;
        }

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const firestore = getFirestore(getApp());
            
            // 1. Record transaction
            await addDoc(collection(firestore, 'transactions'), {
                studentId: user.uid,
                studentName: user.displayName,
                studentEmail: user.email,
                itemId: itemId,
                itemType: paymentType,
                itemTitle: itemTitle,
                amount: parseFloat(itemPrice),
                status: 'Completed',
                createdAt: serverTimestamp(),
            });

            // 2. Update item status if it's an assignment
            if (paymentType === 'assignment') {
                const assignmentRef = doc(firestore, 'assignments', itemId);
                await updateDoc(assignmentRef, {
                    status: 'Paid',
                });
            }
            
            // TODO: If type is 'course' or 'subscription', add logic to grant access.

            toast({ title: 'Payment Successful!', description: `Your payment for "${itemTitle}" has been processed.` });
            router.push('/dashboard?tab=assignments');

        } catch (error) {
            console.error("Payment failed:", error);
            toast({ variant: 'destructive', title: 'Payment Failed', description: 'There was an error processing your payment. Please try again.' });
        } finally {
            setIsProcessing(false);
        }
    };
    
    if (!itemTitle || !itemPrice) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-muted">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Loading Payment Details...</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl mx-auto">
                 <div className="mb-4">
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <Card className="shadow-lg rounded-xl">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review your purchase details before paying.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                                <span className="font-medium">{itemTitle}</span>
                                <span className="font-bold text-lg">R {parseFloat(itemPrice).toFixed(2)}</span>
                            </div>
                             <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                                <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Secure SSL Encryption</p>
                                <p className="flex items-center gap-2"><Lock className="h-4 w-4 text-green-500" /> Your payment information is protected.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Form */}
                    <Card className="shadow-lg rounded-xl">
                        <CardHeader>
                            <CardTitle>Payment Details</CardTitle>
                            <CardDescription>Enter your card information. (This is a simulation)</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="card-number">Card Number</Label>
                                <div className="relative">
                                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input id="card-number" placeholder="**** **** **** 1234" className="pl-10" />
                                </div>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="expiry-date">Expiry Date</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input id="expiry-date" placeholder="MM / YY" className="pl-10" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cvc">CVC</Label>
                                     <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input id="cvc" placeholder="***" className="pl-10" />
                                    </div>
                                </div>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="card-holder">Cardholder Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                    <Input id="card-holder" placeholder="John Doe" className="pl-10" />
                                </div>
                            </div>
                            <Button className="w-full mt-4" size="lg" onClick={handlePayment} disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : `Pay R ${parseFloat(itemPrice).toFixed(2)}`}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentForm />
        </Suspense>
    )
}

