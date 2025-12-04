'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { type Course } from "@/app/instructor/page";

interface DeleteCourseDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedCourse: Course | null;
    onConfirm: () => void;
}

export function DeleteCourseDialog({
    isOpen,
    setIsOpen,
    selectedCourse,
    onConfirm
}: DeleteCourseDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                       This action cannot be undone. This will permanently delete the course <strong>"{selectedCourse?.title}"</strong> and all of its associated videos and files.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>
                        Delete Course
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
