'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import AlbumViewer from '@/components/Album/AlbumViewer'
import { useAuthStore } from '@/store/authStore'
import { imageStorage } from '@/utils/imageStorage'
import { FiChevronLeft, FiUpload, FiSave, FiEdit } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function EditorAlbumViewPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditing, setIsEditing] = useState(false)
  const [album, setAlbum] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'editor') {
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
        router.push('/editor/dashboard')
        return
      }
      setAlbum(albumData)
    } catch (error) {
      toast.error('Failed to load album')
      console.error(error)
      router.push('/editor/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const updatedAlbum = { ...album, updatedAt: new Date().toISOString() }
      await imageStorage.saveAlbum(updatedAlbum)
      toast.success('Changes saved!')
      setIsEditing(false)
    } catch (error) {
      toast.error('Failed to save changes')
    }
  }

  const handleUpload = async () => {
    try {
      const updatedAlbum = { ...album, status: 'pending', updatedAt: new Date().toISOString() }
      await imageStorage.saveAlbum(updatedAlbum)
      toast.success('Album uploaded for client review!')
      router.push('/editor/dashboard')
    } catch (error) {
      toast.error('Failed to upload album')
    }
  }

  if (!isAuthenticated || !user || user.role !== 'editor' || loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="editor" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (!album) {
    return null
  }

  const totalPages = album.pages?.length || 1

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="editor" />
      <div className="flex-1 ml-64">
        <Header />
        <main className="h-[calc(100vh-4rem)] flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/editor/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <FiChevronLeft className="text-xl" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{album.title || 'Untitled Album'}</h1>
                <p className="text-sm text-gray-600">
                  Client: {album.clientName || 'Unknown'} • Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <FiEdit />
                <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
                >
                  <FiSave />
                  <span>Save</span>
                </button>
              )}
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <FiUpload />
                <span>Upload for Review</span>
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            <AlbumViewer
              albumId={album.id}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              comments={[]}
              albumPages={album.pages}
              useFlipbook={true}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

