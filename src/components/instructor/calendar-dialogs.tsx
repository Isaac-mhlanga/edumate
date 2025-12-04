
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { format } from 'date-fns';
import { type CalendarEvent } from "@/app/instructor/page";

interface CalendarDialogsProps {
    isAiDialogOpen: boolean;
    setIsAiDialogOpen: (open: boolean) => void;
    isManualDialogOpen: boolean;
    setIsManualDialogOpen: (open: boolean) => void;
    isDetailDialogOpen: boolean;
    setIsDetailDialogOpen: (open: boolean) => void;
    selectedEvent: CalendarEvent | null;
    manualEvent: Partial<CalendarEvent>;
    setManualEvent: React.Dispatch<React.SetStateAction<Partial<CalendarEvent>>>;
    aiPrompt: string;
    setAiPrompt: (prompt: string) => void;
    isAiLoading: boolean;
    onAiCreate: () => void;
    onManualCreate: () => void;
}

export function CalendarDialogs({
    isAiDialogOpen, setIsAiDialogOpen,
    isManualDialogOpen, setIsManualDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    selectedEvent, manualEvent, setManualEvent,
    aiPrompt, setAiPrompt, isAiLoading,
    onAiCreate, onManualCreate
}: CalendarDialogsProps) {
    return (
        <>
            {/* AI Event Dialog */}
            <Dialog open={isAiDialogOpen} onOpenChange={setIsAiDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">Create Event with AI</DialogTitle>
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
                        <Button onClick={onAiCreate} disabled={isAiLoading}>
                            {isAiLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</> : "Create Event"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
                        <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)}>Cancel</Button>
                        <Button onClick={onManualCreate}>Add Event</Button>
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
