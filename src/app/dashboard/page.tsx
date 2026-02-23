
'use client';

import withAuth from "@/components/with-auth";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { format } from "date-fns";

import { OverviewTab } from "@/components/dashboard/overview-tab";
import { CoursesTab } from "@/components/dashboard/courses-tab";
import { AssignmentsTab } from "@/components/dashboard/assignments-tab";
import { TransactionsTab } from "@/components/dashboard/transactions-tab";
import { SubscriptionsTab } from "@/components/dashboard/subscriptions-tab";
import { AssignmentDialog } from "@/components/dashboard/assignment-dialog";
import { RefundDialog } from "@/components/dashboard/refund-dialog";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type Course = {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: string;
    thumbnail: string;
    pricing: {
        type: string;
        price?: number;
    };
    instructor: string;
    videos: any[];
    duration?: string;
    rating?: number;
    progress?: number; // Added for student progress
};

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
    deletedByStudent?: boolean;
};

export type Transaction = {
    id: string;
    itemId: string;
    itemTitle: string;
    type: string;
    itemType: 'course' | 'assignment' | 'subscription' | 'Tutoring Session';
    status: 'Completed' | 'Refunded';
    amount: number;
    createdAt: Timestamp;
    date: string; // for display
};

function DashboardPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    
    const currentTab = searchParams.get('tab') || 'overview';

    const [submittedAssignments, setSubmittedAssignments] = React.useState<SubmittedAssignment[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [allCourses, setAllCourses] = React.useState<Course[]>([]);
    const [purchasedCourses, setPurchasedCourses] = React.useState<Course[]>([]);

    const [loadingAssignments, setLoadingAssignments] = React.useState(true);
    const [loadingTransactions, setLoadingTransactions] = React.useState(true);
    const [loadingCourses, setLoadingCourses] = React.useState(true);
    
    const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
    const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
    const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = React.useState(false);
    const [selectedAssignment, setSelectedAssignment] = React.useState<SubmittedAssignment | null>(null);


    React.useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const fetchStudentData = async (user: User) => {
            setLoadingAssignments(true);
            setLoadingTransactions(true);
            setLoadingCourses(true);
            try {
                // Fetch assignments
                const assignmentsQuery = query(collection(firestore, 'assignments'), where('studentId', '==', user.uid), orderBy('submittedAt', 'desc'));
                const assignmentsSnapshot = await getDocs(assignmentsQuery);
                const assignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubmittedAssignment[];
                setSubmittedAssignments(assignments.filter(a => !a.deletedByStudent));

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

                // Fetch all courses
                const coursesSnapshot = await getDocs(collection(firestore, 'courses'));
                const fetchedAllCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
                setAllCourses(fetchedAllCourses);

                // Determine purchased courses
                const purchasedCourseIds = new Set(fetchedTransactions.filter(t => t.itemType === 'course').map(t => t.itemId));
                const studentPurchasedCourses = fetchedAllCourses
                    .filter(course => purchasedCourseIds.has(course.id))
                    .map(course => ({
                        ...course,
                        // Simulate progress for now. In a real app, this would come from a 'progress' collection.
                        progress: Math.floor(Math.random() * 80) + 10,
                    }));
                setPurchasedCourses(studentPurchasedCourses);

            } catch (error: any) {
                console.error("Error fetching student data: ", error);
                let errorMessage = 'Could not fetch your data. This can happen if the required database index is not set up.';
                if (error instanceof FirebaseError) { errorMessage = error.message; }
                toast({ variant: 'destructive', title: 'Error', description: errorMessage });
            } finally {
                setLoadingAssignments(false);
                setLoadingTransactions(false);
                setLoadingCourses(false);
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            if (user) {
                fetchStudentData(user);
            } else {
                setSubmittedAssignments([]);
                setTransactions([]);
                setAllCourses([]);
                setPurchasedCourses([]);
                setLoadingAssignments(false);
                setLoadingTransactions(false);
                setLoadingCourses(false);
            }
        });

        return () => unsubscribe();
    }, [toast]);
    
    const handleSoftDeleteAssignment = async (assignmentId: string) => {
        const firestore = getFirestore();
        const assignmentRef = doc(firestore, 'assignments', assignmentId);
        try {
            await updateDoc(assignmentRef, {
                deletedByStudent: true,
            });
            setSubmittedAssignments(prev => prev.filter(a => a.id !== assignmentId));
            toast({
                title: "Assignment Hidden",
                description: "The assignment has been removed from your view.",
            });
        } catch (error) {
            console.error("Error hiding assignment:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not hide the assignment.' });
        }
    };

    const handleFreeEnrollment = async (course: Course) => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Not Logged In', description: 'You must be logged in to enroll in a course.' });
            return;
        }

        const firestore = getFirestore();
        try {
            await addDoc(collection(firestore, 'transactions'), {
                studentId: user.uid,
                itemId: course.id,
                itemTitle: course.title,
                itemType: 'course',
                amount: 0,
                status: 'Completed',
                currency: 'ZAR',
                createdAt: serverTimestamp(),
            });

            const newTransaction: Transaction = {
                id: `temp-${Date.now()}`,
                itemId: course.id,
                itemTitle: course.title,
                itemType: 'course',
                status: 'Completed',
                amount: 0,
                createdAt: Timestamp.now(),
                date: format(new Date(), 'PPP'),
                type: 'course'
            };
            setTransactions(prev => [newTransaction, ...prev]);

            setPurchasedCourses(prev => [{...course, progress: 0}, ...prev]);

            toast({ title: 'Enrollment Successful!', description: `You have enrolled in "${course.title}".` });
        } catch (error) {
            console.error("Error during free enrollment:", error);
            toast({ variant: 'destructive', title: 'Enrollment Failed', description: 'Could not enroll in the course. Please try again.' });
        }
    };
    
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

    const purchasedCourseIds = new Set(transactions.filter(t => t.itemType === 'course').map(t => t.itemId));

    return (
        <div className="space-y-8">
            {currentTab === 'overview' && (
                <OverviewTab 
                    submittedAssignments={submittedAssignments} 
                    purchasedCourses={purchasedCourses}
                    loading={loadingCourses || loadingAssignments}
                />
            )}

            {currentTab === 'courses' && (
                <CoursesTab 
                    allCourses={allCourses} 
                    loadingCourses={loadingCourses}
                    onFreeEnrollment={handleFreeEnrollment}
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
                    onSoftDelete={handleSoftDeleteAssignment}
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

export default withAuth(DashboardPage, ['student']);


    

    