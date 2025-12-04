
'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { type Transaction } from "@/app/instructor/page";

interface TransactionDialogsProps {
    isDetailsOpen: boolean;
    setIsDetailsOpen: (open: boolean) => void;
    isRefundOpen: boolean;
    setIsRefundOpen: (open: boolean) => void;
    isPayoutOpen: boolean;
    setIsPayoutOpen: (open: boolean) => void;
    selectedTransaction: Transaction | null;
    onConfirmRefund: () => void;
    onPayoutRequest: (amount: number) => void;
    availableForPayout: number;
}

export function TransactionDialogs({
    isDetailsOpen, setIsDetailsOpen,
    isRefundOpen, setIsRefundOpen,
    isPayoutOpen, setIsPayoutOpen,
    selectedTransaction,
    onConfirmRefund,
    onPayoutRequest,
    availableForPayout
}: TransactionDialogsProps) {
    const [payoutAmount, setPayoutAmount] = React.useState(0);

    React.useEffect(() => {
        if (isPayoutOpen) {
            setPayoutAmount(availableForPayout);
        }
    }, [isPayoutOpen, availableForPayout]);

    return (
        <>
            {/* Transaction Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>ID: {selectedTransaction?.id}</DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="py-4 space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Item:</span>
                                <span className="font-medium">{selectedTransaction.itemTitle}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Type:</span>
                                <Badge variant="outline" className="capitalize">{selectedTransaction.itemType}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Student:</span>
                                <span className="font-medium">{selectedTransaction.studentName || 'N/A'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-semibold">Amount:</span>
                                <span className={`font-bold ${selectedTransaction.amount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                                    R {selectedTransaction.amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Refund Dialog */}
            <AlertDialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Process Refund?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to refund <strong>R {selectedTransaction?.amount.toFixed(2)}</strong> for the transaction <strong>"{selectedTransaction?.itemTitle}"</strong>? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmRefund}>Confirm Refund</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Payout Dialog */}
            <Dialog open={isPayoutOpen} onOpenChange={setIsPayoutOpen}>
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Request a Payout</DialogTitle>
                        <DialogDescription>
                            Enter the amount you wish to withdraw. Maximum available is R {availableForPayout.toFixed(2)}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2">
                        <Label htmlFor="payout-amount">Payout Amount (R)</Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input
                                id="payout-amount"
                                type="number"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(parseFloat(e.target.value))}
                                max={availableForPayout}
                                className="pl-8"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsPayoutOpen(false)}>Cancel</Button>
                        <Button onClick={() => onPayoutRequest(payoutAmount)}>Submit Request</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

