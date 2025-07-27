
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';
import { getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { getFirestore, doc, addDoc, updateDoc, collection, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

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

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
    const paystackSignature = headers().get('x-paystack-signature') as string;
    const body = await request.text();

    const hash = crypto
        .createHmac('sha512', PAYSTACK_SECRET_KEY)
        .update(body)
        .digest('hex');

    if (hash !== paystackSignature) {
        console.error('Invalid Paystack signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === 'charge.success') {
        const { data } = event;

        // Ensure transaction has not been processed already
        const q = query(collection(firestore, 'transactions'), where('paystackTransactionId', '==', data.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            console.log(`Transaction ${data.id} has already been processed.`);
            return NextResponse.json({ status: 'ok - already processed' });
        }
        
        console.log('✅ Payment was successful!', data.id);

        try {
            const { studentId, itemId, itemType, itemTitle } = data.metadata;
            const amount = data.amount / 100; // convert from kobo to ZAR

            // 1. Record transaction in Firestore
            await addDoc(collection(firestore, 'transactions'), {
                studentId: studentId || "unknown",
                itemId: itemId,
                itemType: itemType,
                itemTitle: itemTitle,
                amount: amount,
                status: 'Completed',
                currency: data.currency,
                paystackTransactionId: data.id,
                paystackReference: data.reference,
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
        console.warn(`🤷‍♀️ Unhandled Paystack event type: ${event.event}`);
    }

    return NextResponse.json({ status: 'ok' });
}
