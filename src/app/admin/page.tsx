
'use client';

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { adminData } from "@/lib/data";
import { ArrowUpRight, Banknote, BookOpen, CheckCircle, ChevronLeft, ChevronRight, DollarSign, Eye, FileText, Hourglass, ListFilter, MoreVertical, Search, Shield, Trash2, UserCog, UserMinus, UserPlus, Users, XCircle } from "lucide-react";
import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type User = (typeof adminData.users)[0];
type Course = (typeof adminData.courses)[0];
type PayoutRequest = (typeof adminData.payoutRequests)[0];

export default function AdminPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const currentTab = searchParams.get('tab') || 'overview';

    const [users, setUsers] = React.useState(adminData.users);
    const [payoutRequests, setPayoutRequests] = React.useState(adminData.payoutRequests);
    
    const [isSuspendUserDialogOpen, setIsSuspendUserDialogOpen] = React.useState(false);
    const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = React.useState(false);
    const [isPayoutActionDialogOpen, setIsPayoutActionDialogOpen] = React.useState(false);
    
    const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
    const [selectedPayout, setSelectedPayout] = React.useState<PayoutRequest | null>(null);
    const [payoutAction, setPayoutAction] = React.useState<'Approve' | 'Decline' | null>(null);

    // Filters and Pagination State
    const [userFilters, setUserFilters] = React.useState({ search: '', role: 'All' });
    const [currentUserPage, setCurrentUserPage] = React.useState(1);
    const usersPerPage = 7;

    const [courseFilters, setCourseFilters] = React.useState({ search: '' });
    const [currentCoursePage, setCurrentCoursePage] = React.useState(1);
    const coursesPerPage = 7;
    
    const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '' });
    const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
    const assignmentsPerPage = 7;

    const handleTabChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('tab', value);
        router.replace(`${pathname}?${params.toString()}`);
    };

    const handleUserFilterChange = (key: keyof typeof userFilters, value: string) => {
        setUserFilters(prev => ({ ...prev, [key]: value }));
        setCurrentUserPage(1);
    };

    const handleUserAction = (user: User, action: 'suspend' | 'delete') => {
        setSelectedUser(user);
        if (action === 'suspend') setIsSuspendUserDialogOpen(true);
        if (action === 'delete') setIsDeleteUserDialogOpen(true);
    };

    const confirmSuspendUser = () => {
        if (!selectedUser) return;
        setUsers(users.map(u => u.id === selectedUser.id ? {...u, status: u.status === 'Active' ? 'Suspended' : 'Active'} : u));
        toast({ title: "User Status Updated", description: `${selectedUser.name}'s status has been changed.` });
        setIsSuspendUserDialogOpen(false);
        setSelectedUser(null);
    }
    
    const confirmDeleteUser = () => {
        if (!selectedUser) return;
        setUsers(users.filter(u => u.id !== selectedUser.id));
        toast({ title: "User Deleted", description: `${selectedUser.name} has been permanently deleted.`, variant: "destructive" });
        setIsDeleteUserDialogOpen(false);
        setSelectedUser(null);
    }

    const handlePayoutAction = (payout: PayoutRequest, action: 'Approve' | 'Decline') => {
        setSelectedPayout(payout);
        setPayoutAction(action);
        setIsPayoutActionDialogOpen(true);
    };

    const confirmPayoutAction = () => {
        if (!selectedPayout || !payoutAction) return;
        const newStatus = payoutAction === 'Approve' ? 'Completed' : 'Declined';
        setPayoutRequests(payouts => payouts.map(p => p.id === selectedPayout.id ? {...p, status: newStatus } : p));
        toast({ title: `Payout ${payoutAction}d`, description: `The payout request for ${selectedPayout.instructor} has been ${newStatus.toLowerCase()}.` });
        setIsPayoutActionDialogOpen(false);
        setSelectedPayout(null);
        setPayoutAction(null);
    };

    const filteredUsers = React.useMemo(() => {
        return users.filter(user => {
            const searchMatch = userFilters.search.trim().toLowerCase() === '' ||
                user.name.toLowerCase().includes(userFilters.search.trim().toLowerCase()) ||
                user.email.toLowerCase().includes(userFilters.search.trim().toLowerCase());
            const roleMatch = userFilters.role === 'All' || user.role === userFilters.role;
            return searchMatch && roleMatch;
        });
    }, [users, userFilters]);
    const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
    const paginatedUsers = filteredUsers.slice((currentUserPage - 1) * usersPerPage, currentUserPage * usersPerPage);

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Shield className="h-8 w-8 text-primary"/>
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">Platform-wide management and oversight.</p>
                </div>
                
                <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 max-w-2xl">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="users">Users</TabsTrigger>
                        <TabsTrigger value="courses">Courses</TabsTrigger>
                        <TabsTrigger value="assignments">Assignments</TabsTrigger>
                        <TabsTrigger value="payouts">Payouts</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="pt-6 space-y-8">
                        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {adminData.stats.map((stat) => (
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
                        <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Platform Activity</CardTitle>
                                    <CardDescription>A log of recent important events across the platform.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-4">
                                        {adminData.recentActivity.map(activity => (
                                            <li key={activity.id} className="flex items-start gap-4">
                                                <div className="bg-muted p-2 rounded-full mt-1">
                                                    {activity.type === 'New User' && <UserPlus className="h-5 w-5 text-muted-foreground"/>}
                                                    {activity.type === 'New Course' && <BookOpen className="h-5 w-5 text-muted-foreground"/>}
                                                    {activity.type === 'Payout' && <Banknote className="h-5 w-5 text-muted-foreground"/>}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-medium">{activity.description}</p>
                                                    <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="users" className="pt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                                <CardDescription>Manage all students and instructors on the platform.</CardDescription>
                            </CardHeader>
                             <div className="flex items-center justify-between gap-2 p-4 border-y">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name or email..."
                                        className="pl-8"
                                        value={userFilters.search}
                                        onChange={(e) => handleUserFilterChange('search', e.target.value)}
                                    />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-1">
                                            <ListFilter className="h-3.5 w-3.5" />
                                            <span>Filter by Role</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={userFilters.role} onValueChange={(value) => handleUserFilterChange('role', value)}>
                                            <DropdownMenuRadioItem value="All">All Roles</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Student">Student</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Instructor">Instructor</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9"><AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                                    <div>
                                                        <p className="font-medium">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'Instructor' ? 'secondary' : 'outline'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{user.joined}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                                                    {user.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                 <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem><Eye className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleUserAction(user, 'suspend')}><UserMinus className="mr-2 h-4 w-4"/>{user.status === 'Active' ? 'Suspend' : 'Unsuspend'}</DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem onClick={() => handleUserAction(user, 'delete')} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete User</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <CardFooter className="flex items-center justify-between py-4">
                                <div className="text-xs text-muted-foreground">
                                    Showing <strong>{(currentUserPage - 1) * usersPerPage + 1}-{Math.min(currentUserPage * usersPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users.
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setCurrentUserPage(p => p - 1)} disabled={currentUserPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                                    <Button variant="outline" size="sm" onClick={() => setCurrentUserPage(p => p + 1)} disabled={currentUserPage >= totalUserPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                                </div>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    
                    <TabsContent value="payouts" className="pt-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Instructor Payouts</CardTitle>
                                <CardDescription>Review and process pending payout requests from instructors.</CardDescription>
                            </CardHeader>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Instructor</TableHead>
                                        <TableHead>Requested Amount (R)</TableHead>
                                        <TableHead>Request Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payoutRequests.map(payout => (
                                        <TableRow key={payout.id}>
                                            <TableCell className="font-medium">{payout.instructor}</TableCell>
                                            <TableCell className="font-semibold text-red-600">{payout.amount.toFixed(2)}</TableCell>
                                            <TableCell>{payout.date}</TableCell>
                                            <TableCell>
                                                <Badge variant={"outline"} className={
                                                    payout.status === 'Completed' ? 'bg-green-500/20 text-green-700 border-green-500/30'
                                                    : payout.status === 'Declined' ? 'bg-red-500/20 text-red-700 border-red-500/30'
                                                    : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30'
                                                }>
                                                    {payout.status === 'Completed' && <CheckCircle className="mr-1 h-3 w-3"/>}
                                                    {payout.status === 'Declined' && <XCircle className="mr-1 h-3 w-3"/>}
                                                    {payout.status === 'Pending' && <Hourglass className="mr-1 h-3 w-3"/>}
                                                    {payout.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {payout.status === 'Pending' ? (
                                                    <div className="flex gap-2 justify-end">
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-600/50 hover:bg-red-50 hover:text-red-700" onClick={() => handlePayoutAction(payout, 'Decline')}>Decline</Button>
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handlePayoutAction(payout, 'Approve')}>Approve</Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">Processed</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>

            {/* Dialogs for User Actions */}
            <AlertDialog open={isSuspendUserDialogOpen} onOpenChange={setIsSuspendUserDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {selectedUser?.status === 'Active' ? 'suspend' : 'unsuspend'} the user account for <strong>{selectedUser?.name}</strong>. Suspended users cannot log in.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmSuspendUser}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                           This action cannot be undone. This will permanently delete the user <strong>{selectedUser?.name}</strong> and all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteUser} className={buttonVariants({ variant: "destructive" })}>Delete User</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Dialog for Payout Actions */}
            <AlertDialog open={isPayoutActionDialogOpen} onOpenChange={setIsPayoutActionDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payout {payoutAction}</AlertDialogTitle>
                        <AlertDialogDescription>
                           Are you sure you want to <strong>{payoutAction?.toLowerCase()}</strong> the payout request of <strong>R {selectedPayout?.amount ? Math.abs(selectedPayout.amount).toFixed(2) : '0.00'}</strong> for <strong>{selectedPayout?.instructor}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setSelectedPayout(null); setPayoutAction(null); }}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPayoutAction} className={payoutAction === 'Decline' ? buttonVariants({ variant: "destructive" }) : ''}>
                            {payoutAction} Payout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
