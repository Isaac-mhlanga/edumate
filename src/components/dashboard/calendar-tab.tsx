
'use client';

import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarIcon, User, BookOpen, GraduationCap, ExternalLink, Info } from 'lucide-react';
import { format } from 'date-fns';
import { getFirestore, doc, getDocs, collection, query, where, or } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, type User as AuthUser } from 'firebase/auth';
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
  instructorId?: string;
  studentId?: string;
  grade?: string;
  subject?: string;
  module?: string;
  scope?: string;
  platforms?: string[];
};

const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'phone', label: 'Phone Call' },
]

export function StudentCalendarTab() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const { toast } = useToast();

     useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            let eventsQuery;
            if (currentUser) {
                // Fetch public events (no studentId) and events for this student
                eventsQuery = query(collection(firestore, "events"), 
                    or(
                        where('studentId', '==', null),
                        where('studentId', '==', currentUser.uid)
                    )
                );
            } else {
                 eventsQuery = query(collection(firestore, "events"), where('studentId', '==', null));
            }
            const eventsSnapshot = await getDocs(eventsQuery);
            const fetchedEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
            setEvents(fetchedEvents);
        });

        return () => unsubscribe();
    }, []);

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
            module: extendedProps.module,
            scope: extendedProps.scope,
            platforms: extendedProps.platforms,
        });
        setIsDetailDialogOpen(true);
    };

    return (
        <>
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">My Calendar</CardTitle>
                    <CardDescription>Your schedule, upcoming sessions, workshops, and deadlines.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border overflow-hidden p-1">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,listWeek'
                            }}
                            events={events}
                            eventClick={handleEventClick}
                            editable={false}
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
                                        <p>Hosted by <span className="font-semibold">{selectedEvent.instructor || 'Tutor'}</span></p>
                                    </div>
                                </div>
                                {selectedEvent.grade === 'Varsity' ? (
                                    selectedEvent.module && (
                                        <div className="flex items-center gap-4">
                                            <BookOpen className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p>{selectedEvent.module}</p>
                                            </div>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        {selectedEvent.subject && (
                                            <div className="flex items-center gap-4">
                                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p>{selectedEvent.subject}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedEvent.grade && (
                                            <div className="flex items-center gap-4">
                                                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p>Grade {selectedEvent.grade}</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}

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
        </>
    );
}
