
import { Timestamp } from "firebase/firestore";

export type Question = {
    id: string;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    title: string;
    content: string;
    fileUrl?: string;
    fileType?: 'image' | 'pdf';
    createdAt: Timestamp;
    commentCount: number;
    likeCount: number;
    likedBy: string[];
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
}
