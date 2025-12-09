
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar as CalendarIcon, Check, PlusCircle, X, Save, User, BookOpen, GraduationCap, Info, ExternalLink, Edit } from "lucide-react";
import { format } from 'date-fns';
import { type CalendarEvent } from "@/app/admin/page";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";


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

const platforms = [
    { value: 'youtube', label: 'YouTube' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'zoom', label: 'Zoom' },
]

export function CalendarDialogs({
    isManualDialogOpen, setIsManualDialogOpen,
    isDetailDialogOpen, setIsDetailDialogOpen,
    selectedEvent, manualEvent, setManualEvent,
    onManualCreate
}: CalendarDialogsProps) {

    const [openPlatforms, setOpenPlatforms] = React.useState(false);
    
    const handleEdit = () => {
        if (!selectedEvent) return;
        setManualEvent(selectedEvent);
        setIsDetailDialogOpen(false);
        setIsManualDialogOpen(true);
    };


    return (
        <>
            {/* Manual Event Dialog */}
            <Dialog open={isManualDialogOpen} onOpenChange={setIsManualDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl">{manualEvent.id ? 'Edit Event' : 'Add New Event'}</DialogTitle>
                        <DialogDescription>{manualEvent.id ? 'Update the details for this event.' : 'Fill in the details for your new event. This will be visible to all users.'}</DialogDescription>
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
                                            {manualEvent.platforms?.length ? manualEvent.platforms.map(p => platforms.find(pl => pl.value === p)?.label).join(', ') : "Select platforms..."}
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
                        <Button variant="ghost" onClick={() => setIsManualDialogOpen(false)}>
                            <X className="mr-2 h-4 w-4"/>Cancel
                        </Button>
                        <Button onClick={onManualCreate}>
                            <Save className="mr-2 h-4 w-4"/>{manualEvent.id ? 'Save Changes' : 'Add Event'}
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
                                        <p>Hosted by <span className="font-semibold">{selectedEvent.instructor}</span></p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <BookOpen className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p>{selectedEvent.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p>Grade {selectedEvent.grade}</p>
                                    </div>
                                </div>

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
                                <Button onClick={handleEdit}><Edit className="mr-2 h-4 w-4"/> Edit Event</Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
