
'use client';

import withAuth from "@/components/with-auth";
import { EnquiriesPage } from "@/components/enquiries-page";

function InstructorEnquiriesPage() {
    return <EnquiriesPage userRole="instructor" />
}

export default withAuth(InstructorEnquiriesPage, ['instructor']);
