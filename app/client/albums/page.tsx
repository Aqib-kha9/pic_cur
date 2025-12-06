'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import { useAuthStore } from '@/store/authStore'
import { FiImage, FiEye, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi'

interface Album {
  id: string
  title: string
  status: 'draft' | 'pending' | 'approved' | 'revision'
  type: 'manual' | 'automated'
  pages: number
  images: number
  coverImage: string
  lastUpdated: string
  revisionCount: number
}

export default function ClientAlbumsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [albums, setAlbums] = useState<Album[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'revision'>('all')

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'client') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Mock data
    setAlbums([
      {
        id: '1',
        title: 'Wedding Album - Sarah & John',
        status: 'pending',
        type: 'manual',
        pages: 30,
        images: 92,
        coverImage: 'https://via.placeholder.com/400x300',
        lastUpdated: '2024-01-15',
        revisionCount: 2,
      },
      {
        id: '2',
        title: 'Portrait Session - Family',
        status: 'approved',
        type: 'automated',
        pages: 20,
        images: 62,
        coverImage: 'https://via.placeholder.com/400x300',
        lastUpdated: '2024-01-10',
        revisionCount: 0,
      },
      {
        id: '3',
        title: 'Engagement Photos',
        status: 'revision',
        type: 'manual',
        pages: 16,
        images: 50,
        coverImage: 'https://via.placeholder.com/400x300',
        lastUpdated: '2024-01-12',
        revisionCount: 1,
      },
    ])
  }, [])

  if (!isAuthenticated || !user || user.role !== 'client') {
    return null
  }

  const filteredAlbums =
    filter === 'all'
      ? albums
      : albums.filter((album) => album.status === filter)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return FiCheckCircle
      case 'pending':
        return FiClock
      case 'revision':
        return FiXCircle
      default:
        return FiImage
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="client" />
      <div className="flex-1 ml-64">
        <Header title="My Albums" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Albums</h1>
            <p className="text-gray-600">View and manage all your album designs</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({albums.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({albums.filter((a) => a.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({albums.filter((a) => a.status === 'approved').length})
              </button>
              <button
                onClick={() => setFilter('revision')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'revision'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Revisions ({albums.filter((a) => a.status === 'revision').length})
              </button>
            </div>
          </div>

          {/* Albums Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlbums.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FiImage className="text-6xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No albums found</p>
              </div>
            ) : (
              filteredAlbums.map((album) => {
                const StatusIcon = getStatusIcon(album.status)
                return (
                  <div
                    key={album.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                    onClick={() => router.push(`/client/albums/${album.id}`)}
                  >
                    <div className="relative h-48 bg-gray-100">
                      <img
                        src={album.coverImage}
                        alt={album.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${getStatusColor(
                            album.status
                          )}`}
                        >
                          <StatusIcon className="text-xs" />
                          <span>{album.status}</span>
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">
                        {album.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>{album.pages} pages</span>
                        <span>{album.images} images</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Updated {album.lastUpdated}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {album.type}
                        </span>
                      </div>
                      {album.revisionCount > 0 && (
                        <div className="mb-3 text-xs text-blue-600">
                          {album.revisionCount} revision{album.revisionCount > 1 ? 's' : ''} requested
                        </div>
                      )}
                      <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                        <FiEye />
                        <span>View Album</span>
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

