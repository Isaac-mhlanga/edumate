
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { usePaystackPayment } from 'react-paystack';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';

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
    const [loading, setLoading] = useState(true);

    const paymentType = searchParams.get('type');
    const itemId = searchParams.get('id');
    const itemTitle = searchParams.get('title');
    const itemPrice = searchParams.get('price');

     useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const config = {
        reference: new Date().getTime().toString(),
        email: user?.email || '',
        amount: parseFloat(itemPrice || '0') * 100, // Amount is in kobo (cents)
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        currency: 'ZAR',
        metadata: {
            studentId: user?.uid,
            itemId: itemId,
            itemType: paymentType,
            itemTitle: itemTitle,
            custom_fields: [
                {
                    display_name: "Item Type",
                    variable_name: "item_type",
                    value: paymentType,
                },
                {
                    display_name: "Item ID",
                    variable_name: "item_id",
                    value: itemId,
                },
            ],
        },
    };
    
    const initializePayment = usePaystackPayment(config);

    const onSuccess = (reference: any) => {
        console.log(reference);
        toast({ title: 'Payment Successful!', description: 'Your transaction has been received and is being processed.' });
        router.push('/dashboard?tab=assignments');
    };

    const onClose = () => {
        console.log('closed');
        toast({ variant: 'destructive', title: 'Payment Canceled', description: 'You have canceled the payment process.' });
    };

    if (loading || !itemTitle || !itemPrice) {
        return (
             <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4 sm:p-6 lg:p-8">
                <Card className="w-full max-w-lg mx-auto">
                    <CardHeader>
                        <Skeleton className="h-7 w-3/5" />
                        <Skeleton className="h-4 w-4/5" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-20 w-full" />
                        <div className="space-y-2 pt-4 border-t">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    const backLink = '/dashboard?tab=assignments';
    const icon = <CreditCard className="mr-2" />;

    return (
        <div className="min-h-screen bg-muted/40 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <div className="w-full max-w-lg mx-auto">
                 <div className="mb-4">
                    <Button variant="ghost" asChild>
                        <Link href={backLink}>
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back
                        </Link>
                    </Button>
                </div>
                <Card className="shadow-lg rounded-xl">
                    <CardHeader>
                        <CardTitle>Complete Your Payment</CardTitle>
                        <CardDescription>Review your purchase and pay securely with Paystack.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">You are paying for</p>
                                <p className="font-medium">{itemTitle}</p>
                            </div>
                            <span className="font-bold text-2xl">R {parseFloat(itemPrice).toFixed(2)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
                            <p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-green-500" /> Secure payment powered by Paystack</p>
                            <p className="flex items-center gap-2"><Lock className="h-4 w-4 text-green-500" /> Your payment information is protected.</p>
                        </div>
                         <Button 
                            className="w-full mt-4" 
                            size="lg" 
                            onClick={() => {
                                if (user && itemPrice) {
                                    initializePayment({onSuccess, onClose});
                                } else {
                                    toast({ variant: 'destructive', title: 'Error', description: 'User details not loaded. Please wait a moment and try again.'});
                                }
                            }}
                            disabled={!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || loading}
                        >
                            {icon} Pay Now
                        </Button>
                        {!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY && (
                            <p className="text-center text-destructive text-xs">Paystack integration is not configured. Please set the public key.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentForm />
        </Suspense>
    )
}

export default PaymentPage;

    