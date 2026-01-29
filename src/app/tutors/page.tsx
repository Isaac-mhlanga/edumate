
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
import { BookOpen, Calendar, ChevronLeft, ChevronRight, Computer, Loader2, MapPin, MessageSquare, Search, Star, LogIn } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { PublicHeader } from "@/components/public-header";

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


// A mock function to simulate getting city from coordinates.
// In a real app, this would be a call to a Geocoding API.
const getCityFromCoords = (lat: number, lon: number) => {
    // This is a simplified mock. It won't be accurate.
    if (lat < -33 && lon > 18 && lon < 19) return "cape town";
    if (lat > -27 && lat < -25 && lon > 27 && lon < 29) return "johannesburg";
    if (lat > -30 && lat < -29 && lon > 30 && lon < 32) return "durban";
    return null;
}

export default function TutorsPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [allTutors, setAllTutors] = useState<Tutor[]>([]);
    const [loading, setLoading] = useState(true);

    const [subject, setSubject] = React.useState(searchParams.get('subject') || 'All');
    const [grade, setGrade] = React.useState(searchParams.get('grade') || 'All');
    const [location, setLocation] = React.useState('');
    const [locationStatus, setLocationStatus] = React.useState('Detecting your location...');

    const [selectedTutor, setSelectedTutor] = React.useState<Tutor | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = React.useState(false);
    const [isMessageDialogOpen, setIsMessageDialogOpen] = React.useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = React.useState(1);
    const tutorsPerPage = 6;

     useEffect(() => {
        const fetchApprovedTutors = async () => {
            setLoading(true);
            const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
            const firestore = getFirestore(app);
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
    }, [toast]);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const city = getCityFromCoords(latitude, longitude);
                    if (city) {
                        setLocation(city);
                        setLocationStatus(`Showing tutors near you.`);
                    } else {
                        setLocationStatus("Could not determine city. Showing all tutors.");
                    }
                },
                (error) => {
                    console.error("Error getting location:", error);
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
    
    // Pagination logic
    const totalPages = Math.ceil(filteredTutors.length / tutorsPerPage);
    const paginatedTutors = filteredTutors.slice((currentPage - 1) * tutorsPerPage, currentPage * tutorsPerPage);

    const handleBookTutor = (tutor: Tutor) => {
        setSelectedTutor(tutor);
        setIsBookingDialogOpen(true);
    };
    
    const handleMessageTutor = (tutor: Tutor) => {
        setSelectedTutor(tutor);
        setIsMessageDialogOpen(true);
    }
    
    const confirmBooking = () => {
        if (!selectedTutor || !selectedTimeSlot) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a time slot.' });
            return;
        }
        toast({ title: 'Booking Confirmed!', description: `Your session with ${selectedTutor.name} is scheduled for ${selectedTimeSlot}.` });
        setIsBookingDialogOpen(false);
        setSelectedTutor(null);
        setSelectedTimeSlot(null);
    };
    
    const sendMessage = () => {
        toast({ title: 'Message Sent!', description: `Your message has been sent to ${selectedTutor?.name}.` });
        setIsMessageDialogOpen(false);
        setSelectedTutor(null);
    };

    return (
        <div className="flex flex-col h-screen bg-background">
            <PublicHeader />
            <main className="flex-1 overflow-y-auto pt-24 pb-8 md:pb-0">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="space-y-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold">Find the Perfect Tutor</h1>
                            <p className="text-muted-foreground">Filter by subject and grade to find the best match for your needs.</p>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-end gap-4 p-4 rounded-lg bg-muted/50 border">
                            <div className="grid grid-cols-2 gap-4 flex-grow">
                                <div>
                                    <Label>Subject</Label>
                                    <Select value={subject} onValueChange={setSubject}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All">All Subjects</SelectItem>
                                            <SelectItem value="Maths">Maths</SelectItem>
                                            <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
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
                            <Button size="lg" className="h-10 w-full md:w-auto" onClick={() => setCurrentPage(1)}>
                                <Search className="mr-2 h-5 w-5" />
                                Search
                            </Button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                {locationStatus.startsWith('Detecting') ? <Loader2 className="h-4 w-4 animate-spin"/> : <MapPin className="h-4 w-4"/> }
                                <span>{locationStatus}</span>
                            </div>
                            {loading ? (
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {Array.from({ length: 3 }).map((_, i) => <Card key={i}><CardHeader><div className="h-48 w-full bg-muted rounded-md animate-pulse"></div></CardHeader></Card>)}
                                </div>
                            ) : paginatedTutors.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {paginatedTutors.map(tutor => (
                                    <Card key={tutor.id} className="flex flex-col transition-shadow duration-300 hover:shadow-xl">
                                        <CardHeader className="flex-row gap-4 items-center">
                                            <Avatar className="w-16 h-16 border">
                                                <AvatarImage src={tutor.avatar} alt={tutor.name} data-ai-hint="person profile" />
                                                <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle className="text-xl">{tutor.name}</CardTitle>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                                                    <span>4.9 (82 reviews)</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-grow space-y-4">
                                            <p className="text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <BookOpen className="h-4 w-4 text-primary" />
                                                    <span>{tutor.subjects.join(', ')} (Grades {tutor.grades.join(', ')})</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <MapPin className="h-4 w-4 text-primary" />
                                                    <span>{tutor.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Computer className="h-4 w-4 text-primary" />
                                                    <span>{tutor.modes.join(' & ')}</span>
                                                </div>
                                            </div>
                                            <div className="text-2xl font-bold">R{tutor.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hour</span></div>
                                        </CardContent>
                                        <CardFooter className="flex gap-2">
                                            <Button className="w-full" onClick={() => handleBookTutor(tutor as Tutor)}><Calendar className="mr-2" /> Book Session</Button>
                                            <Button variant="outline" className="w-full" onClick={() => handleMessageTutor(tutor as Tutor)}><MessageSquare className="mr-2" /> Message</Button>
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
                        </div>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                                <div className="text-xs text-muted-foreground">
                                    Showing <strong>{(currentPage - 1) * tutorsPerPage + 1}-{Math.min(currentPage * tutorsPerPage, filteredTutors.length)}</strong> of <strong>{filteredTutors.length}</strong> tutors.
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="hidden md:block">
                    <Footer />
                </div>
            </main>

            {/* Booking Dialog */}
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Book a Session with {selectedTutor?.name}</DialogTitle>
                        <DialogDescription>Select an available time slot below.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                        <h3 className="font-semibold">Your Information</h3>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Select defaultValue={subject !== 'All' ? subject : undefined}>
                                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                                    <SelectContent>
                                        {selectedTutor?.subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Grade</Label>
                                <Select defaultValue={grade !== 'All' ? grade : undefined}>
                                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                                    <SelectContent>
                                        {selectedTutor?.grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Select a Time</h3>
                            {selectedTutor?.availability && selectedTutor.availability.filter(d => d.slots.length > 0).length > 0 ? (
                            <RadioGroup onValueChange={setSelectedTimeSlot}>
                                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
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
                        <Button onClick={confirmBooking}>Confirm Booking</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Message Dialog */}
            <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send a Message to {selectedTutor?.name}</DialogTitle>
                        <DialogDescription>Ask a question about their services or availability.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sender-name">Full Name</Label>
                                <Input id="sender-name" placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sender-email">Email Address</Label>
                                <Input id="sender-email" type="email" placeholder="you@example.com" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message-text">Your Message</Label>
                            <Textarea id="message-text" placeholder="Type your message here..." rows={4}/>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                        <Button onClick={sendMessage}>Send Message</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
