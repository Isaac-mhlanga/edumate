
'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { type Subscription } from "@/app/admin/page";

interface SubscriptionActionDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedSubscription: Subscription | null;
    onConfirm: () => void;
}

export function SubscriptionActionDialog({ isOpen, setIsOpen, selectedSubscription, onConfirm }: SubscriptionActionDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to cancel the <strong>{selectedSubscription?.planName}</strong> plan for <strong>{selectedSubscription?.studentName}</strong>? Their access will be revoked at the end of the current billing cycle.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>
                        Confirm Cancellation
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
