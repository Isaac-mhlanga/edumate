
'use client';

import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

interface InactivityDialogProps {
  isOpen: boolean;
  onStay: () => void;
  onLogout: () => void;
  countdownSeconds: number;
}

export function InactivityDialog({ isOpen, onStay, onLogout, countdownSeconds }: InactivityDialogProps) {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, countdownSeconds, onLogout]);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you still there?</AlertDialogTitle>
          <AlertDialogDescription>
            You've been inactive for a while. For your security, you will be automatically logged out in{' '}
            <span className="font-bold">{countdown}</span> seconds.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={onLogout}>
            Log Out Now
          </Button>
          <AlertDialogAction onClick={onStay}>I'm Still Here</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
