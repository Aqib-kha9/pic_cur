'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import { useAuthStore } from '@/store/authStore'
import { imageStorage } from '@/utils/imageStorage'
import {
  FiPlus,
  FiImage,
  FiClock,
  FiCheckCircle,
  FiEdit,
  FiEye,
  FiTrendingUp,
} from 'react-icons/fi'

interface Album {
  id: string
  title: string
  clientName: string
  status: 'draft' | 'pending' | 'approved' | 'revision'
  type: 'manual' | 'automated'
  pages: number
  images: number
  coverImage: string
  lastUpdated: string
  revisionCount: number
}

export default function EditorDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'editor') {
      router.push('/auth/login')
      return
    }
    loadAlbums()
  }, [isAuthenticated, user, router])

  const loadAlbums = async () => {
    try {
      const allAlbums = await imageStorage.getAllAlbums()
      // Transform albums to match interface
      const transformedAlbums: Album[] = allAlbums.map((album: any) => {
        const coverImage = album.pages?.[0]?.images?.[0]?.url || 
                         album.pages?.[0]?.images?.[0]?.data ||
                         'https://via.placeholder.com/400x300'
        
        const totalImages = album.pages?.reduce((sum: number, page: any) => {
          return sum + (page.images?.length || 0)
        }, 0) || 0

        return {
          id: album.id,
          title: album.title || 'Untitled Album',
          clientName: album.clientName || 'Unknown Client',
          status: album.status || 'draft',
          type: album.type || 'manual',
          pages: album.pages?.length || 0,
          images: totalImages,
          coverImage,
          lastUpdated: album.updatedAt || album.createdAt || new Date().toISOString(),
          revisionCount: album.revisionCount || 0,
        }
      })
      // Sort by last updated (newest first)
      transformedAlbums.sort((a, b) => 
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
      )
      setAlbums(transformedAlbums)
    } catch (error) {
      console.error('Failed to load albums:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || !user || user.role !== 'editor') {
    return null
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="editor" />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  const stats = {
    total: albums.length,
    pending: albums.filter((a) => a.status === 'pending').length,
    approved: albums.filter((a) => a.status === 'approved').length,
    drafts: albums.filter((a) => a.status === 'draft').length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'revision':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="editor" />
      <div className="flex-1 ml-64">
        <Header title="Editor Dashboard" />
        <main className="p-6">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome, {user.name}!
              </h1>
              <p className="text-gray-600">
                Manage albums and create stunning designs
              </p>
            </div>
            <button
              onClick={() => router.push('/editor/create')}
              className="flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
            >
              <FiPlus />
              <span>Create New Album</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Albums</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FiImage className="text-4xl text-primary-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <FiClock className="text-4xl text-yellow-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <FiCheckCircle className="text-4xl text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Drafts</p>
                  <p className="text-3xl font-bold text-gray-600">{stats.drafts}</p>
                </div>
                <FiEdit className="text-4xl text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">All Albums</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FiTrendingUp />
                <span>Sort by: Recent</span>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => router.push(`/editor/albums/${album.id}`)}
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            album.status
                          )}`}
                        >
                          {album.status}
                        </span>
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
                          {album.type}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">
                        {album.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">{album.clientName}</p>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                        <span>{album.pages} pages</span>
                        <span>{album.images} images</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/editor/albums/${album.id}`)
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                        >
                          <FiEye />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/editor/albums/${album.id}/edit`)
                          }}
                          className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                        >
                          <FiEdit />
                          <span>Edit</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

