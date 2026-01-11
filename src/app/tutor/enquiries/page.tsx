
'use client';

import withAuth from "@/components/with-auth";
import { EnquiriesPage } from "@/components/enquiries-page";

function TutorEnquiriesPage() {
    return <EnquiriesPage userRole="tutor" />
}

export default withAuth(TutorEnquiriesPage, ['tutor']);
