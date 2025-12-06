'use client'

import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiMaximize2, FiBook } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import FlipbookViewer from './FlipbookViewer'

interface Comment {
  id: string
  page: number
  x: number
  y: number
  text: string
  author: string
  timestamp: string
  resolved: boolean
}

interface AlbumViewerProps {
  albumId: string
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  comments: Comment[]
  albumPages?: any[]
  useFlipbook?: boolean
}

export default function AlbumViewer({
  albumId,
  currentPage,
  totalPages,
  onPageChange,
  comments,
  albumPages,
  useFlipbook = true,
}: AlbumViewerProps) {
  const [zoom, setZoom] = useState(100)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [viewMode, setViewMode] = useState<'flipbook' | 'standard'>(useFlipbook ? 'flipbook' : 'standard')

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevious()
      if (e.key === 'ArrowRight') handleNext()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, totalPages])

  // Use flipbook viewer if enabled and pages are available
  if (viewMode === 'flipbook' && albumPages && albumPages.length > 0) {
    return (
      <div className="h-full w-full relative">
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-2">
          <button
            onClick={() => setViewMode('standard')}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded hover:bg-black/70 flex items-center space-x-2"
            title="Switch to standard view"
          >
            <FiBook />
            <span className="text-xs">Standard</span>
          </button>
        </div>
        <FlipbookViewer
          pages={albumPages}
          onPageChange={onPageChange}
          initialPage={currentPage}
        />
      </div>
    )
  }

  return (
    <div className="h-full bg-dark-900 flex items-center justify-center relative overflow-hidden">
      {/* View Mode Toggle */}
      {albumPages && albumPages.length > 0 && (
        <div className="absolute top-4 right-4 z-30">
          <button
            onClick={() => setViewMode('flipbook')}
            className="p-2 bg-black/50 backdrop-blur-sm text-white rounded hover:bg-black/70 flex items-center space-x-2"
            title="Switch to 3D flipbook view"
          >
            <FiBook />
            <span className="text-xs">Flipbook</span>
          </button>
        </div>
      )}
      {/* Navigation Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
        <button
          onClick={handleZoomOut}
          className="p-2 text-white hover:bg-white/20 rounded"
          disabled={zoom <= 50}
        >
          <FiZoomOut />
        </button>
        <span className="text-white text-sm px-2">{zoom}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 text-white hover:bg-white/20 rounded"
          disabled={zoom >= 200}
        >
          <FiZoomIn />
        </button>
        <div className="w-px h-6 bg-white/30 mx-1"></div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 text-white hover:bg-white/20 rounded"
        >
          <FiMaximize2 />
        </button>
      </div>

      {/* Page Navigation */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FiChevronLeft className="text-2xl" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FiChevronRight className="text-2xl" />
      </button>

      {/* Page Display */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ transform: `scale(${zoom / 100})` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-white shadow-2xl" style={{ width: '800px', height: '600px', position: 'relative' }}>
              {albumPages && albumPages[currentPage - 1] ? (
                <div className="w-full h-full relative">
                  {albumPages[currentPage - 1].images?.map((img: any, imgIndex: number) => {
                    const layout = albumPages[currentPage - 1].layout?.toLowerCase() || 'single'
                    const isFull = layout === 'full' || albumPages[currentPage - 1].type === 'cover'
                    const isGrid = layout.includes('grid')
                    const isTwoColumn = layout.includes('two column')
                    const isThreeColumn = layout.includes('three column')
                    const isMixed = layout.includes('mixed')
                    const pageImages = albumPages[currentPage - 1].images || []
                    
                    let width = '100%'
                    let height = '100%'
                    let left = '0'
                    let top = '0'

                    if (isFull) {
                      width = '100%'
                      height = '100%'
                    } else if (isGrid && pageImages.length === 4) {
                      width = '50%'
                      height = '50%'
                      left = `${(imgIndex % 2) * 50}%`
                      top = `${Math.floor(imgIndex / 2) * 50}%`
                    } else if (isTwoColumn && pageImages.length === 2) {
                      width = '50%'
                      height = '100%'
                      left = `${imgIndex * 50}%`
                      top = '0'
                    } else if (isThreeColumn && pageImages.length === 3) {
                      width = `${100 / 3}%`
                      height = '100%'
                      left = `${imgIndex * (100 / 3)}%`
                      top = '0'
                    } else if (isMixed) {
                      if (imgIndex === 0) {
                        width = '100%'
                        height = '50%'
                        top = '0'
                      } else {
                        width = '50%'
                        height = '50%'
                        left = `${(imgIndex - 1) * 50}%`
                        top = '50%'
                      }
                    }

                    return (
                      <div
                        key={img.id || imgIndex}
                        className="absolute border border-gray-200"
                        style={{ width, height, left, top }}
                      >
                        <img
                          src={img.url || img.data}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-400">Page {currentPage}</p>
                </div>
              )}
              
              {/* Comments Overlay */}
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="absolute"
                  style={{
                    left: `${comment.x}%`,
                    top: `${comment.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition"></div>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Page Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-white text-sm">
          {currentPage} / {totalPages}
        </span>
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm rounded-lg p-2 max-w-4xl overflow-x-auto">
        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const pageData = albumPages?.[page - 1]
            const thumbnailUrl = pageData?.images?.[0]?.url || 
                                pageData?.images?.[0]?.data ||
                                `https://via.placeholder.com/160x120?text=${page}`
            
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-16 h-12 rounded overflow-hidden border-2 transition ${
                  page === currentPage
                    ? 'border-primary-500 scale-110'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={thumbnailUrl}
                  alt={`Page ${page}`}
                  className="w-full h-full object-cover"
                />
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

