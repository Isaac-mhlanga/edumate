
'use client';

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Icons } from "./icons";
import { CheckCircle, Clock, XCircle, Landmark, User, Hash } from "lucide-react";
import { PayoutRequest } from "@/app/admin/page";

interface PayoutReceiptProps {
    payout: PayoutRequest;
}

export const PayoutReceipt = React.forwardRef<HTMLDivElement, PayoutReceiptProps>(
    ({ payout }, ref) => {
        const getStatusBadgeVariant = (status: PayoutRequest['status']) => {
            switch (status) {
                case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 border-green-500/30';
                case 'Declined': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-500/30';
                default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 border-yellow-500/30';
            }
        };

        const getStatusIcon = (status: PayoutRequest['status']) => {
             switch (status) {
                case 'Completed': return <CheckCircle className="h-4 w-4 mr-1.5" />;
                case 'Declined': return <XCircle className="h-4 w-4 mr-1.5" />;
                default: return <Clock className="h-4 w-4 mr-1.5" />;
            }
        }

        return (
             <div ref={ref} className="p-4 sm:p-6 bg-gradient-to-br from-background via-background to-muted/50 rounded-lg print:p-0 print:bg-white print:text-black">
                <Card className="w-full max-w-xl mx-auto bg-card/80 backdrop-blur-xl border border-border/20 shadow-xl shadow-primary/10 print:shadow-none print:border-black">
                    <CardHeader className="p-6">
                        <div className="flex justify-between items-start">
                             <div>
                                <Icons.logo className="h-10 w-auto" />
                                <p className="text-sm text-muted-foreground mt-1">Payout Receipt</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">Receipt #{payout.id}</p>
                                <p className="text-sm text-muted-foreground">Date: {payout.date}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div>
                                <h2 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wider uppercase">Payout To</h2>
                                <p className="text-lg font-bold">{payout.userName}</p>
                                <p className="text-sm text-muted-foreground">User ID: {payout.userId}</p>
                            </div>

                            {payout.bankDetails && (
                                <div>
                                    <h2 className="text-sm font-semibold text-muted-foreground mb-2 tracking-wider uppercase">Bank Details</h2>
                                    <div className="text-sm space-y-2">
                                        <div className="flex items-center gap-2"><Landmark className="h-4 w-4 text-primary" /><span className="font-medium">{payout.bankDetails.bankName}</span></div>
                                        <div className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /><span className="font-medium">{payout.bankDetails.accountHolder}</span></div>
                                        <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-primary" /><span className="font-medium">{payout.bankDetails.accountNumber}</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <Separator className="bg-border/50" />

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <p className="text-muted-foreground">Payout Request ({payout.type})</p>
                                <p className="font-mono">R {Math.abs(payout.amount).toFixed(2)}</p>
                            </div>
                             <div className="flex justify-between items-center text-sm">
                                <p className="text-muted-foreground">Processing Fee</p>
                                <p className="font-mono">R 0.00</p>
                            </div>
                        </div>
                        <Separator className="bg-border/50" />
                         <div className="flex justify-between items-center bg-primary/10 p-4 rounded-lg">
                            <p className="font-bold text-lg text-primary">Total Payout</p>
                            <p className="font-headline font-bold text-3xl text-primary">R {Math.abs(payout.amount).toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 flex justify-between items-center">
                         <Badge variant="outline" className={`text-sm px-3 py-1 ${getStatusBadgeVariant(payout.status)}`}>
                            {getStatusIcon(payout.status)}
                            {payout.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground text-right">Edumate &copy; {new Date().getFullYear()}</p>
                    </CardFooter>
                </Card>
            </div>
        );
    }
);
PayoutReceipt.displayName = "PayoutReceipt";
