import { BarChart, Book, CheckCircle, Clock, DollarSign, Users } from "lucide-react";

export const studentData = {
    name: "Alex Johnson",
    activeSubscriptions: [
        { id: 1, name: "Grade 12 - Maths Pro", expires: "2024-12-31", progress: 75 },
        { id: 2, name: "Grade 12 - Physical Sciences Pro", expires: "2024-11-30", progress: 45 },
    ],
    purchasedCourses: [
        { id: 1, name: "Advanced Calculus Masterclass", category: "Maths" },
        { id: 2, name: "Quantum Mechanics Explained", category: "Physical Sciences" },
        { id: 3, name: "Organic Chemistry Fundamentals", category: "Physical Sciences" },
    ],
    submittedAssignments: [
        { id: "A001", title: "Calculus Problem Set 5", status: "Graded", grade: "A-", submitted: "2024-05-10" },
        { id: "A002", title: "Newtonian Physics Lab Report", status: "Submitted", grade: null, submitted: "2024-05-20" },
        { id: "A003", title: "Trigonometry Final Exam", status: "Pending", grade: null, submitted: "2024-05-22" },
    ]
};

export const instructorData = {
    name: "Dr. Evelyn Reed",
    stats: [
        { title: "Enrolled Students", value: "1,204", icon: Users, change: "+12%" },
        { title: "Uploaded Lessons", value: "82", icon: Book, change: "+5 this month" },
        { title: "Monthly Earnings", value: "$4,820", icon: DollarSign, change: "+21%" },
        { title: "Pending Assignments", value: "14", icon: Clock, change: "3 new" },
    ],
    enrolledStudents: [
        { id: 'S001', name: 'Michael Chen', email: 'michael.c@example.com', course: 'Grade 12 - Maths', joined: '2024-03-15' },
        { id: 'S002', name: 'Jessica Rodriguez', email: 'jess.r@example.com', course: 'Grade 12 - Physics', joined: '2024-03-20' },
        { id: 'S003', name: 'David Lee', email: 'david.l@example.com', course: 'Grade 11 - Maths', joined: '2024-04-01' },
        { id: 'S004', name: 'Sarah Miller', email: 'sarah.m@example.com', course: 'Grade 12 - Maths', joined: '2024-04-05' },
    ],
    submittedAssignments: [
        { id: 'A012', studentName: 'Emily White', assignmentTitle: 'Thermodynamics Problem Set', course: 'Physical Sciences G12', submittedDate: '2 hours ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A011', studentName: 'James Brown', assignmentTitle: 'Optics Lab Analysis', course: 'Physical Sciences G12', submittedDate: '1 day ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A010', studentName: 'Olivia Green', assignmentTitle: 'Algebra II Worksheet', course: 'Maths G11', submittedDate: '3 days ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A009', studentName: 'Michael Chen', assignmentTitle: 'Calculus Derivatives Quiz', course: 'Maths G12', submittedDate: '5 days ago', status: 'Awaiting Payment', price: 150, fileUrl: '#' },
        { id: 'A008', studentName: 'Daniel Kim', assignmentTitle: 'Organic Chemistry Reactions', course: 'Physical Sciences G12', submittedDate: '1 week ago', status: 'Paid', price: 120, fileUrl: '#' },
    ],
    engagementData: [
        { month: "Jan", engagement: 186, income: 800 },
        { month: "Feb", engagement: 305, income: 1200 },
        { month: "Mar", engagement: 237, income: 1000 },
        { month: "Apr", engagement: 273, income: 1500 },
        { month: "May", engagement: 209, income: 1300 },
        { month: "Jun", engagement: 250, income: 1750 },
    ],
    courses: [
        {
            id: 'C001',
            title: 'Calculus Fundamentals',
            description: 'A deep dive into the fundamentals of calculus, from limits to derivatives.',
            subject: 'Maths',
            grade: '12',
            thumbnail: 'https://placehold.co/600x400.png',
            pricing: {
                type: 'purchase',
                price: 499,
            },
            status: 'Published',
            videos: [
                { id: 'V001', title: 'Introduction to Limits' },
                { id: 'V002', title: 'Understanding Derivatives' },
            ]
        },
        {
            id: 'C002',
            title: 'Newtonian Mechanics',
            description: 'Explore the laws of motion and gravity as described by Sir Isaac Newton.',
            subject: 'Physical Sciences',
            grade: '11',
            thumbnail: 'https://placehold.co/600x400.png',
            pricing: {
                type: 'subscription',
            },
            status: 'Draft',
            videos: [
                { id: 'V003', title: 'First Law of Motion' },
                { id: 'V004', title: 'Second & Third Laws' },
                { id: 'V005', title: 'Universal Gravitation' },
            ]
        }
    ]
};
