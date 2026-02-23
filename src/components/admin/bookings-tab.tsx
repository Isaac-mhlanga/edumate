
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, ChevronLeft, ChevronRight, CheckCircle, Clock, XCircle } from "lucide-react";
import { type Booking } from "@/app/admin/page";
import { Skeleton } from "../ui/skeleton";

interface AdminBookingsTabProps {
    bookings: Booking[];
    loading: boolean;
}

export function AdminBookingsTab({ bookings, loading }: AdminBookingsTabProps) {
    const [filters, setFilters] = React.useState({ search: '', status: 'All' });
    const [currentPage, setCurrentPage] = React.useState(1);
    const bookingsPerPage = 10;

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const filteredBookings = React.useMemo(() => {
        return bookings.filter(booking => {
            const searchMatch = filters.search.trim().toLowerCase() === '' ||
                booking.studentName.toLowerCase().includes(filters.search.trim().toLowerCase()) ||
                booking.tutorName.toLowerCase().includes(filters.search.trim().toLowerCase()) ||
                booking.subject.toLowerCase().includes(filters.search.trim().toLowerCase());
            const statusMatch = filters.status === 'All' || booking.status === filters.status;
            return searchMatch && statusMatch;
        });
    }, [bookings, filters]);

    const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
    const paginatedBookings = filteredBookings.slice((currentPage - 1) * bookingsPerPage, currentPage * bookingsPerPage);

    const getStatusIcon = (status: Booking['status']) => {
        switch (status) {
            case 'Confirmed': return <CheckCircle className="mr-1 h-3 w-3 text-green-500" />;
            case 'Completed': return <CheckCircle className="mr-1 h-3 w-3 text-blue-500" />;
            case 'Pending Confirmation': return <Clock className="mr-1 h-3 w-3 text-yellow-500" />;
            case 'Declined': return <XCircle className="mr-1 h-3 w-3 text-red-500" />;
            default: return null;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Bookings Management</CardTitle>
                <CardDescription>Oversee all tutoring sessions booked on the platform.</CardDescription>
            </CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by student, tutor, or subject..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1 w-full md:w-auto">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span>Filter by Status</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Pending Confirmation">Pending Confirmation</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Confirmed">Confirmed</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Declined">Declined</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Tutor</TableHead>
                        <TableHead className="hidden md:table-cell">Details</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-40" />
                                    </div>
                                </TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                            </TableRow>
                        ))
                    ) : paginatedBookings.map(booking => (
                        <TableRow key={booking.id}>
                            <TableCell>{booking.studentName}</TableCell>
                            <TableCell className="hidden sm:table-cell">{booking.tutorName}</TableCell>
                            <TableCell className="hidden md:table-cell">
                                <div className="font-medium">{booking.subject}</div>
                                <div className="text-sm text-muted-foreground">{booking.date} @ {booking.time}</div>
                            </TableCell>
                            <TableCell className="font-semibold">R {booking.price?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                                    {getStatusIcon(booking.status)}
                                    {booking.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{(currentPage - 1) * bookingsPerPage + 1}-{Math.min(currentPage * bookingsPerPage, filteredBookings.length)}</strong> of <strong>{filteredBookings.length}</strong> bookings.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}
