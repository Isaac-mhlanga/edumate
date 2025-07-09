
import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { studentData } from "@/lib/data";
import { ArrowRight, Award, BookOpen, CheckCircle, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DashboardPage() {
    const completedAssignmentsCount = studentData.submittedAssignments.filter(a => a.status === 'Graded').length;
    const certificatesEarned = 1; 

    const stats = [
        { title: "Courses in Progress", value: studentData.activeSubscriptions.length, icon: BookOpen },
        { title: "Completed Assignments", value: completedAssignmentsCount, icon: CheckCircle },
        { title: "Certificates Earned", value: certificatesEarned, icon: Award },
    ];

    return (
        <AppLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {studentData.name.split(' ')[0]}!</h1>
                    <p className="text-muted-foreground">Let's continue your learning journey.</p>
                </div>

                <section className="grid gap-6 md:grid-cols-3">
                    {stats.map((stat) => (
                        <Card key={stat.title} className="shadow-md rounded-xl">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-5 w-5 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                            </CardContent>
                        </Card>
                    ))}
                </section>
                
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Continue Learning</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {studentData.activeSubscriptions.map((sub) => (
                            <Card key={sub.id} className="shadow-md rounded-xl flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <CardTitle>{sub.name}</CardTitle>
                                        <Badge>Subscribed</Badge>
                                    </div>
                                    <CardDescription>Expires on: {sub.expires}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                   <p className="text-sm text-muted-foreground">You're making great progress. Keep going to master the material and achieve your goals.</p>
                                </CardContent>
                                <CardFooter className="flex-col items-start pt-4 border-t">
                                    <div className="w-full">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Progress</span>
                                            <span className="text-sm font-bold text-primary">{sub.progress}%</span>
                                        </div>
                                        <Progress value={sub.progress} className="h-2"/>
                                    </div>
                                    <Button className="mt-4 w-full">
                                        Continue Learning <ArrowRight className="ml-2 h-4 w-4"/>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">My Assignments</h2>
                    <Card className="shadow-md rounded-xl">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Submitted On</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {studentData.submittedAssignments.map((assignment) => (
                                    <TableRow key={assignment.id}>
                                        <TableCell className="font-medium">{assignment.title}</TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={
                                                    assignment.status === 'Graded' ? 'default' 
                                                    : assignment.status === 'Submitted' ? 'secondary' 
                                                    : 'outline'
                                                } 
                                                className={
                                                    assignment.status === 'Graded' ? 'bg-green-500/20 text-green-700 border-green-500/30 dark:text-green-400' 
                                                    : assignment.status === 'Submitted' ? 'bg-blue-500/20 text-blue-700 border-blue-500/30 dark:text-blue-400' 
                                                    : 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 dark:text-yellow-400'
                                                }>
                                                {assignment.status === 'Graded' && <CheckCircle className="mr-1 h-3 w-3" />}
                                                {assignment.status !== 'Graded' && <Clock className="mr-1 h-3 w-3" />}
                                                {assignment.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">{assignment.grade || 'N/A'}</TableCell>
                                        <TableCell>{assignment.submitted}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                </section>

                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold">My Course Library</h2>
                        <Button variant="outline">View All</Button>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {studentData.purchasedCourses.map((course) => (
                            <Card key={course.id} className="shadow-md rounded-xl overflow-hidden group">
                                <CardHeader className="p-0">
                                    <div className="bg-primary/10 aspect-video flex items-center justify-center">
                                       <Image src="https://placehold.co/600x400.png" alt={course.name} width={600} height={400} className="w-full h-full object-cover transition-transform group-hover:scale-105" data-ai-hint="online course abstract" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                                    <h3 className="font-semibold text-lg">{course.name}</h3>
                                    <Button variant="link" className="p-0 h-auto mt-2 as-child">
                                        <Link href="#">
                                            Start Learning <ArrowRight className="ml-1 h-4 w-4"/>
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

            </div>
        </AppLayout>
    );
}
