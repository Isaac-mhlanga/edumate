'use client';

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type User } from "@/app/admin/page";

type Role = 'student' | 'varsity-student' | 'instructor' | 'admin' | 'tutor';

interface ChangeRoleDialogProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    selectedUser: User | null;
    onConfirm: (newRole: Role) => void;
}

export function ChangeRoleDialog({ isOpen, setIsOpen, selectedUser, onConfirm }: ChangeRoleDialogProps) {
    const [newRole, setNewRole] = React.useState<Role | null>(null);

    React.useEffect(() => {
        if (selectedUser) {
            setNewRole(selectedUser.role as Role);
        }
    }, [selectedUser]);

    if (!selectedUser) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Change Role for {selectedUser.name}</DialogTitle>
                    <DialogDescription>
                        This will change their permissions and dashboard access.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Select onValueChange={(value: Role) => setNewRole(value)} defaultValue={newRole || undefined}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a new role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="varsity-student">Varsity Student</SelectItem>
                            <SelectItem value="instructor">Instructor</SelectItem>
                            <SelectItem value="tutor">Tutor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={() => onConfirm(newRole!)} disabled={!newRole || newRole === selectedUser.role}>
                        Confirm Change
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
