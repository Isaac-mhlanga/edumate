'use client';

import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, onSnapshot, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, type User } from 'firebase/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Eye, CheckCircle, Clock, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

type Enquiry = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    enquiry: string;
    fileUrl?: string;
    status: 'New' | 'In Progress' | 'Completed';
    assigneeId: string | null;
    assigneeName: string | null;
    createdAt: Timestamp;
};

interface EnquiriesPageProps {
    userRole: 'admin' | 'instructor' | 'tutor';
}

export function EnquiriesPage({ userRole }: EnquiriesPageProps) {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const app = getApps().length > 0 ? getApp() : initializeApp({});
        const auth = getAuth(app);
        const firestore = getFirestore(app);

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        
        const q = query(collection(firestore, 'enquiries'), orderBy('createdAt', 'desc'));
        const unsubscribeEnquiries = onSnapshot(q, (querySnapshot) => {
            const fetchedEnquiries: Enquiry[] = [];
            querySnapshot.forEach((doc) => {
                fetchedEnquiries.push({ id: doc.id, ...doc.data() } as Enquiry);
            });
            setEnquiries(fetchedEnquiries);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching enquiries:", error);
            setLoading(false);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load enquiries.' });
        });

        return () => {
            unsubscribeAuth();
            unsubscribeEnquiries();
        };
    }, [toast]);

    const handleViewEnquiry = (enquiry: Enquiry) => {
        setSelectedEnquiry(enquiry);
        setIsDialogOpen(true);
    };

    const handleAssign = async (enquiry: Enquiry) => {
        if (!user) return;
        const firestore = getFirestore();
        const enquiryRef = doc(firestore, 'enquiries', enquiry.id);
        try {
            await updateDoc(enquiryRef, {
                status: 'In Progress',
                assigneeId: user.uid,
                assigneeName: user.displayName,
            });
            toast({ title: 'Enquiry Assigned', description: `You have been assigned to "${enquiry.name}'s" enquiry.`});
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error assigning enquiry:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not assign the enquiry.' });
        }
    };
    
    const handleComplete = async (enquiry: Enquiry) => {
        if (!user) return;
        const firestore = getFirestore();
        const enquiryRef = doc(firestore, 'enquiries', enquiry.id);
        try {
            await updateDoc(enquiryRef, {
                status: 'Completed',
            });
            toast({ title: 'Enquiry Completed', description: 'The enquiry has been marked as complete.' });
            setIsDialogOpen(false);
        } catch (error) {
            console.error("Error completing enquiry:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not complete the enquiry.' });
        }
    };

    const getStatusBadge = (status: Enquiry['status']) => {
        switch (status) {
            case 'New': return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3"/>New</Badge>;
            case 'In Progress': return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-700"><Clock className="mr-1 h-3 w-3"/>In Progress</Badge>;
            case 'Completed': return <Badge variant="outline" className="bg-green-500/20 text-green-700"><CheckCircle className="mr-1 h-3 w-3"/>Completed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Varsity & College Enquiries</CardTitle>
                    <CardDescription>View and manage incoming project and assignment enquiries.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>From</TableHead>
                                <TableHead className="hidden sm:table-cell">Received</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="hidden md:table-cell">Assigned To</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : enquiries.length > 0 ? (
                                enquiries.map((enquiry) => (
                                    <TableRow key={enquiry.id}>
                                        <TableCell>
                                            <div className="font-medium">{enquiry.name}</div>
                                            <div className="text-xs text-muted-foreground">{enquiry.email}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{formatDistanceToNow(enquiry.createdAt.toDate(), { addSuffix: true })}</TableCell>
                                        <TableCell>{getStatusBadge(enquiry.status)}</TableCell>
                                        <TableCell className="hidden md:table-cell">{enquiry.assigneeName || 'Unassigned'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleViewEnquiry(enquiry)}>
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No enquiries found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Enquiry from {selectedEnquiry?.name}</DialogTitle>
                        <DialogDescription>
                            Received {selectedEnquiry ? formatDistanceToNow(selectedEnquiry.createdAt.toDate(), { addSuffix: true }) : ''}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEnquiry && (
                        <div className="py-4 space-y-4 text-sm max-h-[60vh] overflow-y-auto pr-2">
                             <p className="whitespace-pre-wrap bg-muted p-4 rounded-md">{selectedEnquiry.enquiry}</p>
                             <div className="space-y-1">
                                <p><span className="font-semibold">Email:</span> <a href={`mailto:${selectedEnquiry.email}`} className="text-primary hover:underline">{selectedEnquiry.email}</a></p>
                                {selectedEnquiry.phone && <p><span className="font-semibold">Phone:</span> {selectedEnquiry.phone}</p>}
                            </div>
                            {selectedEnquiry.fileUrl && (
                                <Button asChild variant="outline">
                                    <a href={selectedEnquiry.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="mr-2 h-4 w-4" /> View Attachment
                                    </a>
                                </Button>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        {selectedEnquiry?.status === 'New' && (
                            <Button onClick={() => handleAssign(selectedEnquiry!)}>
                                Assign to Me
                            </Button>
                        )}
                        {selectedEnquiry?.status === 'In Progress' && selectedEnquiry.assigneeId === user?.uid && (
                             <Button onClick={() => handleComplete(selectedEnquiry!)}>
                                Mark as Complete
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
