'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { studentData, subscriptionPlans } from "@/lib/data";
import { CheckCircle, ShieldCheck } from "lucide-react";

export function SubscriptionsTab() {
    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>My Current Plan</CardTitle>
                    <CardDescription>Your primary subscription for accessing course content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Card className="bg-primary/5 border-primary">
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-2xl">{studentData.currentSubscription.planName}</CardTitle>
                                <CardDescription>Next payment on {studentData.currentSubscription.nextBillingDate}</CardDescription>
                            </div>
                            <div className="text-right mt-4 sm:mt-0">
                                <p className="text-3xl font-bold">R{studentData.currentSubscription.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            </div>
                        </CardHeader>
                        <CardFooter className="flex justify-end gap-2">
                             {studentData.currentSubscription.planId !== 'free' && <Button variant="destructive">Cancel Subscription</Button>}
                        </CardFooter>
                    </Card>
                </CardContent>
            </Card>
            <Card>
                 <CardHeader>
                    <CardTitle>Available Plans</CardTitle>
                    <CardDescription>Choose a plan that best fits your learning needs.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subscriptionPlans.map(plan => (
                        <Card key={plan.id} className="flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle>{plan.name}</CardTitle>
                                    <ShieldCheck className="w-6 h-6 text-secondary"/>
                                </div>
                                <p className="text-3xl font-bold pt-4">R{plan.price}<span className="text-sm font-normal text-muted-foreground">/month</span></p>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-1 shrink-0"/>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" disabled={plan.id === studentData.currentSubscription.planId}>
                                    {plan.id === studentData.currentSubscription.planId ? 'Current Plan' : 'Change Plan'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
