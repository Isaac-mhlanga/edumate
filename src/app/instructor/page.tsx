
'use client';

import { AppLayout } from "@/components/app-layout";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { instructorData } from "@/lib/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, Banknote, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, CircleDollarSign, DollarSign, Edit, Eye, GraduationCap, Hourglass, ListFilter, MoreVertical, PlusCircle, ReceiptText, Search, ShieldCheck, Trash2, Undo2, UploadCloud, UserMinus, Video, XCircle, Download, FileUp } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import withAuth from "@/components/with-auth";

const chartConfig = {
  engagement: { label: "Engagement", color: "hsl(var(--primary))" },
  income: { label: "Income ($)", color: "hsl(var(--secondary))" }
} satisfies ChartConfig;

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  subject: z.enum(["Maths", "Physical Sciences"]),
  grade: z.enum(["10", "11", "12"]),
  pricingModel: z.enum(["free", "purchase", "subscription"]),
  price: z.coerce.number().optional(),
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
type Course = (typeof instructorData.courses)[0];
type SubmittedAssignment = (typeof instructorData.submittedAssignments)[0];
type EnrolledStudent = (typeof instructorData.enrolledStudents)[0];
type Transaction = (typeof instructorData.transactions)[0];

type VideoUpload = {
    title: string;
    file: File | null;
    fileName: string;
};

function InstructorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const currentTab = searchParams.get('tab') || 'overview';

  const [courses, setCourses] = React.useState<Course[]>(instructorData.courses);
  const [submittedAssignments, setSubmittedAssignments] = React.useState<SubmittedAssignment[]>(instructorData.submittedAssignments);
  const [enrolledStudents, setEnrolledStudents] = React.useState<EnrolledStudent[]>(instructorData.enrolledStudents);
  const [transactions, setTransactions] = React.useState<Transaction[]>(instructorData.transactions);
  const [videoUploads, setVideoUploads] = React.useState<VideoUpload[]>([]);

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

  const pricingModel = form.watch("pricingModel");

  const handleAddNewVideo = () => {
    setVideoUploads([...videoUploads, { title: '', file: null, fileName: '' }]);
  };

  const handleVideoTitleChange = (index: number, title: string) => {
    const newUploads = [...videoUploads];
    newUploads[index].title = title;
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
    if (selectedCourse) {
      form.reset({
        title: selectedCourse.title,
        description: selectedCourse.description,
        subject: selectedCourse.subject,
        grade: selectedCourse.grade,
        pricingModel: selectedCourse.pricing.type,
        price: selectedCourse.pricing.price,
      });
      setVideoUploads([]); // Reset video uploads for now. Could be extended to edit existing videos.
    } else {
      form.reset({
        title: "",
        description: "",
        subject: "Maths",
        grade: "12",
        pricingModel: "free",
        price: undefined,
      });
      setVideoUploads([]);
    }
  }, [selectedCourse, form]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.replace(`${pathname}?${params.toString()}`);
  };

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
  }
  
  const confirmDeleteCourse = () => {
    if (!selectedCourse) return;
    setCourses(courses.filter(c => c.id !== selectedCourse.id));
    toast({
      title: "Course Deleted",
      description: `The course "${selectedCourse.title}" has been successfully deleted.`,
    });
    setIsDeleteDialogOpen(false);
    setSelectedCourse(null);
  };

  function onCourseSubmit(data: CourseFormValues) {
    const newVideos = videoUploads.map((v, i) => ({ id: `V${Date.now() + i}`, title: v.title }));

    if (selectedCourse) {
      setCourses(courses.map(c => c.id === selectedCourse.id ? { 
        ...c, 
        ...data, 
        pricing: { type: data.pricingModel, price: data.price },
        videos: [...c.videos, ...newVideos]
      } : c));
      toast({
        title: "Course Updated!",
        description: `The course "${data.title}" has been updated with ${newVideos.length} new video(s).`,
      });
    } else {
      const newCourse: Course = {
        id: `C${Date.now()}`,
        ...data,
        thumbnail: 'https://placehold.co/600x400.png',
        status: 'Draft',
        videos: newVideos,
        pricing: {
          type: data.pricingModel,
          price: data.price
        }
      };
      setCourses([newCourse, ...courses]);
      toast({
        title: "Course Created!",
        description: `The course "${data.title}" has been successfully created with ${newVideos.length} video(s).`,
      });
    }
    setIsCourseDialogOpen(false);
    setSelectedCourse(null);
    setVideoUploads([]);
  }

  function handleSaveSolution(assignmentId: string, price: number) {
    setSubmittedAssignments(assignments => assignments.map(a => a.id === assignmentId ? { ...a, status: 'Awaiting Payment', price: price } : a));
    toast({
        title: "Solution Uploaded!",
        description: `The solution has been priced and is now awaiting student payment.`
    });
    handleReviewDialogOpenChange(false);
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

  // Assignment filtering and pagination logic
  const handleAssignmentFilterChange = (key: 'search' | 'status', value: string) => {
    setAssignmentFilters(prev => ({ ...prev, [key]: value }));
    setCurrentAssignmentPage(1);
  };

  const filteredAssignments = React.useMemo(() => {
    return submittedAssignments.filter(assignment => {
        const searchMatch = assignmentFilters.search.trim().toLowerCase() === '' ||
            assignment.studentName.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase()) ||
            assignment.assignmentTitle.toLowerCase().includes(assignmentFilters.search.trim().toLowerCase());
        
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
    setTransactions(transactions.map(t => t.id === selectedTransaction.id ? { ...t, status: 'Refunded' } : t));
    toast({ title: "Refund Processed", description: `Transaction ${selectedTransaction.id} has been refunded.` });
    setIsRefundDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handlePayoutRequest = (amount: number) => {
    toast({ title: "Payout Requested", description: `Your request to withdraw R ${amount.toFixed(2)} has been submitted.` });
    setIsPayoutDialogOpen(false);
  };

  const totalRevenue = React.useMemo(() => transactions.filter(t => t.type !== 'Payout' && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0), [transactions]);
  const availableForPayout = React.useMemo(() => transactions.reduce((acc, t) => acc + t.amount, 0), [transactions]);

  // Overview Pending Assignments Pagination Logic
  const pendingAssignments = React.useMemo(() => {
    return submittedAssignments.filter(a => a.status === 'Pending Review');
  }, [submittedAssignments]);
  const totalPendingAssignmentPages = Math.ceil(pendingAssignments.length / pendingAssignmentsPerPage);
  const paginatedPendingAssignments = pendingAssignments.slice(
    (currentPendingAssignmentPage - 1) * pendingAssignmentsPerPage,
    currentPendingAssignmentPage * pendingAssignmentsPerPage
  );


  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your students, lessons, and earnings.</p>
        </div>

        <Tabs defaultValue={currentTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto pb-1">
            <TabsList className="grid w-full grid-cols-5 min-w-[600px] max-w-2xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="earnings">Earnings</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="pt-6">
            <div className="space-y-8">
              <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {instructorData.stats.map((stat) => (
                  <Card key={stat.title} className="shadow-md rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                      <stat.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground flex items-center">
                        <span className="text-green-600 mr-1 flex items-center"><ArrowUpRight className="h-4 w-4"/> {stat.change}</span> vs last month
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </section>

              <section className="grid gap-8 lg:grid-cols-2">
                <Card className="shadow-md rounded-xl">
                  <CardHeader>
                    <CardTitle>Engagement & Income</CardTitle>
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
                    <CardTitle>Pending Assignments</CardTitle>
                    <CardDescription>Assignments waiting for your review.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {paginatedPendingAssignments.length > 0 ? (
                      <ul className="space-y-4">
                        {paginatedPendingAssignments.map((assignment) => (
                          <li key={assignment.id} className="flex items-center gap-4">
                            <Avatar className="h-10 w-10"><AvatarFallback>{assignment.studentName.charAt(0)}</AvatarFallback></Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{assignment.assignmentTitle}</p>
                              <p className="text-sm text-muted-foreground">From {assignment.studentName} - {assignment.submittedDate}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleReviewAssignment(assignment)}>Review</Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-center text-muted-foreground h-full flex flex-col justify-center items-center">
                          <CheckCircle className="h-10 w-10 mb-2"/>
                          <h3 className="font-semibold">All caught up!</h3>
                          <p className="text-sm">No pending assignments to review.</p>
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
                      {enrolledStudents.slice(0, 4).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                               <Avatar className="h-9 w-9"><AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback></Avatar>
                               <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-muted-foreground">{student.email}</p>
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
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </section>
            </div>
          </TabsContent>

          <TabsContent value="courses" className="pt-6">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Course Management</CardTitle>
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
                  {paginatedCourses.length > 0 ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedCourses.map((course) => (
                        <Card key={course.id} className="overflow-hidden shadow-md rounded-xl">
                          <CardHeader className="p-0 relative">
                            <Image src={course.thumbnail} alt={course.title} width={400} height={200} className="aspect-video object-cover" data-ai-hint="online course" />
                            <Badge className="absolute top-2 right-2" variant={course.status === 'Published' ? 'default' : 'secondary'}>{course.status}</Badge>
                          </CardHeader>
                          <CardContent className="p-4">
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
          </TabsContent>

          <TabsContent value="assignments" className="pt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Assignment Management</CardTitle>
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
                                <DropdownMenuRadioItem value="Awaiting Payment">Awaiting Payment</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="Paid">Paid</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <CardContent className="p-0">
                    {paginatedAssignments.length > 0 ? (
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
                                            <div className="text-xs text-muted-foreground sm:hidden">{assignment.assignmentTitle}</div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">{assignment.assignmentTitle}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={"outline"}
                                                className={
                                                    assignment.status === 'Paid' ? 'bg-green-500/20 text-green-700'
                                                    : assignment.status === 'Awaiting Payment' ? 'bg-blue-500/20 text-blue-700'
                                                    : 'bg-yellow-500/20 text-yellow-700'
                                                }
                                            >
                                                {assignment.status === 'Paid' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                {assignment.status === 'Awaiting Payment' && <CircleDollarSign className="mr-1 h-3 w-3" />}
                                                {assignment.status === 'Pending Review' && <Hourglass className="mr-1 h-3 w-3" />}
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleReviewAssignment(assignment)}>
                                                {assignment.status === 'Pending Review' ? 'Review' : 'View'}
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
          </TabsContent>

          <TabsContent value="students" className="pt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Student Management</CardTitle>
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
                                            <Progress value={student.progress} className="w-24 h-2"/>
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
          </TabsContent>

          <TabsContent value="earnings" className="pt-6 space-y-6">
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
                            +R {transactions.filter(t => t.type === 'Course Sale' && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
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
                            +R {transactions.filter(t => t.type === 'Assignment Sale' && t.status !== 'Refunded').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">From paid solutions.</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-2">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>A detailed log of all your financial activities.</CardDescription>
                    </div>
                     <Button onClick={() => setIsPayoutDialogOpen(true)}>Request Payout</Button>
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
                    {paginatedTransactions.length > 0 ? (
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
                                {paginatedTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">{transaction.item}</TableCell>
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
                                                    {transaction.type !== 'Payout' && transaction.status === 'Completed' && (
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
          </TabsContent>
        </Tabs>

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
                          <div className="space-y-4 col-span-1 md:col-span-2">
                              <Label>Thumbnail / Cover Image</Label>
                              <div className="flex items-center justify-center w-full">
                                  <label htmlFor="dropzone-file-course" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                          <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                          <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
                                      </div>
                                      <Input id="dropzone-file-course" type="file" className="hidden" />
                                  </label>
                              </div>
                          </div>

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
                                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
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
                          <Button type="submit">Save Course</Button>
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
                <AlertDialogAction onClick={confirmDeleteCourse} className={buttonVariants({ variant: "destructive" })}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={handleReviewDialogOpenChange}>
          <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                  <DialogTitle>Review Assignment</DialogTitle>
                  <DialogDescription>
                      Review the student's submission, upload a solution, and set a price.
                  </DialogDescription>
              </DialogHeader>
              {selectedAssignment && (
                  <div className="space-y-6 py-4">
                      <div className="space-y-2 p-4 rounded-lg bg-muted/50">
                          <h4 className="font-semibold">Submission Details</h4>
                          <p className="text-sm"><span className="text-muted-foreground">Student:</span> {selectedAssignment.studentName}</p>
                          <p className="text-sm"><span className="text-muted-foreground">Assignment:</span> {selectedAssignment.assignmentTitle}</p>
                          <Button variant="outline" size="sm" asChild>
                            <a href={selectedAssignment.fileUrl} download><Download className="mr-2 h-4 w-4"/>Download Submission</a>
                          </Button>
                      </div>
                      <div className="space-y-2">
                          <Label>Upload Solution</Label>
                          <div className="flex items-center justify-center w-full">
                              <label htmlFor="dropzone-file-solution" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                      <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                      <p className="text-xs text-muted-foreground">PDF, DOCX, or JPG</p>
                                  </div>
                                  <Input id="dropzone-file-solution" type="file" className="hidden" />
                              </label>
                          </div>
                      </div>
                       <div className="space-y-2">
                          <Label>Set Price (R)</Label>
                           <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                                <Input id="solution-price" type="number" placeholder="e.g. 150" className="pl-8" defaultValue={selectedAssignment.price ?? ''} />
                           </div>
                       </div>
                      <DialogFooter>
                          <Button type="button" variant="ghost" onClick={() => handleReviewDialogOpenChange(false)}>Cancel</Button>
                          <Button type="button" onClick={() => handleSaveSolution(selectedAssignment.id, parseFloat((document.getElementById('solution-price') as HTMLInputElement).value || '0'))}>Save Solution</Button>
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

                        <div>
                            <h4 className="font-semibold mb-3 text-base">Active Subscriptions</h4>
                            {selectedStudent.activeSubscriptions && selectedStudent.activeSubscriptions.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedStudent.activeSubscriptions.map(sub => (
                                        <Card key={sub} className="p-3 bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <ShieldCheck className="h-5 w-5 text-primary"/>
                                                <p className="font-medium text-sm">{sub}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No active subscriptions.</p>}
                        </div>

                        <div>
                            <h4 className="font-semibold mb-3 text-base">Purchased Courses</h4>
                            {selectedStudent.purchasedCourses && selectedStudent.purchasedCourses.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedStudent.purchasedCourses.map(course => (
                                        <Card key={course} className="p-3 bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <GraduationCap className="h-5 w-5 text-secondary"/>
                                                <p className="font-medium text-sm">{course}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : <p className="text-sm text-muted-foreground">No purchased courses.</p>}
                        </div>
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
                      This will remove <strong>{selectedStudent?.name}</strong> from the course. They will lose access to the course content. This action can be reversed by having them enroll again.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedStudent(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmUnenrollStudent}>Unenroll</AlertDialogAction>
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
                  <AlertDialogAction onClick={confirmDeleteStudent} className={buttonVariants({ variant: "destructive" })}>Delete Student</AlertDialogAction>
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
                                <span className="font-medium">{selectedTransaction.item}</span>
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
                                <span className="font-medium">{selectedTransaction.type}</span>
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
                            <strong>{selectedTransaction?.item}</strong> for <strong>R {selectedTransaction?.amount.toFixed(2)}</strong>
                        </div>
                        This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setSelectedTransaction(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmRefundTransaction} className={buttonVariants({ variant: "destructive" })}>Confirm Refund</AlertDialogAction>
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
                    <Button onClick={() => handlePayoutRequest(parseFloat((document.getElementById('payout-amount') as HTMLInputElement).value || '0'))}>Request Payout</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
    </AppLayout>
  );
}

export default withAuth(InstructorPage, ['instructor']);

    