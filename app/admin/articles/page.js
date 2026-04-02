import AdminLayout from '@/components/admin/AdminLayout'
import ArticleManager from '@/components/admin/ArticleManager'

export const dynamic = 'force-dynamic'

export default function ArticlesPage() {
  return (
    <AdminLayout>
      <ArticleManager />
    </AdminLayout>
  )
}
