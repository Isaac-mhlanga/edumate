
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { type Booking } from '@/app/dashboard/page';

interface BookingsTabProps {
    bookings: Booking[];
    loadingBookings: boolean;
}

export function BookingsTab({ bookings, loadingBookings }: BookingsTabProps) {
    const [currentPage, setCurrentPage] = React.useState(1);
    const bookingsPerPage = 5;

    const totalPages = Math.ceil(bookings.length / bookingsPerPage);
    const paginatedBookings = bookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle className="mr-1 h-3 w-3 text-green-500" />;
            case 'Completed': return <CheckCircle className="mr-1 h-3 w-3 text-blue-500" />;
            case 'Pending Confirmation': return <Clock className="mr-1 h-3 w-3 text-yellow-500" />;
            case 'Declined': return <XCircle className="mr-1 h-3 w-3 text-red-500" />;
            default: return null;
        }
    };

    const getStatusBadgeVariant = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400';
            case 'Completed': return 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400';
            case 'Pending Confirmation': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400';
            case 'Declined': return 'bg-red-500/20 text-red-700 border-red-500/30 dark:text-red-400';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>Track your pending, confirmed, and completed tutoring sessions.</CardDescription>
            </CardHeader>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Tutor</TableHead>
                        <TableHead className="hidden sm:table-cell">Subject</TableHead>
                        <TableHead className="hidden md:table-cell">Date & Time</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingBookings ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-6 w-28 ml-auto" /></TableCell>
                            </TableRow>
                        ))
                    ) : paginatedBookings.length > 0 ? (
                        paginatedBookings.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.tutorName}</TableCell>
                                <TableCell className="hidden sm:table-cell">{booking.subject}</TableCell>
                                <TableCell className="hidden md:table-cell">{booking.date} @ {booking.time}</TableCell>
                                <TableCell className="font-semibold">
                                    {booking.price ? `R ${booking.price.toFixed(2)}` : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={"outline"} className={getStatusBadgeVariant(booking.status)}>
                                        {getStatusIcon(booking.status)}
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                You haven't booked any sessions yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            {bookings.length > 0 && (
                 <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                    <div className="text-sm text-muted-foreground">
                        Showing{" "}
                        <strong>
                            {bookings.length > 0 ? (currentPage - 1) * bookingsPerPage + 1 : 0}-
                            {Math.min(currentPage * bookingsPerPage, bookings.length)}
                        </strong>{" "}
                        of <strong>{bookings.length}</strong> bookings.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}
