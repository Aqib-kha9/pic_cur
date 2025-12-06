'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import ManualAlbumBuilder from '@/components/AlbumBuilder/ManualAlbumBuilder'
import AutomatedAlbumBuilder from '@/components/AlbumBuilder/AutomatedAlbumBuilder'
import { useAuthStore } from '@/store/authStore'
import { imageStorage } from '@/utils/imageStorage'
import toast from 'react-hot-toast'

export default function EditAlbumPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
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
      setAlbum(albumData)
    } catch (error) {
      toast.error('Failed to load album')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAlbumSave = async (pages: any[]) => {
    try {
      const updatedAlbum = { 
        ...album, 
        pages, 
        status: 'draft',
        updatedAt: new Date().toISOString()
      }
      
      // Update cover image from first page
      if (pages.length > 0 && pages[0].images && pages[0].images.length > 0) {
        updatedAlbum.coverImage = pages[0].images[0].url || pages[0].images[0].data
      }
      
      await imageStorage.saveAlbum(updatedAlbum)
      toast.success('Album updated successfully!')
      router.push('/editor/dashboard')
    } catch (error) {
      toast.error('Failed to save album')
      console.error(error)
    }
  }

  if (!isAuthenticated || !user || user.role !== 'editor' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Album not found</h1>
          <button
            onClick={() => router.push('/editor/dashboard')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const pageConfig = album.config?.pages
    ? { pages: parseInt(album.config.pages) || 20, images: parseInt(album.config.imageCount) || 50 }
    : { pages: 20, images: 50 }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="editor" />
      <div className="flex-1 ml-64 flex flex-col h-screen">
        <Header title={`Editing: ${album.title}`} />
        <div className="flex-1 overflow-hidden">
          {album.type === 'manual' ? (
            <ManualAlbumBuilder albumId={album.id} onSave={handleAlbumSave} />
          ) : (
            <AutomatedAlbumBuilder
              pageConfig={pageConfig}
              albumSize={album.config?.size || '10×10'}
              onSave={handleAlbumSave}
            />
          )}
        </div>
      </div>
    </div>
  )
}

