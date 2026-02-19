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
import { type CalendarEvent } from "@/app/instructor/page";

interface InstructorCalendarTabProps {
    events: CalendarEvent[];
    onDateClick: (arg: any) => void;
    onEventClick: (clickInfo: any) => void;
}

export function InstructorCalendarTab({ events, onDateClick, onEventClick }: InstructorCalendarTabProps) {
    return (
        <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-xl">My Calendar</CardTitle>
                    <CardDescription>Manage your schedule, teaching sessions, and deadlines.</CardDescription>
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
                        dateClick={onDateClick}
                        eventClick={onEventClick}
                        editable={false}
                        selectable={true}
                        select={onDateClick}
                        height="auto"
                        contentHeight="auto"
                        aspectRatio={2}
                        dayMaxEvents={true}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
