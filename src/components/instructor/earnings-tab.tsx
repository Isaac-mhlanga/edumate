
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Banknote, MoreVertical, ReceiptText, Undo2 } from 'lucide-react';
import { type Transaction } from '@/app/instructor/page';

interface InstructorEarningsTabProps {
    transactions: Transaction[];
    loading: boolean;
    onTransactionAction: (transaction: Transaction, action: 'view' | 'refund') => void;
    onPayoutRequest: () => void;
}

export function InstructorEarningsTab({ transactions, loading, onTransactionAction, onPayoutRequest }: InstructorEarningsTabProps) {
    const availableForPayout = transactions.reduce((acc, t) => {
        if (t.itemType === 'Course Sale' || t.itemType === 'Assignment Sale') {
            return acc + t.amount;
        }
        return acc;
    }, 0);
    
    const getStatusVariant = (status: Transaction['status']) => {
        if (status === 'Refunded') return 'destructive';
        if (status === 'Pending') return 'secondary';
        return 'default';
    };

    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>A log of all your sales, refunds, and payouts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="hidden md:table-cell">Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : transactions.length > 0 ? (
                                    transactions.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell>
                                                <div className="font-medium">{transaction.itemTitle}</div>
                                                <div className="text-sm text-muted-foreground">{transaction.itemType}</div>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">{transaction.date}</TableCell>
                                            <TableCell className={`font-semibold ${transaction.amount < 0 ? 'text-destructive' : ''}`}>
                                                R {transaction.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant={getStatusVariant(transaction.status)}>{transaction.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => onTransactionAction(transaction, 'view')}><ReceiptText className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                                                        {transaction.status === 'Completed' && transaction.itemType.includes('Sale') &&
                                                            <DropdownMenuItem onClick={() => onTransactionAction(transaction, 'refund')}><Undo2 className="mr-2 h-4 w-4"/>Process Refund</DropdownMenuItem>
                                                        }
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">No transactions yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Payout Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Available for Payout</p>
                                <p className="text-3xl font-bold">R {availableForPayout.toFixed(2)}</p>
                            </div>
                            <Banknote className="h-10 w-10 text-primary"/>
                        </div>
                         <Button className="w-full" size="lg" onClick={onPayoutRequest} disabled={availableForPayout <= 0}>
                            Request Payout
                        </Button>
                    </CardContent>
                    <CardFooter>
                         <p className="text-sm text-muted-foreground">Payouts are processed within 3-5 business days. A small processing fee may apply.</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
