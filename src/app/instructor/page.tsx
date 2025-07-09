'use client';

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { ArrowUpRight, DollarSign, Edit, MoreVertical, PlusCircle, Trash2, UploadCloud, Video } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { z } from "zod";

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

export default function InstructorPage() {
  const { toast } = useToast();
  const [isCourseDialogOpen, setIsCourseDialogOpen] = React.useState(false);

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

  function onCourseSubmit(data: CourseFormValues) {
    console.log(data);
    toast({
      title: "Course Created!",
      description: `The course "${data.title}" has been successfully created.`,
    });
    setIsCourseDialogOpen(false);
    form.reset();
  }
  
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your students, lessons, and earnings.</p>
        </div>

        <Tabs defaultValue="courses" className="w-full">
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
                      {instructorData.pendingAssignments.map((assignment) => (
                        <li key={assignment.id} className="flex items-center gap-4">
                          <Avatar className="h-10 w-10"><AvatarFallback>{assignment.student.charAt(0)}</AvatarFallback></Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">From {assignment.student} - {assignment.received}</p>
                          </div>
                          <Button variant="outline" size="sm">Review</Button>
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
                    <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2"/> Add New Course</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Course</DialogTitle>
                                <DialogDescription>Fill in the details below to create a new course.</DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onCourseSubmit)} className="space-y-6 py-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4 col-span-1 md:col-span-2">
                                            <Label>Thumbnail / Cover Image</Label>
                                            <div className="flex items-center justify-center w-full">
                                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
                                                    </div>
                                                    <Input id="dropzone-file" type="file" className="hidden" />
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-3 gap-4">
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
                                                            <Input type="number" placeholder="e.g. 499" className="pl-8" {...field} />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        )}
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="ghost" onClick={() => setIsCourseDialogOpen(false)}>Cancel</Button>
                                        <Button type="submit">Save Course</Button>
                                    </DialogFooter>
                                </form>
                            </Form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                  {instructorData.courses.length > 0 ? (
                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {instructorData.courses.map((course) => (
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
                                        <DropdownMenuItem><Edit className="mr-2"/>Edit Course</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive focus:text-destructive"><Trash2 className="mr-2"/>Delete Course</DropdownMenuItem>
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
                <CardContent>
                    <div className="text-center py-16 border-2 border-dashed rounded-lg">
                      <h3 className="text-lg font-semibold">No Assignments to Review</h3>
                      <p className="text-muted-foreground mt-1">New student submissions will appear here.</p>
                    </div>
                </CardContent>
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
    </AppLayout>
  );
}
