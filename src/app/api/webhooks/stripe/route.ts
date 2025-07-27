
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { getFirestore, doc, addDoc, updateDoc, collection, serverTimestamp } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
});

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export async function POST(request: Request) {
    const body = await request.text();
    const signature = headers().get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`❌ Error message: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('✅ PaymentIntent was successful!', paymentIntent.id);

        try {
            const { itemId, itemType, itemTitle } = paymentIntent.metadata;
            const amount = paymentIntent.amount_received / 100; // convert from cents to Rands
            
            // This is just an example, you might need to fetch student details from metadata if passed
            const studentId = paymentIntent.metadata.studentId || "unknown"; 

            // 1. Record transaction in Firestore
            await addDoc(collection(firestore, 'transactions'), {
                studentId: studentId, // You should pass studentId in metadata from client
                itemId: itemId,
                itemType: itemType,
                itemTitle: itemTitle,
                amount: amount,
                status: 'Completed',
                stripePaymentIntentId: paymentIntent.id,
                createdAt: serverTimestamp(),
            });

            // 2. Update item status if it's an assignment
            if (itemType === 'assignment' && itemId) {
                const assignmentRef = doc(firestore, 'assignments', itemId);
                await updateDoc(assignmentRef, {
                    status: 'Paid',
                });
                console.log(`Updated assignment ${itemId} to Paid.`);
            }
            
            // TODO: If type is 'course' or 'subscription', add logic to grant access.

        } catch (dbError) {
            console.error('Error updating Firestore:', dbError);
            return NextResponse.json({ error: 'Database update failed.' }, { status: 500 });
        }
    } else {
        console.warn(`🤷‍♀️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
