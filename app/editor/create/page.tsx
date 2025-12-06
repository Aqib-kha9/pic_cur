'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Layout/Sidebar'
import Header from '@/components/Layout/Header'
import { useAuthStore } from '@/store/authStore'
import ManualAlbumBuilder from '@/components/AlbumBuilder/ManualAlbumBuilder'
import AutomatedAlbumBuilder from '@/components/AlbumBuilder/AutomatedAlbumBuilder'
import { FiUpload, FiX, FiCheck, FiArrowLeft } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { imageStorage } from '@/utils/imageStorage'

export default function CreateAlbumPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [step, setStep] = useState<'form' | 'builder'>('form')
  const [albumType, setAlbumType] = useState<'manual' | 'automated'>('manual')
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientEmail: '',
    albumStyle: '',
    coverDesign: '',
    pages: '',
    imageCount: '',
    layoutStyle: '',
    size: '10×10',
    zenfolioGallery: '',
  })
  const [albumId, setAlbumId] = useState<string>('')

  if (!isAuthenticated || !user || user.role !== 'editor') {
    return null
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.clientName || !formData.clientEmail) {
      toast.error('Please fill in all required fields')
      return
    }

    // Create album record
    const newAlbumId = Date.now().toString()
    setAlbumId(newAlbumId)
    
    const album = {
      id: newAlbumId,
      title: formData.title,
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      type: albumType,
      status: 'draft',
      config: formData,
      pages: [],
      createdAt: new Date().toISOString(),
    }

    try {
      await imageStorage.saveAlbum(album)
      setStep('builder')
      toast.success('Album created! Now add images and build your album.')
    } catch (error) {
      toast.error('Failed to create album')
      console.error(error)
    }
  }

  const handleAlbumSave = async (pages: any[]) => {
    try {
      const album = await imageStorage.getAlbum(albumId)
      album.pages = pages
      album.status = 'draft'
      album.updatedAt = new Date().toISOString()
      
      // Set cover image from first page
      if (pages.length > 0 && pages[0].images && pages[0].images.length > 0) {
        album.coverImage = pages[0].images[0].url || pages[0].images[0].data
      }
      
      await imageStorage.saveAlbum(album)
      toast.success('Album saved successfully!')
      router.push('/editor/dashboard')
    } catch (error) {
      toast.error('Failed to save album')
      console.error(error)
    }
  }

  const automatedOptions = {
    '16+2': { pages: 18, images: 50 },
    '20+2': { pages: 22, images: 62 },
    '30+2': { pages: 32, images: 92 },
    '40+2': { pages: 42, images: 122 },
  }

  if (step === 'builder') {
    const automatedOptions = {
      '16+2': { pages: 18, images: 50 },
      '20+2': { pages: 22, images: 62 },
      '30+2': { pages: 32, images: 92 },
      '40+2': { pages: 42, images: 122 },
    }

    const pageConfig = formData.pages && automatedOptions[formData.pages as keyof typeof automatedOptions]
      ? automatedOptions[formData.pages as keyof typeof automatedOptions]
      : { pages: parseInt(formData.pages) || 20, images: parseInt(formData.imageCount) || 50 }

    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="editor" />
        <div className="flex-1 ml-64 flex flex-col h-screen">
          <Header title={`Building: ${formData.title}`} />
          <div className="flex-1 overflow-hidden">
            {albumType === 'manual' ? (
              <ManualAlbumBuilder albumId={albumId} onSave={handleAlbumSave} />
            ) : (
              <AutomatedAlbumBuilder
                pageConfig={pageConfig}
                albumSize={formData.size}
                onSave={handleAlbumSave}
              />
            )}
          </div>
          <div className="bg-white border-t border-gray-200 p-4 flex items-center justify-between">
            <button
              onClick={() => setStep('form')}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FiArrowLeft />
              <span>Back to Form</span>
            </button>
            <div className="text-sm text-gray-600">
              {formData.title} • {formData.clientName}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="editor" />
      <div className="flex-1 ml-64">
        <Header title="Create New Album" />
        <main className="p-6 max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Album</h1>
            <p className="text-gray-600">Choose between manual or automated album design</p>
          </div>

          {/* Album Type Selection */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Album Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setAlbumType('manual')}
                className={`p-6 border-2 rounded-lg text-left transition ${
                  albumType === 'manual'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Manual Design</h3>
                <p className="text-sm text-gray-600">
                  Full creative control with custom layouts and styles
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAlbumType('automated')}
                className={`p-6 border-2 rounded-lg text-left transition ${
                  albumType === 'automated'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Automated Design</h3>
                <p className="text-sm text-gray-600">
                  Fast-track with predefined templates and ratios
                </p>
              </button>
            </div>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Album Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="e.g., Wedding Album - Sarah & John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="Client full name"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    placeholder="client@example.com"
                  />
                </div>
              </div>
            </div>

            {albumType === 'manual' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Manual Design Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Album Style
                    </label>
                    <select
                      value={formData.albumStyle}
                      onChange={(e) => setFormData({ ...formData, albumStyle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select style</option>
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="vintage">Vintage</option>
                      <option value="minimalist">Minimalist</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Design
                    </label>
                    <select
                      value={formData.coverDesign}
                      onChange={(e) => setFormData({ ...formData, coverDesign: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select cover</option>
                      <option value="leather">Leather</option>
                      <option value="linen">Linen</option>
                      <option value="canvas">Canvas</option>
                      <option value="acrylic">Acrylic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Pages
                    </label>
                    <input
                      type="number"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., 30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Count
                    </label>
                    <input
                      type="number"
                      value={formData.imageCount}
                      onChange={(e) => setFormData({ ...formData, imageCount: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="e.g., 92"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Layout Style
                    </label>
                    <select
                      value={formData.layoutStyle}
                      onChange={(e) => setFormData({ ...formData, layoutStyle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select layout</option>
                      <option value="grid">Grid</option>
                      <option value="masonry">Masonry</option>
                      <option value="full-bleed">Full Bleed</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Automated Design Options</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Configuration
                    </label>
                    <select
                      value={formData.pages}
                      onChange={(e) => {
                        const selected = e.target.value as keyof typeof automatedOptions
                        if (selected && automatedOptions[selected]) {
                          setFormData({
                            ...formData,
                            pages: automatedOptions[selected].pages.toString(),
                            imageCount: automatedOptions[selected].images.toString(),
                          })
                        }
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">Select configuration</option>
                      <option value="16+2">16 + 2 cover (50 images)</option>
                      <option value="20+2">20 + 2 cover (62 images)</option>
                      <option value="30+2">30 + 2 cover (92 images)</option>
                      <option value="40+2">40 + 2 cover (122 images)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Album Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="10×10">10×10</option>
                      <option value="12×12">12×12</option>
                      <option value="11×14">11×14 (Portrait)</option>
                      <option value="14×11">14×11 (Landscape)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zenfolio Gallery URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.zenfolioGallery}
                      onChange={(e) => setFormData({ ...formData, zenfolioGallery: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                      placeholder="https://zenfolio.com/gallery/..."
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
              >
                <FiCheck />
                <span>Continue to Album Builder</span>
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}

