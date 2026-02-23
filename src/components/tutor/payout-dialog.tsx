
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { DollarSign, Landmark, User, Hash, Loader2 } from "lucide-react";

type BankDetails = {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    branchCode: string;
};

interface PayoutDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    onPayoutRequest: (amount: number, bankDetails: BankDetails) => void;
    availableForPayout: number;
}

export function PayoutDialog({
    isOpen,
    setIsOpen,
    onPayoutRequest,
    availableForPayout
}: PayoutDialogProps) {
    const [payoutAmount, setPayoutAmount] = React.useState(0);
    const [bankDetails, setBankDetails] = React.useState<BankDetails>({
        bankName: '', accountHolder: '', accountNumber: '', branchCode: ''
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setPayoutAmount(availableForPayout);
            setBankDetails({ bankName: '', accountHolder: '', accountNumber: '', branchCode: '' });
        }
    }, [isOpen, availableForPayout]);

    const handlePayout = async () => {
        setIsSubmitting(true);
        await onPayoutRequest(payoutAmount, bankDetails);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request a Payout</DialogTitle>
                    <DialogDescription>
                        Enter your bank details and the amount you wish to withdraw.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
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
                    <Separator />
                    <div className="space-y-4">
                        <Label>Bank Details for Payout</Label>
                        <div className="space-y-2">
                            <div className="relative">
                                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="bankName" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} placeholder="Bank Name" className="pl-8" />
                            </div>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="accountHolder" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} placeholder="Account Holder Name" className="pl-8" />
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="accountNumber" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} placeholder="Account Number" className="pl-8" />
                            </div>
                            <div className="relative">
                                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="branchCode" value={bankDetails.branchCode} onChange={e => setBankDetails({...bankDetails, branchCode: e.target.value})} placeholder="Branch Code" className="pl-8" />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handlePayout} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Submit Request
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    