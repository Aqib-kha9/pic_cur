'use client'

import { useState, useEffect } from 'react'
import { FiImage, FiSave, FiRefreshCw } from 'react-icons/fi'
import ImageUploader from '@/components/ImageUpload/ImageUploader'
import { imageStorage } from '@/utils/imageStorage'
import toast from 'react-hot-toast'

interface AutomatedAlbumBuilderProps {
  pageConfig: { pages: number; images: number }
  albumSize: string
  onSave: (pages: any[]) => void
}

const LAYOUT_TEMPLATES = [
  { name: 'Single', ratio: 1, layout: [[1]] },
  { name: 'Two Column', ratio: 2, layout: [[1, 1]] },
  { name: 'Three Column', ratio: 3, layout: [[1, 1, 1]] },
  { name: 'Grid 2x2', ratio: 4, layout: [[1, 1], [1, 1]] },
  { name: 'Mixed', ratio: 3, layout: [[2], [1, 1]] },
]

export default function AutomatedAlbumBuilder({
  pageConfig,
  albumSize,
  onSave,
}: AutomatedAlbumBuilderProps) {
  const [selectedImages, setSelectedImages] = useState<string[]>([])
  const [availableImages, setAvailableImages] = useState<any[]>([])
  const [generatedPages, setGeneratedPages] = useState<any[]>([])

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      const images = await imageStorage.getAllImages()
      setAvailableImages(images)
    } catch (error) {
      console.error('Failed to load images:', error)
    }
  }

  const handleImagesUploaded = async (imageIds: string[]) => {
    const newImages = await Promise.all(
      imageIds.map((id) => imageStorage.getImage(id))
    )
    setAvailableImages((prev) => [...prev, ...newImages])
    toast.success('Images added to library')
  }

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages((prev) => {
      if (prev.includes(imageId)) {
        return prev.filter((id) => id !== imageId)
      } else {
        if (prev.length >= pageConfig.images) {
          toast.error(`Maximum ${pageConfig.images} images allowed`)
          return prev
        }
        return [...prev, imageId]
      }
    })
  }

  const generateAlbum = () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image')
      return
    }

    const pages: any[] = []
    let imageIndex = 0
    const totalPages = Math.max(1, pageConfig.pages - 2) // Excluding cover pages
    const imagesToUse = Math.min(selectedImages.length, pageConfig.images)

    // Front cover page
    if (selectedImages.length > 0) {
      pages.push({
        id: 'cover-1',
        type: 'cover',
        images: [
          {
            id: selectedImages[0],
            url: availableImages.find((img) => img.id === selectedImages[0])?.data,
            layout: 'full',
          },
        ],
      })
    }

    // Content pages - distribute images across pages
    imageIndex = 1 // Start from second image (first is cover)
    
    for (let i = 0; i < totalPages && imageIndex < imagesToUse; i++) {
      const template = LAYOUT_TEMPLATES[i % LAYOUT_TEMPLATES.length]
      const pageImages: any[] = []
      const imagesPerPage = Math.min(template.ratio, imagesToUse - imageIndex)
      
      // Get image dimensions for proper sizing
      const getImageDimensions = (imgId: string) => {
        const img = availableImages.find((i) => i.id === imgId)
        if (img && img.width && img.height) {
          return { width: img.width, height: img.height, aspectRatio: img.width / img.height }
        }
        return { width: 400, height: 300, aspectRatio: 4/3 }
      }

      for (let j = 0; j < imagesPerPage && imageIndex < imagesToUse; j++) {
        const imageId = selectedImages[imageIndex]
        const imageData = availableImages.find((img) => img.id === imageId)
        if (imageData) {
          const dimensions = getImageDimensions(imageId)
          pageImages.push({
            id: imageId,
            url: imageData.data,
            layout: template.name.toLowerCase(),
            width: dimensions.width,
            height: dimensions.height,
            aspectRatio: dimensions.aspectRatio,
          })
        }
        imageIndex++
      }

      if (pageImages.length > 0) {
        pages.push({
          id: `page-${i + 1}`,
          type: 'content',
          images: pageImages,
          layout: template.name,
        })
      }
    }

    // Back cover
    if (selectedImages.length > 1) {
      const lastImageIndex = Math.min(selectedImages.length - 1, imagesToUse - 1)
      pages.push({
        id: 'cover-2',
        type: 'cover',
        images: [
          {
            id: selectedImages[lastImageIndex],
            url: availableImages.find(
              (img) => img.id === selectedImages[lastImageIndex]
            )?.data,
            layout: 'full',
          },
        ],
      })
    }

    setGeneratedPages(pages)
    toast.success('Album generated successfully!')
  }

  const handleSave = () => {
    if (generatedPages.length === 0) {
      toast.error('Please generate the album first')
      return
    }
    onSave(generatedPages)
    toast.success('Album saved!')
  }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Image Selection */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Upload Images</h3>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
            multiple={true}
            maxFiles={200}
          />
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900">Select Images</h3>
            <span className="text-sm text-gray-600">
              {selectedImages.length} / {pageConfig.images}
            </span>
          </div>
          <button
            onClick={generateAlbum}
            disabled={selectedImages.length === 0}
            className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <FiRefreshCw />
            <span>Generate Album</span>
          </button>
          {selectedImages.length > 0 && selectedImages.length < pageConfig.images && (
            <p className="text-xs text-yellow-600 mt-2">
              Using {selectedImages.length} of {pageConfig.images} recommended images
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-2">
            {availableImages.map((image) => {
              const isSelected = selectedImages.includes(image.id)
              return (
                <div
                  key={image.id}
                  onClick={() => toggleImageSelection(image.id)}
                  className={`relative group cursor-pointer rounded border-2 transition ${
                    isSelected
                      ? 'border-primary-500 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.data}
                    alt={image.name}
                    className="w-full h-24 object-cover rounded"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {selectedImages.indexOf(image.id) + 1}
                        </span>
                      </div>
                    </div>
                  )}
                  {image.width && image.height && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition">
                      {image.width}×{image.height}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Center - Preview */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Album Preview</h2>
            <p className="text-sm text-gray-600">
              {albumSize} • {pageConfig.pages} pages • {pageConfig.images} images
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={generatedPages.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <FiSave />
            <span>Save Album</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {generatedPages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <FiImage className="text-6xl mx-auto mb-4" />
                <p className="text-lg mb-2">No album generated yet</p>
                <p className="text-sm">
                  Select images and click "Generate Album" (recommended: {pageConfig.images} images)
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {generatedPages.map((page, index) => (
                <div
                  key={page.id}
                  className="bg-white rounded-lg shadow-lg mx-auto p-4"
                  style={{ width: '800px' }}
                >
                  <div className="text-sm text-gray-600 mb-2">
                    {page.type === 'cover' ? 'Cover' : `Page ${index}`} • {page.layout}
                  </div>
                  <div
                    className="bg-gray-100 rounded"
                    style={{ height: '600px', position: 'relative' }}
                  >
                    {page.images.map((img: any, imgIndex: number) => {
                      const layout = page.layout?.toLowerCase() || 'single'
                      const isFull = layout === 'full' || (page.type === 'cover')
                      const isGrid = layout.includes('grid')
                      const isTwoColumn = layout.includes('two column')
                      const isThreeColumn = layout.includes('three column')
                      const isMixed = layout.includes('mixed')
                      
                      let width = '100%'
                      let height = '100%'
                      let left = '0'
                      let top = '0'

                      if (isFull) {
                        width = '100%'
                        height = '100%'
                      } else if (isGrid && page.images.length === 4) {
                        // 2x2 Grid
                        width = '50%'
                        height = '50%'
                        left = `${(imgIndex % 2) * 50}%`
                        top = `${Math.floor(imgIndex / 2) * 50}%`
                      } else if (isTwoColumn && page.images.length === 2) {
                        // Two Column
                        width = '50%'
                        height = '100%'
                        left = `${imgIndex * 50}%`
                        top = '0'
                      } else if (isThreeColumn && page.images.length === 3) {
                        // Three Column
                        width = `${100 / 3}%`
                        height = '100%'
                        left = `${imgIndex * (100 / 3)}%`
                        top = '0'
                      } else if (isMixed) {
                        // Mixed layout: large on top, two small below
                        if (imgIndex === 0) {
                          width = '100%'
                          height = '50%'
                          left = '0'
                          top = '0'
                        } else {
                          width = '50%'
                          height = '50%'
                          left = `${(imgIndex - 1) * 50}%`
                          top = '50%'
                        }
                      } else {
                        // Default: single or fallback
                        width = '100%'
                        height = '100%'
                      }

                      return (
                        <div
                          key={img.id || imgIndex}
                          className="absolute border-2 border-gray-300 rounded overflow-hidden bg-white"
                          style={{
                            width,
                            height,
                            left,
                            top,
                          }}
                        >
                          <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

