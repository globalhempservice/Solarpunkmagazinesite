import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Trash2, Eye, Edit, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner@2.0.3'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  coverImage?: string
  readingTime: number
  views?: number
  createdAt: string
  authorId: string
  status?: string
}

interface AdminPanelProps {
  articles: Article[]
  onRefresh: () => void
  onDeleteArticle: (id: string) => void
  serverUrl: string
  accessToken: string | null
}

export function AdminPanel({ articles, onRefresh, onDeleteArticle, serverUrl, accessToken }: AdminPanelProps) {
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return

    setDeleting(id)
    try {
      const response = await fetch(`${serverUrl}/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete article')
      }

      toast.success('Article deleted successfully')
      onDeleteArticle(id)
      onRefresh()
    } catch (error: any) {
      console.error('Error deleting article:', error)
      toast.error('Failed to delete article: ' + error.message)
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Article Management</CardTitle>
              <CardDescription className="hidden sm:block">View and manage all articles in the system</CardDescription>
            </div>
            <Button onClick={onRefresh} variant="outline" className="w-full sm:w-auto">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead className="hidden md:table-cell">Author ID</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No articles found
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm sm:text-base">{article.title}</div>
                          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px] sm:max-w-xs">
                            {article.excerpt}
                          </div>
                          <div className="sm:hidden mt-1">
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                              {article.category}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {article.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {article.authorId?.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-muted-foreground" />
                          <span>{article.views || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {formatDate(article.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(article.id)}
                          disabled={deleting === article.id}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
            <div>Total articles: {articles.length}</div>
            <div>Total views: {articles.reduce((sum, a) => sum + (a.views || 0), 0)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Debug Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Raw article data for troubleshooting</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-2 sm:p-4 rounded-lg text-[10px] sm:text-xs overflow-auto max-h-96">
            {JSON.stringify(articles, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}