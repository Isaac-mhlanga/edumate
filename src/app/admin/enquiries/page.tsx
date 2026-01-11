
'use client';

import withAuth from "@/components/with-auth";
import { EnquiriesPage } from "@/components/enquiries-page";

function AdminEnquiriesPage() {
    return <EnquiriesPage userRole="admin" />
}

export default withAuth(AdminEnquiriesPage, ['admin']);
