
'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';

// Make sure to put your public key in .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const cardElementOptions = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
};

function PaymentForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const stripe = useStripe();
    const elements = useElements();
    
    const [isProcessing, setIsProcessing] = useState(false);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const paymentType = searchParams.get('type');
    const itemId = searchParams.get('id');
    const itemTitle = searchParams.get('title');
    const itemPrice = searchParams.get('price');

    useEffect(() => {
        if (!itemPrice || !itemId) return;

        fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: parseFloat(itemPrice) * 100, // Stripe expects amount in cents
                metadata: {
                    itemId: itemId,
                    itemType: paymentType,
                    itemTitle: itemTitle,
                }
            }),
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                 toast({ variant: 'destructive', title: 'Error', description: data.error });
                 setError(data.error)
            } else {
                setClientSecret(data.clientSecret)
            }
        })
        .catch(err => {
            console.error(err);
            setError("Failed to initialize payment. Please try again.");
            toast({ variant: 'destructive', title: 'Error', description: 'Could not connect to payment service.' });
        });
    }, [itemPrice, itemId, itemTitle, paymentType, toast]);
    

    const handlePayment = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!stripe || !elements || !clientSecret) {
            // Stripe.js has not loaded yet. Make sure to disable
            // form submission until Stripe.js has loaded.
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement)!,
            },
        });

        if (stripeError) {
            setError(stripeError.message || 'An unexpected error occurred.');
            setIsProcessing(false);
            return;
        }
        
        if (paymentIntent?.status === 'succeeded') {
            toast({ title: 'Payment Successful!', description: `Your payment for "${itemTitle}" has been processed.` });
            router.push('/dashboard?tab=assignments');
        } else {
            setError(`Payment status: ${paymentIntent?.status}. Please try again.`);
        }

        setIsProcessing(false);
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
                        <Link href="/dashboard?tab=assignments">
                            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Dashboard
                        </Link>
                    </Button>
                </div>
                <form onSubmit={handlePayment} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                            <CardDescription>Enter your card information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 border rounded-md">
                                <CardElement options={cardElementOptions} />
                            </div>
                            {error && <div className="text-destructive text-sm mt-2">{error}</div>}
                            <Button className="w-full mt-4" size="lg" type="submit" disabled={!stripe || !clientSecret || isProcessing}>
                                {isProcessing ? 'Processing...' : `Pay R ${parseFloat(itemPrice).toFixed(2)}`}
                            </Button>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </div>
    );
}

function PaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Elements stripe={stripePromise}>
                <PaymentForm />
            </Elements>
        </Suspense>
    )
}

export default PaymentPage;
