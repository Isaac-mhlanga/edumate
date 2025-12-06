
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
import { createCalendarEvent, CreateCalendarEventOutput } from '@/ai/flows/create-calendar-event';
import { getFirestore, doc, addDoc, collection } from "firebase/firestore";
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
    const [isAiDialogOpen, setIsAiDialogOpen] = React.useState(false);
    const [isManualDialogOpen, setIsManualDialogOpen] = React.useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
    const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
    const [manualEvent, setManualEvent] = React.useState<Partial<CalendarEvent>>({});
    const [aiPrompt, setAiPrompt] = React.useState('');
    const [isAiLoading, setIsAiLoading] = React.useState(false);

    const handleDateClick = (arg: any) => {
        setManualEvent({ start: arg.dateStr, allDay: arg.allDay });
        setIsManualDialogOpen(true);
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
    
    const handleAddManualEvent = async () => {
        if (!manualEvent.title || !manualEvent.start) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }

        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        
        try {
            const docRef = await addDoc(collection(firestore, 'events'), manualEvent);
            const newEvent = { ...manualEvent, id: docRef.id } as CalendarEvent;
            setEvents([...events, newEvent]);
            toast({ title: 'Event Created!', description: `"${newEvent.title}" has been added.` });
            setIsManualDialogOpen(false);
            setManualEvent({});
        } catch(error) {
            console.error("Error creating event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save the event.' });
        }
    };

    const handleAiCreateEvent = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);
        try {
            const result: CreateCalendarEventOutput = await createCalendarEvent({ prompt: aiPrompt });
            if (result.title && result.start) {
                const newEventData: Partial<CalendarEvent> = {
                    title: result.title,
                    start: result.start,
                    end: result.end || undefined,
                    allDay: result.allDay,
                    color: 'hsl(var(--accent))'
                };
                
                const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
                const firestore = getFirestore(app);
                const docRef = await addDoc(collection(firestore, 'events'), newEventData);

                const newEvent: CalendarEvent = { ...newEventData, id: docRef.id } as CalendarEvent;
                setEvents([...events, newEvent]);
                toast({ title: 'Event Created!', description: `"${result.title}" has been added to the calendar.` });
                setIsAiDialogOpen(false);
                setAiPrompt('');
            } else {
                toast({ variant: 'destructive', title: 'Could not create event', description: 'The AI could not understand the event details. Please try being more specific.' });
            }
        } catch (error) {
            console.error("Error creating AI event:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while creating the event.' });
        } finally {
            setIsAiLoading(false);
        }
    };

    return (
        <>
            <Card className="shadow-lg rounded-xl">
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-xl">Platform Calendar</CardTitle>
                        <CardDescription>View and manage all scheduled events across the platform.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                         <Button variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                             <PlusCircle className="mr-2 h-4 w-4" /> Add Event
                         </Button>
                         <Button onClick={() => setIsAiDialogOpen(true)}>
                            <Sparkles className="mr-2 h-4 w-4" /> Create with AI
                        </Button>
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
                isAiDialogOpen={isAiDialogOpen}
                setIsAiDialogOpen={setIsAiDialogOpen}
                isManualDialogOpen={isManualDialogOpen}
                setIsManualDialogOpen={setIsManualDialogOpen}
                isDetailDialogOpen={isDetailDialogOpen}
                setIsDetailDialogOpen={setIsDetailDialogOpen}
                selectedEvent={selectedEvent}
                manualEvent={manualEvent}
                setManualEvent={setManualEvent}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                isAiLoading={isAiLoading}
                onAiCreate={handleAiCreateEvent}
                onManualCreate={handleAddManualEvent}
            />
        </>
    );
}

    