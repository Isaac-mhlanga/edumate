'use client';
import withAuth from "@/components/with-auth";
import React from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, orderBy, Timestamp, doc } from 'firebase/firestore';
import { getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { format } from "date-fns";

// Reusing components from the student dashboard
import { AssignmentsTab } from "@/components/dashboard/assignments-tab";
import { TransactionsTab } from "@/components/dashboard/transactions-tab";
import { SubscriptionsTab } from "@/components/dashboard/subscriptions-tab";
import { AssignmentDialog } from "@/components/dashboard/assignment-dialog";
import { RefundDialog } from "@/components/dashboard/refund-dialog";
import { BookingsTab } from "@/components/dashboard/bookings-tab";

// New component for varsity overview
import { VarsityOverviewTab } from "@/components/varsity/overview-tab";
import { type Booking } from "@/app/admin/page";

export type SubmittedAssignment = {
    id: string;
    studentId: string;
    studentName: string;
    title: string;
    course: string;
    status: 'Paid' | 'Awaiting Payment' | 'Submitted' | 'Pending Submission' | 'Pending Review';
    price: number | null;
    solutionUrl: string | null;
    fileUrl: string;
    instructions?: string;
    submittedAt: Timestamp;
    dueDate?: Timestamp;
};

export type Transaction = {
    id: string;
    itemId: string;
    itemTitle: string;
    type: string;
    itemType: 'course' | 'assignment' | 'subscription';
    status: 'Completed' | 'Refunded';
    amount: number;
    createdAt: Timestamp;
    date: string; // for display
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


function VarsityDashboardPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    
    const currentTab = searchParams.get('tab') || 'overview';

    const [submittedAssignments, setSubmittedAssignments] = React.useState<SubmittedAssignment[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [bookings, setBookings] = React.useState<Booking[]>([]);

    const [loadingAssignments, setLoadingAssignments] = React.useState(true);
    const [loadingTransactions, setLoadingTransactions] = React.useState(true);
    const [loadingBookings, setLoadingBookings] = React.useState(true);
    
    const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = React.useState(false);
    const [selectedAssignment, setSelectedAssignment] = React.useState<SubmittedAssignment | null>(null);


    React.useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const fetchVarsityData = async (user: User) => {
            setLoadingAssignments(true);
            setLoadingTransactions(true);
            setLoadingBookings(true);
            try {
                // Fetch assignments
                const assignmentsQuery = query(collection(firestore, 'assignments'), where('studentId', '==', user.uid), orderBy('submittedAt', 'desc'));
                const assignmentsSnapshot = await getDocs(assignmentsQuery);
                const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubmittedAssignment[];
                setSubmittedAssignments(assignments);

                // Fetch transactions
                const transactionsQuery = query(collection(firestore, 'transactions'), where('studentId', '==', user.uid), orderBy('createdAt', 'desc'));
                const transactionsSnapshot = await getDocs(transactionsQuery);
                const fetchedTransactions = transactionsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id, ...data, date: data.createdAt ? format(data.createdAt.toDate(), 'PPP') : 'N/A'
                    }
                }) as Transaction[];
                setTransactions(fetchedTransactions);

                // Fetch bookings
                const bookingsQuery = query(collection(firestore, 'bookings'), where('studentId', '==', user.uid), orderBy('createdAt', 'desc'));
                const bookingsSnapshot = await getDocs(bookingsQuery);
                const userBookings = bookingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
                setBookings(userBookings);


            } catch (error: any) {
                console.error("Error fetching varsity data: ", error);
                let errorMessage = 'Could not fetch your data. This can happen if the required database index is not set up.';
                if (error instanceof FirebaseError) { errorMessage = error.message; }
                toast({ variant: 'destructive', title: 'Error', description: errorMessage });
            } finally {
                setLoadingAssignments(false);
                setLoadingTransactions(false);
                setLoadingBookings(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                fetchVarsityData(user);
            } else {
                setSubmittedAssignments([]);
                setTransactions([]);
                setBookings([]);
                setLoadingAssignments(false);
                setLoadingTransactions(false);
                setLoadingBookings(false);
            }
        });

        return () => unsubscribe();
    }, [toast]);
    
    const handleRefundRequest = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setIsRefundDialogOpen(true);
    };

    const confirmRefundRequest = () => {
        if (!selectedTransaction) return;
        toast({
            title: "Refund Request Submitted",
            description: `Your refund request for "${selectedTransaction.itemTitle}" has been submitted for review.`,
        });
        setIsRefundDialogOpen(false);
        setSelectedTransaction(null);
    };

    return (
        <div className="space-y-8">
            {currentTab === 'overview' && (
                <VarsityOverviewTab
                    user={user}
                    submittedAssignments={submittedAssignments} 
                    loading={loadingAssignments}
                />
            )}

            {currentTab === 'assignments' && (
                <AssignmentsTab 
                    submittedAssignments={submittedAssignments} 
                    loadingAssignments={loadingAssignments}
                    onOpenAssignmentDialog={(assignment) => {
                        setSelectedAssignment(assignment);
                        setIsAssignmentDialogOpen(true);
                    }}
                />
            )}

            {currentTab === 'bookings' && (
                <BookingsTab 
                    bookings={bookings} 
                    loadingBookings={loadingBookings}
                />
            )}

            {currentTab === 'transactions' && (
                <TransactionsTab 
                    transactions={transactions} 
                    loadingTransactions={loadingTransactions}
                    onRefundRequest={handleRefundRequest}
                />
            )}
            
            {currentTab === 'subscriptions' && (
                <SubscriptionsTab />
            )}

            <AssignmentDialog 
                isOpen={isAssignmentDialogOpen}
                setIsOpen={setIsAssignmentDialogOpen}
                selectedAssignment={selectedAssignment}
                onSuccess={() => {
                     // In a real app, you'd refetch assignments here. For now, just close.
                     setIsAssignmentDialogOpen(false);
                     setSelectedAssignment(null);
                }}
            />

            <RefundDialog
                isOpen={isRefundDialogOpen}
                setIsOpen={setIsRefundDialogOpen}
                selectedTransaction={selectedTransaction}
                onConfirm={confirmRefundRequest}
            />
        </div>
    );
}

export default withAuth(VarsityDashboardPage, ['varsity-student']);
