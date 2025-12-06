'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import { useAuthStore } from '@/store/authStore'
import { FiClock, FiEye, FiCheckCircle } from 'react-icons/fi'

interface Album {
  id: string
  title: string
  clientName: string
  status: 'pending'
  type: 'manual' | 'automated'
  pages: number
  images: number
  coverImage: string
  submittedDate: string
  daysWaiting: number
}

export default function PendingAlbumsPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [albums, setAlbums] = useState<Album[]>([])

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'editor') {
      router.push('/auth/login')
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    // Mock data
    setAlbums([
      {
        id: '1',
        title: 'Wedding Album - Sarah & John',
        clientName: 'Sarah Johnson',
        status: 'pending',
        type: 'manual',
        pages: 30,
        images: 92,
        coverImage: 'https://via.placeholder.com/400x300',
        submittedDate: '2024-01-15',
        daysWaiting: 3,
      },
      {
        id: '2',
        title: 'Portrait Session - Family',
        clientName: 'Michael Chen',
        status: 'pending',
        type: 'automated',
        pages: 20,
        images: 62,
        coverImage: 'https://via.placeholder.com/400x300',
        submittedDate: '2024-01-14',
        daysWaiting: 4,
      },
    ])
  }, [])

  if (!isAuthenticated || !user || user.role !== 'editor') {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="editor" />
      <div className="flex-1 ml-64">
        <Header title="Pending Approval" />
        <main className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Approval</h1>
            <p className="text-gray-600">
              Albums waiting for client review and approval
            </p>
          </div>

          {albums.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <FiCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                All caught up!
              </h2>
              <p className="text-gray-600">No albums pending approval</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                  onClick={() => router.push(`/editor/albums/${album.id}`)}
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={album.coverImage}
                      alt={album.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium flex items-center space-x-1">
                        <FiClock className="text-xs" />
                        <span>Pending</span>
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-xs rounded">
                        {album.daysWaiting} day{album.daysWaiting !== 1 ? 's' : ''} waiting
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
                    <div className="text-xs text-gray-500 mb-3">
                      Submitted: {album.submittedDate}
                    </div>
                    <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                      <FiEye />
                      <span>View Details</span>
                    </button>
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

