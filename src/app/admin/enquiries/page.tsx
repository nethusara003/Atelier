import { adminListInquiries } from '@/lib/admin-data';
import { getAdminSession } from '@/lib/admin-auth';
import { EnquiriesManager } from '@/components/admin/EnquiriesManager';

export const metadata = { title: 'Enquiries' };

export default async function AdminEnquiriesPage() {
  const session = await getAdminSession();
  const inquiries = await adminListInquiries();

  return (
    <div>
      <p className="micro-label">Inbox</p>
      <h1 className="mt-2 font-serif text-4xl">Enquiries</h1>
      <div className="mt-2">
        <EnquiriesManager inquiries={inquiries} demo={session.demo} />
      </div>
    </div>
  );
}
