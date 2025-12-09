
'use client';

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, CheckCircle, XCircle, Clock, MoreVertical } from "lucide-react";
import { type TutorProfile } from "@/app/admin/page";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Separator } from "../ui/separator";

interface AdminTutorsTabProps {
    tutors: TutorProfile[];
    onTutorApproval: (tutor: TutorProfile, status: 'Approved' | 'Rejected') => void;
    onViewProfile: (tutor: TutorProfile) => void;
}

export function AdminTutorsTab({ tutors, onTutorApproval, onViewProfile }: AdminTutorsTabProps) {
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
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onViewProfile(tutor)}>
                                                    <Eye className="mr-2 h-4 w-4" /> View Profile
                                                </DropdownMenuItem>
                                                {tutor.qualificationUrl && (
                                                    <DropdownMenuItem onClick={() => handleViewDocument(tutor.qualificationUrl!)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Document
                                                    </DropdownMenuItem>
                                                )}
                                                {tutor.approvalStatus === 'Pending' && (
                                                    <>
                                                        <Separator />
                                                        <DropdownMenuItem onClick={() => onTutorApproval(tutor, 'Approved')} className="text-green-600 focus:text-green-700 focus:bg-green-100">
                                                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => onTutorApproval(tutor, 'Rejected')} className="text-red-600 focus:text-red-700 focus:bg-red-100">
                                                            <XCircle className="mr-2 h-4 w-4" /> Reject
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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


interface TutorProfileDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  tutor: TutorProfile | null;
}

export function TutorProfileDialog({ isOpen, setIsOpen, tutor }: TutorProfileDialogProps) {
  if (!tutor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tutor Profile: {tutor.name}</DialogTitle>
          <DialogDescription>
            A complete overview of the tutor's profile details.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-4">
            <div className="flex items-start gap-4">
                <Avatar className="w-20 h-20 border">
                    <AvatarImage src={tutor.avatar} alt={tutor.name} />
                    <AvatarFallback>{tutor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <p className="font-semibold">{tutor.name}</p>
                    <p className="text-sm text-muted-foreground">{tutor.email}</p>
                    <p className="text-sm text-muted-foreground">{tutor.location}</p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">R{tutor.hourlyRate}<span className="text-sm font-normal text-muted-foreground">/hr</span></p>
                </div>
            </div>

            <Separator />
            
            <div>
                <h4 className="font-semibold text-sm mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{tutor.bio}</p>
            </div>
            
            <div>
                <h4 className="font-semibold text-sm mb-2">Expertise</h4>
                <div className="flex flex-wrap gap-2">
                    {tutor.subjects.map(s => <Badge key={s} variant="secondary">{s}</Badge>)}
                    {tutor.grades.map(g => <Badge key={g} variant="outline">Grade {g}</Badge>)}
                    {tutor.modes.map(m => <Badge key={m} variant="outline">{m}</Badge>)}
                </div>
            </div>

            <div>
                <h4 className="font-semibold text-sm mb-2">Availability</h4>
                <div className="space-y-1">
                    {tutor.availability.filter(d => d.slots.length > 0).map(day => (
                        <div key={day.day} className="flex items-start gap-4 text-sm">
                            <span className="font-medium w-20 shrink-0">{day.day}</span>
                            <div className="flex flex-wrap gap-1.5">
                                {day.slots.map(slot => (
                                    <Badge key={slot} variant="outline" className="font-mono">{slot}</Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}