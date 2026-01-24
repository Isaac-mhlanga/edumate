
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import withAuth from '@/components/with-auth';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Gift, DollarSign, Bank, User as UserIcon, Hash, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type ReferredUser = {
    id: string;
    fullName: string;
    createdAt: string;
};

type BankDetails = {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    branchCode: string;
};

function ReferralsPage() {
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [referralBalance, setReferralBalance] = useState(0);
    const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [bankDetails, setBankDetails] = useState<BankDetails>({
        bankName: '', accountHolder: '', accountNumber: '', branchCode: ''
    });

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setLoading(true);
                // Fetch user's referral balance
                const userDocRef = doc(firestore, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setReferralBalance(userDocSnap.data().referralBalance || 0);
                }

                // Fetch users who were referred by the current user
                const referredQuery = query(collection(firestore, 'users'), where('referredBy', '==', currentUser.uid));
                const referredSnapshot = await getDocs(referredQuery);
                const fetchedReferredUsers = referredSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        fullName: data.fullName,
                        createdAt: data.createdAt.toDate().toLocaleDateString(),
                    };
                });
                setReferredUsers(fetchedReferredUsers);
                setLoading(false);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const displayReferralCode = useMemo(() => {
        if (user && user.displayName) {
            const namePart = user.displayName.substring(0, 3).toUpperCase();
            const uidPart = user.uid.substring(0, 6);
            return `${namePart}${uidPart}`;
        }
        return user?.uid.substring(0, 9) || ''; // Fallback
    }, [user]);

    const handleCopyToClipboard = () => {
        if (user) {
            // Important: We copy the FULL UID to ensure the backend can find the user.
            // The display code is just for user-friendliness.
            navigator.clipboard.writeText(user.uid);
            toast({ title: 'Copied!', description: 'Your referral code has been copied to the clipboard.' });
        }
    };
    
    const handlePayoutRequest = async () => {
        if (!user || referralBalance <= 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Insufficient balance for a payout.' });
            return;
        }
        
        if (!bankDetails.bankName || !bankDetails.accountHolder || !bankDetails.accountNumber || !bankDetails.branchCode) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all bank details.' });
            return;
        }

        setIsSubmitting(true);
        const firestore = getFirestore();
        try {
            await addDoc(collection(firestore, 'payouts'), {
                userId: user.uid,
                userName: user.displayName,
                amount: referralBalance,
                status: 'Pending',
                type: 'Referral',
                bankDetails,
                requestedAt: serverTimestamp()
            });

            // Reset user's referral balance
            await updateDoc(doc(firestore, 'users', user.uid), {
                referralBalance: 0
            });
            
            setReferralBalance(0);
            setIsDialogOpen(false);
            toast({ title: 'Payout Requested!', description: 'Your request has been submitted for admin approval.' });
        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit payout request.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">Refer & Earn</h1>
                <p className="text-muted-foreground">Share your code and earn R20 for every new user who signs up!</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle>Your Referral Code</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-10 w-full" /> : (
                            <div className="flex items-center gap-2">
                                <Input value={displayReferralCode} readOnly className="font-mono" />
                                <Button size="icon" variant="outline" onClick={handleCopyToClipboard}><Copy className="h-4 w-4" /></Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Referral Balance</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {loading ? <Skeleton className="h-8 w-2/4" /> : (
                            <div className="text-2xl font-bold">R {referralBalance.toFixed(2)}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
                        <Gift className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                         {loading ? <Skeleton className="h-8 w-1/4" /> : (
                            <div className="text-2xl font-bold">{referredUsers.length}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Request Payout</CardTitle>
                        <CardDescription>Withdraw your referral earnings.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 text-center">
                            <p className="text-sm text-muted-foreground">Available to withdraw</p>
                            <p className="text-4xl font-bold text-primary">R {referralBalance.toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full" disabled={loading || referralBalance <= 0}>
                                    Request Payout
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Bank Details for Payout</DialogTitle>
                                    <DialogDescription>Please provide your banking information. The payout will be processed within 5-7 business days.</DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="bankName"><Bank className="inline-block mr-2 h-4 w-4"/>Bank Name</Label>
                                        <Input id="bankName" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} placeholder="e.g. Standard Bank" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountHolder"><UserIcon className="inline-block mr-2 h-4 w-4"/>Account Holder Name</Label>
                                        <Input id="accountHolder" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} placeholder="John Doe" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="accountNumber"><Hash className="inline-block mr-2 h-4 w-4"/>Account Number</Label>
                                        <Input id="accountNumber" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="branchCode"><Hash className="inline-block mr-2 h-4 w-4"/>Branch Code</Label>
                                        <Input id="branchCode" value={bankDetails.branchCode} onChange={e => setBankDetails({...bankDetails, branchCode: e.target.value})} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handlePayoutRequest} disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                        Submit Request
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardFooter>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Your Referrals</CardTitle>
                        <CardDescription>Users who signed up with your code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-10 w-full mb-2" />) : (
                            referredUsers.length > 0 ? (
                                <ul className="space-y-2">
                                    {referredUsers.map(refUser => (
                                        <li key={refUser.id} className="flex justify-between items-center p-2 bg-muted rounded-md">
                                            <span className="font-medium text-sm">{refUser.fullName}</span>
                                            <span className="text-xs text-muted-foreground">Joined: {refUser.createdAt}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8">You haven't referred any users yet.</p>
                            )
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default withAuth(ReferralsPage, ['student']);
