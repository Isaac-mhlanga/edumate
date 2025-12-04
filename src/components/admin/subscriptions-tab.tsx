
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, ListFilter, ChevronLeft, ChevronRight } from "lucide-react";
import { type Subscription } from "@/app/admin/page";

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
    const subscriptionPlans = ['All', ...Array.from(new Set(subscriptions.map(s => s.planName)))];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">Subscription Management</CardTitle>
                <CardDescription>Oversee all active and canceled student subscriptions.</CardDescription>
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
                            {subscriptionPlans.map(plan => (
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
    );
}
