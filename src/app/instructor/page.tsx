
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { instructorData } from "@/lib/data";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUpRight, CheckCircle, ChevronLeft, ChevronRight, CircleDollarSign, DollarSign, Edit, Eye, Hourglass, MoreVertical, PlusCircle, Trash2, UploadCloud, Video, Download, Search, ListFilter } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

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

export default function InstructorPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const currentTab = searchParams.get('tab') || 'overview';

  const [courses, setCourses] = React.useState<Course[]>(instructorData.courses);
  const [submittedAssignments, setSubmittedAssignments] = React.useState<SubmittedAssignment[]>(instructorData.submittedAssignments);
  const [selectedCourse, setSelectedCourse] = React.useState<Course | null>(null);
  const [selectedAssignment, setSelectedAssignment] = React.useState<SubmittedAssignment | null>(null);
  const [isCourseDialogOpen, setIsCourseDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = React.useState(false);

  // State for assignments filtering and pagination
  const [filters, setFilters] = React.useState({ search: '', status: 'All' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;

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
    } else {
      form.reset({
        title: "",
        description: "",
        subject: "Maths",
        grade: "12",
        pricingModel: "free",
        price: undefined,
      });
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

  const handleDeleteCourse = (course: Course) => {
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
    if (selectedCourse) {
      setCourses(courses.map(c => c.id === selectedCourse.id ? { 
        ...c, 
        ...data, 
        pricing: { type: data.pricingModel, price: data.price } 
      } : c));
      toast({
        title: "Course Updated!",
        description: `The course "${data.title}" has been successfully updated.`,
      });
    } else {
      const newCourse: Course = {
        id: `C${Date.now()}`,
        ...data,
        thumbnail: 'https://placehold.co/600x400.png',
        status: 'Draft',
        videos: [],
        pricing: {
          type: data.pricingModel,
          price: data.price
        }
      };
      setCourses([newCourse, ...courses]);
      toast({
        title: "Course Created!",
        description: `The course "${data.title}" has been successfully created.`,
      });
    }
    setIsCourseDialogOpen(false);
    setSelectedCourse(null);
  }

  function handleSaveSolution(assignmentId: string, price: number) {
    setSubmittedAssignments(assignments => assignments.map(a => a.id === assignmentId ? { ...a, status: 'Awaiting Payment', price: price } : a));
    toast({
        title: "Solution Uploaded!",
        description: `The solution has been priced and is now awaiting student payment.`
    });
    handleReviewDialogOpenChange(false);
  }

  const handleFilterChange = (key: 'search' | 'status', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page on any filter change
  };

  const filteredAssignments = React.useMemo(() => {
    return submittedAssignments.filter(assignment => {
        const searchMatch = filters.search.trim().toLowerCase() === '' ||
            assignment.studentName.toLowerCase().includes(filters.search.trim().toLowerCase()) ||
            assignment.assignmentTitle.toLowerCase().includes(filters.search.trim().toLowerCase());
        
        const statusMatch = filters.status === 'All' || assignment.status === filters.status;

        return searchMatch && statusMatch;
    });
  }, [submittedAssignments, filters]);

  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const paginatedAssignments = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
    }
  };
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your students, lessons, and earnings.</p>
        </div>

        <Tabs defaultValue={currentTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>
          
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
                
                <Card className="shadow-md rounded-xl">
                  <CardHeader>
                    <CardTitle>Pending Assignments</CardTitle>
                    <CardDescription>Assignments waiting for your review.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {submittedAssignments.filter(a => a.status === 'Pending Review').slice(0, 3).map((assignment) => (
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
                  </CardContent>
                </Card>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Enrolled Students</h2>
                <Card className="shadow-md rounded-xl">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Joined Date</TableHead>
                        <TableHead><span className="sr-only">Actions</span></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {instructorData.enrolledStudents.map((student) => (
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
                          <TableCell><Badge variant="secondary">{student.course}</Badge></TableCell>
                          <TableCell>{student.joined}</TableCell>
                          <TableCell><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></TableCell>
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
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Course Management</CardTitle>
                        <CardDescription>Upload, edit, and manage your courses.</CardDescription>
                    </div>
                    <Button onClick={handleAddNewCourse}><PlusCircle className="mr-2"/> Add New Course</Button>
                </CardHeader>
                <CardContent>
                  {courses.length > 0 ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {courses.map((course) => (
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
                                        <DropdownMenuItem onClick={() => handleDeleteCourse(course)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete Course</DropdownMenuItem>
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
                      <h3 className="text-lg font-semibold">No Courses Yet</h3>
                      <p className="text-muted-foreground mt-1">Start building your library by clicking "Add New Course".</p>
                    </div>
                  )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="pt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Assignment Management</CardTitle>
                    <CardDescription>Review submitted assignments, upload solutions, and set pricing.</CardDescription>
                </CardHeader>
                 <div className="flex items-center justify-between gap-2 p-4 border-y">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by student or assignment..."
                            className="pl-8"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-1">
                                <ListFilter className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                    Filter by Status
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
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
                                    <TableHead>Assignment</TableHead>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 hidden sm:flex"><AvatarFallback>{assignment.studentName.split(' ').map(n=>n[0]).join('')}</AvatarFallback></Avatar>
                                                <span className="font-medium">{assignment.studentName}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{assignment.assignmentTitle}</TableCell>
                                        <TableCell><Badge variant="outline">{assignment.course}</Badge></TableCell>
                                        <TableCell>{assignment.submittedDate}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    assignment.status === 'Paid' ? 'default'
                                                    : assignment.status === 'Awaiting Payment' ? 'secondary'
                                                    : 'outline'
                                                }
                                                className={
                                                    assignment.status === 'Paid'
                                                    ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400'
                                                    : assignment.status === 'Awaiting Payment'
                                                    ? 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400'
                                                    : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400'
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
                                                {assignment.status === 'Pending Review' ? 'Review' : 'View/Update'}
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
                <CardFooter className="flex items-center justify-between py-4">
                    <div className="text-xs text-muted-foreground">
                        Showing{" "}
                        <strong>
                            {filteredAssignments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}-
                            {Math.min(currentPage * itemsPerPage, filteredAssignments.length)}
                        </strong>{" "}
                        of <strong>{filteredAssignments.length}</strong> assignments.
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <ChevronLeft />
                            Prev
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages}>
                            Next
                            <ChevronRight />
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
                <CardContent>
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                      <h3 className="text-lg font-semibold">No Enrolled Students</h3>
                      <p className="text-muted-foreground mt-1">Students who purchase your courses will be listed here.</p>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="pt-6">
             <Card>
                <CardHeader>
                    <CardTitle>Earnings & Transactions</CardTitle>
                    <CardDescription>Track your revenue from courses and assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                      <h3 className="text-lg font-semibold">No Transactions Yet</h3>
                      <p className="text-muted-foreground mt-1">Your sales and earnings will be displayed here.</p>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

       <Dialog open={isCourseDialogOpen} onOpenChange={handleCourseDialogOpenChange}>
          <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                  <DialogTitle>{selectedCourse ? 'Edit' : 'Create New'} Course</DialogTitle>
                  <DialogDescription>
                    {selectedCourse ? 'Update the details for your course.' : 'Fill in the details below to create a new course.'}
                  </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onCourseSubmit)} className="space-y-6 py-4">
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
                      </div>
                      <DialogFooter>
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
    </AppLayout>
  );
}
