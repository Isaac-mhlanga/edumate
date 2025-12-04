'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Download, CheckCircle, DollarSign, Loader2, Save } from 'lucide-react';
import { type SubmittedAssignment } from '@/app/instructor/page';
import { type User } from 'firebase/auth';
import { format } from 'date-fns';

interface AssignmentReviewDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedAssignment: SubmittedAssignment | null;
  onAcceptAssignment: (assignment: SubmittedAssignment) => void;
  onSaveSolution: (assignmentId: string, price: number) => void;
  user: User | null;
}

export function AssignmentReviewDialog({
  isOpen,
  setIsOpen,
  selectedAssignment,
  onAcceptAssignment,
  onSaveSolution,
  user,
}: AssignmentReviewDialogProps) {
  const [price, setPrice] = React.useState<number | ''>('');

  React.useEffect(() => {
    if (selectedAssignment?.price) {
      setPrice(selectedAssignment.price);
    } else {
      setPrice('');
    }
  }, [selectedAssignment]);

  const canAccept = selectedAssignment?.status === 'Pending Review';
  const isMarking =
    selectedAssignment?.status === 'In Progress' &&
    selectedAssignment?.markerId === user?.uid;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Review Assignment</DialogTitle>
          <DialogDescription>
            Review the student's submission and provide a priced solution.
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
                    <span className="font-medium">
                      {selectedAssignment.studentName}
                    </span>
                  </div>
                   <div className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span className="font-medium">
                      {selectedAssignment.course}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-medium">
                      {selectedAssignment.submittedAt ? format(selectedAssignment.submittedAt.toDate(), 'PPP') : 'N/A'}
                    </span>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full" asChild>
                    <a href={selectedAssignment.fileUrl} download>
                      <Download className="mr-2 h-4 w-4" /> Download Submission
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              {canAccept && (
                 <Card className="bg-muted/50 text-center">
                    <CardContent className="p-6">
                        <p className="text-sm text-muted-foreground mb-4">Accept this assignment to begin working on the solution. This will lock it from other instructors.</p>
                        <Button onClick={() => onAcceptAssignment(selectedAssignment)}>
                            <CheckCircle className="mr-2"/> Accept for Review
                        </Button>
                    </CardContent>
                </Card>
              )}
               {isMarking && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Set Solution Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Label htmlFor="solution-price">Price (R)</Label>
                         <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                            <Input 
                                id="solution-price"
                                type="number"
                                placeholder="e.g. 150"
                                className="pl-8"
                                value={price}
                                onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            />
                         </div>
                    </CardContent>
                 </Card>
               )}
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          {isMarking && (
             <Button onClick={() => onSaveSolution(selectedAssignment!.id, Number(price))} disabled={!price || price <= 0}>
                <Save className="mr-2"/> Save and Notify Student
             </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
