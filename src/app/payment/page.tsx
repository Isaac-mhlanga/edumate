'use client';

import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, Loader2 } from "lucide-react";
import React from "react";

export default function PaymentPage() {
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSuccess, setIsSuccess] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 2000);
    };

    const handleNewPayment = () => {
        setIsSuccess(false);
    }

    if(isSuccess) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center h-full">
                    <Card className="w-full max-w-md text-center shadow-xl rounded-xl p-8">
                        <CardHeader className="items-center">
                            <div className="bg-green-100 p-4 rounded-full">
                                <CheckCircle2 className="h-12 w-12 text-green-600"/>
                            </div>
                            <CardTitle className="text-2xl pt-4">Payment Successful!</CardTitle>
                            <CardDescription>
                                Your payment for 'Advanced Calculus Masterclass' has been processed. A receipt has been sent to your email.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/50 rounded-lg p-4 text-left">
                                <p className="font-medium">Receipt Details</p>
                                <ul className="text-sm mt-2 space-y-1">
                                    <li><span className="text-muted-foreground">Student:</span> Alex Johnson</li>
                                    <li><span className="text-muted-foreground">Course:</span> Advanced Calculus Masterclass</li>
                                    <li><span className="text-muted-foreground">Amount Paid:</span> $49.99</li>
                                </ul>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-4">
                             <Button onClick={handleNewPayment} className="w-full">Make Another Payment</Button>
                             <Button variant="outline" className="w-full">Go to Dashboard</Button>
                        </CardFooter>
                    </Card>
                </div>
            </AppLayout>
        )
    }

  return (
    <AppLayout>
      <div className="flex justify-center">
        <Card className="w-full max-w-lg shadow-xl rounded-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Secure Payment</CardTitle>
            <CardDescription>
              Complete your payment for 'Advanced Calculus Masterclass'.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required/>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required/>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" required/>
            </div>
             <div className="space-y-2">
                <Label htmlFor="card-number">Card Details</Label>
                <Input id="card-number" placeholder="Card Number" required/>
                <div className="grid grid-cols-2 gap-4">
                    <Input placeholder="MM / YY" required/>
                    <Input placeholder="CVC" required/>
                </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup defaultValue="card" className="flex gap-4">
                <div>
                  <RadioGroupItem value="card" id="card" className="peer sr-only" />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Credit Card
                  </Label>
                </div>
                 <div>
                  <RadioGroupItem value="paystack" id="paystack" className="peer sr-only" />
                  <Label
                    htmlFor="paystack"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    Paystack
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                {isLoading ? 'Processing...' : 'Pay $49.99'}
            </Button>
          </CardFooter>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
