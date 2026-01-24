
'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buttonVariants, Button } from "@/components/ui/button";
import { type User } from "@/app/admin/page";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { Icons } from "../icons";
import { Shield, CreditCard, Phone, Calendar } from "lucide-react";

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

interface UserDetailsDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedUser: User | null;
}

export function UserDetailsDialog({ isOpen, setIsOpen, selectedUser }: UserDetailsDialogProps) {
    if (!selectedUser) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader className="items-center text-center">
                    <div className="mb-4">
                        <Icons.logo className="h-12 w-auto" />
                    </div>
                    <Avatar className="h-20 w-20 border-2 border-primary">
                        <AvatarFallback className="text-3xl">{selectedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <DialogTitle className="text-2xl pt-2">{selectedUser.name}</DialogTitle>
                    <DialogDescription>{selectedUser.email}</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>Role:</span>
                            <Badge variant="secondary" className="capitalize">{selectedUser.role}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                             <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>Plan:</span>
                            <Badge variant="outline">{selectedUser.subscriptionPlan || 'N/A'}</Badge>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                         {selectedUser.phoneNumber && (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{selectedUser.phoneNumber}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Joined on {selectedUser.joined}</span>
                        </div>
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

    