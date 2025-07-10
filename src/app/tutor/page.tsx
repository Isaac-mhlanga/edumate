
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
import { tutorData } from "@/lib/data";
import { Calendar, CheckCircle, Clock, Computer, DollarSign, Edit, Mail, MapPin, MessageSquare, Phone, Save, Users, Video, XCircle } from "lucide-react";
import React from "react";
import withAuth from "@/components/with-auth";
import { useSearchParams } from "next/navigation";

type Booking = (typeof tutorData.bookings)[0];
type Message = (typeof tutorData.messages)[0];
type Mode = "Online" | "In-person";

function TutorPage() {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') || 'overview';
    
    const [bookings, setBookings] = React.useState<Booking[]>(tutorData.bookings);
    const [messages, setMessages] = React.useState<Message[]>(tutorData.messages);

    const [isEditingAvailability, setIsEditingAvailability] = React.useState(false);
    const [availability, setAvailability] = React.useState(tutorData.availability);
    const [tutoringModes, setTutoringModes] = React.useState<Mode[]>(tutorData.modes as Mode[]);

    const handleSlotToggle = (dayIndex: number, slot: string) => {
        const newAvailability = [...availability];
        const day = newAvailability[dayIndex];
        const slotIndex = day.slots.indexOf(slot);

        if (slotIndex > -1) {
            day.slots.splice(slotIndex, 1);
        } else {
            day.slots.push(slot);
        }
        setAvailability(newAvailability);
    };
    
    const handleModeToggle = (mode: Mode) => {
        setTutoringModes(prev => {
            if (prev.includes(mode)) {
                return prev.filter(m => m !== mode);
            }
            return [...prev, mode];
        });
    };

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle className="text-green-500" />;
            case 'Completed': return <CheckCircle className="text-blue-500" />;
            case 'Pending Confirmation': return <Clock className="text-yellow-500" />;
            default: return null;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tutor Dashboard</h1>
                <p className="text-muted-foreground">Manage your profile, bookings, and student interactions.</p>
            </div>

            <div className="pt-6">
                {currentTab === 'overview' && (
                    <div className="space-y-8">
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
                                        {messages.slice(0, 4).map(message => (
                                            <li key={message.id} className="flex items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex justify-between">
                                                        <p className="font-medium">{message.studentName}</p>
                                                        {message.unread && <Badge>New</Badge>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground truncate">{message.snippet}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{message.timestamp}</p>
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
                                        <AvatarImage src={tutorData.avatar} alt={tutorData.name} />
                                        <AvatarFallback className="text-3xl">{tutorData.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2 flex-1">
                                        <div className="space-y-1">
                                            <Label htmlFor="tutor-name">Full Name</Label>
                                            <Input id="tutor-name" defaultValue={tutorData.name} />
                                        </div>
                                        <Button size="sm" variant="outline">Upload New Photo</Button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="tutor-bio">Biography</Label>
                                    <Textarea id="tutor-bio" defaultValue={tutorData.bio} rows={5} placeholder="Tell students about yourself, your teaching style, and your experience."/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="tutor-email">Email Address</Label>
                                        <Input id="tutor-email" type="email" defaultValue={tutorData.email} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="tutor-phone">Phone Number</Label>
                                        <Input id="tutor-phone" type="tel" defaultValue="(123) 456-7890" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button><Save className="mr-2 h-4 w-4"/>Save Changes</Button>
                            </CardFooter>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Expertise, Rates & Mode</CardTitle>
                                <CardDescription>Define subjects, rates, and how you conduct sessions.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-4">
                                        <Label>Subjects</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="terms1" defaultChecked={tutorData.subjects.includes("Maths")}/>
                                            <label htmlFor="terms1" className="text-sm font-medium leading-none">Maths</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="terms2" defaultChecked={tutorData.subjects.includes("Physical Sciences")}/>
                                            <label htmlFor="terms2" className="text-sm font-medium leading-none">Physical Sciences</label>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Grades</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="grade10" defaultChecked={tutorData.grades.includes("10")}/>
                                            <label htmlFor="grade10" className="text-sm font-medium leading-none">Grade 10</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="grade11" defaultChecked={tutorData.grades.includes("11")}/>
                                            <label htmlFor="grade11" className="text-sm font-medium leading-none">Grade 11</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="grade12" defaultChecked={tutorData.grades.includes("12")}/>
                                            <label htmlFor="grade12" className="text-sm font-medium leading-none">Grade 12</label>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <Label>Tutoring Mode</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="mode-online" checked={tutoringModes.includes("Online")} onCheckedChange={() => handleModeToggle("Online")}/>
                                            <label htmlFor="mode-online" className="text-sm font-medium leading-none flex items-center gap-1.5"><Computer className="h-4 w-4"/>Online</label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="mode-inperson" checked={tutoringModes.includes("In-person")} onCheckedChange={() => handleModeToggle("In-person")}/>
                                            <label htmlFor="mode-inperson" className="text-sm font-medium leading-none flex items-center gap-1.5"><Users className="h-4 w-4"/>In-person</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="tutor-rate">Your Hourly Rate (R)</Label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                            <Input id="tutor-rate" type="number" className="pl-8" defaultValue={tutorData.hourlyRate} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="tutor-location">Location (for in-person)</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                            <Input id="tutor-location" className="pl-8" defaultValue={tutorData.location} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button><Save className="mr-2 h-4 w-4"/>Save Expertise</Button>
                            </CardFooter>
                        </Card>
                        
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Availability</CardTitle>
                                        <CardDescription>Set the time slots when you are available for tutoring.</CardDescription>
                                    </div>
                                    <Button variant={isEditingAvailability ? "default" : "outline"} onClick={() => setIsEditingAvailability(!isEditingAvailability)}>
                                        {isEditingAvailability ? <><Save className="mr-2 h-4 w-4" /> Save</> : <><Edit className="mr-2 h-4 w-4" /> Edit</>}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {availability.map((day, dayIndex) => (
                                        <div key={day.day}>
                                            <h4 className="font-semibold mb-3">{day.day}</h4>
                                            <div className="space-y-2">
                                                {["09:00 - 10:00", "10:00 - 11:00", "11:00 - 12:00", "14:00 - 15:00", "15:00 - 16:00", "16:00 - 17:00", "17:00 - 18:00"].map(slot => (
                                                    <div key={slot} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`${day.day}-${slot}`} 
                                                            checked={day.slots.includes(slot)}
                                                            disabled={!isEditingAvailability}
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
                     <Card>
                        <CardHeader>
                            <CardTitle>Inbox</CardTitle>
                            <CardDescription>Respond to student inquiries and booking requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-4">
                                {messages.map(message => (
                                    <li key={message.id} className={`p-4 rounded-lg flex items-start gap-4 transition-colors ${message.unread ? 'bg-muted/50' : 'hover:bg-muted/50'}`}>
                                        <Avatar className="h-10 w-10 border mt-1">
                                            <AvatarFallback>{message.studentName.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <div>
                                                    <p className="font-semibold">{message.studentName}</p>
                                                    <p className="text-sm font-medium">{message.subject}</p>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{message.timestamp}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{message.snippet}</p>
                                        </div>
                                        <Button variant="outline" size="sm" className="mt-1">Reply</Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default withAuth(TutorPage, ['tutor']);
