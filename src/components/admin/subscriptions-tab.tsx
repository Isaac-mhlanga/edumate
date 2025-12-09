
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, ChevronLeft, ChevronRight, CheckCircle, ShieldCheck } from "lucide-react";
import { type Subscription } from "@/app/admin/page";
import { subscriptionPlans } from "@/lib/data";

interface AdminSubscriptionsTabProps {
    subscriptions: Subscription[];
    onCancelSubscription: (subscription: Subscription) => void;
}

export function AdminSubscriptionsTab({ subscriptions, onCancelSubscription }: AdminSubscriptionsTabProps) {
    const [subscriptionFilters, setSubscriptionFilters] = React.useState({ search: '', plan: 'All' });
    const [currentSubscriptionPage, setCurrentSubscriptionPage] = React.useState(1);
    const subscriptionsPerPage = 7;

    const handleSubscriptionFilterChange = (key: keyof typeof subscriptionFilters, value: string) => {
        setSubscriptionFilters(prev => ({ ...prev, [key]: value }));
        setCurrentSubscriptionPage(1);
    };

    const filteredSubscriptions = React.useMemo(() => {
        return subscriptions.filter(sub => {
            const searchMatch = subscriptionFilters.search.trim().toLowerCase() === '' ||
                sub.studentName.toLowerCase().includes(subscriptionFilters.search.trim().toLowerCase()) ||
                sub.studentEmail.toLowerCase().includes(subscriptionFilters.search.trim().toLowerCase());
            const planMatch = subscriptionFilters.plan === 'All' || sub.planName === subscriptionFilters.plan;
            return searchMatch && planMatch;
        });
    }, [subscriptions, subscriptionFilters]);
    const totalSubscriptionPages = Math.ceil(filteredSubscriptions.length / subscriptionsPerPage);
    const paginatedSubscriptions = filteredSubscriptions.slice((currentSubscriptionPage - 1) * subscriptionsPerPage, currentSubscriptionPage * subscriptionsPerPage);
    const subscriptionPlanNames = ['All', ...Array.from(new Set(subscriptions.map(s => s.planName)))];

    return (
        <div className="space-y-8">
            <Card>
                 <CardHeader>
                    <CardTitle>Available Subscription Plans</CardTitle>
                    <CardDescription>A reference of all subscription plans configured for the platform.</CardDescription>
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
                                <Button className="w-full" variant="outline" disabled>Manage Plan</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Active & Canceled Subscriptions</CardTitle>
                    <CardDescription>Oversee all student subscription statuses.</CardDescription>
                </CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name or email..."
                            className="pl-8"
                            value={subscriptionFilters.search}
                            onChange={(e) => handleSubscriptionFilterChange('search', e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-1 w-full md:w-auto">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span>Filter by Plan</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by Plan</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={subscriptionFilters.plan} onValueChange={(value) => handleSubscriptionFilterChange('plan', value)}>
                                {subscriptionPlanNames.map(plan => (
                                    <DropdownMenuRadioItem key={plan} value={plan}>{plan}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead className="hidden sm:table-cell">Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Next Billing Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSubscriptions.map(sub => (
                            <TableRow key={sub.id}>
                                <TableCell>
                                    <div className="font-medium">{sub.studentName}</div>
                                    <div className="text-xs text-muted-foreground">{sub.studentEmail}</div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell">
                                    <Badge variant="secondary">{sub.planName}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={sub.status === 'Active' ? 'default' : 'destructive'} className={sub.status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                                        {sub.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{sub.nextBillingDate}</TableCell>
                                <TableCell className="text-right">
                                    {sub.status === 'Active' && (
                                        <Button variant="outline" size="sm" className="text-destructive border-destructive/50 hover:bg-destructive/10" onClick={() => onCancelSubscription(sub)}>
                                            Cancel Subscription
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(currentSubscriptionPage - 1) * subscriptionsPerPage + 1}-{Math.min(currentSubscriptionPage * subscriptionsPerPage, filteredSubscriptions.length)}</strong> of <strong>{filteredSubscriptions.length}</strong> subscriptions.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentSubscriptionPage(p => p - 1)} disabled={currentSubscriptionPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentSubscriptionPage(p => p + 1)} disabled={currentSubscriptionPage >= totalSubscriptionPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
