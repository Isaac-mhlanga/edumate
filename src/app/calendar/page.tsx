
'use client';

import React, { useState, useRef, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Calendar as CalendarIcon, User, BookOpen, GraduationCap, ExternalLink, Info } from 'lucide-react';
import { format } from 'date-fns';
import { getFirestore, doc, getDocs, collection } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Badge } from '@/components/ui/badge';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color?: string;
  description?: string;
  instructor?: string;
  grade?: string;
  subject?: string;
  scope?: string;
  platforms?: string[];
};

const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'zoom', label: 'Zoom' },
]

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    

    const { toast } = useToast();

     useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const fetchEvents = async () => {
            const eventsSnapshot = await getDocs(collection(firestore, "events"));
            const fetchedEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
            setEvents(fetchedEvents);
        };
        fetchEvents();
    }, []);

    const handleDateClick = (arg: any) => {
        toast({ title: "Action not available", description: "Please go to the admin or instructor dashboard to create new events." });
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
            description: extendedProps.scope || extendedProps.description,
            color: event.backgroundColor,
            instructor: extendedProps.instructor,
            grade: extendedProps.grade,
            subject: extendedProps.subject,
            scope: extendedProps.scope,
            platforms: extendedProps.platforms,
        });
        setIsDetailDialogOpen(true);
    };

    return (
        <>
            <style jsx global>{`
                .fc {
                    font-family: var(--font-body), sans-serif;
                    color: hsl(var(--foreground));
                }
                .fc .fc-toolbar-title {
                    font-size: 1.5rem;
                    font-weight: 500;
                    color: hsl(var(--foreground));
                }
                .fc .fc-button {
                    background-color: hsl(var(--card)) !important;
                    border-color: hsl(var(--border)) !important;
                    color: hsl(var(--card-foreground)) !important;
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
                .fc-theme-standard .fc-list-day-cushion {
                    background-color: hsl(var(--card));
                }
                .fc .fc-list-event:hover td {
                    background-color: hsl(var(--muted)) !important;
                }
                 .fc-col-header-cell-cushion, .fc-list-day-text, .fc-list-day-side-text {
                    color: hsl(var(--foreground)) !important;
                }
                .fc-theme-standard th {
                    background: hsl(var(--card));
                }
            `}</style>

            <div className="space-y-6">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">Calendar</CardTitle>
                            <CardDescription>Browse upcoming live sessions, workshops, and deadlines.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border overflow-hidden p-1">
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
                                editable={false}
                                selectable={true}
                                height="auto"
                                contentHeight="auto"
                                aspectRatio={2}
                                dayMaxEvents={true}
                            />
                        </div>
                    </CardContent>
                </Card>
                
                 {/* Event Detail Dialog */}
                <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
                    <DialogContent>
                        {selectedEvent && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center text-xl">
                                         <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: selectedEvent.color || 'hsl(var(--primary))' }}></span>
                                        {selectedEvent.title}
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="py-4 space-y-4 text-sm">
                                    <div className="flex items-center gap-4">
                                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            {selectedEvent.allDay ? (
                                                <p>{format(new Date(selectedEvent.start), 'eeee, MMMM d, yyyy')}</p>
                                            ) : (
                                                <>
                                                    <p>{format(new Date(selectedEvent.start), 'eeee, MMMM d, yyyy')}</p>
                                                    <p className="text-muted-foreground">{format(new Date(selectedEvent.start), 'p')} {selectedEvent.end ? ` - ${format(new Date(selectedEvent.end), 'p')}` : ''}</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <User className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p>Hosted by <span className="font-semibold">{selectedEvent.instructor}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p>{selectedEvent.subject}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p>Grade {selectedEvent.grade}</p>
                                        </div>
                                    </div>

                                    {selectedEvent.description && (
                                        <div className="flex items-start gap-4">
                                            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <p className="text-muted-foreground">{selectedEvent.description}</p>
                                        </div>
                                    )}
                                    {selectedEvent.platforms && selectedEvent.platforms.length > 0 && (
                                        <div className="flex items-center gap-4">
                                            <ExternalLink className="h-5 w-5 text-muted-foreground" />
                                            <div className="flex flex-wrap gap-2">
                                                {selectedEvent.platforms.map(p => <Badge key={p} variant="secondary">{platforms.find(pl=> pl.value === p)?.label}</Badge>)}
                                            </div>
                                        </div>
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
        </>
    );
}

    
