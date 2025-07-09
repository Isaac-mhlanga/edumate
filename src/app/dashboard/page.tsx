import { AppLayout } from "@/components/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { studentData } from "@/lib/data";
import { Book, CheckCircle, Clock } from "lucide-react";

export default function DashboardPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {studentData.name.split(' ')[0]}!</h1>
          <p className="text-muted-foreground">Here's a summary of your learning journey.</p>
        </div>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Active Subscriptions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {studentData.activeSubscriptions.map((sub) => (
              <Card key={sub.id} className="shadow-md rounded-xl">
                <CardHeader>
                  <CardTitle>{sub.name}</CardTitle>
                  <CardDescription>Expires on: {sub.expires}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold text-primary">{sub.progress}%</span>
                  </div>
                  <Progress value={sub.progress} className="h-2"/>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Submitted Assignments</h2>
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
                      <Badge variant={assignment.status === 'Graded' ? 'default' : 'secondary'} className={assignment.status === 'Graded' ? 'bg-green-500/20 text-green-700 border-green-500/30' : 'bg-blue-500/20 text-blue-700 border-blue-500/30'}>
                        {assignment.status === 'Graded' && <CheckCircle className="mr-1 h-3 w-3" />}
                        {assignment.status !== 'Graded' && <Clock className="mr-1 h-3 w-3" />}
                        {assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{assignment.grade || 'N/A'}</TableCell>
                    <TableCell>{assignment.submitted}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Purchased Courses</h2>
                <Button variant="outline">View All</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {studentData.purchasedCourses.map((course) => (
                    <Card key={course.id} className="shadow-md rounded-xl overflow-hidden group">
                        <CardHeader className="p-0">
                            <div className="bg-primary/10 aspect-video flex items-center justify-center">
                                <Book className="w-12 h-12 text-primary/50"/>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <Badge variant="secondary" className="mb-2">{course.category}</Badge>
                            <h3 className="font-semibold text-lg">{course.name}</h3>
                            <Button variant="link" className="p-0 h-auto mt-2">
                                Start Learning
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
