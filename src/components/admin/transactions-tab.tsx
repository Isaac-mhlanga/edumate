
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, ReceiptText, ChevronLeft, ChevronRight, MoreVertical, Trash2, GraduationCap, FilePenLine, CreditCard } from "lucide-react";
import { type Transaction } from "@/app/admin/page";
import { format } from 'date-fns';
import { Skeleton } from "../ui/skeleton";

interface AdminTransactionsTabProps {
    transactions: Transaction[];
    loading: boolean;
    onDeleteTransaction: (transaction: Transaction) => void;
    onViewReceipt: (transaction: Transaction) => void;
}

export function AdminTransactionsTab({ transactions, loading, onDeleteTransaction, onViewReceipt }: AdminTransactionsTabProps) {
    const [filters, setFilters] = React.useState({ search: '', type: 'All' });
    const [currentPage, setCurrentPage] = React.useState(1);
    const transactionsPerPage = 10;

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1);
    };

    const filteredTransactions = React.useMemo(() => {
        return transactions.filter(t => {
            const searchMatch = filters.search.trim().toLowerCase() === '' ||
                t.itemTitle.toLowerCase().includes(filters.search.trim().toLowerCase()) ||
                t.studentName?.toLowerCase().includes(filters.search.trim().toLowerCase());
            const typeMatch = filters.type === 'All' || t.itemType === filters.type;
            return searchMatch && typeMatch;
        });
    }, [transactions, filters]);
    
    const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
    const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * transactionsPerPage, currentPage * transactionsPerPage);
    const transactionTypes = ['All', ...Array.from(new Set(transactions.map(t => t.itemType)))];
    
    const getStatusVariant = (status: Transaction['status']) => {
        if (status === 'Refunded') return 'destructive';
        if (status === 'Pending') return 'secondary';
        return 'default';
    };

    const getTypeIcon = (type: string) => {
        if (type === 'course') return <GraduationCap className="h-3 w-3" />;
        if (type === 'assignment') return <FilePenLine className="h-3 w-3" />;
        if (type === 'subscription') return <CreditCard className="h-3 w-3" />;
        return <ReceiptText className="h-3 w-3" />;
    }

    return (
        <Card>
             <CardHeader>
                <CardTitle className="text-xl">Platform Transactions</CardTitle>
                <CardDescription>A comprehensive log of all financial activities on the platform.</CardDescription>
            </CardHeader>
             <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by item or student..."
                        className="pl-8"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-1 w-full md:w-auto">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span>Filter by Type</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                            {transactionTypes.map(type => (
                                <DropdownMenuRadioItem key={type} value={type} className="capitalize">{type}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="hidden sm:table-cell">Student</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {loading ? (
                        Array.from({ length: 7 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded-md" /></TableCell>
                            </TableRow>
                        ))
                    ) : paginatedTransactions.map(transaction => (
                        <TableRow key={transaction.id}>
                            <TableCell>
                                <div className="font-medium">{transaction.itemTitle}</div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground capitalize">
                                    {getTypeIcon(transaction.itemType)} {transaction.itemType}
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{transaction.studentName}</TableCell>
                            <TableCell className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : ''}`}>R {transaction.amount.toFixed(2)}</TableCell>
                            <TableCell className="hidden md:table-cell">{format(transaction.createdAt.toDate(), 'PPP')}</TableCell>
                             <TableCell>
                                <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onViewReceipt(transaction)}>
                                            <ReceiptText className="mr-2 h-4 w-4" /> View Receipt
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onDeleteTransaction(transaction)} className="text-destructive focus:text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete Transaction
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{(currentPage - 1) * transactionsPerPage + 1}-{Math.min(currentPage * transactionsPerPage, filteredTransactions.length)}</strong> of <strong>{filteredTransactions.length}</strong> transactions.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    )
}
