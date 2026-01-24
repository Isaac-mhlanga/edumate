'use client';

import React from "react";
import { useReactToPrint } from "react-to-print";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { PayoutReceipt } from "@/components/payout-receipt";
import { Printer } from "lucide-react";
import { type PayoutRequest } from "@/app/admin/page";

interface PayoutActionDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedPayout: PayoutRequest | null;
    payoutAction: 'Approve' | 'Decline' | null;
    onConfirm: () => void;
}

export function PayoutActionDialog({ isOpen, setIsOpen, selectedPayout, payoutAction, onConfirm }: PayoutActionDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Payout {payoutAction}</AlertDialogTitle>
                    <AlertDialogDescription>
                       Are you sure you want to <strong>{payoutAction?.toLowerCase()}</strong> the payout request of <strong>R {selectedPayout?.amount ? Math.abs(selectedPayout.amount).toFixed(2) : '0.00'}</strong> for <strong>{selectedPayout?.userName}</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={payoutAction === 'Decline' ? buttonVariants({ variant: "destructive" }) : ''}>
                        {payoutAction} Payout
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

interface PayoutReceiptDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedPayout: PayoutRequest | null;
}

export function PayoutReceiptDialog({ isOpen, setIsOpen, selectedPayout }: PayoutReceiptDialogProps) {
    const receiptComponentRef = React.useRef(null);
    const handlePrint = useReactToPrint({
        content: () => receiptComponentRef.current,
        documentTitle: `Payout-Receipt-${selectedPayout?.id}`,
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Payout Receipt</DialogTitle>
                    <DialogDescription>
                        A detailed record of the payout transaction.
                    </DialogDescription>
                </DialogHeader>
                {selectedPayout && (
                    <div className="py-4">
                       <PayoutReceipt ref={receiptComponentRef} payout={selectedPayout} />
                    </div>
                )}
                <DialogFooter>
                     <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                     <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print / Save PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
