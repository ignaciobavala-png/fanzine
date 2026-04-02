import AdminLayout from '@/components/admin/AdminLayout'
import TrackManager from '@/components/admin/TrackManager'

export const dynamic = 'force-dynamic'

export default function TracksPage() {
  return (
    <AdminLayout>
      <TrackManager />
    </AdminLayout>
  )
}
