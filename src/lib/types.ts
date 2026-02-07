
import { Timestamp } from "firebase/firestore";

export type Question = {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    title: string;
    content: string;
    audience: 'High School' | 'Varsity/College';
    subject?: string;
    grade?: string;
    module?: string;
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
    createdAt: Timestamp;
    commentCount: number;
    likeCount: number;
    likedBy: string[];
    commentsDisabled?: boolean;
}

export type Comment = {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    content: string;
    createdAt: Timestamp;
    likeCount: number;
    likedBy: string[];
    parentId: string | null;
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
}

export type ThreadMessage = {
    id: string;
    senderId: string;
    content: string;
    timestamp: Timestamp;
};

export type MessageThread = {
    id: string;
    studentId: string;
    studentName: string;
    tutorId: string;
    tutorName: string;
    lastMessage: string;
    lastMessageTimestamp: Timestamp;
    isReadByTutor: boolean;
    isReadByStudent: boolean;
};

    