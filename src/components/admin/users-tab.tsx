
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, ListFilter, CreditCard, MoreVertical, UserMinus, Trash2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { type User } from "@/app/admin/page";

interface AdminUsersTabProps {
    users: User[];
    onUserAction: (user: User, action: 'suspend' | 'delete' | 'view') => void;
}

export function AdminUsersTab({ users, onUserAction }: AdminUsersTabProps) {
    const [userFilters, setUserFilters] = React.useState({ search: '', role: 'All' });
    const [currentUserPage, setCurrentUserPage] = React.useState(1);
    const usersPerPage = 7;

    const handleUserFilterChange = (key: keyof typeof userFilters, value: string) => {
        setUserFilters(prev => ({ ...prev, [key]: value }));
        setCurrentUserPage(1);
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
        <Card>
            <CardHeader>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>Manage all students and instructors on the platform.</CardDescription>
            </CardHeader>
             <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                <div className="relative flex-1 w-full">
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
                        <Button variant="outline" className="gap-1 w-full md:w-auto">
                            <ListFilter className="h-3.5 w-3.5" />
                            <span>Filter by Role</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filter by Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup value={userFilters.role} onValueChange={(value) => handleUserFilterChange('role', value)}>
                            <DropdownMenuRadioItem value="All">All Roles</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="student">Student</DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="instructor">Instructor</DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden sm:table-cell">Role</TableHead>
                        <TableHead className="hidden lg:table-cell">Subscription Plan</TableHead>
                        <TableHead className="hidden md:table-cell">Joined Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedUsers.map(user => (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border"><AvatarFallback>{user.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-xs text-muted-foreground">{user.email}</p>
                                        {user.phoneNumber && <p className="text-xs text-muted-foreground">{user.phoneNumber}</p>}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                                <Badge variant={user.role === 'instructor' ? 'secondary' : 'outline'} className="capitalize">
                                    {user.role}
                                </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                                {user.subscriptionPlan ? (
                                    <Badge variant="default" className="bg-primary/20 text-primary-foreground hover:bg-primary/30">
                                        <CreditCard className="mr-1.5 h-3 w-3"/>
                                        {user.subscriptionPlan}
                                    </Badge>
                                ) : (
                                    <span className="text-xs text-muted-foreground">N/A</span>
                                )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{user.joined}</TableCell>
                            <TableCell>
                                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                                    {user.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                 <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onUserAction(user, 'view')}>
                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => onUserAction(user, 'suspend')}><UserMinus className="mr-2 h-4 w-4"/>{user.status === 'Active' ? 'Suspend' : 'Unsuspend'}</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => onUserAction(user, 'delete')} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete User</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{(currentUserPage - 1) * usersPerPage + 1}-{Math.min(currentUserPage * usersPerPage, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users.
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentUserPage(p => p - 1)} disabled={currentUserPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentUserPage(p => p + 1)} disabled={currentUserPage >= totalUserPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                </div>
            </CardFooter>
        </Card>
    );
}

    

    