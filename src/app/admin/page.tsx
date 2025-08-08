
'use client';

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PayoutRequest as PayoutRequestType, adminData } from "@/lib/data";
import { ArrowUpRight, Banknote, BookOpen, Check, CheckCircle, ChevronLeft, ChevronRight, Clock, CreditCard, DollarSign, Download, Eye, FileText, FileUp, Hourglass, ListFilter, MessageSquare, MoreVertical, Printer, ReceiptText, RefreshCw, Search, Sparkles, Trash2, UserMinus, UserPlus, Users, X, XCircle, PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PayoutReceipt } from "@/components/payout-receipt";
import { useReactToPrint } from "react-to-print";
import withAuth from "@/components/with-auth";
import { getFirestore, doc, getDocs, collection, updateDoc, deleteDoc, writeBatch, query, where } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Skeleton } from "@/components/ui/skeleton";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { createCalendarEvent, CreateCalendarEventOutput } from '@/ai/flows/create-calendar-event';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type User = { id: string; fullName: string; name:string; email: string; role: 'student' | 'instructor' | 'admin' | 'tutor'; joined: string; status: 'Active' | 'Suspended'; subscriptionPlan?: string; };
type Course = { id: string; title: string; subject: string; grade: string; instructor: string; pricing: { type: string, price?: number }; status: 'Published' | 'Pending Approval' | 'Rejected' | 'Draft' };
type PayoutRequest = PayoutRequestType;
type Assignment = { id: string; assignmentTitle: string; course: string; studentName: string; instructor: string; price: number | null; status: 'Paid' | 'Awaiting Payment' | 'Pending Review'; fileUrl: string; };
type Subscription = { id: string; studentId: string; studentName: string; studentEmail: string; planName: string; status: 'Active' | 'Canceled'; nextBillingDate: string; };
type CalendarEvent = { id: string; title: string; start: string; end?: string; allDay: boolean; color?: string; description?: string; };

function AdminPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [firestore, setFirestore] = React.useState(getFirestore(getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)));

    const currentTab = searchParams.get('tab') || 'overview';

    const [users, setUsers] = React.useState<User[]>([]);
    const [courses, setCourses] = React.useState<Course[]>([]);
    const [assignments, setAssignments] = React.useState<Assignment[]>([]);
    const [payoutRequests, setPayoutRequests] = React.useState<PayoutRequest[]>(adminData.payoutRequests);
    const [subscriptions, setSubscriptions] = React.useState<Subscription[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    // Calendar State
    const [events, setEvents] = React.useState<CalendarEvent[]>([
        { id: '1', title: 'Platform Maintenance', start: '2024-08-20T02:00:00', end: '2024-08-20T04:00:00', allDay: false, color: 'hsl(var(--destructive))', description: 'Scheduled server upgrades.' },
        { id: '2', title: 'Instructor Payout Deadline', start: '2024-08-25', allDay: true, color: 'hsl(var(--primary))', description: 'All payout requests must be submitted.' },
        { id: '3', title: 'New Feature Rollout Meeting', start: '2024-08-22T10:00:00', end: '2024-08-22T11:00:00', allDay: false, color: 'hsl(var(--accent))', description: 'Final planning for Q3 features.' }
    ]);
    const [isAiDialogOpen, setIsAiDialogOpen] = React.useState(false);
    const [isManualDialogOpen, setIsManualDialogOpen] = React.useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
    const [aiPrompt, setAiPrompt] = React.useState('');
    const [isAiLoading, setIsAiLoading] = React.useState(false);
    const [manualEvent, setManualEvent] = React.useState<Partial<CalendarEvent>>({});


    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch users
                const usersSnapshot = await getDocs(collection(firestore, "users"));
                const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().fullName, ...doc.data() } as User));

                // Fetch subscriptions
                const fetchedSubscriptions = adminData.subscriptions;
                setSubscriptions(fetchedSubscriptions);
                
                // Create a map of studentId to subscription plan
                const subscriptionMap = new Map<string, string>();
                fetchedSubscriptions.forEach(sub => {
                    if (sub.status === 'Active') {
                        subscriptionMap.set(sub.studentId, sub.planName);
                    }
                });

                // Merge subscription data into users
                const usersWithSubscriptions = fetchedUsers.map(user => ({
                    ...user,
                    subscriptionPlan: subscriptionMap.get(user.id)
                }));
                setUsers(usersWithSubscriptions);


                // Fetch courses
                const coursesSnapshot = await getDocs(collection(firestore, "courses"));
                setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));

                // Fetch assignments
                const assignmentsSnapshot = await getDocs(collection(firestore, "assignments"));
                setAssignments(assignmentsSnapshot.docs.map(doc => ({ id: doc.id, assignmentTitle: doc.data().title, ...doc.data() } as Assignment)));

            } catch (error) {
                console.error("Error fetching admin data:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch platform data.' });
            }
            setLoading(false);
        };

        fetchData();
    }, [firestore, toast]);


    const [isSuspendUserDialogOpen, setIsSuspendUserDialogOpen] = React.useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);
    const [isPayoutActionDialogOpen, setIsPayoutActionDialogOpen] = React.useState(false);
    const [isCourseActionDialogOpen, setIsCourseActionDialogOpen] = React.useState(false);
    const [isAssignmentReviewDialogOpen, setIsAssignmentReviewDialogOpen] = React.useState(false);
    const [isReceiptDialogOpen, setIsReceiptDialogOpen] = React.useState(false);
    const [isCancelSubscriptionDialogOpen, setIsCancelSubscriptionDialogOpen] = React.useState(false);

    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
    const [courseAction, setCourseAction] = React.useState<'Approve' | 'Reject' | null>(null);
    const [selectedPayout, setSelectedPayout] = React.useState<PayoutRequest | null>(null);
    const [payoutAction, setPayoutAction] = React.useState<'Approve' | 'Decline' | null>(null);
    const [selectedAssignment, setSelectedAssignment] = React.useState<Assignment | null>(null);
    const [selectedSubscription, setSelectedSubscription] = React.useState<Subscription | null>(null);


    // Filters and Pagination State
    const [userFilters, setUserFilters] = React.useState({ search: '', role: 'All' });
    const [currentUserPage, setCurrentUserPage] = React.useState(1);
    const usersPerPage = 7;

    const [courseFilters, setCourseFilters] = React.useState({ search: '', status: 'All' });
    const [currentCoursePage, setCurrentCoursePage] = React.useState(1);
    const coursesPerPage = 7;

    const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '', instructor: 'All' });
    const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
    const assignmentsPerPage = 7;

    const [payoutFilters, setPayoutFilters] = React.useState({ search: '', status: 'All' });
    const [currentPayoutPage, setCurrentPayoutPage] = React.useState(1);
    const payoutsPerPage = 7;
    
    const [subscriptionFilters, setSubscriptionFilters] = React.useState({ search: '', plan: 'All' });
    const [currentSubscriptionPage, setCurrentSubscriptionPage] = React.useState(1);
    const subscriptionsPerPage = 7;
    
    const [currentEventPage, setCurrentEventPage] = React.useState(1);
    const eventsPerPage = 4;
    const [currentPayoutRequestPage, setCurrentPayoutRequestPage] = React.useState(1);
    const payoutRequestsPerPage = 4;
    const [currentActivityPage, setCurrentActivityPage] = React.useState(1);
    const activitiesPerPage = 4;


    // Receipt printing logic
    const receiptComponentRef = React.useRef(null);
    const handlePrint = useReactToPrint({
        content: () => receiptComponentRef.current,
        documentTitle: `Payout-Receipt-${selectedPayout?.id}`,
    });

    // Calendar Handlers
    const handleDateClick = (arg: any) => {
        setManualEvent({ start: arg.dateStr, allDay: arg.allDay });
        setIsManualDialogOpen(true);
    };
    
    const handleEventClick = (clickInfo: any) => {
        const event = clickInfo.event;
        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            allDay: event.allDay,
            description: event.extendedProps.description,
            color: event.backgroundColor,
        });
        setIsDetailDialogOpen(true);
    };
    
    const handleAddManualEvent = () => {
        if (!manualEvent.title || !manualEvent.start) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }
        const newEvent = { ...manualEvent, id: String(Date.now()) } as CalendarEvent
        setEvents([...events, newEvent]);
        toast({ title: 'Event Created!', description: `"${newEvent.title}" has been added.` });
        setIsManualDialogOpen(false);
        setManualEvent({});
    };

    const handleAiCreateEvent = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);

        try {
            const result: CreateCalendarEventOutput = await createCalendarEvent({ prompt: aiPrompt });
            if (result.title && result.start) {
                const newEvent: CalendarEvent = {
                    id: String(Date.now()),
                    title: result.title,
                    start: result.start,
                    end: result.end || undefined,
                    allDay: result.allDay,
                    color: 'hsl(var(--accent))'
                };
                setEvents([...events, newEvent]);
                toast({ title: 'Event Created!', description: `"${result.title}" has been added to the calendar.` });
                setIsAiDialogOpen(false);
                setAiPrompt('');
            } else {
                toast({ variant: 'destructive', title: 'Could not create event', description: 'The AI could not understand the event details. Please try being more specific.' });
            }
        } catch (error) {
            console.error("Error creating AI event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while creating the event.' });
        } finally {
            setIsAiLoading(false);
        }
    };


    const handleUserFilterChange = (key: keyof typeof userFilters, value: string) => {
        setUserFilters(prev => ({ ...prev, [key]: value }));
        setCurrentUserPage(1);
    };

    const handleCourseFilterChange = (key: keyof typeof courseFilters, value: string) => {
        setCourseFilters(prev => ({ ...prev, [key]: value }));
        setCurrentCoursePage(1);
    };

    const handleAssignmentFilterChange = (key: keyof typeof assignmentFilters, value: string) => {
        setAssignmentFilters(prev => ({ ...prev, [key]: value }));
        setCurrentAssignmentPage(1);
    };

    const handlePayoutFilterChange = (key: keyof typeof payoutFilters, value: string) => {
        setPayoutFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPayoutPage(1);
    };

    const handleSubscriptionFilterChange = (key: keyof typeof subscriptionFilters, value: string) => {
        setSubscriptionFilters(prev => ({ ...prev, [key]: value }));
        setCurrentSubscriptionPage(1);
    };

    const handleOpenAssignmentReview = (assignment: Assignment) => {
        setSelectedAssignment(assignment);
        setIsAssignmentReviewDialogOpen(true);
    };

    const handleUserAction = (user: User, action: 'suspend' | 'delete') => {
        setSelectedUser(user);
        if (action === 'suspend') setIsSuspendUserDialogOpen(true);
        if (action === 'delete') setIsDeleteUserDialogOpen(true);
    };

    const confirmSuspendUser = async () => {
        if (!selectedUser) return;
        const newStatus = selectedUser.status === 'Active' ? 'Suspended' : 'Active';
        const userRef = doc(firestore, 'users', selectedUser.id);
        await updateDoc(userRef, { status: newStatus });

        setUsers(users.map(u => u.id === selectedUser.id ? {...u, status: newStatus} : u));
        toast({ title: "User Status Updated", description: `${selectedUser.name}'s status has been changed to ${newStatus}.` });
        setIsSuspendUserDialogOpen(false);
        setSelectedUser(null);
    }

    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        
        // This is a placeholder. In a real app, you would need a Cloud Function to delete the user from Firebase Auth.
        // For now, we will just delete their Firestore document.
        await deleteDoc(doc(firestore, "users", selectedUser.id));

        setUsers(users.filter(u => u.id !== selectedUser.id));
        toast({ title: "User Deleted", description: `${selectedUser.name} has been permanently deleted.`, variant: "destructive" });
        setIsDeleteUserDialogOpen(false);
        setSelectedUser(null);
    }

    const handleCourseAction = (course: Course, action: 'Approve' | 'Reject') => {
        setSelectedCourse(course);
        setCourseAction(action);
        setIsCourseActionDialogOpen(true);
    };

    const confirmCourseAction = async () => {
        if (!selectedCourse || !courseAction) return;
        const newStatus = courseAction === 'Approve' ? 'Published' : 'Rejected';
        const courseRef = doc(firestore, 'courses', selectedCourse.id);
        await updateDoc(courseRef, { status: newStatus });
        
        setCourses(courses.map(c => c.id === selectedCourse.id ? { ...c, status: newStatus } : c));
        toast({ title: `Course ${courseAction}d`, description: `The course "${selectedCourse.title}" has been ${newStatus.toLowerCase()}.` });
        setIsCourseActionDialogOpen(false);
        setSelectedCourse(null);
        setCourseAction(null);
    };

    const handlePayoutAction = (payout: PayoutRequest, action: 'Approve' | 'Decline') => {
        setSelectedPayout(payout);
        setPayoutAction(action);
        setIsPayoutActionDialogOpen(true);
    };

    const handleViewReceipt = (payout: PayoutRequest) => {
        setSelectedPayout(payout);
        setIsReceiptDialogOpen(true);
    };

    const confirmPayoutAction = () => {
        if (!selectedPayout || !payoutAction) return;
        const newStatus = payoutAction === 'Approve' ? 'Completed' : 'Declined';
        setPayoutRequests(payouts => payouts.map(p => p.id === selectedPayout.id ? {...p, status: newStatus } : p));
        toast({ title: `Payout ${payoutAction}d`, description: `The payout request for ${selectedPayout.instructor} has been ${newStatus.toLowerCase()}.` });
        setIsPayoutActionDialogOpen(false);
        setSelectedPayout(null);
        setPayoutAction(null);
    };

    const handleCancelSubscription = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setIsCancelSubscriptionDialogOpen(true);
    };
    
    const confirmCancelSubscription = () => {
        if (!selectedSubscription) return;
        setSubscriptions(subs => subs.map(s => s.id === selectedSubscription.id ? { ...s, status: 'Canceled' } : s));
        toast({ title: "Subscription Canceled", description: `The subscription for ${selectedSubscription.studentName} has been canceled.` });
        setIsCancelSubscriptionDialogOpen(false);
        setSelectedSubscription(null);
    };

    // Filtering and pagination logic
    const filteredUsers = React.useMemo(() => {
        return users.filter(user => {
            const searchMatch = userFilters.search.trim().toLowerCase() === '' ||
                user.name.toLowerCase().includes(userFilters.search.trim().toLowerCase()) ||
                user.email.toLowerCase().includes(userFilters.search.trim().toLowerCase());
            const roleMatch = userFilters.role === 'All' || user.role === userFilters.role;
            return searchMatch && roleMatch;
        });
    }, [users, userFilters]);
    const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentUserPage - 1) * usersPerPage, currentUserPage * usersPerPage);

    const filteredCourses = React.useMemo(() => {
        return courses.filter(course => {
            const searchMatch = courseFilters.search.trim().toLowerCase() === '' ||
                course.title.toLowerCase().includes(courseFilters.search.trim().toLowerCase()) ||
                course.instructor.toLowerCase().includes(courseFilters.search.trim().toLowerCase());
            const statusMatch = courseFilters.status === 'All' || course.status === courseFilters.status;
            return searchMatch && statusMatch;
        });
    }, [courses, courseFilters]);
    const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage);
    const paginatedCourses = filteredCourses.slice((currentCoursePage - 1) * coursesPerPage, currentCoursePage * coursesPerPage);

    const filteredAssignments = React.useMemo(() => {
        return assignments.filter(assignment => {
            const searchMatch = assignmentFilters.search.trim().toLowerCase() === '' ||
                assignment.assignmentTitle.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()) ||
                assignment.studentName.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase());
            const instructorMatch = assignmentFilters.instructor === 'All' || assignment.instructor === assignmentFilters.instructor;
            return searchMatch && instructorMatch;
        });
    }, [assignments, assignmentFilters]);
    const totalAssignmentPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
    const paginatedAssignments = filteredAssignments.slice((currentAssignmentPage - 1) * assignmentsPerPage, currentAssignmentPage * assignmentsPerPage);
    const assignmentInstructors = ['All', ...Array.from(new Set(assignments.map(a => a.instructor)))];

    const filteredPayouts = React.useMemo(() => {
        return payoutRequests.filter(payout => {
            const searchMatch = payoutFilters.search.trim().toLowerCase() === '' ||
                payout.instructor.toLowerCase().includes(payoutFilters.search.trim().toLowerCase());
            const statusMatch = payoutFilters.status === 'All' || payout.status === payout.status;
            return searchMatch && statusMatch;
        });
    }, [payoutRequests, payoutFilters]);
    const totalPayoutPages = Math.ceil(filteredPayouts.length / payoutsPerPage);
    const paginatedPayouts = filteredPayouts.slice((currentPayoutPage - 1) * payoutsPerPage, currentPayoutPage * payoutsPerPage);
    
    const filteredSubscriptions = React.useMemo(() => {
        return subscriptions.filter(sub => {
            const searchMatch = subscriptionFilters.search.trim().toLowerCase() === '' ||
                sub.studentName.toLowerCase().includes(subscriptionFilters.search.trim().toLowerCase()) ||
                sub.studentEmail.toLowerCase().includes(subscriptionFilters.search.trim().toLowerCase());
            const planMatch = subscriptionFilters.plan === 'All' || sub.planName === subscriptionFilters.plan;
            return searchMatch && planMatch;
        });
    }, [subscriptions, subscriptionFilters]);
    const totalSubscriptionPages = Math.ceil(filteredSubscriptions.length / subscriptionsPerPage);
    const paginatedSubscriptions = filteredSubscriptions.slice((currentSubscriptionPage - 1) * subscriptionsPerPage, currentSubscriptionPage * subscriptionsPerPage);
    const subscriptionPlans = ['All', ...Array.from(new Set(subscriptions.map(s => s.planName)))];
    
    const upcomingEvents = React.useMemo(() => {
        return events
            .filter(event => new Date(event.start) >= new Date())
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events]);
    const totalEventPages = Math.ceil(upcomingEvents.length / eventsPerPage);
    const paginatedEvents = upcomingEvents.slice((currentEventPage - 1) * eventsPerPage, currentEventPage * eventsPerPage);

    const pendingPayoutRequests = React.useMemo(() => {
        return payoutRequests.filter(p => p.status === 'Pending');
    }, [payoutRequests]);
    const totalPayoutRequestPages = Math.ceil(pendingPayoutRequests.length / payoutRequestsPerPage);
    const paginatedPayoutRequests = pendingPayoutRequests.slice((currentPayoutRequestPage - 1) * payoutRequestsPerPage, currentPayoutRequestPage * payoutRequestsPerPage);

    const totalActivityPages = Math.ceil(adminData.recentActivity.length / activitiesPerPage);
    const paginatedActivities = adminData.recentActivity.slice((currentActivityPage - 1) * activitiesPerPage, currentActivityPage * activitiesPerPage);


    return (
        <div className="space-y-8">
            <style jsx global>{`
                .fc {
                    font-family: var(--font-body), sans-serif;
                }
                .fc .fc-toolbar-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                }
                .fc .fc-button {
                    background-color: transparent !important;
                    border-color: hsl(var(--border)) !important;
                    color: hsl(var(--foreground)) !important;
                    box-shadow: none !important;
                    text-transform: capitalize;
                }
                 .fc .fc-button:hover {
                    background-color: hsl(var(--muted)) !important;
                 }
                .fc .fc-button-primary:not(:disabled).fc-button-active, 
                .fc .fc-button-primary:not(:disabled):active {
                    background-color: hsl(var(--primary)) !important;
                    border-color: hsl(var(--primary)) !important;
                    color: hsl(var(--primary-foreground)) !important;
                }
                .fc-daygrid-day.fc-day-today {
                    background-color: hsla(var(--primary), 0.05) !important;
                }
                .fc-event {
                    border-radius: 4px;
                    border: 0;
                    padding: 4px 6px;
                    cursor: pointer;
                }
            `}</style>

            {currentTab === 'overview' && (
                <div className="space-y-8">
                    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {loading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : adminData.stats.map((stat) => (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    <p className="text-xs text-muted-foreground flex items-center">
                                        <span className="text-green-600 mr-1 flex items-center"><ArrowUpRight className="h-4 w-4"/> {stat.change}</span>
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </section>

                    <section className="grid gap-6 lg:grid-cols-2">
                         <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="text-primary h-6 w-6" />
                                        <CardTitle>AI Performance Summary</CardTitle>
                                    </div>
                                    <Button variant="ghost" size="sm" disabled={true}>
                                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                        Regenerate
                                    </Button>
                                </div>
                                <CardDescription>An AI-powered analysis of your platform's performance.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Recent Platform Activity</CardTitle>
                                <CardDescription>A log of recent important events across the platform.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {paginatedActivities.length > 0 ? (
                                    <ul className="space-y-4">
                                        {paginatedActivities.map(activity => (
                                            <li key={activity.id} className="flex items-start gap-4">
                                                <div className="bg-muted p-2 rounded-full mt-1">
                                                    {activity.type === 'New User' && <UserPlus className="h-5 w-5 text-muted-foreground"/>}
                                                    {activity.type === 'New Course' && <BookOpen className="h-5 w-5 text-muted-foreground"/>}
                                                    {activity.type === 'Payout' && <Banknote className="h-5 w-5 text-muted-foreground"/>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.description}</p>
                                                    <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                                )}
                            </CardContent>
                             {totalActivityPages > 1 && (
                                <CardFooter className="flex items-center justify-between border-t pt-4">
                                    <div className="text-xs text-muted-foreground">
                                        Page <strong>{currentActivityPage}</strong> of <strong>{totalActivityPages}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentActivityPage(p => p - 1)} disabled={currentActivityPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentActivityPage(p => p + 1)} disabled={currentActivityPage >= totalActivityPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </section>
                    
                    <section className="grid gap-6 lg:grid-cols-2">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Upcoming Events</CardTitle>
                                <CardDescription>Key dates and events scheduled on the platform.</CardDescription>
                            </CardHeader>
                             <CardContent className="flex-grow">
                                {paginatedEvents.length > 0 ? (
                                    <ul className="space-y-4">
                                        {paginatedEvents.map(event => (
                                            <li key={event.id} className="flex items-center gap-4">
                                                <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted text-muted-foreground w-16">
                                                    <span className="text-xs font-bold uppercase">{format(new Date(event.start), 'MMM')}</span>
                                                    <span className="text-2xl font-bold">{format(new Date(event.start), 'd')}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{event.title}</p>
                                                    <p className="text-sm text-muted-foreground">{event.allDay ? 'All Day' : format(new Date(event.start), 'p')}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No upcoming events.</p>
                                )}
                            </CardContent>
                            {totalEventPages > 1 && (
                                <CardFooter className="flex items-center justify-between border-t pt-4">
                                    <div className="text-xs text-muted-foreground">
                                        Page <strong>{currentEventPage}</strong> of <strong>{totalEventPages}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentEventPage(p => p - 1)} disabled={currentEventPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentEventPage(p => p + 1)} disabled={currentEventPage >= totalEventPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle>Pending Payouts</CardTitle>
                                <CardDescription>Instructor payout requests awaiting approval.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                {paginatedPayoutRequests.length > 0 ? (
                                    <ul className="space-y-4">
                                        {paginatedPayoutRequests.map(payout => (
                                            <li key={payout.id} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9"><AvatarFallback>{payout.instructor.charAt(0)}</AvatarFallback></Avatar>
                                                    <div>
                                                        <p className="font-medium">{payout.instructor}</p>
                                                        <p className="text-sm text-muted-foreground">Requested on {payout.date}</p>
                                                    </div>
                                                </div>
                                                <div className="font-semibold text-destructive">R {Math.abs(payout.amount).toFixed(2)}</div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No pending payout requests.</p>
                                )}
                            </CardContent>
                             {totalPayoutRequestPages > 1 && (
                                <CardFooter className="flex items-center justify-between border-t pt-4">
                                    <div className="text-xs text-muted-foreground">
                                        Page <strong>{currentPayoutRequestPage}</strong> of <strong>{totalPayoutRequestPages}</strong>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPayoutRequestPage(p => p - 1)} disabled={currentPayoutRequestPage === 1}>
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPayoutRequestPage(p => p + 1)} disabled={currentPayoutRequestPage >= totalPayoutRequestPages}>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </section>
                </div>
            )}

            {currentTab === 'users' && (
                <Card>
                    <CardHeader>
                        <CardTitle>User Management</CardTitle>
                        <CardDescription>Manage all students and instructors on the platform.</CardDescription>
                    </CardHeader>
                     <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-8"
                                value={userFilters.search}
                                onChange={(e) => handleUserFilterChange('search', e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full md:w-auto">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter by Role</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={userFilters.role} onValueChange={(value) => handleUserFilterChange('role', value)}>
                                    <DropdownMenuRadioItem value="All">All Roles</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="student">Student</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="instructor">Instructor</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead className="hidden sm:table-cell">Role</TableHead>
                                <TableHead className="hidden lg:table-cell">Subscription Plan</TableHead>
                                <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9"><AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant={user.role === 'instructor' ? 'secondary' : 'outline'} className="capitalize">
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {user.subscriptionPlan ? (
                                            <Badge variant="default" className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                                                <CreditCard className="mr-1.5 h-3 w-3"/>
                                                {user.subscriptionPlan}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                                            {user.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleUserAction(user, 'suspend')}><UserMinus className="mr-2 h-4 w-4"/>{user.status === 'Active' ? 'Suspend' : 'Unsuspend'}</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => handleUserAction(user, 'delete')} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete User</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentUserPage - 1) * usersPerPage + 1}-{Math.min(currentUserPage * usersPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentUserPage(p => p - 1)} disabled={currentUserPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentUserPage(p => p + 1)} disabled={currentUserPage >= totalUserPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
            
            {currentTab === 'courses' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Course Review &amp; Management</CardTitle>
                        <CardDescription>Approve, reject, and manage all courses on the platform.</CardDescription>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by title or instructor..."
                                className="pl-8"
                                value={courseFilters.search}
                                onChange={(e) => handleCourseFilterChange('search', e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full md:w-auto">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter by Status</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={courseFilters.status} onValueChange={(value) => handleCourseFilterChange('status', value)}>
                                    <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Published">Published</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Pending Approval">Pending Approval</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Draft">Draft</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Course</TableHead>
                                <TableHead className="hidden sm:table-cell">Instructor</TableHead>
                                <TableHead className="hidden md:table-cell">Pricing (R)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCourses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell>
                                        <div className="font-medium">{course.title}</div>
                                        <div className="text-xs text-muted-foreground">{course.subject} - Grade {course.grade}</div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{course.instructor}</TableCell>
                                    <TableCell className="hidden md:table-cell">{course.pricing.type === 'purchase' ? course.pricing.price?.toFixed(2) : 'Subscription'}</TableCell>
                                    <TableCell>
                                        <Badge variant={"outline"} className={
                                            course.status === 'Published' ? 'bg-green-500/20 text-green-700 border-green-500/30'
                                            : course.status === 'Rejected' ? 'bg-red-500/20 text-red-700 border-red-500/30'
                                            : course.status === 'Pending Approval' ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
                                            : ''
                                        }>
                                            {course.status === 'Published' && <CheckCircle className="mr-1 h-3 w-3"/>}
                                            {course.status === 'Rejected' && <XCircle className="mr-1 h-3 w-3"/>}
                                            {course.status === 'Pending Approval' && <Clock className="mr-1 h-3 w-3"/>}
                                            {course.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {course.status === 'Pending Approval' ? (
                                             <div className="flex gap-2 justify-end">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={`/instructor/courses/${course.id}?from=admin`}>
                                                        <Eye className="h-4 w-4"/>
                                                    </Link>
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50 hover:text-red-700" onClick={() => handleCourseAction(course, 'Reject')}><X className="mr-1 h-3 w-3"/>Reject</Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleCourseAction(course, 'Approve')}><Check className="mr-1 h-3 w-3"/>Approve</Button>
                                            </div>
                                        ) : (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/instructor/courses/${course.id}?from=admin`}>
                                                            <Eye className="mr-2 h-4 w-4"/>Preview Course
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem><Trash2 className="mr-2 h-4 w-4 text-destructive"/>Delete Course</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentCoursePage - 1) * coursesPerPage + 1}-{Math.min(currentCoursePage * coursesPerPage, filteredCourses.length)}</strong> of <strong>{filteredCourses.length}</strong> courses.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p - 1)} disabled={currentCoursePage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p + 1)} disabled={currentCoursePage >= totalCoursePages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {currentTab === 'assignments' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assignments Oversight</CardTitle>
                        <CardDescription>Monitor all submitted assignments for quality and pricing fairness.</CardDescription>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by assignment or student..."
                                className="pl-8"
                                value={assignmentFilters.search}
                                onChange={(e) => handleAssignmentFilterChange('search', e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full md:w-auto">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter by Instructor</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Instructor</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={assignmentFilters.instructor} onValueChange={(value) => handleAssignmentFilterChange('instructor', value)}>
                                    {assignmentInstructors.map(instructor => (
                                        <DropdownMenuRadioItem key={instructor} value={instructor}>{instructor}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Assignment</TableHead>
                                <TableHead className="hidden sm:table-cell">Student</TableHead>
                                <TableHead className="hidden md:table-cell">Instructor</TableHead>
                                <TableHead>Price (R)</TableHead>
                                <TableHead className="hidden lg:table-cell">Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedAssignments.map(assignment => (
                                <TableRow key={assignment.id}>
                                    <TableCell>
                                        <div className="font-medium">{assignment.assignmentTitle}</div>
                                        <div className="text-xs text-muted-foreground">{assignment.course}</div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">{assignment.studentName}</TableCell>
                                    <TableCell className="hidden md:table-cell">{assignment.instructor}</TableCell>
                                    <TableCell className="font-semibold">{assignment.price ? assignment.price.toFixed(2) : 'N/A'}</TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        <Badge
                                            variant={"outline"}
                                            className={
                                                assignment.status === 'Paid' ? 'bg-green-500/20 text-green-700'
                                                : assignment.status === 'Awaiting Payment' ? 'bg-blue-500/20 text-blue-700'
                                                : 'bg-yellow-500/20 text-yellow-700'
                                            }
                                        >
                                            {assignment.status === 'Paid' && <CheckCircle className="mr-1 h-3 w-3" />}
                                            {assignment.status === 'Awaiting Payment' && <DollarSign className="mr-1 h-3 w-3" />}
                                            {assignment.status === 'Pending Review' && <Hourglass className="mr-1 h-3 w-3" />}
                                            {assignment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="outline" size="sm" onClick={() => handleOpenAssignmentReview(assignment)}>
                                            <Eye className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">View</span>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentAssignmentPage - 1) * assignmentsPerPage + 1}-{Math.min(currentAssignmentPage * assignmentsPerPage, filteredAssignments.length)}</strong> of <strong>{filteredAssignments.length}</strong> assignments.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p - 1)} disabled={currentAssignmentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p + 1)} disabled={currentAssignmentPage >= totalAssignmentPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
            
            {currentTab === 'calendar' && (
                <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle>Platform Calendar</CardTitle>
                            <CardDescription>View and manage all scheduled events across the platform.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                                 <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                             </Button>
                             <Button onClick={() => setIsAiDialogOpen(true)}>
                                <Sparkles className="mr-2 h-4 w-4" /> Create with AI
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden p-1">
                            <FullCalendar
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
                                }}
                                events={events}
                                dateClick={handleDateClick}
                                eventClick={handleEventClick}
                                editable={true}
                                selectable={true}
                                height="auto"
                                contentHeight="auto"
                                aspectRatio={2}
                                dayMaxEvents={true}
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentTab === 'payouts' && (
                <Card>
                     <CardHeader>
                        <CardTitle>Instructor Payouts</CardTitle>
                        <CardDescription>Review and process pending payout requests from instructors.</CardDescription>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by instructor..."
                                className="pl-8"
                                value={payoutFilters.search}
                                onChange={(e) => handlePayoutFilterChange('search', e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full md:w-auto">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter by Status</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={payoutFilters.status} onValueChange={(value) => handlePayoutFilterChange('status', value)}>
                                    <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Declined">Declined</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Amount (R)</TableHead>
                                <TableHead className="hidden md:table-cell">Request Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedPayouts.map(payout => (
                                <TableRow key={payout.id}>
                                    <TableCell className="font-medium">{payout.instructor}</TableCell>
                                    <TableCell className="font-semibold text-red-600">{payout.amount.toFixed(2)}</TableCell>
                                    <TableCell className="hidden md:table-cell">{payout.date}</TableCell>
                                    <TableCell>
                                        <Badge variant={"outline"} className={
                                            payout.status === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500/30'
                                            : payout.status === 'Declined' ? 'bg-red-500/20 text-red-700 border-red-500/30'
                                            : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
                                        }>
                                            {payout.status === 'Completed' && <CheckCircle className="mr-1 h-3 w-3"/>}
                                            {payout.status === 'Declined' && <XCircle className="mr-1 h-3 w-3"/>}
                                            {payout.status === 'Pending' && <Hourglass className="mr-1 h-3 w-3"/>}
                                            {payout.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {payout.status === 'Pending' ? (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => handleViewReceipt(payout)}><ReceiptText className="mr-1 h-3 w-3"/>Receipt</Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50 hover:text-red-700" onClick={() => handlePayoutAction(payout, 'Decline')}>Decline</Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handlePayoutAction(payout, 'Approve')}>Approve</Button>
                                            </div>
                                        ) : (
                                            <Button variant="outline" size="sm" onClick={() => handleViewReceipt(payout)}>
                                                <ReceiptText className="mr-2 h-4 w-4" /> View Receipt
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentPayoutPage - 1) * payoutsPerPage + 1}-{Math.min(currentPayoutPage * payoutsPerPage, filteredPayouts.length)}</strong> of <strong>{filteredPayouts.length}</strong> payouts.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPayoutPage(p => p - 1)} disabled={currentPayoutPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPayoutPage(p => p + 1)} disabled={currentPayoutPage >= totalPayoutPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
            
            {currentTab === 'subscriptions' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Management</CardTitle>
                        <CardDescription>Oversee all active and canceled student subscriptions.</CardDescription>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student name or email..."
                                className="pl-8"
                                value={subscriptionFilters.search}
                                onChange={(e) => handleSubscriptionFilterChange('search', e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full md:w-auto">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter by Plan</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Plan</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={subscriptionFilters.plan} onValueChange={(value) => handleSubscriptionFilterChange('plan', value)}>
                                    {subscriptionPlans.map(plan => (
                                        <DropdownMenuRadioItem key={plan} value={plan}>{plan}</DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead className="hidden sm:table-cell">Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Next Billing Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSubscriptions.map(sub => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="font-medium">{sub.studentName}</div>
                                        <div className="text-xs text-muted-foreground">{sub.studentEmail}</div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant="secondary">{sub.planName}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={sub.status === 'Active' ? 'default' : 'destructive'} className={sub.status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                                            {sub.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{sub.nextBillingDate}</TableCell>
                                    <TableCell className="text-right">
                                        {sub.status === 'Active' && (
                                             <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10" onClick={() => handleCancelSubscription(sub)}>
                                                Cancel Subscription
                                             </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentSubscriptionPage - 1) * subscriptionsPerPage + 1}-{Math.min(currentSubscriptionPage * subscriptionsPerPage, filteredSubscriptions.length)}</strong> of <strong>{filteredSubscriptions.length}</strong> subscriptions.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentSubscriptionPage(p => p - 1)} disabled={currentSubscriptionPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentSubscriptionPage(p => p + 1)} disabled={currentSubscriptionPage >= totalSubscriptionPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            {/* Dialogs for User Actions */}
            <AlertDialog open={isSuspendUserDialogOpen} onOpenChange={setIsSuspendUserDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {selectedUser?.status === 'Active' ? 'suspend' : 'unsuspend'} the user account for <strong>{selectedUser?.name}</strong>. Suspended users cannot log in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSuspendUser}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete the user <strong>{selectedUser?.name}</strong> and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteUser} className={buttonVariants({ variant: "destructive" })}>Delete User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Dialog for Payout Actions */}
            <AlertDialog open={isPayoutActionDialogOpen} onOpenChange={setIsPayoutActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payout {payoutAction}</AlertDialogTitle>
                        <AlertDialogDescription>
                           Are you sure you want to <strong>{payoutAction?.toLowerCase()}</strong> the payout request of <strong>R {selectedPayout?.amount ? Math.abs(selectedPayout.amount).toFixed(2) : '0.00'}</strong> for <strong>{selectedPayout?.instructor}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setSelectedPayout(null); setPayoutAction(null); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPayoutAction} className={payoutAction === 'Decline' ? buttonVariants({ variant: "destructive" }) : ''}>
                            {payoutAction} Payout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog for Course Actions */}
            <AlertDialog open={isCourseActionDialogOpen} onOpenChange={setIsCourseActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Course {courseAction}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to <strong>{courseAction?.toLowerCase()}</strong> the course <strong>"{selectedCourse?.title}"</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setSelectedCourse(null); setCourseAction(null); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCourseAction} className={courseAction === 'Reject' ? buttonVariants({ variant: "destructive" }) : ''}>
                            {courseAction} Course
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             {/* Dialog for Subscription Actions */}
            <AlertDialog open={isCancelSubscriptionDialogOpen} onOpenChange={setIsCancelSubscriptionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel the <strong>{selectedSubscription?.planName}</strong> plan for <strong>{selectedSubscription?.studentName}</strong>? Their access will be revoked at the end of the current billing cycle.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setSelectedSubscription(null); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmCancelSubscription} className={buttonVariants({ variant: "destructive" })}>
                            Confirm Cancellation
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog for Assignment Review */}
            <Dialog open={isAssignmentReviewDialogOpen} onOpenChange={setIsAssignmentReviewDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Review Assignment</DialogTitle>
                        <DialogDescription>
                            Review submission for quality, fairness, and provide feedback.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAssignment && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Submission Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Student:</span>
                                            <span className="font-medium">{selectedAssignment.studentName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Instructor:</span>
                                            <span className="font-medium">{selectedAssignment.instructor}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Course:</span>
                                            <span className="font-medium">{selectedAssignment.course}</span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-base">
                                            <span className="text-muted-foreground">Price:</span>
                                            <span className="font-semibold">R {selectedAssignment.price?.toFixed(2) ?? 'N/A'}</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex gap-2">
                                        <Button variant="outline" className="w-full" asChild>
                                            <a href={selectedAssignment.fileUrl} download><Download className="mr-2" /> Original</a>
                                        </Button>
                                         <Button variant="secondary" className="w-full" asChild>
                                            <a href={selectedAssignment.fileUrl} download><Download className="mr-2" /> Solution</a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                             <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Leave a Comment for Instructor</Label>
                                    <Textarea placeholder="Type your feedback here..." rows={4} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Upload New Solution (Optional)</Label>
                                    <div className="flex items-center justify-center w-full">
                                        <label htmlFor="dropzone-file-solution-admin" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileUp className="w-6 h-6 mb-1 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                                            </div>
                                            <Input id="dropzone-file-solution-admin" type="file" className="hidden" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAssignmentReviewDialogOpen(false)}>Close</Button>
                        <Button onClick={() => {
                            toast({ title: "Feedback Sent", description: "Your comments and actions have been logged." });
                            setIsAssignmentReviewDialogOpen(false);
                        }}>
                            <MessageSquare className="mr-2"/> Submit Feedback
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog for Payout Receipt */}
            <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Payout Receipt</DialogTitle>
                        <DialogDescription>
                            A detailed record of the payout transaction.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedPayout && (
                        <div className="py-4">
                           <PayoutReceipt ref={receiptComponentRef} payout={selectedPayout} />
                        </div>
                    )}
                    <DialogFooter>
                         <Button variant="outline" onClick={() => setIsReceiptDialogOpen(false)}>Close</Button>
                         <Button onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4"/>
                            Print / Save PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* AI Event Dialog */}
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Event with AI</DialogTitle>
                        <DialogDescription>
                            Describe the event you want to create. For example, "Schedule a meeting with the team for next Friday at 2pm."
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="ai-prompt" className="sr-only">AI Prompt</Label>
                        <Textarea
                            id="ai-prompt"
                            placeholder="e.g. Set up a Maths study session for Grade 12s on Saturday from 10am to 12pm."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAiCreateEvent} disabled={isAiLoading}>
                            {isAiLoading ? "Creating..." : "Create Event"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Event Dialog */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                        <DialogDescription>Fill in the details for your new event.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="manual-title">Event Title</Label>
                            <Input id="manual-title" value={manualEvent.title || ''} onChange={(e) => setManualEvent(prev => ({...prev, title: e.target.value}))}/>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="manual-start">Start Date</Label>
                                <Input id="manual-start" type="date" value={manualEvent.start?.split('T')[0] || ''} onChange={(e) => setManualEvent(prev => ({...prev, start: e.target.value}))}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="manual-end">End Date (Optional)</Label>
                                <Input id="manual-end" type="date" value={manualEvent.end?.split('T')[0] || ''} onChange={(e) => setManualEvent(prev => ({...prev, end: e.target.value}))}/>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="manual-description">Description (Optional)</Label>
                            <Textarea id="manual-description" value={manualEvent.description || ''} onChange={(e) => setManualEvent(prev => ({...prev, description: e.target.value}))}/>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox id="all-day" checked={manualEvent.allDay} onCheckedChange={(checked) => setManualEvent(prev => ({...prev, allDay: !!checked}))} />
                            <Label htmlFor="all-day">All-day event</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddManualEvent}>Add Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
             {/* Event Detail Dialog */}
            <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                <DialogContent>
                    {selectedEvent && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center">
                                     <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: selectedEvent.color || 'hsl(var(--primary))' }}></span>
                                    {selectedEvent.title}
                                </DialogTitle>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="flex items-start gap-4 text-muted-foreground">
                                    <CalendarIcon className="h-5 w-5 mt-1" />
                                    <div className="text-sm">
                                        {selectedEvent.allDay ? (
                                            <p>{format(new Date(selectedEvent.start), 'eeee, MMMM d, yyyy')}</p>
                                        ) : (
                                            <>
                                                <p>{format(new Date(selectedEvent.start), 'eeee, MMMM d, yyyy')}</p>
                                                <p>{format(new Date(selectedEvent.start), 'p')} {selectedEvent.end ? ` - ${format(new Date(selectedEvent.end), 'p')}` : ''}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {selectedEvent.description && (
                                    <p className="text-sm">{selectedEvent.description}</p>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsDetailDialogOpen(false)}>Close</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withAuth(AdminPage, ['admin']);
