
'use client';

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { type TutorProfile } from "@/app/admin/page";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";

interface AdminTutorsTabProps {
    tutors: TutorProfile[];
    onTutorApproval: (tutor: TutorProfile, status: 'Approved' | 'Rejected') => void;
}

export function AdminTutorsTab({ tutors, onTutorApproval }: AdminTutorsTabProps) {
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);

    const handleViewDocument = (url: string) => {
        setSelectedDocumentUrl(url);
        setIsViewerOpen(true);
    };

    const getStatusBadge = (status: TutorProfile['approvalStatus']) => {
        switch (status) {
            case 'Approved':
                return <Badge variant="outline" className="bg-green-500/20 text-green-700"><CheckCircle className="mr-1 h-3 w-3"/>Approved</Badge>;
            case 'Rejected':
                return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Rejected</Badge>;
            default:
                return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3"/>Pending</Badge>;
        }
    };
    
    const isImage = selectedDocumentUrl && (selectedDocumentUrl.includes('.png') || selectedDocumentUrl.includes('.jpg') || selectedDocumentUrl.includes('.jpeg'));
    const isPdf = selectedDocumentUrl && selectedDocumentUrl.includes('.pdf');


    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Tutor Verification</CardTitle>
                    <CardDescription>Review and approve new tutor applications.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tutor</TableHead>
                                <TableHead className="hidden sm:table-cell">Qualifications</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tutors.map(tutor => (
                                <TableRow key={tutor.id}>
                                    <TableCell>
                                        <div className="font-medium">{tutor.name}</div>
                                        <div className="text-xs text-muted-foreground">{tutor.email}</div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell truncate max-w-xs">{tutor.qualifications}</TableCell>
                                    <TableCell>{getStatusBadge(tutor.approvalStatus)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            {tutor.qualificationUrl && (
                                                <Button variant="outline" size="sm" onClick={() => handleViewDocument(tutor.qualificationUrl!)}>
                                                    <Eye className="mr-1 h-3 w-3"/> View Doc
                                                </Button>
                                            )}
                                            {tutor.approvalStatus === 'Pending' && (
                                                <>
                                                    <Button variant="outline" size="sm" className="text-red-600 border-red-600/50 hover:bg-red-50" onClick={() => onTutorApproval(tutor, 'Rejected')}>
                                                        <XCircle className="mr-1 h-3 w-3"/>Reject
                                                    </Button>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => onTutorApproval(tutor, 'Approved')}>
                                                        <CheckCircle className="mr-1 h-3 w-3"/>Approve
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogContent className="max-w-4xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Qualification Document</DialogTitle>
                        <DialogDescription>Review the document provided by the tutor.</DialogDescription>
                    </DialogHeader>
                    <div className="h-full w-full border rounded-md overflow-hidden">
                        {isImage ? (
                            <div className="relative w-full h-full">
                                <Image src={selectedDocumentUrl!} alt="Tutor Qualification" layout="fill" objectFit="contain" />
                            </div>
                        ) : isPdf ? (
                            <iframe src={selectedDocumentUrl!} className="w-full h-full" title="Tutor Qualification PDF"></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p>Unsupported file type. Please open in a new tab.</p>
                                <Button asChild variant="link" className="ml-2">
                                    <a href={selectedDocumentUrl!} target="_blank" rel="noopener noreferrer">Open Document</a>
                                </Button>
                            </div>
                        )}
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewerOpen(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
