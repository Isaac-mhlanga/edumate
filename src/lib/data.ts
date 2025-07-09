
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
        { id: "A001", title: "Calculus Problem Set 5", course: "Grade 12 - Maths Pro", submitted: "2024-05-10", status: "Paid", price: 150, solutionUrl: "#" },
        { id: "A002", title: "Newtonian Physics Lab Report", course: "Grade 12 - Physical Sciences Pro", submitted: "2024-05-20", status: "Awaiting Payment", price: 120, solutionUrl: null },
        { id: "A003", title: "Trigonometry Final Exam", course: "Grade 12 - Maths Pro", submitted: "2024-05-22", status: "Submitted", price: null, solutionUrl: null },
        { id: "A004", title: "Wave Optics Assignment", course: "Grade 12 - Physical Sciences Pro", submitted: null, status: "Pending Submission", price: null, solutionUrl: null },
        { id: "A005", title: "Organic Chemistry Practice", course: "Grade 12 - Physical Sciences Pro", submitted: null, status: "Pending Submission", price: null, solutionUrl: null },
    ]
};

export const instructorData = {
    name: "Dr. Evelyn Reed",
    stats: [
        { title: "Enrolled Students", value: "1,204", icon: Users, change: "+12%" },
        { title: "Uploaded Lessons", value: "82", icon: Book, change: "+5 this month" },
        { title: "Monthly Earnings", value: "R 4,820", icon: DollarSign, change: "+21%" },
        { title: "Pending Assignments", value: "14", icon: Clock, change: "3 new" },
    ],
    enrolledStudents: [
        { 
            id: 'S001', name: 'Michael Chen', email: 'michael.c@example.com', course: 'Grade 12 - Maths', joined: '2024-03-15', progress: 80,
            activeSubscriptions: ['Grade 12 - Maths Pro'],
            purchasedCourses: ['Advanced Calculus Masterclass']
        },
        { 
            id: 'S002', name: 'Jessica Rodriguez', email: 'jess.r@example.com', course: 'Grade 12 - Physics', joined: '2024-03-20', progress: 65,
            activeSubscriptions: ['Grade 12 - Physical Sciences Pro'],
            purchasedCourses: []
        },
        { 
            id: 'S003', name: 'David Lee', email: 'david.l@example.com', course: 'Grade 11 - Maths', joined: '2024-04-01', progress: 40,
            activeSubscriptions: [],
            purchasedCourses: ['Algebra Basics', 'Geometry Essentials']
        },
        { 
            id: 'S004', name: 'Sarah Miller', email: 'sarah.m@example.com', course: 'Grade 12 - Maths', joined: '2024-04-05', progress: 95,
            activeSubscriptions: ['Grade 12 - Maths Pro', 'Grade 12 - All Subjects Bundle'],
            purchasedCourses: []
        },
        { 
            id: 'S005', name: 'Ben Carter', email: 'ben.carter@example.com', course: 'Grade 11 - Physics', joined: '2024-04-10', progress: 55,
            activeSubscriptions: [],
            purchasedCourses: []
        },
    ],
    submittedAssignments: [
        { id: 'A012', studentName: 'Emily White', assignmentTitle: 'Thermodynamics Problem Set', course: 'Physical Sciences G12', submittedDate: '2 hours ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A011', studentName: 'James Brown', assignmentTitle: 'Optics Lab Analysis', course: 'Physical Sciences G12', submittedDate: '1 day ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A010', studentName: 'Olivia Green', assignmentTitle: 'Algebra II Worksheet', course: 'Maths G11', submittedDate: '3 days ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A013', studentName: 'Lucas Grey', assignmentTitle: 'Momentum Questions', course: 'Physical Sciences G11', submittedDate: '4 days ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A014', studentName: 'Chloe Taylor', assignmentTitle: 'Stoichiometry Calculations', course: 'Physical Sciences G12', submittedDate: '4 days ago', status: 'Pending Review', fileUrl: '#' },
        { id: 'A009', studentName: 'Michael Chen', assignmentTitle: 'Calculus Derivatives Quiz', course: 'Maths G12', submittedDate: '5 days ago', status: 'Awaiting Payment', price: 150, fileUrl: '#' },
        { id: 'A008', studentName: 'Daniel Kim', assignmentTitle: 'Organic Chemistry Reactions', course: 'Physical Sciences G12', submittedDate: '1 week ago', status: 'Paid', price: 120, fileUrl: '#' },
    ],
    transactions: [
        { id: 'T001', studentName: 'Michael Chen', item: 'Calculus Fundamentals', type: 'Course Sale', status: 'Completed', amount: 499.00, date: '2024-05-20' },
        { id: 'T002', studentName: 'Daniel Kim', item: 'Organic Chemistry Reactions', type: 'Assignment Sale', status: 'Completed', amount: 120.00, date: '2024-05-18' },
        { id: 'T003', studentName: 'Jessica Rodriguez', item: 'Newtonian Mechanics', type: 'Subscription', status: 'Completed', amount: 150.00, date: '2024-05-15' },
        { id: 'T004', studentName: 'Michael Chen', item: 'Calculus Fundamentals', type: 'Refund', status: 'Refunded', amount: -499.00, date: '2024-05-21' },
        { id: 'T005', studentName: 'Sarah Miller', item: 'Grade 12 - All Subjects Bundle', type: 'Subscription', status: 'Completed', amount: 350.00, date: '2024-05-12' },
        { id: 'T006', studentName: null, item: 'May 2024 Payout', type: 'Payout', status: 'Completed', amount: -2500.00, date: '2024-05-10' },
        { id: 'T007', studentName: 'Ben Carter', item: 'Thermodynamics Problem Set', type: 'Assignment Sale', status: 'Pending', amount: 75.00, date: '2024-05-22' },
        { id: 'T008', studentName: 'David Lee', item: 'Algebra Basics', type: 'Course Sale', status: 'Completed', amount: 250.00, date: '2024-05-05' },
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

    