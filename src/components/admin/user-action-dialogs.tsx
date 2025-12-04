
'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { type User } from "@/app/admin/page";

interface UserActionDialogsProps {
    isSuspendOpen: boolean;
    setIsSuspendOpen: (open: boolean) => void;
    isDeleteOpen: boolean;
    setIsDeleteOpen: (open: boolean) => void;
    selectedUser: User | null;
    onConfirmSuspend: () => void;
    onConfirmDelete: () => void;
}

export function UserActionDialogs({
    isSuspendOpen,
    setIsSuspendOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedUser,
    onConfirmSuspend,
    onConfirmDelete
}: UserActionDialogsProps) {
    return (
        <>
            <AlertDialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {selectedUser?.status === 'Active' ? 'suspend' : 'unsuspend'} the user account for <strong>{selectedUser?.name}</strong>. Suspended users cannot log in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmSuspend}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete the user <strong>{selectedUser?.name}</strong> and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmDelete} className={buttonVariants({ variant: "destructive" })}>Delete User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
