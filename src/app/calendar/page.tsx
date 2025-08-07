
'use client';

import React, { useState, useRef } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles } from 'lucide-react';

type CalendarEvent = {
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color?: string;
};

export default function CalendarPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([
        { title: 'Maths Webinar', start: '2024-08-15T10:30:00', end: '2024-08-15T12:30:00', allDay: false, color: 'hsl(var(--primary))' },
        { title: 'Physics Study Group', start: '2024-08-16', allDay: true, color: 'hsl(var(--secondary))' }
    ]);
    
    const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

    const [aiPrompt, setAiPrompt] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const [manualEvent, setManualEvent] = useState<Partial<CalendarEvent>>({});

    const { toast } = useToast();

    const handleDateClick = (arg: any) => {
        setManualEvent({ start: arg.dateStr, allDay: arg.allDay });
        setIsManualDialogOpen(true);
    };

    const handleAddManualEvent = () => {
        if (!manualEvent.title || !manualEvent.start) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }
        setEvents([...events, manualEvent as CalendarEvent]);
        toast({ title: 'Event Created!', description: `"${manualEvent.title}" has been added.` });
        setIsManualDialogOpen(false);
        setManualEvent({});
    };

    const handleAiCreateEvent = async () => {
        if (!aiPrompt) return;
        setIsAiLoading(true);

        try {
            const result: CreateCalendarEventOutput = await createCalendarEvent({ prompt: aiPrompt });
            if (result.title && result.start) {
                const newEvent: CalendarEvent = {
                    title: result.title,
                    start: result.start,
                    end: result.end || undefined,
                    allDay: result.allDay,
                    color: 'hsl(var(--accent))'
                };
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
            {/* Custom styles to mimic Google Calendar's look */}
            <style jsx global>{`
                .fc {
                    font-family: var(--font-body), sans-serif;
                }
                .fc .fc-toolbar-title {
                    font-size: 1.5rem;
                    font-weight: 500;
                }
                .fc .fc-button {
                    background-color: transparent !important;
                    border-color: hsl(var(--border)) !important;
                    color: hsl(var(--foreground)) !important;
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
                }
            `}</style>

            <div className="space-y-6">
                <Card className="shadow-lg rounded-xl">
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl">Calendar</CardTitle>
                            <CardDescription>Manage your schedule, events, and appointments.</CardDescription>
                        </div>
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsManualDialogOpen(true)}>Add Event</Button>
                             <Button onClick={() => setIsAiDialogOpen(true)}>
                                <Sparkles className="mr-2 h-4 w-4" /> Create with AI
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border overflow-hidden p-1">
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
                                aspectRatio={2}
                                dayMaxEvents={true}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* AI Event Dialog */}
                <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
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
                            <Button variant="ghost" onClick={() => setIsAiDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAiCreateEvent} disabled={isAiLoading}>
                                {isAiLoading ? "Creating..." : "Create Event"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Manual Event Dialog */}
                <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Event</DialogTitle>
                            <DialogDescription>Fill in the details for your new event.</DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="manual-title">Event Title</Label>
                                <Input id="manual-title" value={manualEvent.title || ''} onChange={(e) => setManualEvent(prev => ({...prev, title: e.target.value}))}/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manual-start">Start Date</Label>
                                    <Input id="manual-start" type="date" value={manualEvent.start?.split('T')[0] || ''} onChange={(e) => setManualEvent(prev => ({...prev, start: e.target.value}))}/>
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="manual-end">End Date (Optional)</Label>
                                    <Input id="manual-end" type="date" value={manualEvent.end?.split('T')[0] || ''} onChange={(e) => setManualEvent(prev => ({...prev, end: e.target.value}))}/>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="all-day" checked={manualEvent.allDay} onCheckedChange={(checked) => setManualEvent(prev => ({...prev, allDay: !!checked}))} />
                                <Label htmlFor="all-day">All-day event</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleAddManualEvent}>Add Event</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
