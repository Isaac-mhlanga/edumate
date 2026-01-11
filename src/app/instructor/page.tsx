
'use client';

import React from "react";
import withAuth from "@/components/with-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { z } from "zod";
import { InstructorOverviewTab } from "@/components/instructor/overview-tab";
import { InstructorCoursesTab } from "@/components/instructor/courses-tab";
import { InstructorQuizzesTab } from "@/components/instructor/quizzes-tab";
import { InstructorAssignmentsTab } from "@/components/instructor/assignments-tab";
import { InstructorCalendarTab } from "@/components/instructor/calendar-tab";
import { InstructorStudentsTab } from "@/components/instructor/students-tab";
import { InstructorEarningsTab } from "@/components/instructor/earnings-tab";
import { CourseDialog } from "@/components/instructor/course-dialog";
import { DeleteCourseDialog } from "@/components/instructor/delete-course-dialog";
import { AssignmentReviewDialog } from "@/components/instructor/assignment-review-dialog";
import { StudentActionDialogs } from "@/components/instructor/student-action-dialogs";
import { TransactionDialogs } from "@/components/instructor/transaction-dialogs";
import { CalendarDialogs } from "@/components/instructor/calendar-dialogs";
import { summarizeInstructorPerformance } from "@/ai/flows/summarize-instructor-performance";
import { GradeQuizOutput } from "@/ai/flows/grade-quiz";
import { format } from "date-fns";
import { EnquiriesPage } from "@/components/enquiries-page";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export type VideoData = {
    id: string;
    title: string;
    url: string;
    duration?: number; // Duration in seconds
    quizId?: string | null;
    notesUrl: string | null;
};

export type Course = {
    id: string;
    instructorId: string;
    title: string;
    description: string;
    subject: 'Mathematics' | 'Physical Sciences' | 'Life Sciences';
    paper: 'P1' | 'P2';
    grade: '10' | '11' | '12';
    thumbnail: string;
    pricing: {
        type: 'free' | 'purchase' | 'subscription';
        price?: number | null;
    };
    status: 'Draft' | 'Published' | 'Pending Approval' | 'Rejected';
    videos: VideoData[];
    createdAt: Timestamp;
};

export type Quiz = {
    id: string;
    title: string;
    subject: 'Mathematics' | 'Physical Sciences' | 'Life Sciences';
    grade: '10' | '11' | '12';
};

export type QuizSubmission = {
    quizId: string;
    result: GradeQuizOutput;
};

export type SubmittedAssignment = {
    id: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    title: string;
    course: string;
    status: 'Paid' | 'Awaiting Payment' | 'Pending Review' | 'In Progress' | 'Submitted';
    price: number | null;
    solutionUrl: string | null;
    fileUrl: string;
    instructions?: string;
    submittedAt: Timestamp;
    dueDate?: Timestamp;
    markerId?: string;
    markerName?: string;
};

export type EnrolledStudent = {
    id: string;
    name: string;
    email: string;
    course: string;
    joined: string;
    progress: number;
    transactionDate: Timestamp;
};

export type Transaction = {
    id: string;
    itemTitle: string;
    studentName?: string;
    studentId?: string;
    instructorId?: string;
    itemType: 'Course Sale' | 'Assignment Sale' | 'Subscription' | 'Refund' | 'Payout';
    status: 'Completed' | 'Pending' | 'Refunded';
    amount: number;
    createdAt: Timestamp;
    date: string; // for display
};

export type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end?: string;
  allDay: boolean;
  color?: string;
  description?: string;
};

function InstructorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = React.useState<User | null>(null);
  
  const currentTab = searchParams.get('tab') || 'overview';

  const [courses, setCourses] = React.useState<Course[]>([]);
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [quizSubmissions, setQuizSubmissions] = React.useState<QuizSubmission[]>([]);
  const [submittedAssignments, setSubmittedAssignments] = React.useState<SubmittedAssignment[]>([]);
  const [enrolledStudents, setEnrolledStudents] = React.useState<EnrolledStudent[]>([]);
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [aiSummary, setAiSummary] = React.useState('');
  const [loadingAiSummary, setLoadingAiSummary] = React.useState(true);
  const [events, setEvents] = React.useState<CalendarEvent[]>([]);


  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = React.useState(true);
  const [loadingAssignments, setLoadingAssignments] = React.useState(true);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [loadingStudents, setLoadingStudents] = React.useState(true);
  
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = React.useState<SubmittedAssignment | null>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<EnrolledStudent | null>(null);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  
  const [isCourseDialogOpen, setIsCourseDialogOpen] = React.useState(false);
  const [isSubmittingCourse, setIsSubmittingCourse] = React.useState(false);
  const [submissionProgress, setSubmissionProgress] = React.useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [isStudentDetailsDialogOpen, setIsStudentDetailsDialogOpen] = React.useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = React.useState(false);
  const [isDeleteStudentDialogOpen, setIsDeleteStudentDialogOpen] = React.useState(false);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = React.useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = React.useState(false);
  
  // Calendar State
  const [isManualDialogOpen, setIsManualDialogOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [manualEvent, setManualEvent] = React.useState<Partial<CalendarEvent>>({});
  
  const generatePerformanceSummary = React.useCallback(async (instructor: User, courses: Course[], students: EnrolledStudent[], assignments: SubmittedAssignment[], transactions: Transaction[]) => {
    if (!instructor) return;
    setLoadingAiSummary(true);
    try {
        const response = await summarizeInstructorPerformance({
            instructorName: instructor.displayName || 'Instructor',
            totalStudents: students.length,
            totalCourses: courses.length,
            totalEarnings: transactions.filter(t => (t.itemType === 'Course Sale' || t.itemType === 'Assignment Sale') && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0),
            pendingAssignments: assignments.filter(a => a.status === 'Pending Review').length,
            courseTitles: courses.map(c => c.title)
        });
        setAiSummary(response.summary);
    } catch (error) {
        console.error("Error generating AI summary: ", error);
        setAiSummary("Could not generate performance summary at this time.");
    } finally {
        setLoadingAiSummary(false);
    }
  }, []);

  React.useEffect(() => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    const fetchAllData = async (currentUser: User) => {
      setLoadingCourses(true);
      setLoadingQuizzes(true);
      setLoadingAssignments(true);
      setLoadingTransactions(true);
      setLoadingStudents(true);
      setLoadingAiSummary(true);

      try {
        const eventsSnapshot = await getDocs(collection(firestore, "events"));
        const fetchedEvents = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarEvent));
        setEvents(fetchedEvents);

        const coursesQuery = query(collection(firestore, 'courses'), where('instructorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const coursesSnapshot = await getDocs(coursesQuery);
        const fetchedCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
        setCourses(fetchedCourses);

        const quizzesQuery = query(collection(firestore, 'quizzes'), where('instructorId', '==', currentUser.uid));
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const fetchedQuizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quiz[];
        setQuizzes(fetchedQuizzes);
        setLoadingQuizzes(false);
        
        const quizIds = fetchedQuizzes.map(q => q.id);
        if (quizIds.length > 0) {
            const quizSubmissionsQuery = query(collection(firestore, 'quizSubmissions'), where('quizId', 'in', quizIds));
            const quizSubmissionsSnapshot = await getDocs(quizSubmissionsQuery);
            const fetchedSubmissions = quizSubmissionsSnapshot.docs.map(doc => doc.data()) as QuizSubmission[];
            setQuizSubmissions(fetchedSubmissions);
        } else {
             setQuizSubmissions([]);
        }

        const assignmentsQuery = query(
            collection(firestore, 'assignments'), 
            where('status', 'in', ['Pending Review', 'In Progress']), 
            orderBy('submittedAt', 'desc')
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const fetchedAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubmittedAssignment[];
        setSubmittedAssignments(fetchedAssignments);
        setLoadingAssignments(false);
        
        const transactionsQuery = query(collection(firestore, 'transactions'), where('instructorId', '==', currentUser.uid));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const fetchedTransactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, date: data.createdAt ? format(data.createdAt.toDate(), 'PPP') : 'N/A' } as Transaction;
        });
        setTransactions(fetchedTransactions);

        const studentMap = new Map<string, EnrolledStudent>();
        fetchedTransactions.filter(t => t.itemType === 'Course Sale' || t.itemType === 'Subscription').forEach(t => {
            if (t.studentId && !studentMap.has(t.studentId)) {
                  studentMap.set(t.studentId, {
                    id: t.studentId,
                    name: t.studentName || 'Unknown Student',
                    email: 'unknown@example.com',
                    course: t.itemTitle,
                    joined: t.date,
                    progress: Math.floor(Math.random() * 100), 
                    transactionDate: t.createdAt
                });
            }
        });
        const fetchedStudents = Array.from(studentMap.values()).sort((a,b) => b.transactionDate.toMillis() - a.transactionDate.toMillis());
        setEnrolledStudents(fetchedStudents);

        setLoadingCourses(false);
        setLoadingTransactions(false);
        setLoadingStudents(false);

        await generatePerformanceSummary(currentUser, fetchedCourses, fetchedStudents, fetchedAssignments, fetchedTransactions);

      } catch (error) {
        console.error("Error fetching instructor data: ", error);
        toast({ variant: "destructive", title: "Error", description: "Could not fetch your dashboard data." });
        setLoadingCourses(false);
        setLoadingQuizzes(false);
        setLoadingAssignments(false);
        setLoadingTransactions(false);
        setLoadingStudents(false);
        setLoadingAiSummary(false);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchAllData(currentUser);
      } else {
        setUser(null);
        setCourses([]);
        setQuizzes([]);
        setQuizSubmissions([]);
        setSubmittedAssignments([]);
        setEnrolledStudents([]);
        setTransactions([]);
        setLoadingCourses(false);
        setLoadingQuizzes(false);
        setLoadingAssignments(false);
        setLoadingTransactions(false);
        setLoadingStudents(false);
        setLoadingAiSummary(false);
      }
    });

    return () => unsubscribe();
  }, [toast, generatePerformanceSummary]);

  const handleCourseDialogOpenChange = (open: boolean) => {
    setIsCourseDialogOpen(open);
    if (!open) {
      setSelectedCourse(null);
    }
  };

  const handleReviewDialogOpenChange = (open: boolean) => {
    setIsReviewDialogOpen(open);
    if (!open) {
      setSelectedAssignment(null);
    }
  }

  const handleAddNewCourse = () => {
    setSelectedCourse(null);
    setIsCourseDialogOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsCourseDialogOpen(true);
  };

  const handleDeleteCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setIsDeleteDialogOpen(true);
  };

  const handleReviewAssignment = (assignment: SubmittedAssignment) => {
      setSelectedAssignment(assignment);
      setIsReviewDialogOpen(true);
  };
  
  const handleAcceptAssignment = async (assignment: SubmittedAssignment) => {
    if (!user) return;

    if (assignment.status === 'Pending Review') {
        const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const assignmentRef = doc(firestore, 'assignments', assignment.id);
        try {
            await updateDoc(assignmentRef, {
                status: 'In Progress',
                markerId: user.uid,
                markerName: user.displayName
            });
            const updatedAssignment = { ...assignment, status: 'In Progress' as const, markerId: user.uid, markerName: user.displayName || 'Instructor' };
            setSubmittedAssignments(prev =>
                prev.map(a =>
                    a.id === assignment.id ? updatedAssignment : a
                )
            );
            setSelectedAssignment(updatedAssignment);
            toast({ title: 'Assignment Accepted', description: 'You can now work on the solution.' });
            setIsReviewDialogOpen(false); 
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not accept assignment. It might have been taken by another instructor.' });
        }
    } else {
        toast({ variant: 'destructive', title: 'Assignment Unavailable', description: `This assignment is no longer pending review.` });
    }
  };
  
  const confirmDeleteCourse = async () => {
    if (!selectedCourse) return;

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);
    const courseRef = doc(firestore, "courses", selectedCourse.id);

    try {
        const videoPromises = selectedCourse.videos.map(video => {
            try {
                if (!video.url.includes('youtube.com')) {
                    const videoFileRef = ref(storage, video.url);
                    return deleteObject(videoFileRef);
                }
                return Promise.resolve();
            } catch (e) {
                console.error("Could not delete video file:", video.url, e);
                return Promise.resolve();
            }
        });
        
        try {
            const thumbnailRef = ref(storage, selectedCourse.thumbnail);
            await deleteObject(thumbnailRef);
        } catch (e) {
            console.error("Could not delete thumbnail file:", selectedCourse.thumbnail, e);
        }
        
        await Promise.all(videoPromises);
        await deleteDoc(courseRef);

        setCourses(courses.filter(c => c.id !== selectedCourse.id));
        toast({
          title: "Course Deleted",
          description: `The course "${selectedCourse.title}" and its files have been deleted.`,
        });
    } catch (error) {
        console.error("Error deleting course: ", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to delete course." });
    } finally {
        setIsDeleteDialogOpen(false);
        setSelectedCourse(null);
    }
  };

  const handlePublishCourse = async (course: Course) => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const courseRef = doc(firestore, 'courses', course.id);

    try {
        await updateDoc(courseRef, { status: 'Published' });
        setCourses(courses.map(c => c.id === course.id ? { ...c, status: 'Published' } : c));
        toast({ title: "Course Published!", description: `"${course.title}" is now live.` });
    } catch (error) {
        console.error("Error publishing course: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to publish course.' });
    }
  };

  const handleUnpublishCourse = async (course: Course) => {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const courseRef = doc(firestore, 'courses', course.id);

    try {
        await updateDoc(courseRef, { status: 'Draft' });
        setCourses(courses.map(c => c.id === course.id ? { ...c, status: 'Draft' } : c));
        toast({ title: "Course Unpublished", description: `"${course.title}" is now a draft.` });
    } catch (error) {
        console.error("Error unpublishing course: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to unpublish course.' });
    }
  };

  const onCourseSubmit = async (data: any) => {
    if (!user) return;
    setIsSubmittingCourse(true);
    setSubmissionProgress(0);

    const { videoUploads, existingVideos, originalVideos, ...courseDetails } = data;
    
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    try {
        // Handle thumbnail
        let thumbnailUrl = selectedCourse?.thumbnail || '';
        if (courseDetails.thumbnail instanceof File) {
            setSubmissionProgress(5);
            const thumbnailRef = ref(storage, `courses/${user.uid}/thumbnails/${Date.now()}-${courseDetails.thumbnail.name}`);
            await uploadBytes(thumbnailRef, courseDetails.thumbnail);
            thumbnailUrl = await getDownloadURL(thumbnailRef);
            setSubmissionProgress(10);
        } else if (!selectedCourse) {
            thumbnailUrl = `https://picsum.photos/seed/${Math.random()}/600/400`;
        }

        const newVideos: VideoData[] = [];
        const videosToProcess = [...(existingVideos || []), ...(videoUploads || [])];
        const totalFilesToProcess = videosToProcess.length + (originalVideos?.length || 0);
        let filesProcessed = 0;
        
        const updateProgress = () => {
            filesProcessed++;
            setSubmissionProgress(10 + Math.round((filesProcessed / totalFilesToProcess) * 80));
        };
        
        // Handle deletions and replacements
        if (originalVideos) {
            const existingVideoIds = new Set(existingVideos.map((v: any) => v.id));
            for (const originalVideo of originalVideos) {
                if (!existingVideoIds.has(originalVideo.id)) {
                    // Video was deleted
                    if (!originalVideo.url.includes('youtube.com')) {
                        await deleteObject(ref(storage, originalVideo.url));
                    }
                }
                updateProgress();
            }
        }
        
        // Handle new and existing videos
        const processedExistingVideos = [];
        for (const video of existingVideos) {
             let videoUrl = video.url || '';
            let notesUrl = video.notesUrl || null;
            let duration = video.duration || 0;

            if (video.newVideoFile instanceof File) {
                 if (video.url && !video.url.includes('youtube.com')) {
                    await deleteObject(ref(storage, video.url));
                }
                const newVideoRef = ref(storage, `courses/${user.uid}/videos/${Date.now()}-${video.newVideoFile.name}`);
                await uploadBytes(newVideoRef, video.newVideoFile);
                videoUrl = await getDownloadURL(newVideoRef);
                duration = video.newVideoDuration;
            } else if (video.newYoutubeUrl) {
                if (video.url && !video.url.includes('youtube.com')) {
                   await deleteObject(ref(storage, video.url));
                }
                videoUrl = video.newYoutubeUrl.replace("watch?v=", "embed/");
            }

            if (video.notesFile instanceof File) {
                 if (video.notesUrl) { // Delete old notes if they exist
                    await deleteObject(ref(storage, video.notesUrl));
                 }
                const notesRef = ref(storage, `courses/${user.uid}/notes/${Date.now()}-${video.notesFile.name}`);
                await uploadBytes(notesRef, video.notesFile);
                notesUrl = await getDownloadURL(notesRef);
            }

            processedExistingVideos.push({
                id: video.id,
                title: video.title,
                url: videoUrl,
                duration,
                notesUrl,
                quizId: video.quizId === 'none' ? null : video.quizId || null,
            });
            updateProgress();
        }

        for (const video of (videoUploads || [])) {
             let videoUrl = video.url || '';
            let notesUrl = video.notesUrl || null;
            let duration = video.duration || 0;

            if (video.file instanceof File) {
                const videoRef = ref(storage, `courses/${user.uid}/videos/${Date.now()}-${video.file.name}`);
                await uploadBytes(videoRef, video.file);
                videoUrl = await getDownloadURL(videoRef);
                duration = video.fileDuration;
            } else if (video.youtubeUrl) {
                videoUrl = video.youtubeUrl.replace("watch?v=", "embed/");
            }

            if (videoUrl) {
                 newVideos.push({
                    id: `vid_${Date.now()}_${Math.random()}`,
                    title: video.title,
                    url: videoUrl,
                    duration,
                    notesUrl,
                    quizId: video.quizId === 'none' ? null : video.quizId || null,
                });
            }
            updateProgress();
        }
        
        const finalVideos = [...processedExistingVideos, ...newVideos];

        const finalCourseData = {
            ...courseDetails,
            pricing: {
                type: courseDetails.pricingModel,
                price: courseDetails.price || null,
            },
            thumbnail: thumbnailUrl,
            videos: finalVideos,
        };
        delete finalCourseData.pricingModel;

        if (selectedCourse) {
            const courseRef = doc(firestore, 'courses', selectedCourse.id);
            await updateDoc(courseRef, finalCourseData);
            toast({ title: "Course Updated!" });
            setCourses(prevCourses => prevCourses.map(c => c.id === selectedCourse.id ? { ...c, ...finalCourseData } as Course : c));
        } else {
            const coursePayload = {
                ...finalCourseData,
                instructorId: user.uid,
                status: 'Draft' as const,
                createdAt: serverTimestamp(),
            };
            const newDocRef = await addDoc(collection(firestore, 'courses'), coursePayload);
            toast({ title: "Course Created!" });
            setCourses(prevCourses => [{ ...coursePayload, id: newDocRef.id, createdAt: Timestamp.now() }, ...prevCourses]);
        }
        setSubmissionProgress(100);

    } catch (error) {
       console.error("Error saving course:", error);
       toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the course.'});
    } finally {
        setTimeout(() => {
            setIsSubmittingCourse(false);
            setIsCourseDialogOpen(false);
        }, 500);
    }
  }


  async function handleSaveSolution(assignmentId: string, price: number) {
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const assignmentRef = doc(firestore, 'assignments', assignmentId);

    try {
        await updateDoc(assignmentRef, {
            price: price,
            status: 'Awaiting Payment'
        });
        
        setSubmittedAssignments(assignments => assignments.map(a => 
            a.id === assignmentId ? { ...a, status: 'Awaiting Payment', price: price } : a
        ));

        toast({
            title: "Solution Uploaded!",
            description: `The solution has been priced and is now awaiting student payment.`
        });
        handleReviewDialogOpenChange(false);
    } catch (error) {
        console.error("Error updating assignment: ", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save the solution price. Please try again."
        });
    }
  }

  const handleStudentAction = (student: EnrolledStudent, action: 'view' | 'unenroll' | 'delete') => {
    setSelectedStudent(student);
    if (action === 'view') setIsStudentDetailsDialogOpen(true);
    if (action === 'unenroll') setIsUnenrollDialogOpen(true);
    if (action === 'delete') setIsDeleteStudentDialogOpen(true);
  };
  
  const confirmUnenrollStudent = () => {
    if (!selectedStudent) return;
    setEnrolledStudents(enrolledStudents.filter(s => s.id !== selectedStudent.id));
    toast({ title: "Student Unenrolled", description: `${selectedStudent.name} has been unenrolled.` });
    setIsUnenrollDialogOpen(false);
    setSelectedStudent(null);
  };
  
  const confirmDeleteStudent = () => {
    if (!selectedStudent) return;
    setEnrolledStudents(enrolledStudents.filter(s => s.id !== selectedStudent.id));
    toast({ title: "Student Deleted", description: `${selectedStudent.name}'s profile has been deleted.`, variant: "destructive" });
    setIsDeleteStudentDialogOpen(false);
    setSelectedStudent(null);
  };

  const handleTransactionAction = (transaction: Transaction, action: 'view' | 'refund') => {
    setSelectedTransaction(transaction);
    if (action === 'view') setIsTransactionDetailsOpen(true);
    if (action === 'refund') setIsRefundDialogOpen(true);
  };

  const confirmRefundTransaction = () => {
    if (!selectedTransaction) return;
    setTransactions(transactions.map(t => t.id === selectedTransaction.id ? { ...t, status: 'Refunded', amount: -Math.abs(t.amount) } : t));
    toast({ title: "Refund Processed", description: `Transaction ${selectedTransaction.id} has been refunded.` });
    setIsRefundDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handlePayoutRequest = async (amount: number) => {
    if (!user || amount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Payout amount must be greater than zero.'});
        return;
    }

    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    try {
        await addDoc(collection(firestore, 'payouts'), {
            instructorId: user.uid,
            instructor: user.displayName || 'Unnamed Instructor',
            amount: -Math.abs(amount), // Store as a negative value
            status: 'Pending',
            requestedAt: serverTimestamp()
        });
        toast({ title: "Payout Requested", description: `Your request to withdraw R ${amount.toFixed(2)} has been submitted.` });
        setIsPayoutDialogOpen(false);
    } catch (error) {
        console.error("Error requesting payout: ", error);
        toast({ variant: 'destructive', title: 'Request Failed', description: 'Could not submit your payout request.' });
    }
  };

  const handleDateClick = (arg: any) => {
      setManualEvent({ start: arg.dateStr, allDay: arg.allDay });
      setIsManualDialogOpen(true);
  };
  
  const handleEventClick = (clickInfo: any) => {
      const event = clickInfo.event;
      setSelectedEvent({
          id: event.id,
          title: event.title,
          start: event.startStr,
          end: event.endStr,
          allDay: event.allDay,
          description: event.extendedProps.description,
          color: event.backgroundColor,
      });
      setIsDetailDialogOpen(true);
  };
  
  const handleAddManualEvent = () => {
      if (!manualEvent.title || !manualEvent.start) {
          toast({ variant: 'destructive', title: 'Error', description: 'Event title and start date are required.' });
          return;
      }
      const newEvent = { ...manualEvent, id: String(Date.now()) } as CalendarEvent
      setEvents([...events, newEvent]);
      toast({ title: 'Event Created!', description: `"${newEvent.title}" has been added.` });
      setIsManualDialogOpen(false);
      setManualEvent({});
  };

  return (
    <div className="space-y-8">
      <style jsx global>{`
        .fc {
          font-family: var(--font-body), sans-serif;
          color: hsl(var(--foreground));
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: hsl(var(--foreground));
        }
        .fc .fc-button {
          background-color: hsl(var(--card)) !important;
          border-color: hsl(var(--border)) !important;
          color: hsl(var(--card-foreground)) !important;
          box-shadow: none !important;
          text-transform: capitalize;
        }
          .fc .fc-button:hover {
          background-color: hsl(var(--muted)) !important;
          }
        .fc .fc-button-primary:not(:disabled).fc-button-active, 
        .fc .fc-button-primary:not(:disabled):active {
          background-color: hsl(var(--primary)) !important;
          border-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
        }
        .fc-daygrid-day.fc-day-today {
          background-color: hsla(var(--primary), 0.05) !important;
        }
        .fc-event {
          border-radius: 4px;
          border: 0;
          padding: 4px 6px;
          cursor: pointer;
        }
        .fc-theme-standard .fc-list-day-cushion, .fc-theme-standard th {
          background-color: hsl(var(--card));
        }
        .fc .fc-list-event:hover td {
          background-color: hsl(var(--muted)) !important;
        }
        .fc-col-header-cell-cushion, .fc-list-day-text, .fc-list-day-side-text {
            color: hsl(var(--foreground)) !important;
        }
      `}</style>

      {currentTab === 'overview' && (
        <InstructorOverviewTab 
          user={user}
          courses={courses}
          students={enrolledStudents}
          assignments={submittedAssignments}
          transactions={transactions}
          aiSummary={aiSummary}
          loading={{
            courses: loadingCourses,
            students: loadingStudents,
            assignments: loadingAssignments,
            transactions: loadingTransactions,
            aiSummary: loadingAiSummary
          }}
          onRegenerateSummary={() => user && generatePerformanceSummary(user, courses, enrolledStudents, submittedAssignments, transactions)}
          onReviewAssignment={handleReviewAssignment}
        />
      )}

      {currentTab === 'courses' && (
        <InstructorCoursesTab
          courses={courses}
          loading={loadingCourses}
          onAddNewCourse={handleAddNewCourse}
          onEditCourse={handleEditCourse}
          onDeleteCourse={handleDeleteCourseClick}
          onPublishCourse={handlePublishCourse}
          onUnpublishCourse={handleUnpublishCourse}
        />
      )}

      {currentTab === 'quizzes' && (
        <InstructorQuizzesTab
          quizzes={quizzes}
          quizSubmissions={quizSubmissions}
          loading={loadingQuizzes}
        />
      )}
      
      {currentTab === 'enquiries' && (
        <EnquiriesPage userRole="instructor" />
      )}

      {currentTab === 'calendar' && (
        <InstructorCalendarTab 
          events={events}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onAddEventClick={() => {
             toast({ title: "Action not available", description: "Please go to the admin dashboard to create new events." });
          }}
        />
      )}

      {currentTab === 'assignments' && (
        <InstructorAssignmentsTab
          assignments={submittedAssignments}
          loading={loadingAssignments}
          onReviewAssignment={handleReviewAssignment}
          user={user}
        />
      )}

      {currentTab === 'students' && (
        <InstructorStudentsTab
          students={enrolledStudents}
          loading={loadingStudents}
          onStudentAction={handleStudentAction}
        />
      )}

      {currentTab === 'earnings' && (
        <InstructorEarningsTab
          transactions={transactions}
          loading={loadingTransactions}
          onTransactionAction={handleTransactionAction}
          onPayoutRequest={() => setIsPayoutDialogOpen(true)}
        />
      )}

      <CourseDialog
        isOpen={isCourseDialogOpen}
        setIsOpen={handleCourseDialogOpenChange}
        selectedCourse={selectedCourse}
        quizzes={quizzes}
        onSubmit={onCourseSubmit}
        isSubmitting={isSubmittingCourse}
        submissionProgress={submissionProgress}
      />
    
      <DeleteCourseDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        selectedCourse={selectedCourse}
        onConfirm={confirmDeleteCourse}
      />

      <AssignmentReviewDialog
        isOpen={isReviewDialogOpen}
        setIsOpen={handleReviewDialogOpenChange}
        selectedAssignment={selectedAssignment}
        onAcceptAssignment={handleAcceptAssignment}
        onSaveSolution={handleSaveSolution}
        user={user}
      />
      
      <StudentActionDialogs
        isDetailsOpen={isStudentDetailsDialogOpen}
        setIsDetailsOpen={setIsStudentDetailsDialogOpen}
        isUnenrollOpen={isUnenrollDialogOpen}
        setIsUnenrollOpen={setIsUnenrollDialogOpen}
        isDeleteOpen={isDeleteStudentDialogOpen}
        setIsDeleteOpen={setIsDeleteStudentDialogOpen}
        selectedStudent={selectedStudent}
        onConfirmUnenroll={confirmUnenrollStudent}
        onConfirmDelete={confirmDeleteStudent}
      />

      <TransactionDialogs
        isDetailsOpen={isTransactionDetailsOpen}
        setIsDetailsOpen={setIsTransactionDetailsOpen}
        isRefundOpen={isRefundDialogOpen}
        setIsRefundOpen={setIsRefundDialogOpen}
        isPayoutOpen={isPayoutDialogOpen}
        setIsPayoutOpen={setIsPayoutDialogOpen}
        selectedTransaction={selectedTransaction}
        onConfirmRefund={confirmRefundTransaction}
        onPayoutRequest={handlePayoutRequest}
        availableForPayout={transactions.reduce((acc, t) => acc + t.amount, 0)}
      />
      
      <CalendarDialogs
        isManualDialogOpen={isManualDialogOpen}
        setIsManualDialogOpen={setIsManualDialogOpen}
        isDetailDialogOpen={isDetailDialogOpen}
        setIsDetailDialogOpen={setIsDetailDialogOpen}
        selectedEvent={selectedEvent}
        manualEvent={manualEvent}
        setManualEvent={setManualEvent}
        onManualCreate={handleAddManualEvent}
      />
    </div>
  );
}

export default withAuth(InstructorPage, ['instructor']);
