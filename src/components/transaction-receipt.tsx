
'use client';

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Icons } from "./icons";
import { CheckCircle, Clock, XCircle, User, GraduationCap, FilePenLine, CreditCard, Mail, Phone } from "lucide-react";
import { Transaction } from "@/app/admin/page";
import { format } from 'date-fns';

interface TransactionReceiptProps {
    transaction: Transaction;
}

export const TransactionReceipt = React.forwardRef<HTMLDivElement, TransactionReceiptProps>(
    ({ transaction }, ref) => {
        const getStatusBadgeVariant = (status: Transaction['status']) => {
            switch (status) {
                case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-500/30';
                case 'Refunded': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-500/30';
                default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-500/30';
            }
        };

        const getStatusIcon = (status: Transaction['status']) => {
             switch (status) {
                case 'Completed': return <CheckCircle className="h-4 w-4 mr-1.5" />;
                case 'Refunded': return <XCircle className="h-4 w-4 mr-1.5" />;
                default: return <Clock className="h-4 w-4 mr-1.5" />;
            }
        }
        
        const getTypeIcon = (type: string) => {
            if (type === 'course') return <GraduationCap className="h-4 w-4 text-primary" />;
            if (type === 'assignment') return <FilePenLine className="h-4 w-4 text-primary" />;
            if (type === 'subscription') return <CreditCard className="h-4 w-4 text-primary" />;
            return null;
        }

        return (
             <div ref={ref} className="p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/50 rounded-lg print:p-0 print:bg-white print:text-black">
                <Card className="w-full max-w-xl mx-auto bg-card/80 backdrop-blur-xl border border-border/20 shadow-xl shadow-primary/10 print:shadow-none print:border-black">
                    <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                             <div>
                                <Icons.logo className="h-10 w-auto" />
                                <p className="text-sm text-muted-foreground mt-1">Transaction Receipt</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Receipt #{transaction.id}</p>
                                <p className="text-sm text-muted-foreground">Date: {format(transaction.createdAt.toDate(), 'PPP')}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div>
                                <h2 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wider uppercase">Billed To</h2>
                                <p className="text-lg font-bold">{transaction.studentName}</p>
                                {transaction.studentEmail && <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Mail className="h-3 w-3" /> {transaction.studentEmail}</div>}
                                {transaction.studentPhoneNumber && <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1"><Phone className="h-3 w-3" /> {transaction.studentPhoneNumber}</div>}
                            </div>
                        </div>
                        
                        <Separator className="bg-border/50" />

                        <div className="space-y-4">
                             <div className="flex items-center gap-3">
                                {getTypeIcon(transaction.itemType)}
                                <div className='flex-1'>
                                    <p className="font-medium">{transaction.itemTitle}</p>
                                    <p className="text-sm capitalize text-muted-foreground">{transaction.itemType}</p>
                                </div>
                                <p className="font-mono">R {transaction.amount.toFixed(2)}</p>
                            </div>
                        </div>
                        
                        <Separator className="bg-border/50" />
                         <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
                            <p className="font-bold text-lg text-primary">Total Paid</p>
                            <p className="font-headline font-bold text-3xl text-primary">R {transaction.amount.toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 flex justify-between items-center">
                         <Badge variant="outline" className={`text-sm px-3 py-1 ${getStatusBadgeVariant(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground text-right">Edumate &copy; {new Date().getFullYear()}</p>
                    </CardFooter>
                </Card>
            </div>
        );
    }
);
TransactionReceipt.displayName = "TransactionReceipt";
