'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import AlbumViewer from '@/components/Album/AlbumViewer'
import CommentPanel from '@/components/Album/CommentPanel'
import { useAuthStore } from '@/store/authStore'
import { imageStorage } from '@/utils/imageStorage'
import { FiChevronLeft, FiSend, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  page: number
  x: number
  y: number
  text: string
  author: string
  timestamp: string
  resolved: boolean
}

export default function AlbumViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [showComments, setShowComments] = useState(true)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isApproving, setIsApproving] = useState(false)
  const [isRequestingRevision, setIsRequestingRevision] = useState(false)
  const [album, setAlbum] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'client') {
      router.push('/auth/login')
      return
    }
    loadAlbum()
  }, [params.id, isAuthenticated, user, router])

  const loadAlbum = async () => {
    try {
      const albumData = await imageStorage.getAlbum(params.id as string)
      if (!albumData) {
        toast.error('Album not found')
        router.push('/client/dashboard')
        return
      }
      setAlbum(albumData)
    } catch (error) {
      toast.error('Failed to load album')
      console.error(error)
      router.push('/client/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setIsApproving(true)
    // Simulate API call
    setTimeout(() => {
      toast.success('Album approved!')
      setIsApproving(false)
      router.push('/client/dashboard')
    }, 1000)
  }

  const handleRequestRevision = async () => {
    if (!newComment.trim()) {
      toast.error('Please add a comment explaining the revision')
      return
    }
    setIsRequestingRevision(true)
    // Simulate API call
    setTimeout(() => {
      toast.success('Revision requested!')
      setIsRequestingRevision(false)
      setNewComment('')
      router.push('/client/dashboard')
    }, 1000)
  }

  const addComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      page: currentPage,
      x: 50,
      y: 50,
      text: newComment,
      author: user?.name || 'You',
      timestamp: new Date().toISOString(),
      resolved: false,
    }

    setComments([...comments, comment])
    setNewComment('')
    toast.success('Comment added')
  }

  if (!isAuthenticated || !user || user.role !== 'client' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!album) {
    return null
  }

  const totalPages = album.pages?.length || 1

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="client" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/client/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{album.title || 'Untitled Album'}</h1>
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowComments(!showComments)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {showComments ? 'Hide' : 'Show'} Comments
              </button>
              <button
                onClick={handleRequestRevision}
                disabled={isRequestingRevision}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {isRequestingRevision ? 'Requesting...' : 'Request Revision'}
              </button>
              <button
                onClick={handleApprove}
                disabled={isApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <FiCheck />
                <span>{isApproving ? 'Approving...' : 'Approve'}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 relative">
              <AlbumViewer
                albumId={album.id}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                comments={comments.filter((c) => c.page === currentPage)}
                albumPages={album.pages}
                useFlipbook={true}
              />
            </div>

            {showComments && (
              <CommentPanel
                comments={comments.filter((c) => c.page === currentPage)}
                onAddComment={addComment}
                newComment={newComment}
                onCommentChange={setNewComment}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

