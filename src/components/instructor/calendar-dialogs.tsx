
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Save, X } from "lucide-react";
import { format } from 'date-fns';
import { type CalendarEvent } from "@/app/instructor/page";

interface CalendarDialogsProps {
    isManualDialogOpen: boolean;
    setIsManualDialogOpen: (open: boolean) => void;
    isDetailDialogOpen: boolean;
    setIsDetailDialogOpen: (open: boolean) => void;
    selectedEvent: CalendarEvent | null;
    manualEvent: Partial<CalendarEvent>;
    setManualEvent: React.Dispatch<React.SetStateAction<Partial<CalendarEvent>>>;
    onManualCreate: () => void;
}

export function CalendarDialogs({
    isManualDialogOpen, setIsManualDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    selectedEvent, manualEvent, setManualEvent,
    onManualCreate
}: CalendarDialogsProps) {
    return (
        <>
            {/* Manual Event Dialog */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Add New Event</DialogTitle>
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
                        <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)}>
                            <X className="mr-2 h-4 w-4"/>Cancel
                        </Button>
                        <Button onClick={onManualCreate}>
                            <Save className="mr-2 h-4 w-4"/>Add Event
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
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
        </>
    );
}
