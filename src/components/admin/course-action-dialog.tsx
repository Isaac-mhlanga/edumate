
'use client';

import React from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { type Course } from "@/app/admin/page";

interface CourseActionDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedCourse: Course | null;
    courseAction: 'Approve' | 'Reject' | null;
    onConfirm: () => void;
}

export function CourseActionDialog({
    isOpen,
    setIsOpen,
    selectedCourse,
    courseAction,
    onConfirm
}: CourseActionDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Course {courseAction}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to <strong>{courseAction?.toLowerCase()}</strong> the course <strong>"{selectedCourse?.title}"</strong>?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={courseAction === 'Reject' ? buttonVariants({ variant: "destructive" }) : ''}>
                        {courseAction} Course
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
