
'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Download, Save } from "lucide-react";
import { type Assignment } from "@/app/admin/page";
import { useToast } from "@/hooks/use-toast";

interface AssignmentReviewDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedAssignment: Assignment | null;
    onSave: (assignmentId: string, newPrice: number | null) => void;
}

export function AssignmentReviewDialog({ isOpen, setIsOpen, selectedAssignment, onSave }: AssignmentReviewDialogProps) {
    const { toast } = useToast();
    const [price, setPrice] = React.useState<number | string>('');

    React.useEffect(() => {
        if (selectedAssignment) {
            setPrice(selectedAssignment.price ?? '');
        } else {
            setPrice('');
        }
    }, [selectedAssignment]);

    const handleSaveChanges = () => {
        if (!selectedAssignment) return;
        if (price === '' || isNaN(Number(price)) || Number(price) < 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Price',
                description: 'Please enter a valid non-negative number for the price, or 0 for free.'
            });
            return;
        }
        const newPrice = Number(price);
        onSave(selectedAssignment.id, newPrice);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Review Assignment</DialogTitle>
                    <DialogDescription>
                        Review submission details and adjust the price if necessary.
                    </DialogDescription>
                </DialogHeader>
                {selectedAssignment && (
                    <div className="grid grid-cols-1 gap-6 py-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">Submission Details</CardTitle>
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
                                    <span className="text-muted-foreground">Current Price:</span>
                                    <span className="font-semibold">R {selectedAssignment.price?.toFixed(2) ?? 'N/A'}</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button variant="outline" className="w-full" asChild>
                                    <a href={selectedAssignment.fileUrl} download><Download className="mr-2" /> Download Submission</a>
                                </Button>
                            </CardFooter>
                        </Card>
                        <div className="space-y-2">
                            <Label htmlFor="assignment-price">Set/Adjust Price (R)</Label>
                            <Input
                                id="assignment-price"
                                type="number"
                                placeholder="e.g., 150 or 0 for free"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Setting a price will move the assignment to 'Awaiting Payment'. Setting it to 0 will mark it as 'Paid'.
                            </p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                    <Button onClick={handleSaveChanges}>
                        <Save className="mr-2"/> Save Changes
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

interface MarkAsPaidDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedAssignment: Assignment | null;
    onConfirm: () => void;
}

export function MarkAsPaidDialog({ isOpen, setIsOpen, selectedAssignment, onConfirm }: MarkAsPaidDialogProps) {
    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Mark Assignment as Paid?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This will mark the assignment <strong>"{selectedAssignment?.assignmentTitle}"</strong> as paid and create a transaction record for R{selectedAssignment?.price?.toFixed(2)}. This is for payments made outside the platform (e.g., direct bank transfer). This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>
                        Confirm Payment
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
