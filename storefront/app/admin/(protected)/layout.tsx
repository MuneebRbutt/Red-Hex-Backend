import AdminSidebar from '@/components/admin/AdminSidebar';

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex">
      <AdminSidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
