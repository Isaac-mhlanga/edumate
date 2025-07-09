'use client';

import { AppLayout } from "@/components/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { instructorData } from "@/lib/data";
import { ArrowUpRight, MoreHorizontal } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Rectangle, XAxis, YAxis } from "recharts";

const chartConfig = {
  engagement: {
    label: "Engagement",
    color: "hsl(var(--primary))",
  },
  income: {
    label: "Income ($)",
    color: "hsl(var(--secondary))",
  }
} satisfies ChartConfig;

export default function InstructorPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
          <p className="text-muted-foreground">Manage your students, lessons, and earnings.</p>
        </div>

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
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                   <YAxis />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
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
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{assignment.student.charAt(0)}</AvatarFallback>
                    </Avatar>
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
                         <Avatar className="h-9 w-9">
                            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                         </Avatar>
                         <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{student.course}</Badge>
                    </TableCell>
                    <TableCell>{student.joined}</TableCell>
                    <TableCell>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </section>

      </div>
    </AppLayout>
  );
}
