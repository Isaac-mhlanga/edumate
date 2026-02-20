
'use client';

import React from "react";
import withAuth from "@/components/with-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, getDocs, collection, updateDoc, deleteDoc, Timestamp, addDoc, orderBy, query, getDoc, onSnapshot, setDoc, writeBatch } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";
import { getApp, getApps, initializeApp } from "firebase/app";

import { AdminOverviewTab } from "@/components/admin/overview-tab";
import { AdminUsersTab } from "@/components/admin/users-tab";
import { AdminCoursesTab } from "@/components/admin/courses-tab";
import { AdminAssignmentsTab } from "@/components/admin/assignments-tab";
import { AdminCalendarTab } from "@/components/admin/calendar-tab";
import { AdminPayoutsTab } from "@/components/admin/payouts-tab";
import { AdminSubscriptionsTab } from "@/components/admin/subscriptions-tab";
import { AdminTutorsTab, TutorProfileDialog } from "@/components/admin/tutors-tab";
import { UserActionDialogs, UserDetailsDialog } from "@/components/admin/user-action-dialogs";
import { CourseActionDialog } from "@/components/admin/course-action-dialog";
import { PayoutActionDialog, PayoutReceiptDialog, ClearAllPayoutsDialog } from "@/components/admin/payout-dialogs";
import { AssignmentReviewDialog, DeleteAssignmentDialog, MarkAsPaidDialog } from "@/components/admin/assignment-action-dialogs";
import { SubscriptionActionDialog } from "@/components/admin/subscription-action-dialog";
import { format, formatDistanceToNow } from "date-fns";
import { EnquiriesPage } from "@/components/enquiries-page";
import { ChangeRoleDialog } from "@/components/admin/change-role-dialog";
import { AdminPromotionsTab } from "@/components/admin/promotions-tab";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type User = { id: string; fullName: string; name:string; email: string; role: 'student' | 'varsity-student' | 'instructor' | 'admin' | 'tutor'; joined: string; originalJoinedDate: Date; status: 'Active' | 'Suspended'; subscriptionPlan?: string; phoneNumber?: string; };
export type Course = { id: string; instructorId: string; title: string; subject: string; grade: string; instructor: string; pricing: { type: string, price?: number }; status: 'Published' | 'Pending Approval' | 'Rejected' | 'Draft'; createdAt: Timestamp };
export type PayoutRequest = {
    id: string;
    userName: string;
    userId: string;
    amount: number;
    requestedAt: Timestamp;
    date: string; // for display
    status: 'Pending' | 'Completed' | 'Declined';
    type: 'Instructor' | 'Referral';
    bankDetails?: {
        bankName: string;
        accountHolder: string;
        accountNumber: string;
        branchCode: string;
    }
};
export type Assignment = { id: string; studentId: string; assignmentTitle: string; course: string; studentName: string; instructor: string; instructorId?: string; markerId?: string; price: number | null; status: 'Paid' | 'Awaiting Payment' | 'Pending Review' | 'In Progress' | 'Submitted'; fileUrl: string; deletedByStudent?: boolean; };
export type Subscription = { id: string; studentId: string; studentName: string; studentEmail: string; planName: string; status: 'Active' | 'Canceled'; nextBillingDate: string; };
export type CalendarEvent = { id: string; title: string; start: string; end?: string; allDay: boolean; color?: string; description?: string; instructor?: string; instructorId?: string; grade?: string; subject?: string; module?: string; scope?: string; platforms?: string[]; };
export type Transaction = { id: string; itemType: string; itemTitle: string; status: string; amount: number; createdAt: Timestamp; };
export type RecentActivity = {
    id: string;
    type: 'New User' | 'New Course' | 'Payout' | 'Transaction';
    description: string;
    timestamp: string;
    value?: string;
    originalTimestamp: Date;
};
export type TutorProfile = {
    id: string;
    name: string;
    email: string;
    bio: string;
    hourlyRate: number;
    subjects: string[];
    grades: string[];
    location: string;
    avatar: string;
    modes: ('Online' | 'In-person')[];
    availability: { day: string; slots: string[] }[];
    qualifications: string;
    qualificationUrl: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
};
export type Promotion = {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    icon: string;
};


function AdminPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [firestore] = React.useState(getFirestore(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)));
    const [storage] = React.useState(getStorage(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)));

    const currentTab = searchParams.get('tab') || 'overview';

    const [users, setUsers] = React.useState<User[]>([]);
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [assignments, setAssignments] = React.useState<Assignment[]>([]);
    const [payoutRequests, setPayoutRequests] = React.useState<PayoutRequest[]>([]);
    const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [events, setEvents] = React.useState<CalendarEvent[]>([]);
    const [tutors, setTutors] = React.useState<TutorProfile[]>([]);
    const [promotion, setPromotion] = React.useState<Promotion | null>(null);
    
    const [loading, setLoading] = React.useState(true);
    
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
    const [courseAction, setCourseAction] = React.useState<'Approve' | 'Reject' | null>(null);
    const [selectedPayout, setSelectedPayout] = React.useState<PayoutRequest | null>(null);
    const [payoutAction, setPayoutAction] = React.useState<'Approve' | 'Decline' | null>(null);
    const [selectedAssignment, setSelectedAssignment] = React.useState<Assignment | null>(null);
    const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);
    const [selectedTutorProfile, setSelectedTutorProfile] = React.useState<TutorProfile | null>(null);

    const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = React.useState(false);
    const [isSuspendUserDialogOpen, setIsSuspendUserDialogOpen] = React.useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);
    const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = React.useState(false);
    const [isCourseActionDialogOpen, setIsCourseActionDialogOpen] = React.useState(false);
    const [isPayoutActionDialogOpen, setIsPayoutActionDialogOpen] = React.useState(false);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
    const [isAssignmentReviewDialogOpen, setIsAssignmentReviewDialogOpen] = React.useState(false);
    const [isDeleteAssignmentDialogOpen, setIsDeleteAssignmentDialogOpen] = React.useState(false);
    const [isMarkAsPaidDialogOpen, setIsMarkAsPaidDialogOpen] = React.useState(false);
    const [isCancelSubscriptionDialogOpen, setIsCancelSubscriptionDialogOpen] = React.useState(false);
    const [isTutorProfileDialogOpen, setIsTutorProfileDialogOpen] = React.useState(false);
    const [isClearAllPayoutsDialogOpen, setIsClearAllPayoutsDialogOpen] = React.useState(false);


    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Events
                const eventsSnapshot = await getDocs(collection(firestore, "events"));
                const fetchedEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
                setEvents(fetchedEvents);

                // Fetch Users and create a map for instructor lookup
                const usersSnapshot = await getDocs(query(collection(firestore, "users"), orderBy('createdAt', 'desc')));
                const userMap = new Map<string, string>();
                const fetchedUsers = usersSnapshot.docs.map(doc => {
                    const data = doc.data();
                    userMap.set(doc.id, data.fullName); // Populate map
                    const joinedDate = data.createdAt.toDate();
                    return { 
                        id: doc.id, 
                        name: data.fullName, 
                        joined: format(joinedDate, 'PPP'), 
                        originalJoinedDate: joinedDate, 
                        ...data 
                    } as User;
                });
                
                const subsSnapshot = await getDocs(collection(firestore, "subscriptions"));
                const fetchedSubscriptions = subsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Omit<Subscription, 'id'>}));
                setSubscriptions(fetchedSubscriptions);
                const subscriptionMap = new Map<string, string>();
                fetchedSubscriptions.forEach(sub => { if (sub.status === 'Active') { subscriptionMap.set(sub.studentId, sub.planName); } });
                const usersWithSubscriptions = fetchedUsers.map(user => ({ ...user, subscriptionPlan: subscriptionMap.get(user.id) || user.subscriptionPlan }));
                setUsers(usersWithSubscriptions);

                const tutorsSnapshot = await getDocs(collection(firestore, "tutors"));
                const fetchedTutors = tutorsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TutorProfile));
                setTutors(fetchedTutors);

                const coursesSnapshot = await getDocs(query(collection(firestore, "courses"), orderBy('createdAt', 'desc')));
                const fetchedCourses = coursesSnapshot.docs.map(doc => {
                    const courseData = { id: doc.id, ...doc.data() } as Course;
                    return {
                        ...courseData,
                        instructor: userMap.get(courseData.instructorId) || 'Unknown Instructor'
                    };
                });
                setCourses(fetchedCourses);

                const assignmentsSnapshot = await getDocs(collection(firestore, "assignments"));
                const fetchedAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, assignmentTitle: doc.data().title, ...doc.data() } as Assignment));
                setAssignments(fetchedAssignments);
                
                const transactionsSnapshot = await getDocs(query(collection(firestore, "transactions"), orderBy('createdAt', 'desc')));
                const fetchedTransactions = transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
                setTransactions(fetchedTransactions);

                const payoutsQuery = query(collection(firestore, 'payouts'), orderBy('requestedAt', 'desc'));
                const payoutsSnapshot = await getDocs(payoutsQuery);
                const fetchedPayouts = payoutsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        date: data.requestedAt ? format(data.requestedAt.toDate(), 'PPP') : 'N/A'
                    } as PayoutRequest;
                });
                setPayoutRequests(fetchedPayouts);
                
                // Fetch Promotion
                const promoRef = doc(firestore, 'promotions', 'homepage-banner');
                const promoSnap = await getDoc(promoRef);
                if (promoSnap.exists()) {
                    setPromotion(promoSnap.data() as Promotion);
                }

            } catch (error) {
                console.error("Error fetching admin data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch platform data.' });
            }
            setLoading(false);
        };
        fetchData();
    }, [firestore, toast]);

    const recentActivity = React.useMemo(() => {
        const userMap = new Map(users.map(u => [u.id, u.fullName]));

        const userActivities: RecentActivity[] = users.slice(0, 5).map(user => ({
            id: `user-${user.id}`,
            type: 'New User',
            description: `${user.fullName} signed up as a ${user.role}.`,
            originalTimestamp: user.originalJoinedDate,
            timestamp: formatDistanceToNow(user.originalJoinedDate, { addSuffix: true }),
            value: user.role
        }));
    
        const courseActivities: RecentActivity[] = courses.slice(0, 5).map(course => {
            const instructorName = userMap.get(course.instructorId) || 'An instructor';
            return {
                id: `course-${course.id}`,
                type: 'New Course',
                description: `${instructorName} created "${course.title}".`,
                originalTimestamp: course.createdAt.toDate(),
                timestamp: formatDistanceToNow(course.createdAt.toDate(), { addSuffix: true }),
                value: course.status
            };
        });
        
        const transactionActivities: RecentActivity[] = transactions.slice(0, 5).map(t => ({
             id: `txn-${t.id}`,
            type: 'Transaction',
            description: `Sale of "${t.itemTitle}".`,
            originalTimestamp: t.createdAt.toDate(),
            timestamp: formatDistanceToNow(t.createdAt.toDate(), { addSuffix: true }),
            value: `R ${t.amount.toFixed(2)}`
        }));
        
        return [...userActivities, ...courseActivities, ...transactionActivities]
            .sort((a, b) => b.originalTimestamp.getTime() - a.originalTimestamp.getTime());
    }, [users, courses, transactions]);


    const handleUserAction = (user: User, action: 'suspend' | 'delete' | 'view' | 'change-role') => {
        setSelectedUser(user);
        if (action === 'suspend') setIsSuspendUserDialogOpen(true);
        if (action === 'delete') setIsDeleteUserDialogOpen(true);
        if (action === 'view') setIsUserDetailsDialogOpen(true);
        if (action === 'change-role') setIsChangeRoleDialogOpen(true);
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
    
    const confirmChangeRole = async (newRole: 'student' | 'varsity-student' | 'instructor' | 'admin' | 'tutor') => {
        if (!selectedUser) return;
        try {
            await updateDoc(doc(firestore, 'users', selectedUser.id), { role: newRole });
            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: newRole } : u));
            toast({ title: "User Role Updated", description: `${selectedUser.name}'s role has been changed to ${newRole}.` });
            setIsChangeRoleDialogOpen(false);
        } catch (error) {
            console.error("Error updating user role:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update user role.' });
        }
    };

    const confirmCourseAction = async () => {
        if (!selectedCourse || !courseAction) return;
        const newStatus = courseAction === 'Approve' ? 'Published' : 'Rejected';
        await updateDoc(doc(firestore, 'courses', selectedCourse.id), { status: newStatus });
        setCourses(courses.map(c => c.id === selectedCourse.id ? { ...c, status: newStatus } : c));
        toast({ title: `Course ${courseAction}d`, description: `The course "${selectedCourse.title}" has been ${newStatus.toLowerCase()}.` });
        setIsCourseActionDialogOpen(false);
    };

    const handlePublishCourse = async (courseToPublish: Course) => {
        try {
            await updateDoc(doc(firestore, 'courses', courseToPublish.id), { status: 'Published' });
            setCourses(courses.map(c => c.id === courseToPublish.id ? { ...c, status: 'Published' } : c));
            toast({ title: "Course Published", description: `"${courseToPublish.title}" is now live.` });
        } catch (error) {
            console.error("Error publishing course:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not publish course.' });
        }
    };
    
    const handleUnpublishCourse = async (courseToUnpublish: Course) => {
        try {
            await updateDoc(doc(firestore, 'courses', courseToUnpublish.id), { status: 'Draft' });
            setCourses(courses.map(c => c.id === courseToUnpublish.id ? { ...c, status: 'Draft' } : c));
            toast({ title: "Course Unpublished", description: `"${courseToUnpublish.title}" is now a draft.` });
        } catch (error) {
            console.error("Error unpublishing course:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not unpublish course.' });
        }
    };

    const confirmPayoutAction = async () => {
        if (!selectedPayout || !payoutAction) return;
        const newStatus = payoutAction === 'Approve' ? 'Completed' : 'Declined';
        
        await updateDoc(doc(firestore, 'payouts', selectedPayout.id), { status: newStatus });
        
        setPayoutRequests(payouts => payouts.map(p => p.id === selectedPayout.id ? {...p, status: newStatus } : p));
        toast({ title: `Payout ${payoutAction}d`, description: `The payout request for ${selectedPayout.userName} has been ${newStatus.toLowerCase()}.` });
        setIsPayoutActionDialogOpen(false);
    };

    const confirmClearAllPayouts = async () => {
        const payoutsCollection = collection(firestore, 'payouts');
        try {
            const querySnapshot = await getDocs(payoutsCollection);
            const batch = writeBatch(firestore);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            setPayoutRequests([]);
            toast({ title: "All Payouts Cleared", description: "All payout records have been permanently deleted." });
        } catch (error) {
            console.error("Error clearing payouts:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not clear all payouts.' });
        } finally {
            setIsClearAllPayoutsDialogOpen(false);
        }
    };

    const confirmDeleteAssignment = async () => {
        if (!selectedAssignment) return;
        
        try {
            // Delete file from storage
            if (selectedAssignment.fileUrl) {
                const fileRef = ref(storage, selectedAssignment.fileUrl);
                await deleteObject(fileRef);
            }
            
            // Delete document from firestore
            await deleteDoc(doc(firestore, 'assignments', selectedAssignment.id));

            setAssignments(assignments.filter(a => a.id !== selectedAssignment.id));
            toast({ title: "Assignment Deleted", description: `The assignment "${selectedAssignment.assignmentTitle}" has been deleted.` });
        } catch (error) {
            console.error("Error deleting assignment:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the assignment.' });
        } finally {
            setIsDeleteAssignmentDialogOpen(false);
            setSelectedAssignment(null);
        }
    };

    const handleUpdateAssignmentPrice = async (assignmentId: string, newPrice: number | null) => {
        const assignmentRef = doc(firestore, 'assignments', assignmentId);
        try {
            const currentAssignment = assignments.find(a => a.id === assignmentId);
            let statusToUpdate = currentAssignment?.status;

            if (currentAssignment?.status === 'Pending Review' && newPrice !== null) {
                statusToUpdate = newPrice === 0 ? 'Paid' : 'Awaiting Payment';
            } else if (newPrice === 0) {
                statusToUpdate = 'Paid';
            }

            await updateDoc(assignmentRef, { 
                price: newPrice,
                status: statusToUpdate
            });
            
            setAssignments(prev => 
                prev.map(a => a.id === assignmentId ? { ...a, price: newPrice, status: statusToUpdate as any } : a)
            );

            toast({ title: "Assignment Price Updated", description: "The price and status have been successfully updated." });
            setIsAssignmentReviewDialogOpen(false);
        } catch (error) {
            console.error("Error updating assignment price:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the assignment price.' });
        }
    };

    const confirmMarkAsPaid = async () => {
        if (!selectedAssignment) return;

        try {
            const batch = writeBatch(firestore);

            const assignmentRef = doc(firestore, 'assignments', selectedAssignment.id);
            batch.update(assignmentRef, { status: 'Paid' });

            const transactionRef = doc(collection(firestore, 'transactions'));
            const instructorId = selectedAssignment.markerId || null;

            batch.set(transactionRef, {
                studentId: selectedAssignment.studentId,
                instructorId: instructorId,
                itemId: selectedAssignment.id,
                itemType: 'assignment',
                itemTitle: selectedAssignment.assignmentTitle,
                amount: selectedAssignment.price,
                status: 'Completed',
                currency: 'ZAR',
                createdAt: Timestamp.now(),
                notes: 'Manually marked as paid by admin.'
            });

            await batch.commit();

            setAssignments(prev => prev.map(a => 
                a.id === selectedAssignment.id ? { ...a, status: 'Paid' } : a
            ));
            
            const newTransaction: Transaction = {
                id: transactionRef.id,
                itemTitle: selectedAssignment.assignmentTitle,
                itemType: 'assignment',
                status: 'Completed',
                amount: selectedAssignment.price || 0,
                createdAt: Timestamp.now(),
            };
            setTransactions(prev => [newTransaction, ...prev]);

            toast({ title: 'Assignment Marked as Paid', description: `A transaction record has been created for ${selectedAssignment.studentName}.` });
            
        } catch (error) {
            console.error("Error marking assignment as paid:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the assignment status.' });
        } finally {
          setIsMarkAsPaidDialogOpen(false);
        }
    };
    
    const confirmCancelSubscription = () => {
        if (!selectedSubscription) return;
        setSubscriptions(subs => subs.map(s => s.id === selectedSubscription.id ? { ...s, status: 'Canceled' } : s));
        toast({ title: "Subscription Canceled", description: `The subscription for ${selectedSubscription.studentName} has been canceled.` });
        setIsCancelSubscriptionDialogOpen(false);
    };

    const handleTutorApproval = async (tutor: TutorProfile, newStatus: 'Approved' | 'Rejected') => {
        const tutorRef = doc(firestore, 'tutors', tutor.id);
        try {
            await updateDoc(tutorRef, { approvalStatus: newStatus });
            setTutors(prevTutors => prevTutors.map(t => t.id === tutor.id ? { ...t, approvalStatus: newStatus } : t));
            toast({
                title: `Tutor ${newStatus}`,
                description: `${tutor.name} has been ${newStatus.toLowerCase()}.`
            });
        } catch (error) {
            console.error(`Error updating tutor status:`, error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not update tutor status.` });
        }
    };
    
    const handleViewTutorProfile = (tutor: TutorProfile) => {
        setSelectedTutorProfile(tutor);
        setIsTutorProfileDialogOpen(true);
    };
    
    const handleSavePromotion = async (data: Promotion) => {
        const promoRef = doc(firestore, 'promotions', 'homepage-banner');
        try {
            await setDoc(promoRef, data, { merge: true });
            setPromotion(data);
            toast({ title: 'Promotion Updated', description: 'The homepage banner has been saved.' });
        } catch (error) {
            console.error("Error saving promotion:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the promotion.' });
        }
    };

    const handleAddOrUpdateEvent = async () => {
        if (!manualEvent.title || !manualEvent.start) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }

        // Sanitize data for Firestore by removing undefined properties
        const sanitizedEventData = Object.fromEntries(
            Object.entries(manualEvent).filter(([, value]) => value !== undefined)
        );
        
        try {
            if (manualEvent.id) {
                // Update existing event
                const eventRef = doc(firestore, 'events', manualEvent.id);
                await updateDoc(eventRef, sanitizedEventData);
                setEvents(prev => prev.map(e => e.id === manualEvent.id ? { ...e, ...sanitizedEventData } as CalendarEvent : e));
                toast({ title: 'Event Updated!', description: `"${manualEvent.title}" has been updated.` });
            } else {
                // Create new event
                const docRef = await addDoc(collection(firestore, 'events'), sanitizedEventData);
                const newEvent = { ...sanitizedEventData, id: docRef.id } as CalendarEvent;
                setEvents(prev => [...prev, newEvent]);
                toast({ title: 'Event Created!', description: `"${newEvent.title}" has been added.` });
            }
            
            setIsManualDialogOpen(false);
            setManualEvent({});
        } catch(error) {
            console.error("Error saving event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the event.' });
        }
    };

    return (
        <div className="space-y-8">
            <style jsx global>{`
                .fc-theme-standard .fc-list-day-cushion {
                    background-color: hsl(var(--card));
                }
                .fc-theme-standard th {
                    background: hsl(var(--card));
                }
                .fc-col-header-cell-cushion, .fc-list-day-text, .fc-list-day-side-text {
                    color: hsl(var(--foreground)) !important;
                }
                .fc .fc-list-event:hover td {
                    background-color: hsl(var(--muted)) !important;
                }
            `}</style>
            {currentTab === 'overview' && (
                <AdminOverviewTab
                    loading={loading}
                    events={events}
                    payoutRequests={payoutRequests}
                    users={users}
                    courses={courses}
                    transactions={transactions}
                    subscriptions={subscriptions}
                    recentActivity={recentActivity}
                />
            )}
            {currentTab === 'promotions' && (
                <AdminPromotionsTab 
                    promotion={promotion}
                    onSave={handleSavePromotion}
                />
            )}
            {currentTab === 'enquiries' && <EnquiriesPage userRole="admin" />}
            {currentTab === 'users' && <AdminUsersTab users={users} loading={loading} onUserAction={handleUserAction} />}
            {currentTab === 'tutors' && <AdminTutorsTab tutors={tutors} loading={loading} onTutorApproval={handleTutorApproval} onViewProfile={handleViewTutorProfile} />}
            {currentTab === 'courses' && (
                <AdminCoursesTab 
                    courses={courses} 
                    loading={loading}
                    onCourseAction={(course, action) => {
                        setSelectedCourse(course);
                        setCourseAction(action);
                        setIsCourseActionDialogOpen(true);
                    }}
                    onPublishCourse={handlePublishCourse}
                    onUnpublishCourse={handleUnpublishCourse}
                />
            )}
            {currentTab === 'assignments' && (
                <AdminAssignmentsTab 
                    assignments={assignments} 
                    onOpenAssignmentReview={(assignment) => {
                        setSelectedAssignment(assignment);
                        setIsAssignmentReviewDialogOpen(true);
                    }}
                    onDeleteAssignment={(assignment) => {
                        setSelectedAssignment(assignment);
                        setIsDeleteAssignmentDialogOpen(true);
                    }}
                    onMarkAsPaid={(assignment) => {
                        setSelectedAssignment(assignment);
                        setIsMarkAsPaidDialogOpen(true);
                    }}
                />
            )}
            {currentTab === 'calendar' && <AdminCalendarTab events={events} setEvents={setEvents} />}
            {currentTab === 'payouts' && (
                <AdminPayoutsTab 
                    payouts={payoutRequests}
                    loading={loading}
                    onPayoutAction={(payout, action) => {
                        setSelectedPayout(payout);
                        setPayoutAction(action);
                        setIsPayoutActionDialogOpen(true);
                    }}
                    onViewReceipt={(payout) => {
                        setSelectedPayout(payout);
                        setIsReceiptDialogOpen(true);
                    }}
                    onClearAllPayouts={() => setIsClearAllPayoutsDialogOpen(true)}
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

            <UserDetailsDialog
                isOpen={isUserDetailsDialogOpen}
                setIsOpen={setIsUserDetailsDialogOpen}
                selectedUser={selectedUser}
            />
            <UserActionDialogs 
                isSuspendOpen={isSuspendUserDialogOpen}
                setIsSuspendOpen={setIsSuspendUserDialogOpen}
                isDeleteOpen={isDeleteUserDialogOpen}
                setIsDeleteOpen={setIsDeleteUserDialogOpen}
                selectedUser={selectedUser}
                onConfirmSuspend={confirmSuspendUser}
                onConfirmDelete={confirmDeleteUser}
            />
             <ChangeRoleDialog
                isOpen={isChangeRoleDialogOpen}
                setIsOpen={setIsChangeRoleDialogOpen}
                selectedUser={selectedUser}
                onConfirm={confirmChangeRole}
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
            <ClearAllPayoutsDialog
                isOpen={isClearAllPayoutsDialogOpen}
                setIsOpen={setIsClearAllPayoutsDialogOpen}
                onConfirm={confirmClearAllPayouts}
            />
            <AssignmentReviewDialog
                isOpen={isAssignmentReviewDialogOpen}
                setIsOpen={setIsAssignmentReviewDialogOpen}
                selectedAssignment={selectedAssignment}
                onSave={handleUpdateAssignmentPrice}
            />
            <DeleteAssignmentDialog
                isOpen={isDeleteAssignmentDialogOpen}
                setIsOpen={setIsDeleteAssignmentDialogOpen}
                selectedAssignment={selectedAssignment}
                onConfirm={confirmDeleteAssignment}
            />
            <MarkAsPaidDialog
                isOpen={isMarkAsPaidDialogOpen}
                setIsOpen={setIsMarkAsPaidDialogOpen}
                selectedAssignment={selectedAssignment}
                onConfirm={confirmMarkAsPaid}
            />
            <SubscriptionActionDialog
                isOpen={isCancelSubscriptionDialogOpen}
                setIsOpen={setIsCancelSubscriptionDialogOpen}
                selectedSubscription={selectedSubscription}
                onConfirm={confirmCancelSubscription}
            />
            <TutorProfileDialog
                isOpen={isTutorProfileDialogOpen}
                setIsOpen={setIsTutorProfileDialogOpen}
                tutor={selectedTutorProfile}
            />
        </div>
    );
}

export default withAuth(AdminPage, ['admin']);

    

    
