
import { BarChart, Book, CheckCircle, Clock, DollarSign, Users } from "lucide-react";

export const studentData = {
    name: "Alex Johnson",
    activeSubscriptions: [
        { id: 1, name: "Grade 12 - Maths Pro", expires: "2024-12-31", progress: 75 },
        { id: 2, name: "Grade 12 - Physical Sciences Pro", expires: "2024-11-30", progress: 45 },
    ],
    purchasedCourses: [
        { id: 'C001', name: "Calculus Fundamentals", category: "Maths" },
        { id: 'C003', name: "Organic Chemistry Fundamentals", category: "Physical Sciences" },
    ],
    submittedAssignments: [
        { id: "A001", title: "Calculus Problem Set 5", course: "Grade 12 - Maths Pro", status: "Paid", price: 150, solutionUrl: "#" },
        { id: "A002", title: "Newtonian Physics Lab Report", course: "Grade 12 - Physical Sciences Pro", status: "Awaiting Payment", price: 120, solutionUrl: null },
        { id: "A003", title: "Trigonometry Final Exam", course: "Grade 12 - Maths Pro", status: "Submitted", price: null, solutionUrl: null },
        { id: "A004", title: "Wave Optics Assignment", course: "Grade 12 - Physical Sciences Pro", status: "Pending Submission", price: null, solutionUrl: null },
        { id: "A005", title: "Organic Chemistry Practice", course: "Grade 12 - Physical Sciences Pro", status: "Pending Submission", price: null, solutionUrl: null },
    ],
    transactions: [
        { id: 'TXN001', item: 'Grade 12 - Maths Pro', type: 'Subscription', status: 'Completed', amount: 350.00, date: '2024-05-01' },
        { id: 'TXN002', item: 'Calculus Problem Set 5', type: 'Assignment', status: 'Completed', amount: 150.00, date: '2024-05-10' },
        { id: 'TXN003', item: 'Calculus Fundamentals', type: 'Course', status: 'Completed', amount: 499.00, date: '2024-04-15' },
        { id: 'TXN004', item: 'Grade 12 - Physical Sciences Pro', type: 'Subscription', status: 'Completed', amount: 350.00, date: '2024-04-01' },
        { id: 'TXN005', item: 'Organic Chemistry Fundamentals', type: 'Course', status: 'Completed', amount: 299.00, date: '2024-03-20' },
        { id: 'TXN006', item: 'Another Course', type: 'Course', status: 'Refunded', amount: 199.00, date: '2024-03-15' },
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
                { id: 'V003', title: 'The Chain Rule' },
                { id: 'V004', title: 'Product and Quotient Rules' },
                { id: 'V005', title: 'Introduction to Integrals' },
                { id: 'V006', title: 'The Fundamental Theorem of Calculus' },
                { id: 'V007', title: 'Advanced Integration Techniques' },
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
                { id: 'V008', title: 'First Law of Motion' },
                { id: 'V009', title: 'Second & Third Laws' },
                { id: 'V010', title: 'Universal Gravitation' },
            ]
        },
        {
            id: 'C003',
            title: 'Organic Chemistry Fundamentals',
            description: 'Learn the building blocks of organic chemistry, including nomenclature, structures, and basic reactions.',
            subject: 'Physical Sciences',
            grade: '12',
            thumbnail: 'https://placehold.co/600x400.png',
            pricing: {
                type: 'purchase',
                price: 299,
            },
            status: 'Published',
            videos: [
                { id: 'V011', title: 'Alkane Structures' },
                { id: 'V012', title: 'Stereochemistry Basics' },
            ]
        },
         {
            id: 'C004',
            title: 'Trigonometry Masterclass',
            description: 'Master trigonometric functions, identities, and their applications in problem-solving.',
            subject: 'Maths',
            grade: '11',
            thumbnail: 'https://placehold.co/600x400.png',
            pricing: {
                type: 'subscription',
            },
            status: 'Published',
            videos: [
                { id: 'V013', title: 'The Unit Circle' },
                { id: 'V014', title: 'Solving Trig Equations' },
            ]
        }
    ]
};

