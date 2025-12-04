
'use client';

import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { type Transaction } from '@/app/dashboard/page';

interface RefundDialogProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    selectedTransaction: Transaction | null;
    onConfirm: () => void;
}

export function RefundDialog({ isOpen, setIsOpen, selectedTransaction, onConfirm }: RefundDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Request a Refund</AlertDialogTitle>
                    <AlertDialogDescription>
                        Please provide a reason for your refund request for <strong>"{selectedTransaction?.itemTitle}"</strong>. Our team will review it shortly.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                    <Textarea placeholder="Type your reason here..." />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Submit Request</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
