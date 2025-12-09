
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Download, FileUp, MessageSquare } from "lucide-react";
import { type Assignment } from "@/app/admin/page";

interface AssignmentReviewDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedAssignment: Assignment | null;
    onFeedbackSubmit: () => void;
}

export function AssignmentReviewDialog({ isOpen, setIsOpen, selectedAssignment, onFeedbackSubmit }: AssignmentReviewDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Review Assignment</DialogTitle>
                    <DialogDescription>
                        Review submission for quality, fairness, and provide feedback.
                    </DialogDescription>
                </DialogHeader>
                {selectedAssignment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">Submission Details</CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Student:</span>
                                        <span className="font-medium">{selectedAssignment.studentName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Instructor:</span>
                                        <span className="font-medium">{selectedAssignment.instructor}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Course:</span>
                                        <span className="font-medium">{selectedAssignment.course}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-base">
                                        <span className="text-muted-foreground">Price:</span>
                                        <span className="font-semibold">R {selectedAssignment.price?.toFixed(2) ?? 'N/A'}</span>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex gap-2">
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={selectedAssignment.fileUrl} download><Download className="mr-2" /> Original</a>
                                    </Button>
                                     <Button variant="secondary" className="w-full" asChild>
                                        <a href={selectedAssignment.fileUrl} download><Download className="mr-2" /> Solution</a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Leave a Comment for Instructor</Label>
                                <Textarea placeholder="Type your feedback here..." rows={4} />
                            </div>
                            <div className="space-y-2">
                                <Label>Upload New Solution (Optional)</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file-solution-admin" className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileUp className="w-6 h-6 mb-1 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground"><span className="font-medium">Click to upload</span></p>
                                        </div>
                                        <Input id="dropzone-file-solution-admin" type="file" className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                    <Button onClick={onFeedbackSubmit}>
                        <MessageSquare className="mr-2"/> Submit Feedback
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

interface DeleteAssignmentDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedAssignment: Assignment | null;
    onConfirm: () => void;
}

export function DeleteAssignmentDialog({ isOpen, setIsOpen, selectedAssignment, onConfirm }: DeleteAssignmentDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the assignment <strong>"{selectedAssignment?.assignmentTitle}"</strong> and its associated file.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: "destructive" })}>
                        Delete Assignment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

    