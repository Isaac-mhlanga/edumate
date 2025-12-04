
'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { type EnrolledStudent } from "@/app/instructor/page";

interface StudentActionDialogsProps {
    isDetailsOpen: boolean;
    setIsDetailsOpen: (open: boolean) => void;
    isUnenrollOpen: boolean;
    setIsUnenrollOpen: (open: boolean) => void;
    isDeleteOpen: boolean;
    setIsDeleteOpen: (open: boolean) => void;
    selectedStudent: EnrolledStudent | null;
    onConfirmUnenroll: () => void;
    onConfirmDelete: () => void;
}

export function StudentActionDialogs({
    isDetailsOpen,
    setIsDetailsOpen,
    isUnenrollOpen,
    setIsUnenrollOpen,
    isDeleteOpen,
    setIsDeleteOpen,
    selectedStudent,
    onConfirmUnenroll,
    onConfirmDelete
}: StudentActionDialogsProps) {
    return (
        <>
            {/* Student Details Dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Student Details</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl">{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-lg">{selectedStudent.name}</h3>
                                    <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                                </div>
                            </div>
                            <Separator />
                             <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Enrolled In:</span>
                                    <span className="font-medium">{selectedStudent.course}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Joined:</span>
                                    <span className="font-medium">{selectedStudent.joined}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Progress:</span>
                                    <Badge variant="secondary">{selectedStudent.progress}%</Badge>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <AlertDialogAction onClick={() => setIsDetailsOpen(false)}>Close</AlertDialogAction>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unenroll Dialog */}
            <AlertDialog open={isUnenrollOpen} onOpenChange={setIsUnenrollOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unenroll Student?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to unenroll <strong>{selectedStudent?.name}</strong> from <strong>{selectedStudent?.course}</strong>? They will lose access to the course content. This action can be undone by them re-enrolling.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onConfirmUnenroll}>Confirm Unenrollment</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Delete Student Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete the user <strong>{selectedStudent?.name}</strong>.
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
