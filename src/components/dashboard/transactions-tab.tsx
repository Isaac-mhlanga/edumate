
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ListFilter, ChevronLeft, ChevronRight, MoreVertical, ReceiptText, Undo2, GraduationCap, Banknote } from "lucide-react";
import { type Transaction } from '@/app/dashboard/page';

interface TransactionsTabProps {
    transactions: Transaction[];
    loadingTransactions: boolean;
    onRefundRequest: (transaction: Transaction) => void;
}

export function TransactionsTab({ transactions, loadingTransactions, onRefundRequest }: TransactionsTabProps) {
    const [transactionFilters, setTransactionFilters] = React.useState({ search: '', type: 'All' });
    const [currentTransactionPage, setCurrentTransactionPage] = React.useState(1);
    const transactionsPerPage = 5;

    const handleTransactionFilterChange = (key: 'search' | 'type', value: string) => {
        setTransactionFilters(prev => ({ ...prev, [key]: value }));
        setCurrentTransactionPage(1);
    };

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(transaction => {
            const searchMatch = transactionFilters.search.trim().toLowerCase() === '' ||
                transaction.itemTitle.toLowerCase().includes(transactionFilters.search.trim().toLowerCase());
            
            const typeMatch = transactionFilters.type === 'All' || transaction.itemType === transactionFilters.type;

            return searchMatch && typeMatch;
        });
    }, [transactions, transactionFilters]);

    const totalTransactionPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentTransactionPage - 1) * transactionsPerPage, currentTransactionPage * transactionsPerPage);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>A log of all your purchases and refunds.</CardDescription>
            </CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by item..."
                        className="pl-8"
                        value={transactionFilters.search}
                        onChange={(e) => handleTransactionFilterChange('search', e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1 w-full md:w-auto">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter by Type</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={transactionFilters.type} onValueChange={(value) => handleTransactionFilterChange('type', value)}>
                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="course">Course</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="assignment">Assignment</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="subscription">Subscription</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Amount (R)</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingTransactions ? (
                        Array.from({ length: 3 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-5 w-3/4" /></TableCell>
                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                            <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                        </TableRow>
                        ))
                    ) : paginatedTransactions.length > 0 ? (
                        paginatedTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-medium">{transaction.itemTitle}</TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant="outline" className="gap-1.5 capitalize">
                                        {transaction.itemType === 'course' && <GraduationCap className="h-3 w-3" />}
                                        {transaction.itemType === 'assignment' && <ReceiptText className="h-3 w-3" />}
                                        {transaction.itemType === 'subscription' && <Banknote className="h-3 w-3" />}
                                        {transaction.itemType}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{transaction.date}</TableCell>
                                <TableCell className={`font-semibold ${transaction.status === 'Refunded' ? 'text-red-600' : ''}`}>
                                    R {transaction.amount.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {transaction.status !== 'Refunded' && transaction.amount > 0 && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem>
                                                    <ReceiptText className="mr-2 h-4 w-4"/>View Receipt
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onRefundRequest(transaction)} className="text-destructive focus:text-destructive">
                                                    <Undo2 className="mr-2 h-4 w-4"/>Request Refund
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                You have no transaction history yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
             <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing{" "}
                    <strong>
                        {filteredTransactions.length > 0 ? (currentTransactionPage - 1) * transactionsPerPage + 1 : 0}-
                        {Math.min(currentTransactionPage * transactionsPerPage, filteredTransactions.length)}
                    </strong>{" "}
                    of <strong>{filteredTransactions.length}</strong> transactions.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentTransactionPage(p => p - 1)} disabled={currentTransactionPage === 1}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Prev
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentTransactionPage(p => p + 1)} disabled={currentTransactionPage >= totalTransactionPages}>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
