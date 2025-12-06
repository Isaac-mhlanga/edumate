
'use client';

import React from "react";
import withAuth from "@/components/with-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, getDocs, collection, updateDoc, deleteDoc, Timestamp, addDoc } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";

import { PayoutRequest as PayoutRequestType, adminData } from "@/lib/data";
import { AdminOverviewTab } from "@/components/admin/overview-tab";
import { AdminUsersTab } from "@/components/admin/users-tab";
import { AdminCoursesTab } from "@/components/admin/courses-tab";
import { AdminAssignmentsTab } from "@/components/admin/assignments-tab";
import { AdminCalendarTab } from "@/components/admin/calendar-tab";
import { AdminPayoutsTab } from "@/components/admin/payouts-tab";
import { AdminSubscriptionsTab } from "@/components/admin/subscriptions-tab";
import { UserActionDialogs } from "@/components/admin/user-action-dialogs";
import { CourseActionDialog } from "@/components/admin/course-action-dialog";
import { PayoutActionDialog, PayoutReceiptDialog } from "@/components/admin/payout-dialogs";
import { AssignmentReviewDialog } from "@/components/admin/assignment-review-dialog";
import { SubscriptionActionDialog } from "@/components/admin/subscription-action-dialog";
import { CalendarDialogs } from "@/components/admin/calendar-dialogs";
import { summarizeInstructorPerformance } from "@/ai/flows/summarize-instructor-performance";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type User = { id: string; fullName: string; name:string; email: string; role: 'student' | 'instructor' | 'admin' | 'tutor'; joined: string; status: 'Active' | 'Suspended'; subscriptionPlan?: string; };
export type Course = { id: string; title: string; subject: string; grade: string; instructor: string; pricing: { type: string, price?: number }; status: 'Published' | 'Pending Approval' | 'Rejected' | 'Draft' };
export type PayoutRequest = PayoutRequestType;
export type Assignment = { id: string; assignmentTitle: string; course: string; studentName: string; instructor: string; price: number | null; status: 'Paid' | 'Awaiting Payment' | 'Pending Review'; fileUrl: string; };
export type Subscription = { id: string; studentId: string; studentName: string; studentEmail: string; planName: string; status: 'Active' | 'Canceled'; nextBillingDate: string; };
export type CalendarEvent = { id: string; title: string; start: string; end?: string; allDay: boolean; color?: string; description?: string; instructor?: string; grade?: string; subject?: string; scope?: string; platforms?: string[]; };
export type Transaction = { id: string; itemType: string; status: string; amount: number; createdAt: Timestamp; };

function AdminPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [firestore] = React.useState(getFirestore(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)));

    const currentTab = searchParams.get('tab') || 'overview';

    const [users, setUsers] = React.useState<User[]>([]);
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [assignments, setAssignments] = React.useState<Assignment[]>([]);
    const [payoutRequests, setPayoutRequests] = React.useState<PayoutRequest[]>(adminData.payoutRequests);
    const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [events, setEvents] = React.useState<CalendarEvent[]>([]);
    
    const [loading, setLoading] = React.useState(true);
    const [aiSummary, setAiSummary] = React.useState('');
    const [loadingAiSummary, setLoadingAiSummary] = React.useState(true);
    
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
    const [courseAction, setCourseAction] = React.useState<'Approve' | 'Reject' | null>(null);
    const [selectedPayout, setSelectedPayout] = React.useState<PayoutRequest | null>(null);
    const [payoutAction, setPayoutAction] = React.useState<'Approve' | 'Decline' | null>(null);
    const [selectedAssignment, setSelectedAssignment] = React.useState<Assignment | null>(null);
    const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);

    const [isSuspendUserDialogOpen, setIsSuspendUserDialogOpen] = React.useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);
    const [isCourseActionDialogOpen, setIsCourseActionDialogOpen] = React.useState(false);
    const [isPayoutActionDialogOpen, setIsPayoutActionDialogOpen] = React.useState(false);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
    const [isAssignmentReviewDialogOpen, setIsAssignmentReviewDialogOpen] = React.useState(false);
    const [isCancelSubscriptionDialogOpen, setIsCancelSubscriptionDialogOpen] = React.useState(false);

    const generatePerformanceSummary = React.useCallback(async (courses: Course[], users: User[], assignments: Assignment[], transactions: Transaction[]) => {
        setLoadingAiSummary(true);
        try {
            const totalRevenue = transactions
                .filter(t => t.itemType === 'course' || t.itemType === 'assignment' && t.status !== 'Refunded')
                .reduce((sum, t) => sum + t.amount, 0);

            const response = await summarizeInstructorPerformance({
                instructorName: "Admin",
                totalStudents: users.filter(u => u.role === 'student').length,
                totalCourses: courses.length,
                totalEarnings: totalRevenue,
                pendingAssignments: assignments.filter(a => a.status === 'Pending Review').length,
                courseTitles: courses.map(c => c.title)
            });
            setAiSummary(response.summary);
        } catch (error) {
            console.error("Error generating AI summary: ", error);
            setAiSummary("Could not generate performance summary at this time.");
        } finally { setLoadingAiSummary(false); }
    }, []);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Events
                const eventsSnapshot = await getDocs(collection(firestore, "events"));
                const fetchedEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
                setEvents(fetchedEvents);

                const usersSnapshot = await getDocs(collection(firestore, "users"));
                const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().fullName, ...doc.data() } as User));
                
                const fetchedSubscriptions = adminData.subscriptions;
                setSubscriptions(fetchedSubscriptions);
                const subscriptionMap = new Map<string, string>();
                fetchedSubscriptions.forEach(sub => { if (sub.status === 'Active') { subscriptionMap.set(sub.studentId, sub.planName); } });
                const usersWithSubscriptions = fetchedUsers.map(user => ({ ...user, subscriptionPlan: subscriptionMap.get(user.id) }));
                setUsers(usersWithSubscriptions);

                const coursesSnapshot = await getDocs(collection(firestore, "courses"));
                const fetchedCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
                setCourses(fetchedCourses);

                const assignmentsSnapshot = await getDocs(collection(firestore, "assignments"));
                const fetchedAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, assignmentTitle: doc.data().title, ...doc.data() } as Assignment));
                setAssignments(fetchedAssignments);
                
                const transactionsSnapshot = await getDocs(collection(firestore, "transactions"));
                const fetchedTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                setTransactions(fetchedTransactions);
                
                await generatePerformanceSummary(fetchedCourses, usersWithSubscriptions, fetchedAssignments, fetchedTransactions);
            } catch (error) {
                console.error("Error fetching admin data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch platform data.' });
                 setLoadingAiSummary(false);
            }
            setLoading(false);
        };
        fetchData();
    }, [firestore, toast, generatePerformanceSummary]);

    const handleUserAction = (user: User, action: 'suspend' | 'delete') => {
        setSelectedUser(user);
        if (action === 'suspend') setIsSuspendUserDialogOpen(true);
        if (action === 'delete') setIsDeleteUserDialogOpen(true);
    };

    const confirmSuspendUser = async () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'Active' ? 'Suspended' : 'Active';
        await updateDoc(doc(firestore, 'users', selectedUser.id), { status: newStatus });
        setUsers(users.map(u => u.id === selectedUser.id ? {...u, status: newStatus} : u));
        toast({ title: "User Status Updated", description: `${selectedUser.name}'s status has been changed to ${newStatus}.` });
        setIsSuspendUserDialogOpen(false);
    }

    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        await deleteDoc(doc(firestore, "users", selectedUser.id));
        setUsers(users.filter(u => u.id !== selectedUser.id));
        toast({ title: "User Deleted", description: `${selectedUser.name} has been permanently deleted.`, variant: "destructive" });
        setIsDeleteUserDialogOpen(false);
    }

    const confirmCourseAction = async () => {
        if (!selectedCourse || !courseAction) return;
        const newStatus = courseAction === 'Approve' ? 'Published' : 'Rejected';
        await updateDoc(doc(firestore, 'courses', selectedCourse.id), { status: newStatus });
        setCourses(courses.map(c => c.id === selectedCourse.id ? { ...c, status: newStatus } : c));
        toast({ title: `Course ${courseAction}d`, description: `The course "${selectedCourse.title}" has been ${newStatus.toLowerCase()}.` });
        setIsCourseActionDialogOpen(false);
    };

    const confirmPayoutAction = () => {
        if (!selectedPayout || !payoutAction) return;
        const newStatus = payoutAction === 'Approve' ? 'Completed' : 'Declined';
        setPayoutRequests(payouts => payouts.map(p => p.id === selectedPayout.id ? {...p, status: newStatus } : p));
        toast({ title: `Payout ${payoutAction}d`, description: `The payout request for ${selectedPayout.instructor} has been ${newStatus.toLowerCase()}.` });
        setIsPayoutActionDialogOpen(false);
    };
    
    const confirmCancelSubscription = () => {
        if (!selectedSubscription) return;
        setSubscriptions(subs => subs.map(s => s.id === selectedSubscription.id ? { ...s, status: 'Canceled' } : s));
        toast({ title: "Subscription Canceled", description: `The subscription for ${selectedSubscription.studentName} has been canceled.` });
        setIsCancelSubscriptionDialogOpen(false);
    };

    return (
        <div className="space-y-8">
            <style jsx global>{`
                .fc-col-header-cell-cushion {
                    color: hsl(var(--muted-foreground)) !important;
                }
            `}</style>
            {currentTab === 'overview' && (
                <AdminOverviewTab
                    loading={loading}
                    aiSummary={aiSummary}
                    loadingAiSummary={loadingAiSummary}
                    events={events}
                    payoutRequests={payoutRequests}
                    onRegenerateSummary={() => generatePerformanceSummary(courses, users, assignments, transactions)}
                />
            )}
            {currentTab === 'users' && <AdminUsersTab users={users} onUserAction={handleUserAction} />}
            {currentTab === 'courses' && (
                <AdminCoursesTab 
                    courses={courses} 
                    onCourseAction={(course, action) => {
                        setSelectedCourse(course);
                        setCourseAction(action);
                        setIsCourseActionDialogOpen(true);
                    }}
                />
            )}
            {currentTab === 'assignments' && (
                <AdminAssignmentsTab 
                    assignments={assignments} 
                    onOpenAssignmentReview={(assignment) => {
                        setSelectedAssignment(assignment);
                        setIsAssignmentReviewDialogOpen(true);
                    }} 
                />
            )}
            {currentTab === 'calendar' && <AdminCalendarTab events={events} setEvents={setEvents} />}
            {currentTab === 'payouts' && (
                <AdminPayoutsTab 
                    payouts={payoutRequests}
                    onPayoutAction={(payout, action) => {
                        setSelectedPayout(payout);
                        setPayoutAction(action);
                        setIsPayoutActionDialogOpen(true);
                    }}
                    onViewReceipt={(payout) => {
                        setSelectedPayout(payout);
                        setIsReceiptDialogOpen(true);
                    }}
                />
            )}
            {currentTab === 'subscriptions' && (
                <AdminSubscriptionsTab 
                    subscriptions={subscriptions}
                    onCancelSubscription={(subscription) => {
                        setSelectedSubscription(subscription);
                        setIsCancelSubscriptionDialogOpen(true);
                    }}
                />
            )}

            <UserActionDialogs 
                isSuspendOpen={isSuspendUserDialogOpen}
                setIsSuspendOpen={setIsSuspendUserDialogOpen}
                isDeleteOpen={isDeleteUserDialogOpen}
                setIsDeleteOpen={setIsDeleteUserDialogOpen}
                selectedUser={selectedUser}
                onConfirmSuspend={confirmSuspendUser}
                onConfirmDelete={confirmDeleteUser}
            />
            <CourseActionDialog
                isOpen={isCourseActionDialogOpen}
                setIsOpen={setIsCourseActionDialogOpen}
                selectedCourse={selectedCourse}
                courseAction={courseAction}
                onConfirm={confirmCourseAction}
            />
            <PayoutActionDialog
                isOpen={isPayoutActionDialogOpen}
                setIsOpen={setIsPayoutActionDialogOpen}
                selectedPayout={selectedPayout}
                payoutAction={payoutAction}
                onConfirm={confirmPayoutAction}
            />
            <PayoutReceiptDialog
                isOpen={isReceiptDialogOpen}
                setIsOpen={setIsReceiptDialogOpen}
                selectedPayout={selectedPayout}
            />
            <AssignmentReviewDialog
                isOpen={isAssignmentReviewDialogOpen}
                setIsOpen={setIsAssignmentReviewDialogOpen}
                selectedAssignment={selectedAssignment}
                onFeedbackSubmit={() => {
                    toast({ title: "Feedback Sent", description: "Your comments and actions have been logged." });
                    setIsAssignmentReviewDialogOpen(false);
                }}
            />
            <SubscriptionActionDialog
                isOpen={isCancelSubscriptionDialogOpen}
                setIsOpen={setIsCancelSubscriptionDialogOpen}
                selectedSubscription={selectedSubscription}
                onConfirm={confirmCancelSubscription}
            />
        </div>
    );
}

export default withAuth(AdminPage, ['admin']);

    