'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowUpRight, Sparkles, RefreshCw, UserPlus, BookOpen, Banknote, ChevronLeft, ChevronRight, Wand2, Users, DollarSign, CreditCard, Book } from "lucide-react";
import { format } from "date-fns";
import { type PayoutRequest, type CalendarEvent, type RecentActivity, type User, type Course, type Subscription, type Transaction } from "@/app/admin/page";

interface AdminOverviewTabProps {
    loading: boolean;
    events: CalendarEvent[];
    payoutRequests: PayoutRequest[];
    users: User[];
    courses: Course[];
    transactions: Transaction[];
    subscriptions: Subscription[];
    recentActivity: RecentActivity[];
}

export function AdminOverviewTab({ 
    loading, 
    events, 
    payoutRequests,
    users,
    courses,
    transactions,
    subscriptions,
    recentActivity
}: AdminOverviewTabProps) {
    const [currentActivityPage, setCurrentActivityPage] = React.useState(1);
    const activitiesPerPage = 5;
    const [currentEventPage, setCurrentEventPage] = React.useState(1);
    const eventsPerPage = 4;
    const [currentPayoutRequestPage, setCurrentPayoutRequestPage] = React.useState(1);
    const payoutRequestsPerPage = 4;

    const upcomingEvents = React.useMemo(() => {
        return events
            .filter(event => new Date(event.start) >= new Date())
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    }, [events]);
    const totalEventPages = Math.ceil(upcomingEvents.length / eventsPerPage);
    const paginatedEvents = upcomingEvents.slice((currentEventPage - 1) * eventsPerPage, currentEventPage * eventsPerPage);

    const pendingPayoutRequests = React.useMemo(() => {
        return payoutRequests.filter(p => p.status === 'Pending');
    }, [payoutRequests]);
    const totalPayoutRequestPages = Math.ceil(pendingPayoutRequests.length / payoutRequestsPerPage);
    const paginatedPayoutRequests = pendingPayoutRequests.slice((currentPayoutRequestPage - 1) * payoutRequestsPerPage, currentPayoutRequestPage * payoutRequestsPerPage);
    
    const totalActivityPages = Math.ceil(recentActivity.length / activitiesPerPage);
    const paginatedActivities = recentActivity.slice((currentActivityPage - 1) * activitiesPerPage, currentActivityPage * activitiesPerPage);

    const stats = React.useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthRevenue = transactions
            .filter(t => t.createdAt.toDate().getMonth() === currentMonth && t.createdAt.toDate().getFullYear() === currentYear && t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthRevenue = transactions
            .filter(t => t.createdAt.toDate().getMonth() === lastMonth && t.createdAt.toDate().getFullYear() === lastMonthYear && t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);

        let revenueChange = '0%';
        if (lastMonthRevenue > 0) {
            const change = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
            revenueChange = `${change >= 0 ? '+' : ''}${change.toFixed(0)}%`;
        } else if (currentMonthRevenue > 0) {
            revenueChange = '+100%';
        }
        
        const newUsersThisMonth = users.filter(u => u.originalJoinedDate.getMonth() === currentMonth && u.originalJoinedDate.getFullYear() === currentYear).length;

        const newSubscriptionsThisMonth = transactions.filter(t => t.itemType === 'subscription' && t.createdAt.toDate().getMonth() === currentMonth && t.createdAt.toDate().getFullYear() === currentYear).length;
        
        const newCoursesThisMonth = courses.filter(c => c.createdAt.toDate().getMonth() === currentMonth && c.createdAt.toDate().getFullYear() === currentYear).length;

        const totalRevenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
        const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;
        const activeCourses = courses.filter(c => c.status === 'Published').length;

        return [
            { title: "Total Revenue", value: `R ${totalRevenue.toFixed(2)}`, icon: DollarSign, change: `${revenueChange} this month` },
            { title: "Total Users", value: users.length, icon: Users, change: `+${newUsersThisMonth} new users` },
            { title: "Active Subscriptions", value: activeSubscriptions, icon: CreditCard, change: `+${newSubscriptionsThisMonth} this month` },
            { title: "Active Courses", value: activeCourses, icon: Book, change: `+${newCoursesThisMonth} new this month` },
        ];
    }, [transactions, users, subscriptions, courses]);

    return (
        <div className="space-y-8">
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {loading ? Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-5 w-5 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground flex items-center">
                                <span className="text-green-600 mr-1 flex items-center"><ArrowUpRight className="h-4 w-4"/> {stat.change}</span>
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Recent Platform Activity</CardTitle>
                        <CardDescription>A log of recent important events across the platform.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {paginatedActivities.length > 0 ? (
                            <ul className="space-y-4">
                                {paginatedActivities.map(activity => (
                                    <li key={activity.id} className="flex items-start gap-4">
                                        <div className="bg-muted p-2 rounded-full mt-1">
                                            {activity.type === 'New User' && <UserPlus className="h-5 w-5 text-muted-foreground"/>}
                                            {activity.type === 'New Course' && <BookOpen className="h-5 w-5 text-muted-foreground"/>}
                                            {activity.type === 'Transaction' && <Banknote className="h-5 w-5 text-muted-foreground"/>}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{activity.description}</p>
                                            <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
                        )}
                    </CardContent>
                     {totalActivityPages > 1 && (
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                            <div className="text-xs text-muted-foreground">
                                Page <strong>{currentActivityPage}</strong> of <strong>{totalActivityPages}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentActivityPage(p => p - 1)} disabled={currentActivityPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentActivityPage(p => p + 1)} disabled={currentActivityPage >= totalActivityPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Upcoming Events</CardTitle>
                        <CardDescription>Key dates and events scheduled on the platform.</CardDescription>
                    </CardHeader>
                     <CardContent className="flex-grow">
                        {paginatedEvents.length > 0 ? (
                            <ul className="space-y-4">
                                {paginatedEvents.map(event => (
                                    <li key={event.id} className="flex items-center gap-4">
                                        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted text-muted-foreground w-16">
                                            <span className="text-xs font-bold uppercase">{format(new Date(event.start), 'MMM')}</span>
                                            <span className="text-2xl font-bold">{format(new Date(event.start), 'd')}</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{event.title}</p>
                                            <p className="text-sm text-muted-foreground">{event.allDay ? 'All Day' : format(new Date(event.start), 'p')}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No upcoming events.</p>
                        )}
                    </CardContent>
                    {totalEventPages > 1 && (
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                            <div className="text-xs text-muted-foreground">
                                Page <strong>{currentEventPage}</strong> of <strong>{totalEventPages}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentEventPage(p => p - 1)} disabled={currentEventPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentEventPage(p => p + 1)} disabled={currentEventPage >= totalEventPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </section>
            
            <section className="grid gap-6">
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-xl">Pending Payouts</CardTitle>
                        <CardDescription>Instructor payout requests awaiting approval.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                        {paginatedPayoutRequests.length > 0 ? (
                            <ul className="space-y-4">
                                {paginatedPayoutRequests.map(payout => (
                                    <li key={payout.id} className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9"><AvatarFallback>{payout.instructor.charAt(0)}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-medium">{payout.instructor}</p>
                                                <p className="text-sm text-muted-foreground">Requested on {payout.date}</p>
                                            </div>
                                        </div>
                                        <div className="font-semibold text-destructive">R {Math.abs(payout.amount).toFixed(2)}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">No pending payout requests.</p>
                        )}
                    </CardContent>
                     {totalPayoutRequestPages > 1 && (
                        <CardFooter className="flex items-center justify-between border-t pt-4">
                            <div className="text-xs text-muted-foreground">
                                Page <strong>{currentPayoutRequestPage}</strong> of <strong>{totalPayoutRequestPages}</strong>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPayoutRequestPage(p => p - 1)} disabled={currentPayoutRequestPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPayoutRequestPage(p => p + 1)} disabled={currentPayoutRequestPage >= totalPayoutRequestPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </section>
        </div>
    );
}