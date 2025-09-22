
'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { instructorData } from "@/lib/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Banknote, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, CircleDollarSign, Clock, DollarSign, Edit, Eye, GraduationCap, Hourglass, ListFilter, MoreVertical, PlusCircle, ReceiptText, Search, ShieldCheck, Trash2, Undo2, UploadCloud, UserMinus, Users, Video, XCircle, Download, FileUp, FileQuestion, Send, Check, Sparkles, RefreshCw, Calendar, Save, Wand2, Lightbulb, Image as ImageIcon, BookOpen, Printer } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useReactToPrint } from "react-to-print";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import withAuth from "@/components/with-auth";
import { getApp, getApps, initializeApp, FirebaseError } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, Timestamp, doc, updateDoc, writeBatch, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { GradeQuizOutput } from "@/ai/flows/grade-quiz";
import { summarizeInstructorPerformance } from "@/ai/flows/summarize-instructor-performance";
import { solveQuestionPaper, type SolveQuestionPaperOutput } from "@/ai/flows/solve-question-paper";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { clarifyQuestion } from "@/ai/flows/clarify-question";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};


const chartConfig = {
  engagement: { label: "Engagement", color: "hsl(var(--primary))" },
  income: { label: "Income (R)", color: "hsl(var(--secondary))" }
} satisfies ChartConfig;

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.enum(["Maths", "Physical Sciences", "Life Sciences"]),
  grade: z.enum(["10", "11", "12"]),
  pricingModel: z.enum(["free", "purchase", "subscription"]),
  price: z.coerce.number().optional(),
  thumbnail: z.instanceof(File).optional(),
}).refine(data => {
    if (data.pricingModel === 'purchase') {
        return data.price !== undefined && data.price > 0;
    }
    return true;
}, {
    message: "Price is required for one-time purchase",
    path: ["price"],
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

type VideoData = {
    id: string;
    title: string;
    url: string;
    quizId?: string;
};

type Course = {
    id: string;
    instructorId: string;
    title: string;
    description: string;
    subject: 'Maths' | 'Physical Sciences' | 'Life Sciences';
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

type Quiz = {
    id: string;
    title: string;
    subject: 'Maths' | 'Physical Sciences' | 'Life Sciences';
    grade: '10' | '11' | '12';
};

type QuizSubmission = {
    quizId: string;
    result: GradeQuizOutput;
};

type SubmittedAssignment = {
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

type EnrolledStudent = {
    id: string;
    name: string;
    email: string;
    course: string;
    joined: string;
    progress: number;
    transactionDate: Timestamp;
};

type Transaction = {
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

type VideoUpload = {
    title: string;
    file: File | null;
    fileName: string;
    quizId?: string;
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
  const [videoUploads, setVideoUploads] = React.useState<VideoUpload[]>([]);
  const [aiSummary, setAiSummary] = React.useState('');
  const [loadingAiSummary, setLoadingAiSummary] = React.useState(true);

  // AI Solution Generator State
  const [questionPaper, setQuestionPaper] = React.useState<File | null>(null);
  const [isSolving, setIsSolving] = React.useState(false);
  const [aiSolution, setAiSolution] = React.useState<SolveQuestionPaperOutput | null>(null);
  const solutionPrintRef = React.useRef(null);

  const handlePrint = useReactToPrint({
      content: () => solutionPrintRef.current,
      documentTitle: `solutions-${questionPaper?.name.replace(/\.[^/.]+$/, "") || 'paper'}`
  });


  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = React.useState(true);
  const [loadingAssignments, setLoadingAssignments] = React.useState(true);
  const [loadingTransactions, setLoadingTransactions] = React.useState(true);
  const [loadingStudents, setLoadingStudents] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = React.useState<SubmittedAssignment | null>(null);
  const [selectedStudent, setSelectedStudent] = React.useState<EnrolledStudent | null>(null);
  const [selectedTransaction, setSelectedTransaction] = React.useState<Transaction | null>(null);
  
  const [isCourseDialogOpen, setIsCourseDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);
  const [isStudentDetailsDialogOpen, setIsStudentDetailsDialogOpen] = React.useState(false);
  const [isUnenrollDialogOpen, setIsUnenrollDialogOpen] = React.useState(false);
  const [isDeleteStudentDialogOpen, setIsDeleteStudentDialogOpen] = React.useState(false);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = React.useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = React.useState(false);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = React.useState(false);


  // State for courses filtering and pagination
  const [courseFilters, setCourseFilters] = React.useState({ search: '', status: 'All' });
  const [currentCoursePage, setCurrentCoursePage] = React.useState(1);
  const coursesPerPage = 6;
  
  // State for quizzes filtering and pagination
  const [quizFilters, setQuizFilters] = React.useState({ search: '', subject: 'All', grade: 'All' });
  const [currentQuizPage, setCurrentQuizPage] = React.useState(1);
  const quizzesPerPage = 10;
  
  // State for assignments filtering and pagination
  const [assignmentFilters, setAssignmentFilters] = React.useState({ search: '', status: 'All' });
  const [currentAssignmentPage, setCurrentAssignmentPage] = React.useState(1);
  const assignmentsPerPage = 5;

  // State for students filtering and pagination
  const [studentFilters, setStudentFilters] = React.useState({ search: '', course: 'All' });
  const [currentStudentPage, setCurrentStudentPage] = React.useState(1);
  const studentsPerPage = 5;

  // State for transactions filtering and pagination
  const [transactionFilters, setTransactionFilters] = React.useState({ search: '', type: 'All' });
  const [currentTransactionPage, setCurrentTransactionPage] = React.useState(1);
  const transactionsPerPage = 7;

  // State for overview pending assignments pagination
  const [currentPendingAssignmentPage, setCurrentPendingAssignmentPage] = React.useState(1);
  const pendingAssignmentsPerPage = 3;

  // State for overview recent students pagination
  const [currentRecentStudentPage, setCurrentRecentStudentPage] = React.useState(1);
  const recentStudentsPerPage = 4;

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      subject: "Maths",
      grade: "12",
      pricingModel: "free",
    },
  });
  
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
        // Fetch Courses for this instructor
        const coursesQuery = query(collection(firestore, 'courses'), where('instructorId', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const coursesSnapshot = await getDocs(coursesQuery);
        const fetchedCourses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Course[];
        setCourses(fetchedCourses);

        // Fetch Quizzes created by this instructor
        const quizzesQuery = query(collection(firestore, 'quizzes'), where('instructorId', '==', currentUser.uid));
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const fetchedQuizzes = quizzesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Quiz[];
        setQuizzes(fetchedQuizzes);
        setLoadingQuizzes(false);
        
        // Fetch Quiz Submissions for this instructor's quizzes
        const quizIds = fetchedQuizzes.map(q => q.id);
        if (quizIds.length > 0) {
            const quizSubmissionsQuery = query(collection(firestore, 'quizSubmissions'), where('quizId', 'in', quizIds));
            const quizSubmissionsSnapshot = await getDocs(quizSubmissionsQuery);
            const fetchedSubmissions = quizSubmissionsSnapshot.docs.map(doc => doc.data()) as QuizSubmission[];
            setQuizSubmissions(fetchedSubmissions);
        } else {
             setQuizSubmissions([]);
        }

        // Fetch all assignments available for review by any instructor
        const assignmentsQuery = query(
            collection(firestore, 'assignments'), 
            where('status', 'in', ['Pending Review', 'In Progress']), 
            orderBy('submittedAt', 'desc')
        );
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const fetchedAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubmittedAssignment[];
        setSubmittedAssignments(fetchedAssignments);
        setLoadingAssignments(false);
        
        // Fetch Transactions for this instructor
        const transactionsQuery = query(
            collection(firestore, 'transactions'),
            where('instructorId', '==', currentUser.uid),
            orderBy('createdAt', 'desc')
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const fetchedTransactions = transactionsSnapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, ...data, date: data.createdAt ? format(data.createdAt.toDate(), 'PPP') : 'N/A' } as Transaction;
        });
        setTransactions(fetchedTransactions);

        // Derive enrolled students from instructor's transactions
        const studentMap = new Map<string, EnrolledStudent>();
        fetchedTransactions.filter(t => t.itemType === 'Course Sale' || t.itemType === 'Subscription').forEach(t => {
            if (t.studentId && !studentMap.has(t.studentId)) {
                  studentMap.set(t.studentId, {
                    id: t.studentId,
                    name: t.studentName || 'Unknown Student',
                    email: 'unknown@example.com',
                    course: t.itemTitle,
                    joined: t.date,
                    progress: Math.floor(Math.random() * 100), // Placeholder
                    transactionDate: t.createdAt
                });
            }
        });
        const fetchedStudents = Array.from(studentMap.values()).sort((a,b) => b.transactionDate.toMillis() - a.transactionDate.toMillis());
        setEnrolledStudents(fetchedStudents);

        setLoadingCourses(false);
        setLoadingTransactions(false);
        setLoadingStudents(false);

        // Generate AI summary with all fetched data
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
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            await fetchAllData(currentUser);
        } else {
            // Clear all data if user logs out
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


  const pricingModel = form.watch("pricingModel");

  const handleAddNewVideo = () => {
    setVideoUploads([...videoUploads, { title: '', file: null, fileName: '' }]);
  };

  const handleVideoTitleChange = (index: number, title: string) => {
    const newUploads = [...videoUploads];
    newUploads[index].title = title;
    setVideoUploads(newUploads);
  };
  
  const handleVideoQuizChange = (index: number, quizId: string) => {
    const newUploads = [...videoUploads];
    newUploads[index].quizId = quizId;
    setVideoUploads(newUploads);
  };

  const handleVideoFileChange = (index: number, file: File | null) => {
    const newUploads = [...videoUploads];
    newUploads[index].file = file;
    newUploads[index].fileName = file?.name || '';
    setVideoUploads(newUploads);
  };

  const handleRemoveVideo = (index: number) => {
    const newUploads = [...videoUploads];
    newUploads.splice(index, 1);
    setVideoUploads(newUploads);
  };

  
  React.useEffect(() => {
    if (isCourseDialogOpen) {
        if (selectedCourse) {
          form.reset({
            title: selectedCourse.title,
            description: selectedCourse.description,
            subject: selectedCourse.subject,
            grade: selectedCourse.grade,
            pricingModel: selectedCourse.pricing.type,
            price: selectedCourse.pricing.price || undefined,
            thumbnail: undefined,
          });
          setVideoUploads([]);
        } else {
          form.reset({
            title: "",
            description: "",
            subject: "Maths",
            grade: "12",
            pricingModel: "free",
            price: undefined,
            thumbnail: undefined,
          });
          setVideoUploads([]);
        }
    }
  }, [selectedCourse, form, isCourseDialogOpen]);

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
            setIsReviewDialogOpen(false); // Close dialog on accept
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
        // Delete video files from Storage
        const videoPromises = selectedCourse.videos.map(video => {
            try {
                const videoFileRef = ref(storage, video.url);
                return deleteObject(videoFileRef);
            } catch (e) {
                console.error("Could not delete video file:", video.url, e);
                return Promise.resolve();
            }
        });
        
        // Delete thumbnail from Storage
        try {
            const thumbnailRef = ref(storage, selectedCourse.thumbnail);
            await deleteObject(thumbnailRef);
        } catch (e) {
            console.error("Could not delete thumbnail file:", selectedCourse.thumbnail, e);
        }
        
        await Promise.all(videoPromises);

        // Delete course document from Firestore
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

  async function onCourseSubmit(data: CourseFormValues) {
    if (!user) return;
    setIsSubmitting(true);
    
    const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const storage = getStorage(app);

    try {
        let thumbnailUrl = selectedCourse?.thumbnail || '';
        if (data.thumbnail) {
            const thumbnailRef = ref(storage, `courses/${user.uid}/${Date.now()}-${data.thumbnail.name}`);
            const snapshot = await uploadBytes(thumbnailRef, data.thumbnail);
            thumbnailUrl = await getDownloadURL(snapshot.ref);
        }

        const uploadedVideos: VideoData[] = [];
        for (const videoUpload of videoUploads) {
            if (videoUpload.file) {
                const videoRef = ref(storage, `videos/${user.uid}/${Date.now()}-${videoUpload.file.name}`);
                const snapshot = await uploadBytes(videoRef, videoUpload.file);
                const url = await getDownloadURL(snapshot.ref);
                uploadedVideos.push({ id: `V${Date.now()}-${videoUpload.title}`, title: videoUpload.title, url, quizId: videoUpload.quizId });
            }
        }
        
        const courseData = {
            instructorId: user.uid,
            title: data.title,
            description: data.description,
            subject: data.subject,
            grade: data.grade,
            pricing: {
                type: data.pricingModel,
                price: data.pricingModel === 'purchase' ? data.price : null,
            },
            thumbnail: thumbnailUrl,
            status: 'Draft' as const,
            videos: selectedCourse ? [...selectedCourse.videos, ...uploadedVideos] : uploadedVideos,
            createdAt: selectedCourse?.createdAt || serverTimestamp(),
        };

        if (selectedCourse) {
            const courseRef = doc(firestore, 'courses', selectedCourse.id);
            await updateDoc(courseRef, courseData);
            setCourses(courses.map(c => c.id === selectedCourse.id ? { ...c, ...courseData, id: c.id, createdAt: c.createdAt } as Course : c));
            toast({ title: "Course Updated!", description: `The course "${data.title}" has been updated.` });
        } else {
            const newDocRef = await addDoc(collection(firestore, 'courses'), courseData);
            setCourses([{ id: newDocRef.id, ...courseData, createdAt: Timestamp.now() } as Course, ...courses]);
            toast({ title: "Course Created!", description: `The course "${data.title}" has been created.` });
        }

        setIsCourseDialogOpen(false);
        setSelectedCourse(null);

    } catch (error) {
        console.error("Error saving course: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to save course.' });
    } finally {
        setIsSubmitting(false);
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

  // Course filtering and pagination logic
  const handleCourseFilterChange = (key: 'search' | 'status', value: string) => {
    setCourseFilters(prev => ({ ...prev, [key]: value }));
    setCurrentCoursePage(1);
  };

  const filteredCourses = React.useMemo(() => {
    return courses.filter(course => {
        const searchMatch = courseFilters.search.trim().toLowerCase() === '' ||
            course.title.toLowerCase().includes(courseFilters.search.trim().toLowerCase()) ||
            course.description.toLowerCase().includes(courseFilters.search.trim().toLowerCase());
        
        const statusMatch = courseFilters.status === 'All' || course.status === courseFilters.status;

        return searchMatch && statusMatch;
    });
  }, [courses, courseFilters]);

  const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice((currentCoursePage - 1) * coursesPerPage, currentCoursePage * coursesPerPage);

  // Quiz filtering and pagination logic
  const handleQuizFilterChange = (key: 'search' | 'subject' | 'grade', value: string) => {
    setQuizFilters(prev => ({ ...prev, [key]: value }));
    setCurrentQuizPage(1);
  };

  const filteredQuizzes = React.useMemo(() => {
    return quizzes.filter(quiz => {
        const searchMatch = quizFilters.search.trim().toLowerCase() === '' ||
            quiz.title.toLowerCase().includes(quizFilters.search.trim().toLowerCase());
        const subjectMatch = quizFilters.subject === 'All' || quiz.subject === quizFilters.subject;
        const gradeMatch = quizFilters.grade === 'All' || quiz.grade === quizFilters.grade;
        return searchMatch && subjectMatch && gradeMatch;
    });
  }, [quizzes, quizFilters]);

  const totalQuizPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);
  const paginatedQuizzes = filteredQuizzes.slice((currentQuizPage - 1) * quizzesPerPage, currentQuizPage * quizzesPerPage);


  // Assignment filtering and pagination logic
  const handleAssignmentFilterChange = (key: 'search' | 'status', value: string) => {
    setAssignmentFilters(prev => ({ ...prev, [key]: value }));
    setCurrentAssignmentPage(1);
  };

  const filteredAssignments = React.useMemo(() => {
    return submittedAssignments.filter(assignment => {
        const searchMatch = assignmentFilters.search.trim().toLowerCase() === '' ||
            assignment.studentName.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()) ||
            (assignment.title && assignment.title.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase())) ||
            (assignment.course && assignment.course.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()));
        
        const statusMatch = assignmentFilters.status === 'All' || assignment.status === assignmentFilters.status;

        return searchMatch && statusMatch;
    });
  }, [submittedAssignments, assignmentFilters]);

  const totalAssignmentPages = Math.ceil(filteredAssignments.length / assignmentsPerPage);
  const paginatedAssignments = filteredAssignments.slice((currentAssignmentPage - 1) * assignmentsPerPage, currentAssignmentPage * assignmentsPerPage);

  // Student filtering and pagination logic
  const handleStudentFilterChange = (key: 'search' | 'course', value: string) => {
    setStudentFilters(prev => ({ ...prev, [key]: value }));
    setCurrentStudentPage(1);
  };
  
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

  const filteredStudents = React.useMemo(() => {
    return enrolledStudents.filter(student => {
      const searchMatch = studentFilters.search.trim().toLowerCase() === '' ||
        student.name.toLowerCase().includes(studentFilters.search.trim().toLowerCase()) ||
        student.email.toLowerCase().includes(studentFilters.search.trim().toLowerCase());
      
      const courseMatch = studentFilters.course === 'All' || student.course.includes(studentFilters.course);

      return searchMatch && courseMatch;
    });
  }, [enrolledStudents, studentFilters]);

  const totalStudentPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const paginatedStudents = filteredStudents.slice((currentStudentPage - 1) * studentsPerPage, currentStudentPage * studentsPerPage);

  const studentCourses = ['All', ...Array.from(new Set(instructorData.enrolledStudents.map(s => s.course)))];

  // Transactions filtering and pagination logic
  const handleTransactionFilterChange = (key: 'search' | 'type', value: string) => {
    setTransactionFilters(prev => ({ ...prev, [key]: value }));
    setCurrentTransactionPage(1);
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

  const handlePayoutRequest = (amount: number) => {
    toast({ title: "Payout Requested", description: `Your request to withdraw R ${amount.toFixed(2)} has been submitted.` });
    setIsPayoutDialogOpen(false);
  };

  const totalRevenue = React.useMemo(() => transactions.filter(t => t.amount > 0 && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const availableForPayout = React.useMemo(() => transactions.reduce((acc, t) => acc + t.amount, 0), [transactions]);

  const filteredTransactions = React.useMemo(() => {
    return transactions.filter(transaction => {
      const searchMatch = transactionFilters.search.trim().toLowerCase() === '' ||
        transaction.itemTitle.toLowerCase().includes(transactionFilters.search.trim().toLowerCase()) ||
        (transaction.studentName && transaction.studentName.toLowerCase().includes(transactionFilters.search.trim().toLowerCase()));
      
      const typeMatch = transactionFilters.type === 'All' || transaction.itemType === 'Course Sale';

      return searchMatch && typeMatch;
    });
  }, [transactions, transactionFilters]);

  const totalTransactionPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const paginatedTransactionsData = filteredTransactions.slice((currentTransactionPage - 1) * transactionsPerPage, currentTransactionPage * transactionsPerPage);

  // Overview Pending Assignments Pagination Logic
  const pendingAssignments = React.useMemo(() => {
    return submittedAssignments.filter(a => a.status === 'In Progress' && a.markerId === user?.uid);
  }, [submittedAssignments, user]);
  
  const totalPendingAssignmentPages = Math.ceil(pendingAssignments.length / pendingAssignmentsPerPage);
  
  const paginatedPendingAssignments = pendingAssignments.slice(
    (currentPendingAssignmentPage - 1) * pendingAssignmentsPerPage,
    currentPendingAssignmentPage * pendingAssignmentsPerPage
  );

  // Overview Recent Students Pagination Logic
  const totalRecentStudentPages = Math.ceil(enrolledStudents.length / recentStudentsPerPage);
  const paginatedRecentStudents = enrolledStudents.slice(
    (currentRecentStudentPage - 1) * recentStudentsPerPage,
    currentRecentStudentPage * recentStudentsPerPage
  );

  const getAssignmentStatusBadge = (assignment: SubmittedAssignment) => {
    switch (assignment.status) {
        case 'Paid':
            return <Badge variant={"outline"} className='bg-green-500/20 text-green-700'><CheckCircle className="mr-1 h-3 w-3" />Paid</Badge>;
        case 'Awaiting Payment':
            return <Badge variant={"outline"} className='bg-blue-500/20 text-blue-700'><CircleDollarSign className="mr-1 h-3 w-3" />Awaiting Payment</Badge>;
        case 'Pending Review':
            return <Badge variant={"outline"} className='bg-yellow-500/20 text-yellow-700'><Hourglass className="mr-1 h-3 w-3" />Pending Review</Badge>;
        case 'In Progress':
            return <Badge variant={"outline"} className='bg-purple-500/20 text-purple-700'><Clock className="mr-1 h-3 w-3" />In Progress by {assignment.markerId === user?.uid ? 'You' : assignment.markerName}</Badge>;
        default:
            return <Badge variant={"outline"}>{assignment.status}</Badge>;
    }
  };

  // AI Solution Generator Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setQuestionPaper(e.target.files[0]);
      setAiSolution(null); // Reset solution when a new file is chosen
    }
  };

  const handleSolvePaper = async () => {
    if (!questionPaper) {
      toast({ variant: 'destructive', title: 'No File', description: 'Please upload a question paper first.' });
      return;
    }
    setIsSolving(true);
    setAiSolution(null);

    const fileToDataURI = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    try {
        const paperDataUri = await fileToDataURI(questionPaper);
        const result = await solveQuestionPaper({ paperDataUri });
        setAiSolution(result);
        toast({ title: 'Processing Complete!', description: 'The solutions and study notes have been generated.' });
    } catch (error) {
        console.error(`Error solving paper:`, error);
        toast({ variant: 'destructive', title: `Solving Failed`, description: 'The AI could not process this document. Please try another one.' });
    } finally {
        setIsSolving(false);
    }
  };


  return (
      <div className="space-y-8">
          {currentTab === 'overview' && (
            <div className="space-y-8">
              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="shadow-md rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loadingStudents ? <Skeleton className="h-8 w-16" /> : enrolledStudents.length}</div>
                      <p className="text-xs text-muted-foreground">+0 this month</p>
                    </CardContent>
                  </Card>
                   <Card className="shadow-md rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Your Courses</CardTitle>
                      <GraduationCap className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loadingCourses ? <Skeleton className="h-8 w-16" /> : courses.length}</div>
                      <p className="text-xs text-muted-foreground">+0 this month</p>
                    </CardContent>
                  </Card>
                   <Card className="shadow-md rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loadingTransactions ? <Skeleton className="h-8 w-24" /> : `R ${totalRevenue.toFixed(2)}`}</div>
                      <p className="text-xs text-muted-foreground">All-time earnings</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-md rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Accepted Assignments</CardTitle>
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{loadingAssignments ? <Skeleton className="h-8 w-16" /> : pendingAssignments.length}</div>
                       <p className="text-xs text-muted-foreground">Awaiting your solution</p>
                    </CardContent>
                  </Card>
              </section>
              
              <section>
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="text-primary h-6 w-6" />
                                <CardTitle className="text-xl">AI Performance Summary</CardTitle>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => user && generatePerformanceSummary(user, courses, enrolledStudents, submittedAssignments, transactions)} disabled={loadingAiSummary}>
                                <RefreshCw className={`mr-2 h-4 w-4 ${loadingAiSummary ? 'animate-spin' : ''}`} />
                                Regenerate
                            </Button>
                        </div>
                        <CardDescription>An AI-powered analysis of your current performance.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAiSummary ? (
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        ) : (
                            <p className="text-muted-foreground">{aiSummary}</p>
                        )}
                    </CardContent>
                </Card>
              </section>

              <section className="grid gap-8 lg:grid-cols-2">
                <Card className="shadow-md rounded-xl">
                  <CardHeader>
                    <CardTitle className="text-xl">Engagement &amp; Income</CardTitle>
                    <CardDescription>Monthly student engagement and income over the last 6 months.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-64 w-full">
                      <BarChart accessibilityLayer data={instructorData.engagementData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} tickFormatter={(value) => value.slice(0, 3)} />
                        <YAxis />
                        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                        <Bar dataKey="engagement" fill="var(--color-engagement)" radius={4} />
                        <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
                
                <Card className="shadow-md rounded-xl flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">Your Pending Assignments</CardTitle>
                    <CardDescription>Assignments you have accepted to work on.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {loadingAssignments ? (
                       <div className="space-y-4">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                       </div>
                    ) : paginatedPendingAssignments.length > 0 ? (
                      <ul className="space-y-4">
                        {paginatedPendingAssignments.map((assignment) => (
                          <li key={assignment.id} className="flex items-center gap-4">
                            <Avatar className="h-10 w-10"><AvatarFallback>{assignment.studentName.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{assignment.title}</p>
                              <p className="text-sm text-muted-foreground">From {assignment.studentName}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleReviewAssignment(assignment)}>
                                <Edit className="mr-2 h-4 w-4" /> Continue
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                          <CheckCircle className="h-10 w-10 mb-2"/>
                          <h3 className="font-semibold">All caught up!</h3>
                          <p className="text-sm">You have no pending assignments.</p>
                      </div>
                    )}
                  </CardContent>
                  {totalPendingAssignmentPages > 1 && (
                    <CardFooter className="flex items-center justify-between border-t pt-4">
                        <div className="text-xs text-muted-foreground">
                            Page <strong>{currentPendingAssignmentPage}</strong> of <strong>{totalPendingAssignmentPages}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPendingAssignmentPage(p => p - 1)} disabled={currentPendingAssignmentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous</span>
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentPendingAssignmentPage(p => p + 1)} disabled={currentPendingAssignmentPage >= totalPendingAssignmentPages}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next</span>
                            </Button>
                        </div>
                    </CardFooter>
                  )}
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Recently Enrolled Students</h2>
                <Card className="shadow-md rounded-xl">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead className="hidden sm:table-cell">Course</TableHead>
                        <TableHead className="hidden md:table-cell">Progress</TableHead>
                        <TableHead className="hidden lg:table-cell">Joined Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingStudents ? (
                           Array.from({ length: 4 }).map((_, i) => (
                             <TableRow key={i}>
                                <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                                <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-32" /></TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-28" /></TableCell>
                            </TableRow>
                           ))
                        ) : paginatedRecentStudents.length > 0 ? (
                            paginatedRecentStudents.map((student) => (
                                <TableRow key={student.id}>
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9"><AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                                    <div>
                                        <p className="font-medium">{student.name}</p>
                                        {/* <p className="text-xs text-muted-foreground">{student.email}</p> */}
                                    </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden sm:table-cell"><Badge variant="secondary">{student.course}</Badge></TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="flex items-center gap-2">
                                    <Progress value={student.progress} className="w-24 h-2" />
                                    <span className="text-xs text-muted-foreground">{student.progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden lg:table-cell">{student.joined}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                             <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No students have enrolled in your courses yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                  </Table>
                   {totalRecentStudentPages > 1 && (
                    <CardFooter className="flex items-center justify-between border-t pt-4">
                        <div className="text-xs text-muted-foreground">
                            Page <strong>{currentRecentStudentPage}</strong> of <strong>{totalRecentStudentPages}</strong>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentRecentStudentPage(p => p - 1)} disabled={currentRecentStudentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                                <span className="sr-only">Previous</span>
                            </Button>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCurrentRecentStudentPage(p => p + 1)} disabled={currentRecentStudentPage >= totalRecentStudentPages}>
                                <ChevronRight className="h-4 w-4" />
                                <span className="sr-only">Next</span>
                            </Button>
                        </div>
                    </CardFooter>
                  )}
                </Card>
              </section>
            </div>
          )}

          {currentTab === 'courses' && (
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Course Management</CardTitle>
                            <CardDescription>Upload, edit, and manage your courses.</CardDescription>
                        </div>
                        <Button onClick={handleAddNewCourse}><PlusCircle className="mr-2"/> Add New Course</Button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 pt-4 border-t mt-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search courses..."
                                className="pl-8"
                                value={courseFilters.search}
                                onChange={(e) => handleCourseFilterChange('search', e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full md:w-auto">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Filter</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={courseFilters.status} onValueChange={(value) => handleCourseFilterChange('status', value)}>
                                    <DropdownMenuRadioItem value="All">All Statuses</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Published">Published</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Draft">Draft</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Pending Approval">Pending Approval</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Rejected">Rejected</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardHeader>
                <CardContent>
                  {loadingCourses ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({length: 3}).map((_, i) => (
                             <Card key={i}><CardHeader><Skeleton className="h-40 w-full" /></CardHeader><CardContent className="space-y-2 pt-4"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></CardContent><CardFooter><Skeleton className="h-6 w-full" /></CardFooter></Card>
                        ))}
                    </div>
                   ) : paginatedCourses.length > 0 ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden shadow-md rounded-xl flex flex-col">
                          <CardHeader className="p-0 relative">
                            <Image src={course.thumbnail} alt={course.title} width={400} height={200} className="aspect-video object-cover" data-ai-hint="online course" />
                            <Badge className="absolute top-2 right-2" variant={course.status === 'Published' ? 'default' : 'secondary'}>{course.status}</Badge>
                          </CardHeader>
                          <CardContent className="p-4 flex-grow">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg">{course.title}</h3>
                                    <p className="text-sm text-muted-foreground">{course.subject} - Grade {course.grade}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem asChild>
                                          <Link href={`/instructor/courses/${course.id}`}>
                                            <Eye className="mr-2 h-4 w-4"/>Preview Course
                                          </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditCourse(course)}><Edit className="mr-2 h-4 w-4"/>Edit Course</DropdownMenuItem>
                                        {course.status === 'Draft' && <DropdownMenuItem onClick={() => handlePublishCourse(course)}><Send className="mr-2 h-4 w-4"/>Publish Course</DropdownMenuItem>}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => handleDeleteCourseClick(course)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete Course</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{course.description}</p>
                          </CardContent>
                          <CardFooter className="bg-muted/50 p-4 flex justify-between items-center">
                              <div className="flex items-center gap-2 text-sm">
                                  <Video className="h-4 w-4"/>
                                  <span>{course.videos.length} lessons</span>
                              </div>
                              <div className="text-sm font-semibold">
                                {course.pricing.type === 'purchase' ? `R ${course.pricing.price}` : course.pricing.type === 'free' ? 'Free' : 'By Subscription'}
                              </div>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                      <h3 className="text-lg font-semibold">No Courses Found</h3>
                      <p className="text-muted-foreground mt-1">{courseFilters.search || courseFilters.status !== 'All' ? 'Try adjusting your search or filters.' : 'Start building your library by clicking "Add New Course".'}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(currentCoursePage - 1) * coursesPerPage + 1}-{Math.min(currentCoursePage * coursesPerPage, filteredCourses.length)}</strong> of <strong>{filteredCourses.length}</strong> courses.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p - 1)} disabled={currentCoursePage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentCoursePage(p => p + 1)} disabled={currentCoursePage >= totalCoursePages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                </CardFooter>
            </Card>
          )}

          {currentTab === 'quizzes' && (
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">Quiz Management</CardTitle>
                            <CardDescription>Create quizzes and view student attempts.</CardDescription>
                        </div>
                        <Button asChild>
                            <Link href="/instructor/quizzes/create">
                                <PlusCircle className="mr-2"/> Create New Quiz
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by quiz title..."
                            className="pl-8"
                            value={quizFilters.search}
                            onChange={(e) => handleQuizFilterChange('search', e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Subject</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Subject</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={quizFilters.subject} onValueChange={(value) => handleQuizFilterChange('subject', value)}>
                                    <DropdownMenuRadioItem value="All">All Subjects</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Maths">Maths</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Physical Sciences">Physical Sciences</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Life Sciences">Life Sciences</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1 w-full">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span>Grade</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter by Grade</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={quizFilters.grade} onValueChange={(value) => handleQuizFilterChange('grade', value)}>
                                    <DropdownMenuRadioItem value="All">All Grades</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="10">Grade 10</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="11">Grade 11</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="12">Grade 12</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <CardContent className="p-0">
                    {loadingQuizzes ? (
                         <div className="text-center py-16 text-muted-foreground">Loading quizzes...</div>
                    ) : paginatedQuizzes.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead className="hidden sm:table-cell">Subject</TableHead>
                                    <TableHead className="hidden md:table-cell">Grade</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedQuizzes.map(quiz => {
                                    const hasAttempt = quizSubmissions.some(sub => sub.quizId === quiz.id);
                                    return (
                                        <TableRow key={quiz.id}>
                                            <TableCell className="font-medium">{quiz.title}</TableCell>
                                            <TableCell className="hidden sm:table-cell"><Badge variant="outline">{quiz.subject}</Badge></TableCell>
                                            <TableCell className="hidden md:table-cell"><Badge variant="secondary">Grade {quiz.grade}</Badge></TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={`/quiz/${quiz.id}`}>
                                                        {hasAttempt ? (
                                                            <><Check className="mr-2 h-4 w-4"/> View Results / Retake</>
                                                        ) : (
                                                            <><FileQuestion className="mr-2 h-4 w-4"/> Start Quiz</>
                                                        )}
                                                    </Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg m-4">
                            <h3 className="text-lg font-semibold">No Quizzes Found</h3>
                            <p className="text-muted-foreground mt-1">{quizFilters.search || quizFilters.subject !== 'All' || quizFilters.grade !== 'All' ? 'Try adjusting your search or filters.' : 'Click "Create New Quiz" to get started.'}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>{(currentQuizPage - 1) * quizzesPerPage + 1}-{Math.min(currentQuizPage * quizzesPerPage, filteredQuizzes.length)}</strong> of <strong>{filteredQuizzes.length}</strong> quizzes.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentQuizPage(p => p - 1)} disabled={currentQuizPage === 1}><ChevronLeft className="h-4 w-4 mr-1" />Prev</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentQuizPage(p => p + 1)} disabled={currentQuizPage >= totalQuizPages}>Next<ChevronRight className="h-4 w-4 ml-1" /></Button>
                    </div>
                </CardFooter>
            </Card>
          )}

          {currentTab === 'ai-quiz' && (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">AI Solution &amp; Study Guide Generator</CardTitle>
                        <CardDescription>Upload a question paper (PDF, DOCX, PNG, JPG) to get full solutions and generated study notes.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                             <div className="mt-2 flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file-papers" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-medium">Click to upload</span> or drag and drop</p>
                                    </div>
                                    <Input id="dropzone-file-papers" type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg" onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        {questionPaper && (
                            <div>
                                <Label>Uploaded File</Label>
                                <div className="mt-2 flex items-center justify-between p-2 rounded-md bg-muted">
                                    <span className="text-sm font-medium truncate">{questionPaper.name}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setQuestionPaper(null); setAiSolution(null); }}>
                                        <XCircle className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSolvePaper} disabled={isSolving || !questionPaper}>
                            <Wand2 className="mr-2 h-4 w-4" />
                            {isSolving ? 'Solving with AI...' : 'Solve with AI'}
                        </Button>
                    </CardFooter>
                </Card>

                {isSolving && (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground space-y-4">
                            <Sparkles className="h-10 w-10 mx-auto animate-pulse text-primary" />
                            <h3 className="text-lg font-semibold">AI is at work...</h3>
                            <p>Analyzing the document, solving questions, and generating study notes. This may take a moment.</p>
                            <Skeleton className="h-4 w-3/4 mx-auto" />
                            <Skeleton className="h-4 w-1/2 mx-auto" />
                        </CardContent>
                    </Card>
                )}

                {aiSolution && (
                    <Card>
                        <CardHeader>
                             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <CardTitle>AI Generated Results</CardTitle>
                                    <CardDescription>Review the solutions and study notes generated by the AI.</CardDescription>
                                </div>
                                <Button onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Save as PDF</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="solutions">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="solutions">Solutions &amp; Explanations</TabsTrigger>
                                    <TabsTrigger value="notes">Study Notes</TabsTrigger>
                                </TabsList>
                                <div ref={solutionPrintRef} className="printable-content">
                                    <TabsContent value="solutions" className="mt-4 space-y-6">
                                        {aiSolution.solvedQuestions.map((item, index) => (
                                            <Card key={index} className="overflow-hidden">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                                                    <div className="text-muted-foreground prose dark:prose-invert max-w-none">
                                                        <BlockMath math={item.questionText} />
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <h4 className="font-semibold text-primary mb-2">Solution:</h4>
                                                    <div className="prose dark:prose-invert max-w-none text-sm">
                                                        <BlockMath math={item.detailedSolution} />
                                                    </div>
                                                </CardContent>
                                                <CardFooter className="bg-muted/30 p-4">
                                                    <div>
                                                        <h4 className="font-semibold mb-2">Explanation:</h4>
                                                        <p className="text-sm text-muted-foreground">{item.explanation}</p>
                                                    </div>
                                                </CardFooter>
                                            </Card>
                                        ))}
                                    </TabsContent>
                                    <TabsContent value="notes" className="mt-4">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Generated Study Notes</CardTitle>
                                                <CardDescription>Key concepts and formulas from the question paper.</CardDescription>
                                            </CardHeader>
                                            <CardContent className="prose dark:prose-invert max-w-none">
                                                <BlockMath math={aiSolution.studyNotes} />
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                )}
            </div>
          )}

          {currentTab === 'assignments' && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Assignment Management</CardTitle>
                    <CardDescription>Review submitted assignments, upload solutions, and set pricing.</CardDescription>
                </CardHeader>
                 <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student or assignment..."
                            className="pl-8"
                            value={assignmentFilters.search}
                            onChange={(e) => handleAssignmentFilterChange('search', e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-1 w-full md:w-auto">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Filter by Status
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={assignmentFilters.status} onValueChange={(value) => handleAssignmentFilterChange('status', value)}>
                                <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Pending Review">Pending Review</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="In Progress">In Progress</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Awaiting Payment">Awaiting Payment</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Paid">Paid</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardContent className="p-0">
                    {loadingAssignments ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead className="hidden sm:table-cell">Assignment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-48" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : paginatedAssignments.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead className="hidden sm:table-cell">Assignment</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div className="font-medium">{assignment.studentName}</div>
                                            <div className="text-xs text-muted-foreground md:hidden">{assignment.title || assignment.course}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="font-medium">{assignment.title || 'Untitled Assignment'}</div>
                                            <div className="text-xs text-muted-foreground">{assignment.course}</div>
                                        </TableCell>
                                        <TableCell>{getAssignmentStatusBadge(assignment)}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleReviewAssignment(assignment)}
                                                disabled={assignment.status === 'In Progress' && assignment.markerId !== user?.uid}
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                {assignment.status === 'In Progress' && assignment.markerId === user?.uid ? 'Continue' : 'Review'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold">No Assignments Found</h3>
                            <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                    <div className="text-xs text-muted-foreground">
                        Showing{" "}
                        <strong>
                            {filteredAssignments.length > 0 ? (currentAssignmentPage - 1) * assignmentsPerPage + 1 : 0}-
                            {Math.min(currentAssignmentPage * assignmentsPerPage, filteredAssignments.length)}
                        </strong>{" "}
                        of <strong>{filteredAssignments.length}</strong> assignments.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p - 1)} disabled={currentAssignmentPage === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentAssignmentPage(p => p + 1)} disabled={currentAssignmentPage >= totalAssignmentPages}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
          )}

          {currentTab === 'students' && (
             <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Student Management</CardTitle>
                    <CardDescription>View enrolled students, track their progress, and manage access.</CardDescription>
                </CardHeader>
                <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student name or email..."
                            className="pl-8"
                            value={studentFilters.search}
                            onChange={(e) => handleStudentFilterChange('search', e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-1 w-full md:w-auto">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter by Course</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by Course</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={studentFilters.course} onValueChange={(value) => handleStudentFilterChange('course', value)}>
                                {studentCourses.map(course => (
                                  <DropdownMenuRadioItem key={course} value={course}>{course}</DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 <CardContent className="p-0">
                    {paginatedStudents.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead className="hidden sm:table-cell">Course</TableHead>
                                    <TableHead className="hidden md:table-cell">Progress</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell>
                                            <div className="font-medium">{student.name}</div>
                                            <div className="text-xs text-muted-foreground md:hidden">{student.email}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell"><Badge variant="outline">{student.course}</Badge></TableCell>
                                        <TableCell className="hidden md:table-cell">
                                          <div className="flex items-center gap-2">
                                            <Progress value={student.progress} className="w-24 h-2" />
                                            <span className="text-xs text-muted-foreground">{student.progress}%</span>
                                          </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleStudentAction(student, 'view')}><Eye className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStudentAction(student, 'unenroll')}><UserMinus className="mr-2 h-4 w-4"/>Unenroll</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleStudentAction(student, 'delete')} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete Student</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-16">
                            <h3 className="text-lg font-semibold">No Students Found</h3>
                            <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
                        </div>
                    )}
                </CardContent>
                 <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                    <div className="text-xs text-muted-foreground">
                        Showing{" "}
                        <strong>
                            {filteredStudents.length > 0 ? (currentStudentPage - 1) * studentsPerPage + 1 : 0}-
                            {Math.min(currentStudentPage * studentsPerPage, filteredStudents.length)}
                        </strong>{" "}
                        of <strong>{filteredStudents.length}</strong> students.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentStudentPage(p => p - 1)} disabled={currentStudentPage === 1}>
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentStudentPage(p => p + 1)} disabled={currentStudentPage >= totalStudentPages}>
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            </Card>
          )}

          {currentTab === 'earnings' && (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R {totalRevenue.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">All-time earnings from sales.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
                            <Banknote className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">R {availableForPayout.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">Current account balance.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Course Sales</CardTitle>
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                +R {transactions.filter(t => t.itemType === 'Course Sale' && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">From one-time purchases.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Assignment Sales</CardTitle>
                            <ReceiptText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                +R {transactions.filter(t => t.itemType === 'Assignment Sale' && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">From paid solutions.</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-xl">Transaction History</CardTitle>
                            <CardDescription>A detailed log of all your financial activities.</CardDescription>
                        </div>
                        <Button onClick={() => setIsPayoutDialogOpen(true)}>
                            <Banknote className="mr-2 h-4 w-4" /> Request Payout
                        </Button>
                    </CardHeader>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-2 p-4 border-y">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by item or student..."
                                className="pl-8"
                                value={transactionFilters.search}
                                onChange={(e) => handleTransactionFilterChange('search', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-1 w-full">
                                        <ListFilter className="h-3.5 w-3.5" />
                                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter by Type</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuRadioGroup value={transactionFilters.type} onValueChange={(value) => handleTransactionFilterChange('type', value)}>
                                        <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Course Sale">Course Sale</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Assignment Sale">Assignment Sale</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Subscription">Subscription</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Refund">Refund</DropdownMenuRadioItem>
                                        <DropdownMenuRadioItem value="Payout">Payout</DropdownMenuRadioItem>
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button variant="outline" className="gap-1.5 w-full">
                                <CalendarDays className="h-4 w-4" />
                                <span>Filter by Date</span>
                            </Button>
                        </div>
                    </div>
                    <CardContent className="p-0">
                        {loadingTransactions ? (
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item / Description</TableHead>
                                        <TableHead className="hidden sm:table-cell">Student</TableHead>
                                        <TableHead className="hidden md:table-cell">Status</TableHead>
                                        <TableHead className="text-right">Amount (R)</TableHead>
                                        <TableHead className="text-right hidden md:table-cell">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                            <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                                            <TableCell className="hidden md:table-cell"><Skeleton className="h-6 w-28" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                            <TableCell className="text-right hidden md:table-cell"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : paginatedTransactionsData.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item / Description</TableHead>
                                        <TableHead className="hidden sm:table-cell">Student</TableHead>
                                        <TableHead className="hidden md:table-cell">Status</TableHead>
                                        <TableHead className="text-right">Amount (R)</TableHead>
                                        <TableHead className="text-right hidden md:table-cell">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTransactionsData.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">{transaction.itemTitle}</TableCell>
                                            <TableCell className="text-muted-foreground hidden sm:table-cell">{transaction.studentName || 'N/A'}</TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge
                                                    variant={transaction.status === 'Completed' ? 'default' : transaction.status === 'Refunded' ? 'destructive' : 'secondary'}
                                                    className={
                                                        transaction.status === 'Completed' ? 'bg-green-500/20 text-green-700' 
                                                        : transaction.status === 'Refunded' ? 'bg-red-500/20 text-red-700'
                                                        : 'bg-yellow-500/20 text-yellow-700'
                                                    }
                                                >
                                                    {transaction.status === 'Completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                    {transaction.status === 'Refunded' && <XCircle className="mr-1 h-3 w-3" />}
                                                    {transaction.status === 'Pending' && <Hourglass className="mr-1 h-3 w-3" />}
                                                    {transaction.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {transaction.amount > 0 ? `+${transaction.amount.toFixed(2)}` : transaction.amount.toFixed(2)}
                                            </TableCell>
                                            <TableCell className="text-right hidden md:table-cell">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4"/></Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleTransactionAction(transaction, 'view')}><Eye className="mr-2 h-4 w-4"/>View Details</DropdownMenuItem>
                                                        {transaction.itemType !== 'Payout' && transaction.status === 'Completed' && (
                                                            <DropdownMenuItem onClick={() => handleTransactionAction(transaction, 'refund')} className="text-destructive focus:text-destructive"><Undo2 className="mr-2 h-4 w-4"/>Issue Refund</DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-16">
                                <h3 className="text-lg font-semibold">No Transactions Found</h3>
                                <p className="text-muted-foreground mt-1">Try adjusting your search or filter criteria.</p>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between py-4 gap-4">
                        <div className="text-xs text-muted-foreground">
                            Showing{" "}
                            <strong>
                                {filteredTransactions.length > 0 ? (currentTransactionPage - 1) * transactionsPerPage + 1 : 0}-
                                {Math.min(currentTransactionPage * transactionsPerPage, filteredTransactions.length)}
                            </strong>{" "}
                            of <strong>{filteredTransactions.length}</strong> transactions.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentTransactionPage(p => p - 1)} disabled={currentTransactionPage === 1}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Prev
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setCurrentTransactionPage(p => p + 1)} disabled={currentTransactionPage >= totalTransactionPages}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
          )}

       <Dialog open={isCourseDialogOpen} onOpenChange={handleCourseDialogOpenChange}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>{selectedCourse ? 'Edit' : 'Create New'} Course</DialogTitle>
                  <DialogDescription>
                    {selectedCourse ? 'Update the details for your course.' : 'Fill in the details below to create a new course.'}
                  </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCourseSubmit)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="thumbnail"
                                render={({ field }) => (
                                <FormItem className="col-span-1 md:col-span-2">
                                  <FormLabel>Thumbnail / Cover Image</FormLabel>
                                  <FormControl>
                                      <div className="flex items-center justify-center w-full">
                                          <label htmlFor="dropzone-file-course" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                  <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-medium">Click to upload</span> or drag and drop</p>
                                                  <p className="text-xs text-muted-foreground">PNG or JPG (MAX. 800x400px)</p>
                                              </div>
                                              <Input id="dropzone-file-course" type="file" className="hidden" onChange={(e) => field.onChange(e.target.files?.[0])} />
                                          </label>
                                      </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                                )}
                            />

                          <FormField control={form.control} name="title" render={({ field }) => (
                              <FormItem className="col-span-1 md:col-span-2">
                                  <FormLabel>Course Title</FormLabel>
                                  <FormControl><Input placeholder="e.g. Advanced Calculus" {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          
                          <FormField control={form.control} name="description" render={({ field }) => (
                              <FormItem className="col-span-1 md:col-span-2">
                                  <FormLabel>Course Description</FormLabel>
                                  <FormControl><Textarea placeholder="Describe your course..." rows={4} {...field} /></FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="subject" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Subject</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="Maths">Maths</SelectItem>
                                          <SelectItem value="Physical Sciences">Physical Sciences</SelectItem>
                                          <SelectItem value="Life Sciences">Life Sciences</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )} />
                          
                          <FormField control={form.control} name="grade" render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Grade</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                      <FormControl><SelectTrigger><SelectValue placeholder="Select a grade" /></SelectTrigger></FormControl>
                                      <SelectContent>
                                          <SelectItem value="10">Grade 10</SelectItem>
                                          <SelectItem value="11">Grade 11</SelectItem>
                                          <SelectItem value="12">Grade 12</SelectItem>
                                      </SelectContent>
                                  </Select>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          <FormField control={form.control} name="pricingModel" render={({ field }) => (
                              <FormItem className="col-span-1 md:col-span-2">
                                  <FormLabel>Pricing Model</FormLabel>
                                  <FormControl>
                                      <RadioGroup onValueChange={field.onChange} value={field.value} className="grid grid-cols-3 gap-4">
                                          <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary"><RadioGroupItem value="free" className="sr-only"/>Free</Label>
                                          <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary"><RadioGroupItem value="purchase" className="sr-only"/>One-time Purchase</Label>
                                          <Label className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground has-[:checked]:border-primary"><RadioGroupItem value="subscription" className="sr-only"/>Subscription</Label>
                                      </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )} />

                          {pricingModel === 'purchase' && (
                              <FormField control={form.control} name="price" render={({ field }) => (
                                  <FormItem className="col-span-1 md:col-span-2">
                                      <FormLabel>Price (R)</FormLabel>
                                      <FormControl>
                                          <div className="relative">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                                              <Input type="number" placeholder="e.g. 499" className="pl-8" {...field} value={field.value ?? ''} />
                                          </div>
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )} />
                          )}

                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <Separator />
                            <div className="flex items-center justify-between">
                                <Label>Course Videos</Label>
                                <Button type="button" variant="outline" size="sm" onClick={handleAddNewVideo}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Video
                                </Button>
                            </div>
                            {selectedCourse && selectedCourse.videos.length > 0 && (
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <p>This course already has {selectedCourse.videos.length} video(s). You can add more below.</p>
                                    <ul className="list-disc pl-5">
                                        {selectedCourse.videos.slice(0, 3).map(v => <li key={v.id}>{v.title}</li>)}
                                        {selectedCourse.videos.length > 3 && <li>...and {selectedCourse.videos.length - 3} more.</li>}
                                    </ul>
                                </div>
                            )}
                            <div className="space-y-4">
                            {videoUploads.map((upload, index) => (
                                <Card key={index} className="p-4 bg-muted/50">
                                    <div className="flex items-start gap-4">
                                        <Video className="h-5 w-5 text-muted-foreground mt-2" />
                                        <div className="flex-grow space-y-2">
                                            <Input
                                                placeholder={`Video ${index + 1} Title`}
                                                value={upload.title}
                                                onChange={(e) => handleVideoTitleChange(index, e.target.value)}
                                            />
                                            <label htmlFor={`video-upload-${index}`} className="relative flex items-center justify-center w-full h-10 border-2 border-dashed rounded-md cursor-pointer hover:bg-muted">
                                                <FileUp className="h-4 w-4 mr-2 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground truncate">
                                                    {upload.fileName || 'Choose a video file'}
                                                </span>
                                                <Input id={`video-upload-${index}`} type="file" accept="video/*" className="sr-only" onChange={(e) => handleVideoFileChange(index, e.target.files ? e.target.files[0] : null)} />
                                            </label>
                                            <Select onValueChange={(value) => handleVideoQuizChange(index, value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Link a quiz (optional)" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {quizzes.map(quiz => (
                                                        <SelectItem key={quiz.id} value={quiz.id}>{quiz.title}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveVideo(index)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                            </div>
                        </div>

                      </div>
                      <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background/95 pb-0 -mx-4 px-4">
                          <Button type="button" variant="ghost" onClick={() => handleCourseDialogOpenChange(false)}>Cancel</Button>
                          <Button type="submit" disabled={isSubmitting}>
                              <Save className="mr-2 h-4 w-4" />
                              {isSubmitting ? 'Saving...' : 'Save Course'}
                          </Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the course "{selectedCourse?.title}".
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSelectedCourse(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteCourse} className={buttonVariants({ variant: "destructive" })}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={handleReviewDialogOpenChange}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Review Assignment</DialogTitle>
                  <DialogDescription>
                    {selectedAssignment?.status === 'Pending Review' 
                      ? "Review the student's submission and accept it to provide a solution."
                      : "Upload a solution and set a price for your work."}
                  </DialogDescription>
              </DialogHeader>
              {selectedAssignment && (
                  <div className="space-y-6 py-4">
                      <div className="space-y-4 p-4 rounded-lg bg-muted/50">
                          <h4 className="font-semibold">Submission Details</h4>
                           <div className="text-sm space-y-2">
                                <p><span className="text-muted-foreground">Student:</span> {selectedAssignment.studentName}</p>
                                <p><span className="text-muted-foreground">Assignment:</span> {selectedAssignment.title || 'N/A'} / {selectedAssignment.course}</p>
                                {selectedAssignment.instructions && <p><span className="text-muted-foreground">Instructions:</span> {selectedAssignment.instructions}</p>}
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedAssignment.fileUrl} download><Download className="mr-2 h-4 w-4"/>Download Submission</a>
                          </Button>
                      </div>

                      {selectedAssignment.status === 'In Progress' && selectedAssignment.markerId === user?.uid && (
                        <>
                          <div className="space-y-2">
                              <Label>Upload Solution</Label>
                              <div className="flex items-center justify-center w-full">
                                  <label htmlFor="dropzone-file-solution" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-medium">Click to upload</span> or drag and drop</p>
                                          <p className="text-xs text-muted-foreground">PDF, DOCX, or JPG</p>
                                      </div>
                                      <Input id="dropzone-file-solution" type="file" className="hidden" />
                                  </label>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label>Set Price (R)</Label>
                              <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R</span>
                                  <Input id="solution-price" type="number" placeholder="e.g. 150" className="pl-8" defaultValue={selectedAssignment.price ?? ''} />
                              </div>
                          </div>
                        </>
                      )}

                      <DialogFooter>
                          <Button type="button" variant="ghost" onClick={() => handleReviewDialogOpenChange(false)}>Cancel</Button>
                          {selectedAssignment.status === 'Pending Review' && (
                            <Button type="button" onClick={() => handleAcceptAssignment(selectedAssignment)}>
                               <Check className="mr-2 h-4 w-4" /> Accept Assignment
                            </Button>
                          )}
                          {selectedAssignment.status === 'In Progress' && (
                            <Button type="button" onClick={() => handleSaveSolution(selectedAssignment.id, parseFloat((document.getElementById('solution-price') as HTMLInputElement).value || '0'))}>
                                <Save className="mr-2 h-4 w-4" /> Save Solution
                            </Button>
                          )}
                      </DialogFooter>
                  </div>
              )}
          </DialogContent>
      </Dialog>
      
      {/* Student Action Dialogs */}
      <Dialog open={isStudentDetailsDialogOpen} onOpenChange={setIsStudentDetailsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            {selectedStudent && (
                <>
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                             <Avatar className="h-16 w-16 border">
                                <AvatarFallback className="text-2xl">{selectedStudent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-2xl">{selectedStudent.name}</DialogTitle>
                                <DialogDescription>{selectedStudent.email}</DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="text-sm space-y-2">
                            <p><strong>Enrolled In:</strong> <Badge variant="outline">{selectedStudent.course}</Badge></p>
                            <p><strong>Joined:</strong> {selectedStudent.joined}</p>
                            <div className="flex items-center gap-2">
                                <strong>Progress:</strong>
                                <Progress value={selectedStudent.progress} className="w-32 h-2" />
                                <span>{selectedStudent.progress}%</span>
                            </div>
                        </div>
                        
                        <Separator />

                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsStudentDetailsDialogOpen(false)}>Close</Button>
                    </DialogFooter>
                </>
            )}
          </DialogContent>
      </Dialog>

      <AlertDialog open={isUnenrollDialogOpen} onOpenChange={setIsUnenrollDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to unenroll this student?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will remove <strong>{selectedStudent?.name}</strong> from the course. They will lose access to the course content. This action can be reversed by have them enroll again.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedStudent(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmUnenrollStudent}>
                      <UserMinus className="mr-2 h-4 w-4" /> Unenroll
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteStudentDialogOpen} onOpenChange={setIsDeleteStudentDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the student profile for <strong>{selectedStudent?.name}</strong> and remove all their associated data.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedStudent(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDeleteStudent} className={buttonVariants({ variant: "destructive" })}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Student
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

        {/* Transaction Dialogs */}
        <Dialog open={isTransactionDetailsOpen} onOpenChange={setIsTransactionDetailsOpen}>
            <DialogContent>
                {selectedTransaction && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                            <DialogDescription>Transaction ID: {selectedTransaction.id}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Item</span>
                                <span className="font-medium">{selectedTransaction.itemTitle}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Student</span>
                                <span className="font-medium">{selectedTransaction.studentName || 'N/A'}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Date</span>
                                <span className="font-medium">{selectedTransaction.date}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium capitalize">{selectedTransaction.itemType}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <span className="font-medium">{selectedTransaction.status}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-bold">R {selectedTransaction.amount.toFixed(2)}</span>
                            </div>
                        </div>
                         <DialogFooter>
                            <Button variant="outline" onClick={() => setIsTransactionDetailsOpen(false)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
        
        <AlertDialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to refund this transaction?
                        <div className="p-2 mt-2 bg-muted rounded-md text-sm">
                            <strong>{selectedTransaction?.itemTitle}</strong> for <strong>R {selectedTransaction?.amount.toFixed(2)}</strong>
                        </div>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRefundTransaction} className={buttonVariants({ variant: "destructive" })}>
                        <Undo2 className="mr-2 h-4 w-4" /> Confirm Refund
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isPayoutDialogOpen} onOpenChange={setIsPayoutDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                    <DialogDescription>Withdraw funds to your linked bank account.</DialogDescription>
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-3xl font-bold">R {availableForPayout.toFixed(2)}</p>
                    </div>
                    <div>
                        <Label htmlFor="payout-amount">Amount to withdraw (R)</Label>
                        <Input id="payout-amount" type="number" placeholder="e.g. 1000" defaultValue={availableForPayout > 0 ? availableForPayout.toFixed(2) : ''} />
                    </div>
                 </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setIsPayoutDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => handlePayoutRequest(parseFloat((document.getElementById('payout-amount') as HTMLInputElement).value || '0'))}>
                        <Send className="mr-2 h-4 w-4" /> Request Payout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}

export default withAuth(InstructorPage, ['instructor']);
