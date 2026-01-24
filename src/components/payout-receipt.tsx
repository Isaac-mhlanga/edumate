'use client';

import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Icons } from "./icons";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { PayoutRequest } from "@/app/admin/page";

interface PayoutReceiptProps {
    payout: PayoutRequest;
}

export const PayoutReceipt = React.forwardRef<HTMLDivElement, PayoutReceiptProps>(
    ({ payout }, ref) => {
        const getStatusBadgeVariant = (status: PayoutRequest['status']) => {
            switch (status) {
                case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
                case 'Declined': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
                default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
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
            <div ref={ref} className="p-8 font-sans bg-background text-foreground">
                <Card className="w-full max-w-lg mx-auto border-primary shadow-lg">
                    <CardHeader className="bg-muted/30">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Icons.logo className="h-10 w-auto" />
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-lg">Receipt #{payout.id}</p>
                                <p className="text-sm text-muted-foreground">Date: {payout.date}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h2 className="text-base font-semibold text-muted-foreground mb-2">PAYOUT TO</h2>
                            <p className="text-lg font-bold">{payout.userName}</p>
                            <p className="text-sm text-muted-foreground">User ID: {payout.userId}</p>
                        </div>
                        <Separator />
                        <div className="space-y-4">
                            <h3 className="text-base font-semibold text-muted-foreground">SUMMARY</h3>
                            <div className="flex justify-between items-center">
                                <p>Payout Request ({payout.type})</p>
                                <p className="font-medium">R {Math.abs(payout.amount).toFixed(2)}</p>
                            </div>
                             <div className="flex justify-between items-center">
                                <p>Processing Fee</p>
                                <p className="font-medium">R 0.00</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-lg">Total Payout</p>
                            <p className="font-bold text-2xl text-primary">R {Math.abs(payout.amount).toFixed(2)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 p-6 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                            <p>Thank you for being a part of Edumate Pro.</p>
                            <p>Questions? Contact support@edumate.pro</p>
                        </div>
                        <Badge variant="outline" className={`text-base px-3 py-1 ${getStatusBadgeVariant(payout.status)}`}>
                            {getStatusIcon(payout.status)}
                            {payout.status}
                        </Badge>
                    </CardFooter>
                </Card>
            </div>
        );
    }
);
PayoutReceipt.displayName = "PayoutReceipt";
