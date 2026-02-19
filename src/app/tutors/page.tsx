
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ChevronLeft, ChevronRight, Loader2, MapPin, Search, Star } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { PublicHeader } from "@/components/public-header";
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
    const [isBookingDialogOpen, setIsBookingDialogOpen] = React.useState(false);

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
        setIsBookingDialogOpen(true);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PublicHeader />
            <main className="flex-1">
                <section className="relative pt-24 pb-12 bg-background animate-fade-in-up">
                    <div className="absolute inset-0 -z-10 bg-grid-pattern opacity-5" />
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob" />
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-blob-2" />
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-headline font-bold">Find the Perfect Tutor</h1>
                            <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">Filter by subject and grade to find an expert who fits your needs.</p>
                        </div>
                        <Card className="mb-12 shadow-lg bg-card/70 backdrop-blur-lg">
                            <CardContent className="p-4">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                     <div className="relative flex-1 w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search by city..."
                                            className="pl-10 h-11"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 w-full md:w-auto">
                                        <Select value={subject} onValueChange={setSubject}>
                                            <SelectTrigger className="w-full h-11"><SelectValue placeholder="Select Subject"/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Subjects</SelectItem>
                                                <SelectItem value="Maths">Maths</SelectItem>
                                                <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={grade} onValueChange={setGrade}>
                                            <SelectTrigger className="w-full h-11"><SelectValue placeholder="Select Grade" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="All">All Grades</SelectItem>
                                                <SelectItem value="10">Grade 10</SelectItem>
                                                <SelectItem value="11">Grade 11</SelectItem>
                                                <SelectItem value="12">Grade 12</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <Card key={i}><CardHeader><Skeleton className="h-64 w-full" /></CardHeader></Card>
                                ))}
                            </div>
                        ) : paginatedTutors.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                                                <Button size="lg" className="w-full mt-2" onClick={() => handleBookTutor(tutor as Tutor)}><Calendar className="mr-2" /> Book Session</Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                                {totalPages > 1 && (
                                     <div className="flex items-center justify-center space-x-1 pt-8">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                             <Button
                                                key={page}
                                                variant={currentPage === page ? 'default' : 'outline'}
                                                size="sm"
                                                className="h-9 w-9 p-0"
                                                onClick={() => setCurrentPage(page)}
                                            >
                                                {page}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                                <h3 className="text-lg font-semibold">No Tutors Found</h3>
                                <p>Try adjusting your search criteria or broadening your location.</p>
                            </div>
                        )}
                    </div>
                </section>
                <Footer />
            </main>

            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Book a Session with {selectedTutor?.name}</DialogTitle>
                        <DialogDescription>
                            To book a session, please log in or create an account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4">
                        <Button variant="ghost" onClick={() => setIsBookingDialogOpen(false)}>Cancel</Button>
                         <Button asChild><Link href="/login">Log In to Book</Link></Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
