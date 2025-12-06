
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Check } from "lucide-react";
import { format } from 'date-fns';
import { type CalendarEvent } from "@/app/admin/page";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";


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

const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'zoom', label: 'Zoom' },
]

export function CalendarDialogs({
    isAiDialogOpen, setIsAiDialogOpen,
    isManualDialogOpen, setIsManualDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    selectedEvent, manualEvent, setManualEvent,
    aiPrompt, setAiPrompt, isAiLoading,
    onAiCreate, onManualCreate
}: CalendarDialogsProps) {

    const [openPlatforms, setOpenPlatforms] = React.useState(false);

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
                            {isAiLoading ? "Creating..." : "Create Event"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manual Event Dialog */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Add New Event</DialogTitle>
                        <DialogDescription>Fill in the details for your new event. This will be visible to all users.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="manual-title">Event Title</Label>
                                <Input id="manual-title" value={manualEvent.title || ''} onChange={(e) => setManualEvent(prev => ({...prev, title: e.target.value}))}/>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="manual-instructor">Instructor</Label>
                                <Input id="manual-instructor" value={manualEvent.instructor || ''} onChange={(e) => setManualEvent(prev => ({...prev, instructor: e.target.value}))}/>
                            </div>
                             <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manual-subject">Subject</Label>
                                    <Input id="manual-subject" value={manualEvent.subject || ''} onChange={(e) => setManualEvent(prev => ({...prev, subject: e.target.value}))}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual-grade">Grade</Label>
                                     <Select value={manualEvent.grade} onValueChange={(value) => setManualEvent(prev => ({...prev, grade: value}))}>
                                        <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Grade 10</SelectItem>
                                            <SelectItem value="11">Grade 11</SelectItem>
                                            <SelectItem value="12">Grade 12</SelectItem>
                                            <SelectItem value="10-12">All Grades</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                             </div>
                             <div className="space-y-2">
                                <Label>Platforms</Label>
                                 <Popover open={openPlatforms} onOpenChange={setOpenPlatforms}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" aria-expanded={openPlatforms} className="w-full justify-between">
                                            <span className="truncate">
                                            {manualEvent.platforms?.length ? manualEvent.platforms.join(', ') : "Select platforms..."}
                                            </span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0">
                                        <Command>
                                            <CommandInput placeholder="Search platforms..." />
                                            <CommandEmpty>No platform found.</CommandEmpty>
                                            <CommandGroup>
                                                {platforms.map(platform => (
                                                <CommandItem
                                                    key={platform.value}
                                                    onSelect={() => {
                                                        const currentPlatforms = manualEvent.platforms || [];
                                                        const newPlatforms = currentPlatforms.includes(platform.value)
                                                            ? currentPlatforms.filter(p => p !== platform.value)
                                                            : [...currentPlatforms, platform.value];
                                                        setManualEvent(prev => ({ ...prev, platforms: newPlatforms }));
                                                    }}
                                                >
                                                    <Check className={cn("mr-2 h-4 w-4", manualEvent.platforms?.includes(platform.value) ? "opacity-100" : "opacity-0")}/>
                                                    {platform.label}
                                                </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="manual-start">Start Date/Time</Label>
                                    <Input id="manual-start" type={manualEvent.allDay ? 'date' : 'datetime-local'} value={manualEvent.start || ''} onChange={(e) => setManualEvent(prev => ({...prev, start: e.target.value}))}/>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="manual-end">End Date/Time</Label>
                                    <Input id="manual-end" type={manualEvent.allDay ? 'date' : 'datetime-local'} value={manualEvent.end || ''} onChange={(e) => setManualEvent(prev => ({...prev, end: e.target.value}))}/>
                                </div>
                            </div>
                             <div className="flex items-center space-x-2 pt-2">
                                <Checkbox id="all-day" checked={manualEvent.allDay} onCheckedChange={(checked) => setManualEvent(prev => ({...prev, allDay: !!checked}))} />
                                <Label htmlFor="all-day">All-day event</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="manual-description">Event Scope/Description</Label>
                                <Textarea id="manual-description" placeholder="What will be covered in this event?" value={manualEvent.scope || ''} onChange={(e) => setManualEvent(prev => ({...prev, scope: e.target.value}))}/>
                            </div>
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

    