
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, ReceiptText, CheckCircle, XCircle, Hourglass, ChevronLeft, ChevronRight, User, DollarSign } from "lucide-react";
import { type PayoutRequest } from "@/app/admin/page";

interface AdminPayoutsTabProps {
    payouts: PayoutRequest[];
    onPayoutAction: (payout: PayoutRequest, action: 'Approve' | 'Decline') => void;
    onViewReceipt: (payout: PayoutRequest) => void;
}

export function AdminPayoutsTab({ payouts, onPayoutAction, onViewReceipt }: AdminPayoutsTabProps) {
    const [payoutFilters, setPayoutFilters] = React.useState({ search: '', status: 'All' });
    const [currentPayoutPage, setCurrentPayoutPage] = React.useState(1);
    const payoutsPerPage = 7;

    const handlePayoutFilterChange = (key: keyof typeof payoutFilters, value: string) => {
        setPayoutFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPayoutPage(1);
    };

    const filteredPayouts = React.useMemo(() => {
        return payouts.filter(payout => {
            const searchMatch = payoutFilters.search.trim().toLowerCase() === '' ||
                payout.userName.toLowerCase().includes(payoutFilters.search.trim().toLowerCase());
            const statusMatch = payoutFilters.status === 'All' || payout.status === payoutFilters.status;
            return searchMatch && statusMatch;
        });
    }, [payouts, payoutFilters]);
    const totalPayoutPages = Math.ceil(filteredPayouts.length / payoutsPerPage);
    const paginatedPayouts = filteredPayouts.slice((currentPayoutPage - 1) * payoutsPerPage, currentPayoutPage * payoutsPerPage);
    
    return (
        <Card>
             <CardHeader>
                <CardTitle className="text-xl">Payouts</CardTitle>
                <CardDescription>Review and process pending instructor and referral payouts.</CardDescription>
            </CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by user..."
                        className="pl-8"
                        value={payoutFilters.search}
                        onChange={(e) => handlePayoutFilterChange('search', e.target.value)}
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
                        <DropdownMenuRadioGroup value={payoutFilters.status} onValueChange={(value) => handlePayoutFilterChange('status', value)}>
                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="Declined">Declined</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount (R)</TableHead>
                        <TableHead className="hidden md:table-cell">Request Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedPayouts.map(payout => (
                        <TableRow key={payout.id}>
                            <TableCell className="font-medium">{payout.userName}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                                    {payout.type === 'Instructor' ? <DollarSign className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                    {payout.type}
                                </Badge>
                            </TableCell>
                            <TableCell className={`font-semibold ${payout.amount < 0 ? 'text-red-600' : ''}`}>{Math.abs(payout.amount).toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{payout.date}</TableCell>
                            <TableCell>
                                <Badge variant={"outline"} className={
                                    payout.status === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500/30'
                                    : payout.status === 'Declined' ? 'bg-red-500/20 text-red-700 border-red-500/30'
                                    : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
                                }>
                                    {payout.status === 'Completed' && <CheckCircle className="mr-1 h-3 w-3"/>}
                                    {payout.status === 'Declined' && <XCircle className="mr-1 h-3 w-3"/>}
                                    {payout.status === 'Pending' && <Hourglass className="mr-1 h-3 w-3"/>}
                                    {payout.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {payout.status === 'Pending' ? (
                                    <div className="flex gap-2 justify-end">
                                        <Button size="sm" variant="outline" onClick={() => onViewReceipt(payout)}><ReceiptText className="mr-1 h-3 w-3"/>Receipt</Button>
                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50 hover:text-red-700" onClick={() => onPayoutAction(payout, 'Decline')}>Decline</Button>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onPayoutAction(payout, 'Approve')}>Approve</Button>
                                    </div>
                                ) : (
                                    <Button variant="outline" size="sm" onClick={() => onViewReceipt(payout)}>
                                        <ReceiptText className="mr-2 h-4 w-4" /> View Receipt
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
             <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{(currentPayoutPage - 1) * payoutsPerPage + 1}-{Math.min(currentPayoutPage * payoutsPerPage, filteredPayouts.length)}</strong> of <strong>{filteredPayouts.length}</strong> payouts.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPayoutPage(p => p - 1)} disabled={currentPayoutPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPayoutPage(p => p + 1)} disabled={currentPayoutPage >= totalPayoutPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}
