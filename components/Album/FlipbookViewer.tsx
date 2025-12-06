'use client'

import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut, FiRotateCw } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface FlipbookViewerProps {
  pages: any[]
  onPageChange?: (page: number) => void
  initialPage?: number
}

export default function FlipbookViewer({
  pages,
  onPageChange,
  initialPage = 1,
}: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [isFlipping, setIsFlipping] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [viewMode, setViewMode] = useState<'spread' | 'single'>('spread') // Default to double-page spread (usePortrait={false})
  const flipbookRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPage)
    }
  }, [currentPage, onPageChange])

  const handleNext = () => {
    if (isFlipping || currentPage >= pages.length) return
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentPage((prev) => Math.min(prev + 1, pages.length))
      setIsFlipping(false)
    }, 300)
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50))
  }

  const handlePrevious = () => {
    if (isFlipping || currentPage <= 1) return
    setIsFlipping(true)
    setTimeout(() => {
      setCurrentPage((prev) => Math.max(prev - 1, 1))
      setIsFlipping(false)
    }, 300)
  }

  const renderPage = (pageIndex: number, isLeft: boolean = false) => {
    const page = pages[pageIndex - 1]
    if (!page) return null

    const pageImages = page.images || []
    const layout = page.layout?.toLowerCase() || 'single'
    const isFull = layout === 'full' || page.type === 'cover'
    const isGrid = layout.includes('grid')
    const isTwoColumn = layout.includes('two column')
    const isThreeColumn = layout.includes('three column')
    const isMixed = layout.includes('mixed')

    return (
      <div className="w-full h-full bg-white relative overflow-hidden">
        {pageImages.length > 0 ? (
          pageImages.map((img: any, imgIndex: number) => {
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
          })
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <p className="text-gray-400">Page {pageIndex}</p>
          </div>
        )}
      </div>
    )
  }

  const getSpreadPages = () => {
    if (viewMode === 'single') {
      return { left: currentPage, right: null }
    }

    // Double-page spread: show current page on right, previous on left
    const rightPage = currentPage
    const leftPage = currentPage > 1 ? currentPage - 1 : null

    return { left: leftPage, right: rightPage }
  }

  const { left, right } = getSpreadPages()

  return (
    <div className="h-full w-full bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center relative overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-30 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-lg p-2">
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
          onClick={() => setViewMode(viewMode === 'spread' ? 'single' : 'spread')}
          className="p-2 text-white hover:bg-white/20 rounded"
          title={viewMode === 'spread' ? 'Switch to single page' : 'Switch to double-page spread'}
        >
          <FiRotateCw />
        </button>
      </div>

      {/* Page Navigation */}
      <button
        onClick={handlePrevious}
        disabled={currentPage <= 1 || isFlipping}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FiChevronLeft className="text-2xl" />
      </button>

      <button
        onClick={handleNext}
        disabled={currentPage >= pages.length || isFlipping}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <FiChevronRight className="text-2xl" />
      </button>

      {/* Flipbook Container */}
      <div
        ref={flipbookRef}
        className="relative"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center',
          transition: 'transform 0.3s ease',
        }}
      >
        <div className="flex items-center justify-center space-x-1 perspective-1000">
          {/* Left Page */}
          {left && (
            <motion.div
              key={`left-${left}`}
              initial={{ rotateY: -5, opacity: 0.9 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative shadow-2xl"
              style={{
                width: '400px',
                height: '600px',
                transformStyle: 'preserve-3d',
                transform: 'perspective(1000px) rotateY(-2deg)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700 rounded-l-lg"></div>
              <div
                className="absolute inset-0 rounded-l-lg overflow-hidden"
                style={{
                  transform: 'translateZ(1px)',
                  boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.3)',
                }}
              >
                {renderPage(left, true)}
              </div>
              {/* Page edge shadow */}
              <div
                className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-r from-transparent via-black/20 to-transparent"
                style={{ transform: 'translateZ(2px)' }}
              ></div>
            </motion.div>
          )}

          {/* Right Page */}
          {right && (
            <motion.div
              key={`right-${right}`}
              initial={{ rotateY: 5, opacity: 0.9 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative shadow-2xl"
              style={{
                width: '400px',
                height: '600px',
                transformStyle: 'preserve-3d',
                transform: 'perspective(1000px) rotateY(2deg)',
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-l from-gray-800 to-gray-700 rounded-r-lg"></div>
              <div
                className="absolute inset-0 rounded-r-lg overflow-hidden"
                style={{
                  transform: 'translateZ(1px)',
                  boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.3)',
                }}
              >
                {renderPage(right, false)}
              </div>
              {/* Page edge shadow */}
              <div
                className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-l from-transparent via-black/20 to-transparent"
                style={{ transform: 'translateZ(2px)' }}
              ></div>
            </motion.div>
          )}

          {/* Single page mode - centered */}
          {viewMode === 'single' && right && (
            <motion.div
              key={`single-${right}`}
              initial={{ scale: 0.95, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="relative shadow-2xl"
              style={{
                width: '500px',
                height: '700px',
                transformStyle: 'preserve-3d',
              }}
            >
              <div className="absolute inset-0 bg-white rounded-lg overflow-hidden shadow-2xl">
                {renderPage(right, false)}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Page Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <span className="text-white text-sm">
          {currentPage} / {pages.length}
        </span>
      </div>

      {/* View Mode Indicator */}
      <div className="absolute top-4 right-4 z-30 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1">
        <span className="text-white text-xs">
          {viewMode === 'spread' ? 'Double-Page Spread' : 'Single Page'}
        </span>
      </div>
    </div>
  )
}

