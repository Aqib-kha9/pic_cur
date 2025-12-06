'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import { useAuthStore } from '@/store/authStore'
import { imageStorage } from '@/utils/imageStorage'
import {
  FiImage,
  FiEdit,
  FiEye,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi'
import toast from 'react-hot-toast'

interface Album {
  id: string
  title: string
  clientName: string
  clientEmail?: string
  status: 'draft' | 'pending' | 'approved' | 'revision'
  type: 'manual' | 'automated'
  pages: any[]
  config?: any
  coverImage?: string
  lastUpdated: string
  createdAt: string
  revisionCount?: number
}

export default function EditorAlbumsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
        
        return {
          id: album.id,
          title: album.title || 'Untitled Album',
          clientName: album.clientName || 'Unknown Client',
          clientEmail: album.clientEmail,
          status: album.status || 'draft',
          type: album.type || 'manual',
          pages: album.pages || [],
          config: album.config,
          coverImage,
          lastUpdated: album.updatedAt || album.createdAt || new Date().toISOString(),
          createdAt: album.createdAt || new Date().toISOString(),
          revisionCount: album.revisionCount || 0,
        }
      })
      setAlbums(transformedAlbums)
    } catch (error) {
      console.error('Failed to load albums:', error)
      toast.error('Failed to load albums')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (albumId: string) => {
    if (!confirm('Are you sure you want to delete this album?')) return

    try {
      await imageStorage.deleteAlbum(albumId)
      const updatedAlbums = albums.filter((a) => a.id !== albumId)
      setAlbums(updatedAlbums)
      toast.success('Album deleted')
    } catch (error) {
      toast.error('Failed to delete album')
      console.error(error)
    }
  }

  if (!isAuthenticated || !user || user.role !== 'editor') {
    return null
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

  const filteredAlbums = albums.filter((album) => {
    const matchesSearch =
      album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || album.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: albums.length,
    draft: albums.filter((a) => a.status === 'draft').length,
    pending: albums.filter((a) => a.status === 'pending').length,
    approved: albums.filter((a) => a.status === 'approved').length,
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="editor" />
      <div className="flex-1 ml-64">
        <Header title="All Albums" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Albums</h1>
            <p className="text-gray-600">Manage and view all your albums</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total Albums</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Drafts</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search albums..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex items-center space-x-2">
                <FiFilter className="text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="revision">Revision</option>
                </select>
              </div>
            </div>
          </div>

          {/* Albums Grid */}
          {filteredAlbums.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FiImage className="text-6xl text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {albums.length === 0 ? 'No albums yet' : 'No albums found'}
              </h2>
              <p className="text-gray-600 mb-4">
                {albums.length === 0
                  ? 'Create your first album to get started'
                  : 'Try adjusting your search or filters'}
              </p>
              {albums.length === 0 && (
                <button
                  onClick={() => router.push('/editor/create')}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create Album
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAlbums.map((album) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition"
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
                      <span>{album.pages.length} pages</span>
                      <span>
                        {new Date(album.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => router.push(`/editor/albums/${album.id}`)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 text-sm"
                      >
                        <FiEye />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => router.push(`/editor/albums/${album.id}/edit`)}
                        className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                      >
                        <FiEdit />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(album.id)}
                        className="p-2 border border-red-300 text-red-600 rounded hover:bg-red-50"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