const allUsers = [
    { id: 'I001', name: 'Dr. Evelyn Reed', email: 'evelyn.r@example.com', role: 'Instructor', joined: '2023-01-10', status: 'Active' },
    ...instructorData.enrolledStudents.map(s => ({...s, role: 'Student', status: 'Active'})),
    { id: 'I002', name: 'Dr. Alan Grant', email: 'alan.g@example.com', role: 'Instructor', joined: '2023-05-22', status: 'Suspended' },
    { id: 'S006', name: 'Emily White', email: 'emily.w@example.com', role: 'Student', joined: '2024-04-12', status: 'Active' },
    { id: 'S007', name: 'James Brown', email: 'james.b@example.com', role: 'Student', joined: '2024-04-18', status: 'Active' },
];

const allCourses = [
    ...instructorData.courses,
    {
        id: 'C005', title: 'Quantum Physics Intro', description: 'Introduction to Quantum Mechanics.', subject: 'Physical Sciences', grade: '12', thumbnail: 'https://placehold.co/600x400.png', 
        pricing: { type: 'purchase', price: 599 }, status: 'Pending Approval', videos: [], instructor: 'Dr. Alan Grant'
    },
    {
        id: 'C006', title: 'Advanced Thermodynamics', description: 'Deep dive into thermodynamics.', subject: 'Physical Sciences', grade: '12', thumbnail: 'https://placehold.co/600x400.png', 
        pricing: { type: 'subscription' }, status: 'Rejected', videos: [], instructor: 'Dr. Alan Grant'
    }
].map(course => ({...course, instructor: course.instructor || instructorData.name}));

const allAssignments = [
    ...instructorData.submittedAssignments.map(a => ({...a, instructor: instructorData.name})),
     { id: 'A020', studentName: 'Sarah Miller', assignmentTitle: 'Quantum Entanglement Paper', course: 'Quantum Physics Intro', submittedDate: '1 day ago', status: 'Pending Review', fileUrl: '#', instructor: 'Dr. Alan Grant' }
];

export type PayoutRequest = {
    id: string;
    instructor: string;
    instructorId: string;
    amount: number;
    date: string;
    status: 'Pending' | 'Completed' | 'Declined';
}

const payoutRequests: PayoutRequest[] = [
     { id: 'T009', instructor: 'Dr. Evelyn Reed', instructorId: 'I001', status: 'Pending', amount: -4820.00, date: '2024-05-23' },
     { id: 'T011', instructor: 'Dr. Alan Grant', instructorId: 'I002', status: 'Pending', amount: -599.00, date: '2024-05-24' },
     { id: 'T006', instructor: 'Dr. Evelyn Reed', instructorId: 'I001', status: 'Completed', amount: -2500.00, date: '2024-05-10' },
     { id: 'T012', instructor: 'Dr. Evelyn Reed', instructorId: 'I001', status: 'Declined', amount: -1500.00, date: '2024-04-15' },
];


const allTransactions = [
    ...instructorData.transactions,
    { id: 'T009', studentName: null, item: 'Payout Request - Dr. Evelyn Reed', type: 'Payout Request', status: 'Pending', amount: -4820.00, date: '2024-05-23', instructor: 'Dr. Evelyn Reed' },
    { id: 'T010', studentName: 'Sarah Miller', item: 'Quantum Physics Intro', type: 'Course Sale', status: 'Completed', amount: 599.00, date: '2024-05-19', instructor: 'Dr. Alan Grant' },
    { id: 'T011', studentName: null, item: 'Payout Request - Dr. Alan Grant', type: 'Payout Request', status: 'Pending', amount: -599.00, date: '2024-05-24', instructor: 'Dr. Alan Grant' },
];


export const adminData = {
    stats: [
        { title: "Total Revenue", value: `R ${allTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`, icon: DollarSign, change: "+15% this month" },
        { title: "Total Users", value: allUsers.length, icon: Users, change: "+5 new users" },
        { title: "Instructors", value: allUsers.filter(u => u.role === 'Instructor').length, icon: Users, change: "+1 new instructor" },
        { title: "Active Courses", value: allCourses.filter(c => c.status === 'Published').length, icon: Book, change: "+2 this month" },
    ],
    users: allUsers,
    courses: allCourses,
    assignments: allAssignments,
    transactions: allTransactions,
    payoutRequests: payoutRequests,
    recentActivity: [
        { id: 1, type: 'New User', description: 'Sarah Miller signed up as a Student.', timestamp: '2 hours ago' },
        { id: 2, type: 'New Course', description: 'Dr. Alan Grant published "Quantum Physics Intro".', timestamp: '1 day ago' },
        { id: 3, type: 'Payout', description: 'Payout of R 2500.00 to Dr. Evelyn Reed was completed.', timestamp: '3 days ago' },
    ]
};
