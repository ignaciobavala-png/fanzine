import AdminLayout from '@/components/admin/AdminLayout'
import DashboardHome from '@/components/admin/DashboardHome'

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  return (
    <AdminLayout>
      <DashboardHome />
    </AdminLayout>
  )
}
