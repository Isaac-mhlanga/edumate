
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle, Clock, Computer, DollarSign, Edit, Mail, MapPin, MessageSquare, Phone, Save, Users, Video, XCircle, Send, Loader2, Paperclip, Upload, Info, MoreVertical, Search, ListFilter, ChevronLeft, ChevronRight, Book, GraduationCap, ArrowUpRight, X, Trash2 } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import withAuth from "@/components/with-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged, type User, updateProfile } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp, onSnapshot, Unsubscribe, addDoc, serverTimestamp, arrayUnion, orderBy } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { Skeleton } from "@/components/ui/skeleton";
import { type MessageThread, type ThreadMessage } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EnquiriesPage } from "@/components/enquiries-page";
import { TutorCalendarTab } from "@/components/tutor/calendar-tab";
import { CalendarDialogs } from "@/components/tutor/calendar-dialogs";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color?: string;
  description?: string;
  instructor?: string;
  instructorId?: string;
  tutorId?: string;
  studentId?: string;
  grade?: string;
  subject?: string;
  module?: string;
  scope?: string;
  platforms?: string[];
};

type Booking = {
    id: string;
    studentName: string;
    studentId: string;
    tutorId: string;
    tutorName: string;
    date: string;
    time: string;
    subject: string;
    status: 'Confirmed' | 'Completed' | 'Pending Confirmation' | 'Declined';
    createdAt: Timestamp;
};

type Mode = "Online" | "In-person";
type VarsityModule = { name: string; year: string };


type TutorProfile = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio: string;
    hourlyRate: number;
    subjects: string[];
    grades: string[];
    varsityModules?: VarsityModule[];
    location: string;
    modes: Mode[];
    availability: { day: string; slots: string[] }[];
    qualifications: string;
    qualificationUrl?: string;
    approvalStatus: 'Pending' | 'Approved' | 'Rejected';
};

function TutorPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<TutorProfile | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
    const [currentThreadMessages, setCurrentThreadMessages] = useState<ThreadMessage[]>([]);
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [qualificationFile, setQualificationFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const currentTab = searchParams.get('tab') || 'overview';
    const [isEditingProfile, setIsEditingProfile] = useState(false);

    // Bookings tab state
    const [bookingFilters, setBookingFilters] = useState({ search: '', status: 'All' });
    const [currentBookingPage, setCurrentBookingPage] = useState(1);
    const bookingsPerPage = 7;
    
    // Calendar state
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [manualEvent, setManualEvent] = useState<Partial<CalendarEvent>>({});
    
    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);
        const availabilityPlaceholder = [
            { day: "Monday", slots: [] }, { day: "Tuesday", slots: [] }, { day: "Wednesday", slots: [] },
            { day: "Thursday", slots: [] }, { day: "Friday", slots: [] }, { day: "Saturday", slots: [] }, { day: "Sunday", slots: [] },
        ];

        let unsubscribeBookings: Unsubscribe | undefined;
        let unsubscribeEvents: Unsubscribe | undefined;
        let unsubscribeTransactions: Unsubscribe | undefined;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setLoading(true);
                // Fetch Profile
                const profileRef = doc(firestore, 'tutors', currentUser.uid);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    const data = profileSnap.data();
                    setProfile({ id: profileSnap.id, ...data, availability: data.availability || availabilityPlaceholder } as TutorProfile);
                } else {
                    const defaultProfile: TutorProfile = {
                        id: currentUser.uid, name: currentUser.displayName || 'New Tutor', email: currentUser.email || '',
                        avatar: currentUser.photoURL || 'https://placehold.co/100x100.png', bio: '', hourlyRate: 200, subjects: [],
                        grades: [], varsityModules: [], location: '', modes: [], availability: availabilityPlaceholder, qualifications: '', approvalStatus: 'Pending'
                    };
                    await setDoc(profileRef, defaultProfile);
                    setProfile(defaultProfile);
                }
                
                // Fetch Bookings (real-time)
                const bookingsQuery = query(collection(firestore, 'bookings'), where('tutorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
                unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
                    setBookings(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as Booking));
                });

                // Fetch Transactions (real-time)
                const transactionsQuery = query(collection(firestore, 'transactions'), where('tutorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
                unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
                     setTransactions(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as Transaction));
                });
                
                // Fetch Events (real-time)
                const eventsQuery = query(collection(firestore, "events"), where('tutorId', '==', currentUser.uid));
                unsubscribeEvents = onSnapshot(eventsQuery, (snapshot) => {
                    setEvents(snapshot.docs.map(d => ({id: d.id, ...d.data()}) as CalendarEvent));
                });

                setLoading(false);
            } else {
                setLoading(false);
                 if (unsubscribeBookings) unsubscribeBookings();
                 if (unsubscribeEvents) unsubscribeEvents();
                 if (unsubscribeTransactions) unsubscribeTransactions();
            }
        });
        
        return () => {
            unsubscribeAuth();
            if (unsubscribeBookings) unsubscribeBookings();
            if (unsubscribeEvents) unsubscribeEvents();
            if (unsubscribeTransactions) unsubscribeTransactions();
        };
    }, []);

    useEffect(() => {
        if (!user) return;
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const messagesQuery = query(collection(firestore, 'messages'), where('tutorId', '==', user.uid), orderBy('lastMessageTimestamp', 'desc'));
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MessageThread));
            setMessageThreads(threads);
        });
        return () => unsubscribeMessages();
    }, [user]);

     useEffect(() => {
        if (!selectedThread) return;
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        
        const messagesSubcollectionQuery = query(collection(firestore, 'messages', selectedThread.id, 'threadMessages'), orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(messagesSubcollectionQuery, (snapshot) => {
            const messages = snapshot.docs.map(doc => ({id: doc.id, ...doc.data() } as ThreadMessage));
            setCurrentThreadMessages(messages);
            
            // Mark as read
            if (selectedThread.isReadByTutor === false) {
                 updateDoc(doc(firestore, 'messages', selectedThread.id), { isReadByTutor: true });
            }
        });

        return () => unsubscribe();

    }, [selectedThread]);
    
    const handleSelectThread = (thread: MessageThread) => {
        setSelectedThread(thread);
    }

    const handleSendMessage = async () => {
        if (!replyContent.trim() || !selectedThread || !user) return;
        setIsSending(true);

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        
        const threadRef = doc(firestore, 'messages', selectedThread.id);
        const messagesColRef = collection(threadRef, 'threadMessages');

        try {
            await addDoc(messagesColRef, {
                senderId: user.uid,
                content: replyContent,
                timestamp: serverTimestamp(),
            });

            await updateDoc(threadRef, {
                lastMessage: replyContent,
                lastMessageTimestamp: serverTimestamp(),
                isReadByTutor: true,
                isReadByStudent: false, // Make sure to notify the student
            });

            setReplyContent('');
        } catch (error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send your message.' });
        } finally {
            setIsSending(false);
        }
    };


    const handleProfileChange = (field: keyof TutorProfile, value: any) => {
        if (!profile) return;
        setProfile({ ...profile, [field]: value });
    };

    const handleRemovePhoto = () => {
        if (!profile) return;
        setProfile({ ...profile, avatar: 'https://placehold.co/100x100.png' });
        setAvatarFile(null);
        setAvatarPreview(null);
        toast({ title: 'Photo Marked for Removal', description: 'Click "Save All Profile Changes" to confirm.' });
    };
    
    const handleSaveProfile = async () => {
        if (!user || !profile) return;
        setIsSaving(true);
        const firestore = getFirestore();
        const storage = getStorage();
        const auth = getAuth();
        const currentUser = auth.currentUser;

        let finalAvatarUrl = profile.avatar;
        let newQualificationUrl = profile.qualificationUrl;

        try {
            if (avatarFile && currentUser) {
                const avatarRef = ref(storage, `tutors/${user.uid}/avatar/${Date.now()}-${avatarFile.name}`);
                await uploadBytes(avatarRef, avatarFile);
                finalAvatarUrl = await getDownloadURL(avatarRef);
            }

            if (currentUser && finalAvatarUrl !== currentUser.photoURL) {
                await updateProfile(currentUser, { photoURL: finalAvatarUrl });
            }

            if (qualificationFile) {
                const fileRef = ref(storage, `tutors/${user.uid}/qualifications/${qualificationFile.name}`);
                await uploadBytes(fileRef, qualificationFile);
                newQualificationUrl = await getDownloadURL(fileRef);
            }

            const profileDataToSave = {
                ...profile,
                avatar: finalAvatarUrl,
                qualificationUrl: newQualificationUrl,
                approvalStatus: 'Pending' as const
            };

            const profileRef = doc(firestore, 'tutors', user.uid);
            await updateDoc(profileRef, profileDataToSave);

            setProfile(profileDataToSave);
            setQualificationFile(null);
            setAvatarFile(null);
            setAvatarPreview(null);

            toast({ title: 'Profile Updated', description: 'Your changes have been saved and submitted for review.' });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save your profile.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSlotToggle = (dayIndex: number, slot: string) => {
        if (!profile) return;
        const newAvailability = [...profile.availability];
        const day = newAvailability[dayIndex];
        const slotIndex = day.slots.indexOf(slot);

        if (slotIndex > -1) {
            day.slots.splice(slotIndex, 1);
        } else {
            day.slots.push(slot);
        }
        handleProfileChange('availability', newAvailability);
    };
    
    const handleCheckboxToggle = (field: 'subjects' | 'grades' | 'modes', value: string) => {
        if (!profile) return;
        const currentValues = profile[field] as string[] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];
        handleProfileChange(field, newValues);
    };

    const handleAddVarsityModule = () => {
        if (!profile) return;
        const newModules = [...(profile.varsityModules || []), { name: '', year: '' }];
        handleProfileChange('varsityModules', newModules);
    };

    const handleVarsityModuleChange = (index: number, field: 'name' | 'year', value: string) => {
        if (!profile || !profile.varsityModules) return;
        const newModules = [...profile.varsityModules];
        newModules[index][field] = value;
        handleProfileChange('varsityModules', newModules);
    };
    
    const handleRemoveVarsityModule = (index: number) => {
        if (!profile || !profile.varsityModules) return;
        const newModules = profile.varsityModules.filter((_, i) => i !== index);
        handleProfileChange('varsityModules', newModules);
    };

    const handleBookingAction = async (booking: Booking, newStatus: 'Confirmed' | 'Declined' | 'Completed') => {
        const originalStatus = booking.status;
        setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b));

        const firestore = getFirestore();
        const bookingRef = doc(firestore, 'bookings', booking.id);
        
        try {
            await updateDoc(bookingRef, { status: newStatus });
            
            if (newStatus === 'Confirmed') {
                const startTime = booking.time.split(' - ')[0];
                const endTime = booking.time.split(' - ')[1];

                const startDateTime = new Date(`${booking.date}T${startTime}:00`);
                const endDateTime = new Date(`${booking.date}T${endTime}:00`);
                
                const eventData = {
                    title: `Tutoring: ${booking.subject} with ${booking.studentName}`,
                    start: startDateTime.toISOString(),
                    end: endDateTime.toISOString(),
                    allDay: false,
                    tutorId: booking.tutorId,
                    studentId: booking.studentId,
                    bookingId: booking.id,
                    instructor: booking.tutorName, // Keep 'instructor' for calendar display consistency
                    description: `Online tutoring session for ${booking.subject}.`,
                    platforms: ["zoom"] 
                };

                await addDoc(collection(firestore, 'events'), eventData);
                toast({ title: 'Booking Confirmed!', description: 'The session has been added to your calendar.' });
            } else if (newStatus === 'Completed') {
                // Create a transaction when a session is completed
                 await addDoc(collection(firestore, 'transactions'), {
                    studentId: booking.studentId,
                    tutorId: booking.tutorId,
                    itemId: booking.id,
                    itemType: 'Tutoring Session',
                    itemTitle: `Session with ${booking.studentName}`,
                    amount: profile?.hourlyRate || 0,
                    status: 'Completed',
                    currency: 'ZAR',
                    createdAt: serverTimestamp(),
                    notes: `Completed session on ${booking.date}`
                });
                toast({ title: 'Session Completed!', description: 'Earnings for this session have been recorded.' });
            } else {
                toast({ title: 'Booking Declined' });
            }

        } catch (error) {
            console.error("Error updating booking:", error);
            setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: originalStatus } : b));
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update the booking status.' });
        }
    };


    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle className="text-green-500" />;
            case 'Completed': return <CheckCircle className="text-blue-500" />;
            case 'Pending Confirmation': return <Clock className="text-yellow-500" />;
            case 'Declined': return <XCircle className="text-red-500" />;
            default: return null;
        }
    };

    const overviewStats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const newStudentsThisMonth = new Set(bookings
            .filter(b => b.createdAt && b.createdAt.toDate().getMonth() === currentMonth && b.createdAt.toDate().getFullYear() === currentYear)
            .map(b => b.studentId)).size;

        const bookingsThisMonth = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
        }).length;

        const currentMonthEarnings = bookings
            .filter(b => b.status === 'Completed' && new Date(b.date).getMonth() === currentMonth && new Date(b.date).getFullYear() === currentYear)
            .length * (profile?.hourlyRate || 0);
            
        const lastMonthEarnings = bookings
            .filter(b => b.status === 'Completed' && new Date(b.date).getMonth() === lastMonth && new Date(b.date).getFullYear() === lastMonthYear)
            .length * (profile?.hourlyRate || 0);

        let earningsChange = '0%';
        if (lastMonthEarnings > 0) {
            const change = ((currentMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100;
            earningsChange = `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
        } else if (currentMonthEarnings > 0) {
            earningsChange = '+100%';
        }

        const unreadMessages = messageThreads.filter(t => !t.isReadByTutor).length;

        return [
            { title: "New Students", value: newStudentsThisMonth, icon: Users, change: `this month` },
            { title: "Bookings", value: bookingsThisMonth, icon: Calendar, change: `this month` },
            { title: "Earnings", value: `R ${currentMonthEarnings.toFixed(2)}`, icon: DollarSign, change: `${earningsChange} this month` },
            { title: "Unread Messages", value: unreadMessages, icon: MessageSquare, change: "" },
        ];
    }, [bookings, profile?.hourlyRate, messageThreads]);
    
    const handleBookingFilterChange = (key: keyof typeof bookingFilters, value: string) => {
        setBookingFilters(prev => ({ ...prev, [key]: value }));
        setCurrentBookingPage(1);
    };

    const filteredBookings = React.useMemo(() => {
        return bookings.filter(booking => {
            const searchMatch = bookingFilters.search.trim().toLowerCase() === '' ||
                booking.studentName.toLowerCase().includes(bookingFilters.search.trim().toLowerCase()) ||
                booking.subject.toLowerCase().includes(bookingFilters.search.trim().toLowerCase());
            const statusMatch = bookingFilters.status === 'All' || booking.status === bookingFilters.status;
            return searchMatch && statusMatch;
        });
    }, [bookings, bookingFilters]);

    const totalBookingPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    const paginatedBookings = filteredBookings.slice((currentBookingPage - 1) * bookingsPerPage, currentBookingPage * bookingsPerPage);


    const isProfileIncomplete = !profile?.bio || !profile?.qualifications;
    
    // Calendar handlers
    const handleDateClick = (arg: any) => {
      setManualEvent({ start: arg.dateStr, allDay: arg.allDay, instructor: user?.displayName || 'Tutor', tutorId: user?.uid });
      setIsManualDialogOpen(true);
    };

    const handleEventClick = (clickInfo: any) => {
        const event = clickInfo.event;
        const extendedProps = event.extendedProps;
        setSelectedEvent({
            id: event.id,
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            allDay: event.allDay,
            description: event.extendedProps.description,
            instructor: extendedProps.instructor,
            tutorId: extendedProps.tutorId,
            grade: extendedProps.grade,
            subject: extendedProps.subject,
            module: extendedProps.module,
            scope: extendedProps.scope,
            platforms: extendedProps.platforms,
            color: event.backgroundColor,
        });
        setIsDetailDialogOpen(true);
    };

    const handleAddOrUpdateEvent = async () => {
        if (!manualEvent.title || !manualEvent.start || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        
        const eventData = { ...manualEvent, tutorId: user.uid, instructor: user.displayName };

        // Sanitize data for Firestore by removing undefined properties
        const sanitizedEventData = Object.fromEntries(
            Object.entries(eventData).filter(([, value]) => value !== undefined)
        );

        try {
            if (manualEvent.id) {
                const eventRef = doc(firestore, 'events', manualEvent.id);
                await updateDoc(eventRef, sanitizedEventData);
            } else {
                await addDoc(collection(firestore, 'events'), sanitizedEventData);
            }
            toast({ title: 'Event Saved!', description: `"${manualEvent.title}" has been saved.` });
            
            setIsManualDialogOpen(false);
            setManualEvent({});
        } catch(error) {
            console.error("Error saving event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the event.' });
        }
    };


    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
    }

    if (!profile) {
        return <div>Loading profile...</div>
    }

    const timeSlots = {
        Morning: ["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00"],
        Afternoon: ["14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00"],
        Evening: ["17:00 - 18:00", "18:00 - 19:00", "19:00 - 20:00"],
    };

    return (
        <div className="space-y-8">
            {currentTab === 'overview' && (
                <div className="space-y-8">
                     {isProfileIncomplete && (
                        <Alert>
                            <Info className="h-4 w-4" />
                            <AlertTitle>Complete Your Profile!</AlertTitle>
                            <AlertDescription className="flex items-center justify-between">
                                Your profile is incomplete. Please update it to become visible to students.
                                <Button size="sm" onClick={() => router.push('/tutor?tab=profile')}>Update Profile</Button>
                            </AlertDescription>
                        </Alert>
                    )}
                     {profile.approvalStatus === 'Approved' && (
                        <Alert variant="default" className="bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-300">
                           <CheckCircle className="h-4 w-4" />
                           <AlertTitle>Profile Approved!</AlertTitle>
                           <AlertDescription>
                               Your profile is live and students can now book sessions with you.
                           </AlertDescription>
                       </Alert>
                    )}
                    {profile.approvalStatus === 'Pending' && (
                         <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300">
                           <Clock className="h-4 w-4" />
                           <AlertTitle>Profile Pending Review</AlertTitle>
                           <AlertDescription>
                               Your profile is currently being reviewed by our team. You will be notified once it's approved.
                           </AlertDescription>
                       </Alert>
                    )}
                     {profile.approvalStatus === 'Rejected' && (
                        <Alert variant="destructive">
                           <XCircle className="h-4 w-4" />
                           <AlertTitle>Profile Rejected</AlertTitle>
                           <AlertDescription className="flex items-center justify-between">
                               There was an issue with your submission. Please review your profile and resubmit.
                               <Button size="sm" variant="secondary" onClick={() => router.push('/tutor?tab=profile')}>Review Profile</Button>
                           </AlertDescription>
                       </Alert>
                    )}
                    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {overviewStats.map((stat) => (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    {stat.change && (
                                        <p className="text-xs text-muted-foreground flex items-center">
                                            {stat.title === 'Earnings' && stat.change.includes('-') ? null : (
                                                 <span className="text-green-600 mr-1 flex items-center">
                                                    <ArrowUpRight className="h-4 w-4"/> 
                                                </span>
                                            )}
                                            {stat.change}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                    <section className="grid gap-8 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upcoming Bookings</CardTitle>
                                <CardDescription>Your next scheduled sessions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {bookings.filter(b => b.status === 'Confirmed').slice(0, 4).map(booking => (
                                        <li key={booking.id} className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10"><AvatarFallback>{booking.studentName.charAt(0)}</AvatarFallback></Avatar>
                                            <div className="flex-1">
                                                <p className="font-medium">{booking.studentName}</p>
                                                <p className="text-sm text-muted-foreground">{booking.subject} - {booking.date}</p>
                                            </div>
                                            <Badge variant="outline">{booking.time}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Messages</CardTitle>
                                <CardDescription>Your latest student communications.</CardDescription>
                            </CardHeader>
                            <CardContent>
                            <ul className="space-y-4">
                                    {messageThreads.slice(0, 4).map(thread => (
                                        <li key={thread.id} className="flex items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex justify-between">
                                                    <p className="font-medium">{thread.studentName}</p>
                                                    {!thread.isReadByTutor && <Badge>New</Badge>}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                     {thread.lastMessageTimestamp ? formatDistanceToNow(thread.lastMessageTimestamp.toDate(), { addSuffix: true }) : ''}
                                                </p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            )}
            
            {currentTab === 'enquiries' && <EnquiriesPage userRole="tutor" />}

            {currentTab === 'profile' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Keep your public profile up to date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="relative group/avatar">
                                    <Avatar className="w-24 h-24 border-2 border-primary">
                                        <AvatarImage src={avatarPreview || profile.avatar} alt={profile.name} data-ai-hint="person profile" />
                                        <AvatarFallback className="text-3xl">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center gap-2 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <label htmlFor="avatar-upload" className="cursor-pointer text-white p-2">
                                            <Upload className="h-6 w-6" />
                                            <span className="sr-only">Upload photo</span>
                                        </label>
                                        <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setAvatarFile(file);
                                                setAvatarPreview(URL.createObjectURL(file));
                                            }
                                        }} />
                                        {profile.avatar && !profile.avatar.includes('placehold.co') && (
                                            <button onClick={handleRemovePhoto} className="text-white p-2">
                                                <Trash2 className="h-6 w-6" />
                                                <span className="sr-only">Remove photo</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1 flex-1">
                                    <Label htmlFor="tutor-name">Full Name</Label>
                                    <Input id="tutor-name" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="tutor-bio">Biography</Label>
                                <Textarea id="tutor-bio" value={profile.bio} onChange={(e) => handleProfileChange('bio', e.target.value)} rows={5} placeholder="Tell students about yourself, your teaching style, and your experience."/>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Qualifications & Verification</CardTitle>
                            <CardDescription>Provide your qualifications for admin approval.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-1">
                                <Label htmlFor="tutor-qualifications">Qualifications</Label>
                                <Input id="tutor-qualifications" value={profile.qualifications} onChange={(e) => handleProfileChange('qualifications', e.target.value)} placeholder="e.g. B.Sc. in Physics, M.Ed."/>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="qualification-file">Highest Qualification Document</Label>
                                <div className="flex items-center gap-4">
                                    <Input id="qualification-file" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setQualificationFile(e.target.files?.[0] || null)} className="flex-1"/>
                                </div>
                                {qualificationFile && <p className="text-sm text-muted-foreground">New file selected: {qualificationFile.name}</p>}
                                {profile.qualificationUrl && !qualificationFile && (
                                     <p className="text-sm text-muted-foreground">Current file: <a href={profile.qualificationUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Document</a></p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Expertise, Rates & Mode</CardTitle>
                            <CardDescription>Define subjects, rates, and how you conduct sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-sm">High School</h4>
                                    <div className="space-y-2">
                                        <Label>Subjects</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {["Maths", "Physical Sciences", "Life Sciences"].map(subject => (
                                                <div key={subject} className="flex items-center space-x-2">
                                                    <Checkbox id={`subject-${subject}`} checked={profile.subjects.includes(subject)} onCheckedChange={() => handleCheckboxToggle('subjects', subject)} />
                                                    <label htmlFor={`subject-${subject}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{subject}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grades</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {["10", "11", "12"].map(grade => (
                                                <div key={grade} className="flex items-center space-x-2">
                                                    <Checkbox id={`grade-${grade}`} checked={profile.grades.includes(grade)} onCheckedChange={() => handleCheckboxToggle('grades', grade)} />
                                                    <label htmlFor={`grade-${grade}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Grade {grade}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                     <h4 className="font-semibold text-sm">Varsity / College</h4>
                                     <div className="space-y-2">
                                        {(profile.varsityModules || []).map((mod, index) => (
                                            <div key={index} className="flex items-end gap-2">
                                                <div className="flex-1">
                                                    <Label htmlFor={`mod-name-${index}`}>Module Name</Label>
                                                    <Input id={`mod-name-${index}`} placeholder="e.g. MTH101" value={mod.name} onChange={e => handleVarsityModuleChange(index, 'name', e.target.value)} />
                                                </div>
                                                <div className="w-1/3">
                                                    <Label htmlFor={`mod-year-${index}`}>Year</Label>
                                                    <Input id={`mod-year-${index}`} placeholder="1st" value={mod.year} onChange={e => handleVarsityModuleChange(index, 'year', e.target.value)} />
                                                </div>
                                                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 shrink-0" onClick={() => handleRemoveVarsityModule(index)}><XCircle className="h-4 w-4" /></Button>
                                            </div>
                                        ))}
                                         <Button type="button" variant="outline" size="sm" onClick={handleAddVarsityModule}>Add Module</Button>
                                     </div>
                                </div>
                            </div>
                            <Separator/>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="tutor-rate">Your Hourly Rate (R)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R</span>
                                        <Input id="tutor-rate" type="number" className="pl-8" value={profile.hourlyRate} onChange={(e) => handleProfileChange('hourlyRate', parseFloat(e.target.value))}/>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="tutor-location">Location (for in-person)</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                        <Input id="tutor-location" className="pl-8" value={profile.location} onChange={(e) => handleProfileChange('location', e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Availability</CardTitle>
                                    <CardDescription>Set the time slots when you are available for tutoring.</CardDescription>
                                </div>
                                <Button variant={isEditingProfile ? "default" : "outline"} onClick={() => setIsEditingProfile(!isEditingProfile)}>
                                    {isEditingProfile ? 'Done Editing' : <><Edit className="mr-2 h-4 w-4" /> Edit</>}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             {profile.availability.map((day, dayIndex) => (
                                <div key={day.day} className="grid grid-cols-[100px_1fr] items-start gap-6">
                                    <h4 className="font-semibold pt-2 text-right">{day.day}</h4>
                                    <div className="border rounded-lg p-4">
                                        {Object.entries(timeSlots).map(([period, slots]) => (
                                            <div key={period} className="mb-4 last:mb-0">
                                                <h5 className="text-sm font-medium mb-2">{period}</h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {slots.map(slot => (
                                                        isEditingProfile ? (
                                                            <Button
                                                                key={slot}
                                                                variant={day.slots.includes(slot) ? 'secondary' : 'outline'}
                                                                size="sm"
                                                                onClick={() => handleSlotToggle(dayIndex, slot)}
                                                                className="text-sm h-8"
                                                            >
                                                                {slot}
                                                            </Button>
                                                        ) : (
                                                            day.slots.includes(slot) && (
                                                                <Badge key={slot} variant="secondary">{slot}</Badge>
                                                            )
                                                        )
                                                    ))}
                                                     {!isEditingProfile && !day.slots.some(slot => slots.includes(slot)) && <p className="text-sm text-muted-foreground">Not available for this period.</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                         <CardFooter className="justify-end pt-4">
                            <Button onClick={handleSaveProfile} disabled={isSaving}>
                                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4"/>}
                                {isSaving ? 'Saving...' : 'Save All Profile Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
            
            {currentTab === 'bookings' && (
                <Card>
                    <CardHeader>
                        <CardTitle>My Bookings</CardTitle>
                        <CardDescription>Manage all your confirmed and pending student sessions.</CardDescription>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by student or subject..."
                                className="pl-8"
                                value={bookingFilters.search}
                                onChange={(e) => handleBookingFilterChange('search', e.target.value)}
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
                                <DropdownMenuRadioGroup value={bookingFilters.status} onValueChange={(value) => handleBookingFilterChange('status', value)}>
                                    <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Pending Confirmation">Pending Confirmation</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Confirmed">Confirmed</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Declined">Declined</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date & Time</TableHead>
                                    <TableHead className="hidden md:table-cell">Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedBookings.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell>
                                            <div className="font-medium">{booking.studentName}</div>
                                            <div className="text-sm text-muted-foreground sm:hidden">{booking.date} @ {booking.time}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{booking.date} @ {booking.time}</TableCell>
                                        <TableCell className="hidden md:table-cell"><Badge variant="secondary">{booking.subject}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                                                {getStatusIcon(booking.status)}
                                                {booking.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {booking.status === 'Pending Confirmation' ? (
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-500/50 hover:bg-red-50" onClick={() => handleBookingAction(booking, 'Declined')}><XCircle className="h-4 w-4" /></Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBookingAction(booking, 'Confirmed')}><CheckCircle className="h-4 w-4" /></Button>
                                                </div>
                                            ) : booking.status === 'Confirmed' ? (
                                                <Button size="sm" variant="outline" onClick={() => handleBookingAction(booking, 'Completed')}>Mark Completed</Button>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">No actions</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentBookingPage - 1) * bookingsPerPage + 1}-{Math.min(currentBookingPage * bookingsPerPage, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong> bookings.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentBookingPage(p => p - 1)} disabled={currentBookingPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentBookingPage(p => p + 1)} disabled={currentBookingPage >= totalBookingPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                </Card>
            )}
            
            {currentTab === 'messages' && (
                 <Card className="flex flex-col lg:flex-row lg:h-[calc(100vh-12rem)]">
                    <div className={cn("w-full lg:w-1/3 border-b lg:border-r lg:border-b-0 flex flex-col", selectedThread && "hidden lg:flex")}>
                        <div className="p-4 border-b">
                             <CardTitle className="text-lg">Inbox</CardTitle>
                        </div>
                        <ScrollArea className="flex-1 h-64 lg:h-auto">
                            {messageThreads.map(thread => (
                                <button key={thread.id} onClick={() => handleSelectThread(thread)} className={cn("block w-full text-left p-4 border-b hover:bg-muted", selectedThread?.id === thread.id && "bg-muted")}>
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold">{thread.studentName}</h4>
                                        {!thread.isReadByTutor && <Badge>New</Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {thread.lastMessageTimestamp ? formatDistanceToNow(thread.lastMessageTimestamp.toDate(), { addSuffix: true }) : ''}
                                    </p>
                                </button>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className={cn("w-full lg:w-2/3 flex flex-col", !selectedThread && "hidden lg:flex")}>
                        {selectedThread ? (
                             <>
                                <div className="p-4 border-b flex items-center gap-3">
                                     <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedThread(null)}>
                                        <ChevronLeft />
                                    </Button>
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarFallback>{selectedThread.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{selectedThread.studentName}</h3>
                                        <p className="text-sm text-muted-foreground">Student</p>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-4 h-96 lg:h-auto">
                                     <div className="space-y-4">
                                        {currentThreadMessages.map(msg => (
                                            <div key={msg.id} className={cn("flex items-end gap-2", msg.senderId === user?.uid ? 'justify-end' : '')}>
                                                {msg.senderId !== user?.uid && <Avatar className="h-8 w-8"><AvatarFallback>{selectedThread.studentName.charAt(0)}</AvatarFallback></Avatar>}
                                                <div className={cn("max-w-xs md:max-w-md p-3 rounded-lg", msg.senderId === user?.uid ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                                    <p className="text-sm">{msg.content}</p>
                                                    <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp ? formatDistanceToNow(msg.timestamp.toDate(), { addSuffix: true }) : 'sending...'}</p>
                                                </div>
                                            </div>
                                        ))}
                                     </div>
                                </ScrollArea>
                                <div className="p-4 border-t flex items-center gap-2">
                                    <Input placeholder="Type your reply..." className="flex-1" value={replyContent} onChange={(e) => setReplyContent(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}/>
                                    <Button onClick={handleSendMessage} disabled={isSending}>
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                             </>
                        ) : (
                            <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground p-8">
                                <MessageSquare className="h-16 w-16 mb-4"/>
                                <h2 className="text-xl font-semibold">Select a conversation</h2>
                                <p>Choose a conversation from the list to view messages.</p>
                            </div>
                        )}
                    </div>
                 </Card>
            )}
             {currentTab === 'calendar' && (
                <TutorCalendarTab 
                    events={events}
                    onDateClick={handleDateClick}
                    onEventClick={handleEventClick}
                />
            )}
            <CalendarDialogs
                isManualDialogOpen={isManualDialogOpen}
                setIsManualDialogOpen={setIsManualDialogOpen}
                isDetailDialogOpen={isDetailDialogOpen}
                setIsDetailDialogOpen={setIsDetailDialogOpen}
                selectedEvent={selectedEvent}
                manualEvent={manualEvent}
                setManualEvent={setManualEvent}
                onManualCreate={handleAddOrUpdateEvent}
            />
        </div>
    );
}


export default withAuth(TutorPage, ['tutor']);

type Transaction = {
    id: string;
    itemTitle: string;
    studentName?: string;
    studentId?: string;
    instructorId?: string;
    tutorId?: string;
    itemType: 'course' | 'assignment' | 'subscription' | 'refund' | 'payout' | 'Course Sale' | 'Assignment Sale' | 'Tutoring Session';
    status: 'Completed' | 'Pending' | 'Refunded';
    amount: number;
    createdAt: Timestamp;
    date: string; // for display
};
