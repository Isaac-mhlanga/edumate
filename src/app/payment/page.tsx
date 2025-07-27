
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react';
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

    const paymentType = searchParams.get('type');
    const itemId = searchParams.get('id');
    const itemTitle = searchParams.get('title');
    const itemPrice = searchParams.get('price');

     useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
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
        // Implementation for whatever you want to do with reference and after success call.
        console.log(reference);
        toast({ title: 'Payment Successful!', description: 'Your transaction has been received and is being processed.' });
        router.push('/dashboard?tab=assignments');
    };

    const onClose = () => {
        // implementation for  whatever you want to do when the Paystack dialog closed.
        console.log('closed');
        toast({ variant: 'destructive', title: 'Payment Canceled', description: 'You have canceled the payment process.' });
    };

    if (!itemTitle || !itemPrice || !user) {
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
            <div className="w-full max-w-lg mx-auto">
                 <div className="mb-4">
                    <Button variant="ghost" asChild>
                        <Link href="/dashboard?tab=assignments">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
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
                            onClick={() => initializePayment({onSuccess, onClose})}
                            disabled={!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}
                        >
                            <CreditCard className="mr-2" /> Pay Now
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
