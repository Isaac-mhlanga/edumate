
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Loader2, MapPin, MessageSquare, Search, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { getFirestore, collection, query, where, getDocs, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import withAuth from "@/components/with-auth";
import { Skeleton } from "@/components/ui/skeleton";

type Mode = "Online" | "In-person";

type Tutor = {
    id: string;
    name: string;
    avatar: string;
    bio: string;
    hourlyRate: number;
    subjects: string[];
    grades: string[];
    location: string;
    modes: Mode[];
    availability: { day: string; slots: string[] }[];
    approvalStatus: 'Approved';
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const getCityFromCoords = (lat: number, lon: number) => {
    if (lat < -33 && lon > 18 && lon < 19) return "cape town";
    if (lat > -27 && lat < -25 && lon > 27 && lon < 29) return "johannesburg";
    if (lat > -30 && lat < -29 && lon > 30 && lon < 32) return "durban";
    return null;
}

function TutorsDashboardPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [user, setUser] = useState<User | null>(null);
    const [allTutors, setAllTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);

    const [subject, setSubject] = React.useState(searchParams.get('subject') || 'All');
    const [grade, setGrade] = React.useState(searchParams.get('grade') || 'All');
    const [location, setLocation] = React.useState('');
    const [locationStatus, setLocationStatus] = React.useState('Detecting your location...');

    const [selectedTutor, setSelectedTutor] = React.useState<Tutor | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
    const [bookingSubject, setBookingSubject] = React.useState('');

    const [isBookingDialogOpen, setIsBookingDialogOpen] = React.useState(false);
    const [isMessageDialogOpen, setIsMessageDialogOpen] = React.useState(false);

    const [currentPage, setCurrentPage] = React.useState(1);
    const tutorsPerPage = 6;

     useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const unsubscribeAuth = onAuthStateChanged(auth, setUser);

        const fetchApprovedTutors = async () => {
            setLoading(true);
            const tutorsQuery = query(collection(firestore, 'tutors'), where('approvalStatus', '==', 'Approved'));
            
            try {
                const querySnapshot = await getDocs(tutorsQuery);
                const approvedTutors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tutor));
                setAllTutors(approvedTutors);
            } catch (error) {
                console.error("Error fetching approved tutors:", error);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch available tutors.' });
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedTutors();
        
        return () => unsubscribeAuth();
    }, [toast]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const city = getCityFromCoords(position.coords.latitude, position.coords.longitude);
                    if (city) {
                        setLocation(city);
                        setLocationStatus(`Showing tutors near you.`);
                    } else {
                        setLocationStatus("Could not determine city. Showing all tutors.");
                    }
                },
                (error) => {
                    console.error("Error getting location:", error.message);
                    setLocationStatus("Location access denied. Showing all tutors.");
                }
            );
        } else {
             setLocationStatus("Geolocation is not supported by your browser.");
        }
    }, []);


    const filteredTutors = React.useMemo(() => {
        return allTutors.filter(tutor => {
            const subjectMatch = subject === 'All' || tutor.subjects.includes(subject);
            const gradeMatch = grade === 'All' || tutor.grades.includes(grade);
            const locationMatch = location === '' || tutor.location.toLowerCase().includes(location.toLowerCase());
            return subjectMatch && gradeMatch && locationMatch;
        });
    }, [allTutors, subject, grade, location]);
    
    const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
    const paginatedTutors = filteredTutors.slice((currentPage - 1) * tutorsPerPage, currentPage * tutorsPerPage);

    const handleBookTutor = (tutor: Tutor) => {
        setSelectedTutor(tutor);
        setBookingSubject(subject !== 'All' ? subject : tutor.subjects[0]);
        setIsBookingDialogOpen(true);
    };
    
    const handleMessageTutor = (tutor: Tutor) => {
        if (!user) {
             toast({ variant: 'destructive', title: 'Please log in', description: 'You must be logged in to message a tutor.' });
             return;
        }
        setSelectedTutor(tutor);
        setIsMessageDialogOpen(true);
    }
    
    const confirmBooking = async () => {
        if (!selectedTutor || !selectedTimeSlot || !bookingSubject || !user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a subject and time slot.' });
            return;
        }

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);

        try {
            await addDoc(collection(firestore, 'bookings'), {
                studentId: user.uid,
                studentName: user.displayName,
                tutorId: selectedTutor.id,
                tutorName: selectedTutor.name,
                subject: bookingSubject,
                date: selectedTimeSlot.split(' @ ')[0],
                time: selectedTimeSlot.split(' @ ')[1],
                status: 'Pending Confirmation',
                createdAt: serverTimestamp()
            });

            toast({ title: 'Booking Request Sent!', description: `Your request for a session with ${selectedTutor.name} has been sent.` });
            setIsBookingDialogOpen(false);
            setSelectedTutor(null);
            setSelectedTimeSlot(null);
        } catch (error) {
            console.error("Error creating booking:", error);
            toast({ variant: 'destructive', title: 'Booking Failed', description: 'Could not send your booking request.' });
        }
    };
    
    const sendMessage = async (message: string) => {
        if (!user || !selectedTutor) return;
        
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        
        const threadId = [user.uid, selectedTutor.id].sort().join('_');
        
        try {
            const threadRef = doc(collection(firestore, 'messages'), threadId);
            const messagesColRef = collection(threadRef, 'threadMessages');

            await addDoc(messagesColRef, {
                senderId: user.uid,
                content: message,
                timestamp: serverTimestamp(),
            });

            await setDoc(threadRef, {
                studentId: user.uid,
                studentName: user.displayName,
                tutorId: selectedTutor.id,
                tutorName: selectedTutor.name,
                lastMessage: message,
                lastMessageTimestamp: serverTimestamp(),
                isReadByTutor: false,
                isReadByStudent: true,
            }, { merge: true });

            toast({ title: 'Message Sent!', description: `Your message has been sent to ${selectedTutor?.name}.` });
            setIsMessageDialogOpen(false);
            setSelectedTutor(null);
        } catch(error) {
            console.error("Error sending message:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not send message.' });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Find a Tutor</h1>
                <p className="text-muted-foreground">Browse and book sessions with our expert tutors.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow">
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select value={subject} onValueChange={setSubject}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Subjects</SelectItem>
                                        <SelectItem value="Maths">Maths</SelectItem>
                                        <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                        <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Grade</Label>
                                <Select value={grade} onValueChange={setGrade}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Grades</SelectItem>
                                        <SelectItem value="10">Grade 10</SelectItem>
                                        <SelectItem value="11">Grade 11</SelectItem>
                                        <SelectItem value="12">Grade 12</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button className="h-10 w-full md:w-auto" onClick={() => setCurrentPage(1)}>
                            <Search className="mr-2 h-5 w-5" />
                            Search
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                        {locationStatus.startsWith('Detecting') ? <Loader2 className="h-4 w-4 animate-spin"/> : <MapPin className="h-4 w-4"/> }
                        <span>{locationStatus}</span>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
                        </div>
                    ) : paginatedTutors.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedTutors.map(tutor => (
                             <Card key={tutor.id} className="group overflow-hidden flex flex-col h-full bg-card/50 backdrop-blur-lg border-border/20 shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1">
                                <CardHeader className="flex-row gap-4 items-center p-4">
                                    <Avatar className="w-20 h-20 border-2 border-primary">
                                        <AvatarImage src={tutor.avatar} alt={tutor.name} data-ai-hint="person profile" />
                                        <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl">{tutor.name}</CardTitle>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                            <Star className="w-4 h-4 fill-primary text-primary" />
                                            <span>4.9 (82 reviews)</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-grow p-4 space-y-4">
                                    <p className="text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tutor.subjects.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                                        {tutor.grades.map(g => <Badge key={g} variant="outline">Grade {g}</Badge>)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{tutor.location}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-4 flex-col gap-2">
                                    <div className="flex justify-between items-center w-full">
                                        <span className="text-2xl font-bold">R{tutor.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hour</span></span>
                                        <div className="flex gap-2">
                                            {tutor.modes.map(mode => <Badge key={mode} variant="outline">{mode}</Badge>)}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full mt-2">
                                        <Button className="w-full" onClick={() => handleBookTutor(tutor as Tutor)}><Calendar className="mr-2" /> Book</Button>
                                        <Button variant="outline" className="w-full" onClick={() => handleMessageTutor(tutor as Tutor)}><MessageSquare className="mr-2" /> Message</Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    ) : (
                        <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold">No Tutors Found</h3>
                            <p>Try adjusting your search criteria or broadening your location.</p>
                        </div>
                    )}
                </CardContent>

                {totalPages > 1 && (
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{(currentPage - 1) * tutorsPerPage + 1}-{Math.min(currentPage * tutorsPerPage, filteredTutors.length)}</strong> of <strong>{filteredTutors.length}</strong> tutors.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Book a Session with {selectedTutor?.name}</DialogTitle>
                        <DialogDescription>Select a subject and an available time slot.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select value={bookingSubject} onValueChange={setBookingSubject}>
                                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                <SelectContent>
                                    {selectedTutor?.subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm mb-2">Select a Time</h3>
                            {selectedTutor?.availability && selectedTutor.availability.filter(d => d.slots.length > 0).length > 0 ? (
                            <RadioGroup onValueChange={setSelectedTimeSlot} className="max-h-60 overflow-y-auto pr-2">
                                <div className="space-y-4">
                                {selectedTutor?.availability.filter(d => d.slots.length > 0).map(day => (
                                    <div key={day.day}>
                                        <h4 className="font-medium text-sm mb-2">{day.day}</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {day.slots.map(slot => (
                                                <Label key={`${day.day}-${slot}`} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-2 font-normal hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary">
                                                    <RadioGroupItem value={`${day.day} @ ${slot}`} id={`${day.day}-${slot}`} className="sr-only"/>
                                                    {slot}
                                                </Label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </RadioGroup>
                            ) : (
                                <p className="text-sm text-muted-foreground">This tutor has not set their availability yet.</p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
                        <Button onClick={confirmBooking}>Request Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send a Message to {selectedTutor?.name}</DialogTitle>
                        <DialogDescription>Ask a question about their services or availability.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); sendMessage((e.target as any).elements.message.value); }}>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message-text">Your Message</Label>
                                <Textarea id="message-text" name="message" placeholder="Type your message here..." rows={4} required/>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Send Message</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default withAuth(TutorsDashboardPage, ['student']);

    
