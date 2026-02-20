
'use client';

import React from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button, buttonVariants } from '@/components/ui/button';
import { TransactionReceipt } from '@/components/transaction-receipt';
import { Printer, Trash2 } from 'lucide-react';
import { type Transaction } from '@/app/admin/page';

interface DeleteTransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTransaction: Transaction | null;
  onConfirm: () => void;
}

export function DeleteTransactionDialog({ isOpen, setIsOpen, selectedTransaction, onConfirm }: DeleteTransactionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the transaction for{' '}
            <strong>"{selectedTransaction?.itemTitle}"</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={buttonVariants({ variant: 'destructive' })}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Transaction
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}


interface TransactionReceiptDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedTransaction: Transaction | null;
}

export function TransactionReceiptDialog({ isOpen, setIsOpen, selectedTransaction }: TransactionReceiptDialogProps) {
    const receiptComponentRef = React.useRef(null);
    const handlePrint = useReactToPrint({
        content: () => receiptComponentRef.current,
        documentTitle: `Transaction-Receipt-${selectedTransaction?.id}`,
    });

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl">Transaction Receipt</DialogTitle>
                    <DialogDescription>
                        A detailed record of the transaction.
                    </DialogDescription>
                </DialogHeader>
                {selectedTransaction && (
                    <div className="py-4">
                       <TransactionReceipt ref={receiptComponentRef} transaction={selectedTransaction} />
                    </div>
                )}
                <DialogFooter>
                     <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
                     <Button onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4"/>
                        Print / Save PDF
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
