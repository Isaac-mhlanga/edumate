
'use client';

import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { type TutorProfile } from "@/app/admin/page";

interface AdminTutorsTabProps {
    tutors: TutorProfile[];
    onTutorApproval: (tutor: TutorProfile, status: 'Approved' | 'Rejected') => void;
}

export function AdminTutorsTab({ tutors, onTutorApproval }: AdminTutorsTabProps) {

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

    return (
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
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={tutor.qualificationUrl} target="_blank" rel="noopener noreferrer">
                                                <Eye className="mr-1 h-3 w-3"/> View Doc
                                            </a>
                                        </Button>
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
    );
}

    