
'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { createCalendarEvent, CreateCalendarEventOutput } from '@/ai/flows/create-calendar-event';
import { Sparkles } from 'lucide-react';

export default function CalendarPage() {
    const [events, setEvents] = useState([
        { title: 'Maths Webinar', start: '2024-08-15T10:30:00', end: '2024-08-15T12:30:00', color: '#6A1B9A' },
        { title: 'Physics Study Group', start: '2024-08-16T14:00:00', color: '#349888' }
    ]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const { toast } = useToast();

    const handleDateClick = (arg: any) => {
        // Handle date click if needed, e.g., for creating a new event manually
        console.log(arg);
    };

    const handleAiCreateEvent = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);

        try {
            const result: CreateCalendarEventOutput = await createCalendarEvent({ prompt: aiPrompt });
            if (result.title && result.start) {
                const newEvent = {
                    title: result.title,
                    start: result.start,
                    end: result.end || undefined, // FullCalendar handles null/undefined end dates
                    allDay: result.allDay,
                    color: '#1A73E8' // Default color for AI-created events
                };
                setEvents([...events, newEvent]);
                toast({ title: 'Event Created!', description: `"${result.title}" has been added to the calendar.` });
                setIsDialogOpen(false);
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
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Calendar</CardTitle>
                        <CardDescription>Manage your schedule, events, and appointments.</CardDescription>
                    </div>
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Sparkles className="mr-2 h-4 w-4" /> Create with AI
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border overflow-hidden">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={events}
                            dateClick={handleDateClick}
                            editable={true}
                            selectable={true}
                            height="auto"
                            contentHeight="auto"
                            aspectRatio={1.75}
                            dayMaxEvents={true}
                        />
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create Event with AI</DialogTitle>
                        <DialogDescription>
                            Describe the event you want to create. For example, "Schedule a meeting with the team for next Friday at 2pm."
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="ai-prompt" className="sr-only">AI Prompt</Label>
                        <Textarea
                            id="ai-prompt"
                            placeholder="e.g. Set up a Maths study session for Grade 12s on Saturday from 10am to 12pm."
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAiCreateEvent} disabled={isAiLoading}>
                            {isAiLoading ? "Creating..." : "Create Event"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
