
'use client';

import React, { useState, useRef } from 'react';
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
    const [events, setEvents] = useState<CalendarEvent[]>([
        { id: '1', title: 'Maths Webinar', start: '2024-08-15T10:30:00', end: '2024-08-15T12:30:00', allDay: false, color: 'hsl(var(--primary))', description: 'A deep dive into advanced calculus concepts.' },
        { id: '2', title: 'Physics Study Group', start: '2024-08-16', allDay: true, color: 'hsl(var(--secondary))', description: 'Collaborative session for Newtonian mechanics.' }
    ]);
    
    const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    
    const [manualEvent, setManualEvent] = useState<Partial<CalendarEvent>>({});

    const { toast } = useToast();

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

    const handleAddManualEvent = () => {
        if (!manualEvent.title || !manualEvent.start) {
            toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
            return;
        }
        const newEvent = { ...manualEvent, id: String(Date.now()) } as CalendarEvent
        setEvents([...events, newEvent]);
        toast({ title: 'Event Created!', description: `"${newEvent.title}" has been added.` });
        setIsManualDialogOpen(false);
        setManualEvent({});
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
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setIsManualDialogOpen(true)}>
                                 <PlusCircle className="mr-2 h-4 w-4" /> Add Event
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
                             <div className="space-y-2">
                                <Label htmlFor="manual-description">Description (Optional)</Label>
                                <Textarea id="manual-description" value={manualEvent.description || ''} onChange={(e) => setManualEvent(prev => ({...prev, description: e.target.value}))}/>
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
