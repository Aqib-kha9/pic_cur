'use client'

import { useState } from 'react'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import { FiImage, FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'

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

export default function ClientDashboard() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [albums, setAlbums] = useState<Album[]>([
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
      status: 'draft',
      type: 'manual',
      pages: 16,
      images: 50,
      coverImage: 'https://via.placeholder.com/400x300',
      lastUpdated: '2024-01-12',
      revisionCount: 1,
    },
  ])

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'client') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  if (!isAuthenticated || !user || user.role !== 'client') {
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

  const stats = {
    total: albums.length,
    pending: albums.filter((a) => a.status === 'pending').length,
    approved: albums.filter((a) => a.status === 'approved').length,
    revisions: albums.filter((a) => a.status === 'revision').length,
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="client" />
      <div className="flex-1 ml-64">
        <Header title="Dashboard" />
        <main className="p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600">
              Review and manage your album designs
            </p>
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
                  <p className="text-sm text-gray-600 mb-1">Pending Review</p>
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
                  <p className="text-sm text-gray-600 mb-1">Revisions</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.revisions}</p>
                </div>
                <FiXCircle className="text-4xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Albums</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album) => (
                  <div
                    key={album.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
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
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            album.status
                          )}`}
                        >
                          {album.status}
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
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          Updated {album.lastUpdated}
                        </span>
                        <button className="text-primary-600 hover:text-primary-700 flex items-center space-x-1">
                          <FiEye />
                          <span>View</span>
                        </button>
                      </div>
                      {album.revisionCount > 0 && (
                        <div className="mt-2 text-xs text-blue-600">
                          {album.revisionCount} revision{album.revisionCount > 1 ? 's' : ''}
                        </div>
                      )}
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

