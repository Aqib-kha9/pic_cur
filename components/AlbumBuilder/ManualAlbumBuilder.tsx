'use client'

import { useState, useEffect } from 'react'
import { FiImage, FiX, FiEdit, FiTrash2, FiSave, FiPlus, FiRotateCw, FiMaximize2, FiMinimize2, FiCornerDownRight } from 'react-icons/fi'
import ImageUploader from '@/components/ImageUpload/ImageUploader'
import ImageEditor from '@/components/ImageEditor/ImageEditor'
import { imageStorage } from '@/utils/imageStorage'
import toast from 'react-hot-toast'

interface Page {
  id: string
  images: Array<{
    id: string
    url: string
    x: number
    y: number
    width: number
    height: number
    originalWidth?: number
    originalHeight?: number
    rotation?: number
  }>
}

interface ManualAlbumBuilderProps {
  albumId?: string
  onSave: (pages: Page[]) => void
}

export default function ManualAlbumBuilder({
  albumId,
  onSave,
}: ManualAlbumBuilderProps) {
  const [pages, setPages] = useState<Page[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [availableImages, setAvailableImages] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [editingImage, setEditingImage] = useState<{ id: string; url: string } | null>(null)
  const [draggingImage, setDraggingImage] = useState<string | null>(null)
  const [resizingImage, setResizingImage] = useState<string | null>(null)
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null)
  const [history, setHistory] = useState<Page[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

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

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      images: [],
    }
    setPages((prev) => {
      const updated = [...prev, newPage]
      saveToHistory(updated)
      return updated
    })
    setCurrentPage(pages.length)
  }

  const addImageToPage = (imageId: string) => {
    const image = availableImages.find((img) => img.id === imageId)
    if (!image) return

    // Use original dimensions, but scale to fit canvas if too large
    const canvasWidth = 800
    const canvasHeight = 600
    let width = image.width || 200
    let height = image.height || 200

    // Scale down if image is larger than canvas
    if (width > canvasWidth || height > canvasHeight) {
      const scale = Math.min(canvasWidth / width, canvasHeight / height, 0.8)
      width = width * scale
      height = height * scale
    } else {
      // Scale to reasonable size if too small, but maintain aspect ratio
      if (width < 100 || height < 100) {
        const scale = Math.max(100 / width, 100 / height)
        width = width * scale
        height = height * scale
      }
    }

    const newImage = {
      id: imageId,
      url: image.data,
      originalWidth: image.width || width,
      originalHeight: image.height || height,
      x: (canvasWidth - width) / 2, // Center on canvas
      y: (canvasHeight - height) / 2,
      width: Math.round(width),
      height: Math.round(height),
      rotation: 0,
    }

    setPages((prev) => {
      const updated = [...prev]
      if (!updated[currentPage]) {
        updated[currentPage] = { id: Date.now().toString(), images: [] }
      }
      updated[currentPage].images.push(newImage)
      return updated
    })
  }

  const removeImageFromPage = (imageId: string) => {
    setPages((prev) => {
      const updated = [...prev]
      if (updated[currentPage]) {
        updated[currentPage].images = updated[currentPage].images.filter(
          (img) => img.id !== imageId
        )
      }
      return updated
    })
    saveToHistory(pages)
  }

  const saveToHistory = (newPages: Page[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(newPages)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setPages(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setPages(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }

  const updateImagePosition = (imageId: string, x: number, y: number) => {
    setPages((prev) => {
      const updated = [...prev]
      if (updated[currentPage]) {
        const img = updated[currentPage].images.find((i) => i.id === imageId)
        if (img) {
          img.x = Math.max(0, Math.min(x, 800 - img.width))
          img.y = Math.max(0, Math.min(y, 600 - img.height))
        }
      }
      return updated
    })
  }

  const updateImageSize = (imageId: string, newWidth: number, newHeight: number) => {
    setPages((prev) => {
      const updated = [...prev]
      if (updated[currentPage]) {
        const img = updated[currentPage].images.find((i) => i.id === imageId)
        if (img) {
          const maxWidth = 800 - img.x
          const maxHeight = 600 - img.y
          img.width = Math.min(newWidth, maxWidth)
          img.height = Math.min(newHeight, maxHeight)
        }
      }
      return updated
    })
  }

  const updateImageRotation = (imageId: string, rotation: number) => {
    setPages((prev) => {
      const updated = [...prev]
      if (updated[currentPage]) {
        const img = updated[currentPage].images.find((i) => i.id === imageId)
        if (img) {
          img.rotation = rotation
        }
      }
      return updated
    })
  }

  const handleSave = () => {
    saveToHistory(pages)
    onSave(pages)
    toast.success('Album saved!')
  }

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
      } else if (e.key === 'Delete' && selectedImageId) {
        removeImageFromPage(selectedImageId)
        setSelectedImageId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedImageId, historyIndex, history.length, pages])

  const currentPageData = pages[currentPage] || { id: '', images: [] }

  return (
    <div className="flex h-full">
      {/* Left Sidebar - Image Library */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Image Library</h3>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
            multiple={true}
            maxFiles={50}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-2">
            {availableImages.map((image) => (
              <div
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => addImageToPage(image.id)}
                title={`${image.name}${image.width && image.height ? ` (${image.width}×${image.height})` : ''}`}
              >
                <img
                  src={image.data}
                  alt={image.name}
                  className="w-full h-24 object-cover rounded border border-gray-200 hover:border-primary-500 transition"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition rounded flex items-center justify-center">
                  <FiPlus className="text-white opacity-0 group-hover:opacity-100" />
                </div>
                {image.width && image.height && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 opacity-0 group-hover:opacity-100 transition">
                    {image.width}×{image.height}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center - Canvas */}
      <div className="flex-1 flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={addPage}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <FiPlus />
              <span>Add Page</span>
            </button>
            <div className="text-sm text-gray-600">
              Page {currentPage + 1} of {pages.length || 1}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              title="Undo (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              title="Redo (Ctrl+Y)"
            >
              ↷
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button
              onClick={() => {
                if (currentPage > 0) setCurrentPage(currentPage - 1)
              }}
              disabled={currentPage === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => {
                if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1)
              }}
              disabled={currentPage >= pages.length - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <FiSave />
              <span>Save Album</span>
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 overflow-auto">
          <div 
            className="bg-white rounded-lg shadow-lg mx-auto" 
            style={{ width: '800px', height: '600px', position: 'relative' }}
            onClick={() => setSelectedImageId(null)}
          >
            {currentPageData.images.map((img) => {
              const imageData = availableImages.find((i) => i.id === img.id)
              return (
                <div
                  key={img.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggingImage(img.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragEnd={() => setDraggingImage(null)}
                  onMouseDown={(e) => {
                    if (resizingImage) return
                    setSelectedImageId(img.id)
                    const startX = e.clientX - img.x
                    const startY = e.clientY - img.y
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const canvas = e.currentTarget.parentElement
                      if (canvas) {
                        const rect = canvas.getBoundingClientRect()
                        const x = moveEvent.clientX - rect.left - startX
                        const y = moveEvent.clientY - rect.top - startY
                        updateImagePosition(img.id, x, y)
                      }
                    }
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                      saveToHistory(pages)
                    }
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                  style={{
                    position: 'absolute',
                    left: `${img.x}px`,
                    top: `${img.y}px`,
                    width: `${img.width}px`,
                    height: `${img.height}px`,
                    transform: `rotate(${img.rotation || 0}deg)`,
                    cursor: selectedImageId === img.id ? 'move' : 'pointer',
                  }}
                  className={`group border-2 rounded ${
                    selectedImageId === img.id
                      ? 'border-primary-500 shadow-lg'
                      : 'border-transparent hover:border-primary-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedImageId(img.id)
                  }}
                >
                  <img
                    src={imageData?.data || img.url}
                    alt=""
                    className="w-full h-full object-cover rounded pointer-events-none"
                    draggable={false}
                  />
                  
                  {/* Resize handles */}
                  {selectedImageId === img.id && (
                    <>
                      {/* Corner resize handle */}
                      <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-primary-500 border-2 border-white rounded-full cursor-nwse-resize z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          setResizingImage(img.id)
                          const startX = e.clientX
                          const startY = e.clientY
                          const startWidth = img.width
                          const startHeight = img.height
                          const aspectRatio = img.originalWidth && img.originalHeight 
                            ? img.originalWidth / img.originalHeight 
                            : startWidth / startHeight

                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            const deltaX = moveEvent.clientX - startX
                            const deltaY = moveEvent.clientY - startY
                            const scale = Math.max(0.1, Math.min(2, 1 + (deltaX + deltaY) / 200))
                            const newWidth = startWidth * scale
                            const newHeight = newWidth / aspectRatio
                            updateImageSize(img.id, newWidth, newHeight)
                          }

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove)
                            document.removeEventListener('mouseup', handleMouseUp)
                            setResizingImage(null)
                            saveToHistory(pages)
                          }

                          document.addEventListener('mousemove', handleMouseMove)
                          document.addEventListener('mouseup', handleMouseUp)
                        }}
                      />
                      {/* Rotation handle */}
                      <div
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary-500 border-2 border-white rounded-full cursor-grab flex items-center justify-center z-10"
                        onMouseDown={(e) => {
                          e.stopPropagation()
                          const startX = e.clientX
                          const startY = e.clientY
                          const startRotation = img.rotation || 0
                          const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                          if (!rect) return

                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            const centerX = rect.left + rect.width / 2
                            const centerY = rect.top + rect.height / 2
                            const angle = Math.atan2(
                              moveEvent.clientY - centerY,
                              moveEvent.clientX - centerX
                            )
                            const degrees = (angle * 180) / Math.PI + 90
                            updateImageRotation(img.id, degrees)
                          }

                          const handleMouseUp = () => {
                            document.removeEventListener('mousemove', handleMouseMove)
                            document.removeEventListener('mouseup', handleMouseUp)
                            saveToHistory(pages)
                          }

                          document.addEventListener('mousemove', handleMouseMove)
                          document.addEventListener('mouseup', handleMouseUp)
                        }}
                      >
                        <FiRotateCw className="text-white text-xs" />
                      </div>
                    </>
                  )}

                  {/* Action buttons */}
                  <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingImage({ id: img.id, url: img.url })
                      }}
                      className="p-1 bg-white rounded shadow hover:bg-gray-50"
                      title="Edit image"
                    >
                      <FiEdit className="text-sm" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeImageFromPage(img.id)
                        saveToHistory(pages)
                      }}
                      className="p-1 bg-white rounded shadow hover:bg-red-50"
                      title="Delete image"
                    >
                      <FiTrash2 className="text-sm text-red-600" />
                    </button>
                  </div>
                </div>
              )
            })}
            {currentPageData.images.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <FiImage className="text-4xl mx-auto mb-2" />
                  <p>Drag images from library to add to page</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Page Thumbnails */}
      <div className="w-48 bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <h3 className="font-semibold text-gray-900 mb-4">Pages</h3>
        <div className="space-y-2">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => setCurrentPage(index)}
              className={`w-full p-2 rounded-lg border-2 transition ${
                index === currentPage
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                {page.images.length > 0 ? (
                  <img
                    src={page.images[0].url}
                    alt=""
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <FiImage className="text-gray-400" />
                )}
              </div>
              <p className="text-xs text-gray-600">Page {index + 1}</p>
            </button>
          ))}
          {pages.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-4">
              No pages yet
            </div>
          )}
        </div>
      </div>

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.url}
          imageId={editingImage.id}
          onSave={(editedUrl) => {
            // Update the image in the page
            setPages((prev) => {
              const updated = [...prev]
              if (updated[currentPage]) {
                const img = updated[currentPage].images.find(
                  (i) => i.id === editingImage.id
                )
                if (img) {
                  img.url = editedUrl
                }
              }
              return updated
            })
            setEditingImage(null)
          }}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  )
}

