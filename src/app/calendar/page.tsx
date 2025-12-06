
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
import { PlusCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { getFirestore, doc, getDocs, collection } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";

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
};

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    
    const [manualEvent, setManualEvent] = useState<Partial<CalendarEvent>>({});

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
        toast({ title: "Action not available", description: "Please go to the admin dashboard to create new events." });
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
                .fc-theme-standard .fc-list-day-cushion, .fc-theme-standard .fc-list-table td {
                    background-color: hsl(var(--card));
                }
                .fc .fc-list-event:hover td {
                    background-color: hsl(var(--muted));
                }
                 .fc-col-header-cell-cushion {
                    color: hsl(var(--muted-foreground)) !important;
                }
            `}</style>

            <div className="space-y-6">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">Calendar</CardTitle>
                            <CardDescription>Manage your schedule, events, and appointments.</CardDescription>
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
        </>
    );
}

    