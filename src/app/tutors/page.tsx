
'use client';

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { tutorData } from "@/lib/data";
import { ArrowLeft, BookOpen, Calendar, Computer, DollarSign, GraduationCap, MapPin, MessageSquare, Search, Star, Users } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Icons } from "@/components/icons";
import { Footer } from "@/components/footer";

type Tutor = typeof tutorData;
type Day = (typeof tutorData.availability)[0];

const allTutors = [tutorData, { ...tutorData, id: "T002", name: "Dr. Evelyn Reed", avatar: "https://placehold.co/100x100.png", hourlyRate: 300, subjects: ["Maths"], location: "Johannesburg, Gauteng" }];

export default function TutorsPage() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [subject, setSubject] = React.useState(searchParams.get('subject') || 'All');
    const [grade, setGrade] = React.useState(searchParams.get('grade') || 'All');
    const [location, setLocation] = React.useState(searchParams.get('location') || '');

    const [selectedTutor, setSelectedTutor] = React.useState<Tutor | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = React.useState<string | null>(null);
    const [isBookingDialogOpen, setIsBookingDialogOpen] = React.useState(false);
    const [isMessageDialogOpen, setIsMessageDialogOpen] = React.useState(false);

    const filteredTutors = React.useMemo(() => {
        return allTutors.filter(tutor => {
            const subjectMatch = subject === 'All' || tutor.subjects.includes(subject);
            const gradeMatch = grade === 'All' || tutor.grades.includes(grade);
            const locationMatch = location === '' || tutor.location.toLowerCase().includes(location.toLowerCase());
            return subjectMatch && gradeMatch && locationMatch;
        });
    }, [subject, grade, location]);
    
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
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Icons.logo className="h-8 w-8 text-primary" />
                    <span className="text-xl font-bold">Edumate Pro</span>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                    <Link href="/#tutors" className="text-sm font-medium hover:text-primary transition-colors">Find a Tutor</Link>
                    <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
                </nav>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" asChild>
                        <Link href="/login">Log In</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Get Started</Link>
                    </Button>
                </div>
                </div>
            </header>
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    <div>
                        <Button variant="outline" asChild>
                            <Link href="/#tutors">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Search
                            </Link>
                        </Button>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Find a Tutor</CardTitle>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 items-end gap-4">
                                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                    <div>
                                        <Label>Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Cape Town" className="pl-10" />
                                        </div>
                                    </div>
                                </div>
                                <Button size="lg" className="h-10">
                                    <Search className="mr-2 h-5 w-5" />
                                    Search
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground mb-4">
                                Showing {filteredTutors.length} tutor(s) matching your criteria.
                            </div>
                            {filteredTutors.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {filteredTutors.map(tutor => (
                                    <Card key={tutor.id} className="flex flex-col">
                                        <CardHeader className="flex-row gap-4 items-center">
                                            <Avatar className="w-16 h-16 border">
                                                <AvatarImage src={tutor.avatar} alt={tutor.name} />
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
                                        <CardContent className="flex gap-2">
                                            <Button className="w-full" onClick={() => handleBookTutor(tutor as Tutor)}><Calendar className="mr-2" /> Book Session</Button>
                                            <Button variant="outline" className="w-full" onClick={() => handleMessageTutor(tutor as Tutor)}><MessageSquare className="mr-2" /> Message</Button>
                                        </CardContent>
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
                    </Card>

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
                            <div className="py-4 space-y-2">
                                <Label htmlFor="message-text">Your Message</Label>
                                <Textarea id="message-text" placeholder="Type your message here..." rows={6}/>
                            </div>
                            <DialogFooter>
                                <Button variant="ghost" onClick={() => setIsMessageDialogOpen(false)}>Cancel</Button>
                                <Button onClick={sendMessage}>Send Message</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
            <Footer />
        </div>
    );
}
