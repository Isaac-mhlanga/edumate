
'use client';

import React from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles } from "lucide-react";
import { CalendarEvent } from "@/app/admin/page";
import { CalendarDialogs } from "./calendar-dialogs";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, addDoc, collection, updateDoc } from "firebase/firestore";
import { getApp, getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

interface AdminCalendarTabProps {
    events: CalendarEvent[];
    setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
}

export function AdminCalendarTab({ events, setEvents }: AdminCalendarTabProps) {
    const { toast } = useToast();
    const [isManualDialogOpen, setIsManualDialogOpen] = React.useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
    const [manualEvent, setManualEvent] = React.useState<Partial<CalendarEvent>>({});

    const handleDateClick = (arg: any) => {
        setManualEvent({ start: arg.dateStr, allDay: arg.allDay });
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
            description: extendedProps.description,
            instructor: extendedProps.instructor,
            grade: extendedProps.grade,
            subject: extendedProps.subject,
            scope: extendedProps.scope,
            platforms: extendedProps.platforms,
            color: event.backgroundColor,
        });
        setIsDetailDialogOpen(true);
    };
    
    const handleAddOrUpdateEvent = async () => {
        if (!manualEvent.title || !manualEvent.start) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        
        try {
            if (manualEvent.id) {
                // Update existing event
                const eventRef = doc(firestore, 'events', manualEvent.id);
                await updateDoc(eventRef, manualEvent);
                setEvents(prev => prev.map(e => e.id === manualEvent.id ? manualEvent as CalendarEvent : e));
                toast({ title: 'Event Updated!', description: `"${manualEvent.title}" has been updated.` });
            } else {
                // Create new event
                const docRef = await addDoc(collection(firestore, 'events'), manualEvent);
                const newEvent = { ...manualEvent, id: docRef.id } as CalendarEvent;
                setEvents([...events, newEvent]);
                toast({ title: 'Event Created!', description: `"${newEvent.title}" has been added.` });
            }
            
            setIsManualDialogOpen(false);
            setManualEvent({});
        } catch(error) {
            console.error("Error saving event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the event.' });
        }
    };

    return (
        <>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">Platform Calendar</CardTitle>
                        <CardDescription>View and manage all scheduled events across the platform.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                             <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                         </Button>
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
                            editable={true}
                            selectable={true}
                            height="auto"
                            contentHeight="auto"
                            aspectRatio={2}
                            dayMaxEvents={true}
                        />
                    </div>
                </CardContent>
            </Card>
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
        </>
    );
}

    
