
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
import { tutorData } from "@/lib/data";
import { Calendar, CheckCircle, Clock, Computer, DollarSign, Edit, Mail, MapPin, MessageSquare, Phone, Save, Users, Video, XCircle, Send, Loader2, Paperclip, Upload, Info } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import withAuth from "@/components/with-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp, onSnapshot, Unsubscribe, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import { Skeleton } from "@/components/ui/skeleton";
import { type MessageThread, type ThreadMessage } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type Booking = {
    id: string;
    studentName: string;
    date: string;
    time: string;
    subject: string;
    status: 'Confirmed' | 'Completed' | 'Pending Confirmation';
};

type Mode = "Online" | "In-person";

type TutorProfile = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    bio: string;
    hourlyRate: number;
    subjects: string[];
    grades: string[];
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
    const [messageThreads, setMessageThreads] = useState<MessageThread[]>([]);
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
    const [currentThreadMessages, setCurrentThreadMessages] = useState<ThreadMessage[]>([]);
    const [replyContent, setReplyContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [qualificationFile, setQualificationFile] = useState<File | null>(null);

    const currentTab = searchParams.get('tab') || 'overview';
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    
    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setLoading(true);
                // Fetch Profile
                const profileRef = doc(firestore, 'tutors', currentUser.uid);
                const profileSnap = await getDoc(profileRef);
                if (profileSnap.exists()) {
                    setProfile({ id: profileSnap.id, ...profileSnap.data() } as TutorProfile);
                } else {
                    const defaultProfile: TutorProfile = {
                        id: currentUser.uid, name: currentUser.displayName || 'New Tutor', email: currentUser.email || '',
                        avatar: currentUser.photoURL || 'https://placehold.co/100x100.png', bio: '', hourlyRate: 200, subjects: [],
                        grades: [], location: '', modes: [], availability: tutorData.availability, qualifications: '', approvalStatus: 'Pending'
                    };
                    await setDoc(profileRef, defaultProfile);
                    setProfile(defaultProfile);
                }
                
                // Fetch Bookings
                const bookingsQuery = query(collection(firestore, 'bookings'), where('tutorId', '==', currentUser.uid));
                const bookingsSnap = await getDocs(bookingsQuery);
                setBookings(bookingsSnap.docs.map(d => ({id: d.id, ...d.data()}) as Booking));

                // Subscribe to Message Threads
                const messagesQuery = query(collection(firestore, 'messages'), where('tutorId', '==', currentUser.uid), orderBy('lastMessageTimestamp', 'desc'));
                const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
                    const threads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MessageThread));
                    setMessageThreads(threads);
                });
                
                setLoading(false);
                return () => unsubscribeMessages();
            } else {
                setLoading(false);
            }
        });
        
        return () => unsubscribe();
    }, [toast]);
    
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

    const handleSaveProfile = async () => {
        if (!user || !profile) return;
        setIsSaving(true);
        const firestore = getFirestore();
        const storage = getStorage();
        const profileRef = doc(firestore, 'tutors', user.uid);

        let newQualificationUrl = profile.qualificationUrl;

        try {
            if (qualificationFile) {
                const fileRef = ref(storage, `tutors/${user.uid}/qualifications/${qualificationFile.name}`);
                await uploadBytes(fileRef, qualificationFile);
                newQualificationUrl = await getDownloadURL(fileRef);
            }

            await updateDoc(profileRef, { 
                ...profile,
                qualificationUrl: newQualificationUrl,
                approvalStatus: 'Pending' // Resubmit for approval on changes
            });
            setProfile({ ...profile, qualificationUrl: newQualificationUrl, approvalStatus: 'Pending' });
            setQualificationFile(null);
            toast({ title: 'Profile Updated', description: 'Your changes have been saved and submitted for review.' });
        } catch (error) {
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
    
    const handleModeToggle = (mode: Mode) => {
        if (!profile) return;
        const newModes = profile.modes.includes(mode)
            ? profile.modes.filter(m => m !== mode)
            : [...profile.modes, mode];
        handleProfileChange('modes', newModes);
    };

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle className="text-green-500" />;
            case 'Completed': return <CheckCircle className="text-blue-500" />;
            case 'Pending Confirmation': return <Clock className="text-yellow-500" />;
            default: return null;
        }
    };

    const isProfileIncomplete = !profile?.bio || !profile?.qualifications;

    if (loading) {
        return <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-64 w-full" /></div>
    }

    if (!profile) {
        return <div>Loading profile...</div>
    }

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
                    <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {tutorData.stats.map((stat) => (
                            <Card key={stat.title}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                    <stat.icon className="h-5 w-5 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                    {stat.change && <p className="text-xs text-muted-foreground">{stat.change}</p>}
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
                                                <p className="text-xs text-muted-foreground mt-1">
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

            {currentTab === 'profile' && (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Keep your public profile up to date.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center gap-6">
                                <Avatar className="w-24 h-24 border-2 border-primary">
                                    <AvatarImage src={profile.avatar} alt={profile.name} />
                                    <AvatarFallback className="text-3xl">{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 flex-1">
                                    <div className="space-y-1">
                                        <Label htmlFor="tutor-name">Full Name</Label>
                                        <Input id="tutor-name" value={profile.name} onChange={(e) => handleProfileChange('name', e.target.value)} />
                                    </div>
                                    <Button size="sm" variant="outline">Upload New Photo</Button>
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
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="tutor-rate">Your Hourly Rate (R)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
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
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profile.availability.map((day, dayIndex) => (
                                    <div key={day.day}>
                                        <h4 className="font-semibold mb-3">{day.day}</h4>
                                        <div className="space-y-2">
                                            {["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"].map(slot => (
                                                <div key={slot} className="flex items-center space-x-2">
                                                    <Checkbox 
                                                        id={`${day.day}-${slot}`} 
                                                        checked={day.slots.includes(slot)}
                                                        disabled={!isEditingProfile}
                                                        onCheckedChange={() => handleSlotToggle(dayIndex, slot)}
                                                    />
                                                    <label htmlFor={`${day.day}-${slot}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                                        {slot}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            {bookings.map(booking => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <div className="font-medium">{booking.studentName}</div>
                                        <div className="text-xs text-muted-foreground sm:hidden">{booking.date} @ {booking.time}</div>
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
                                        {booking.status === 'Pending Confirmation' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-500/50 hover:bg-red-50"><XCircle className="h-4 w-4" /></Button>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4" /></Button>
                                            </div>
                                        )}
                                        {booking.status === 'Confirmed' && <Button size="sm" variant="outline">Reschedule</Button>}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}
            
            {currentTab === 'messages' && (
                 <Card className="flex h-[calc(100vh-12rem)]">
                    <div className="w-1/3 border-r flex flex-col">
                        <div className="p-4 border-b">
                             <CardTitle className="text-lg">Inbox</CardTitle>
                        </div>
                        <ScrollArea className="flex-1">
                            {messageThreads.map(thread => (
                                <button key={thread.id} onClick={() => handleSelectThread(thread)} className={cn("block w-full text-left p-4 border-b hover:bg-muted", selectedThread?.id === thread.id && "bg-muted")}>
                                    <div className="flex justify-between">
                                        <h4 className="font-semibold">{thread.studentName}</h4>
                                        {!thread.isReadByTutor && <Badge className="h-2 w-2 p-0"></Badge>}
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{thread.lastMessage}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {thread.lastMessageTimestamp ? formatDistanceToNow(thread.lastMessageTimestamp.toDate(), { addSuffix: true }) : ''}
                                    </p>
                                </button>
                            ))}
                        </ScrollArea>
                    </div>
                    <div className="w-2/3 flex flex-col">
                        {selectedThread ? (
                             <>
                                <div className="p-4 border-b flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border">
                                        <AvatarFallback>{selectedThread.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold">{selectedThread.studentName}</h3>
                                        <p className="text-sm text-muted-foreground">Student</p>
                                    </div>
                                </div>
                                <ScrollArea className="flex-1 p-4">
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
                            <div className="flex flex-col h-full items-center justify-center text-center text-muted-foreground">
                                <MessageSquare className="h-16 w-16 mb-4"/>
                                <h2 className="text-xl font-semibold">Select a conversation</h2>
                                <p>Choose a conversation from the list to view messages.</p>
                            </div>
                        )}
                    </div>
                 </Card>
            )}
        </div>
    );
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default withAuth(TutorPage, ['tutor']);
