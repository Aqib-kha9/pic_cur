'use client'

import { useState, useEffect, useRef } from 'react'
import { FiChevronLeft, FiMessageSquare, FiPlusCircle, FiX, FiZoomIn, FiZoomOut, FiChevronRight } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  id: string
  pageNumber: number
  x: number
  y: number
  content: string
  user: {
    name: string
  }
  createdAt: string
}

interface ReviewFlipbookProps {
  pages: any[]
  albumId: string
  onPageChange?: (page: number) => void
  initialPage?: number
}

export default function ReviewFlipbook({
  pages,
  albumId,
  onPageChange,
  initialPage = 0,
}: ReviewFlipbookProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPage)
  const [scale, setScale] = useState(0.8)
  const [comments, setComments] = useState<Comment[]>([])
  const [showSidebar, setShowSidebar] = useState(true)
  const [annotationMode, setAnnotationMode] = useState(false)
  const [tempPin, setTempPin] = useState<{ x: number; y: number; pageNumber: number } | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipProgress, setFlipProgress] = useState(0)
  const [flipDirection, setFlipDirection] = useState<'forward' | 'backward'>('forward')
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPageIndex + 1)
    }
  }, [currentPageIndex, onPageChange])

  const handlePageClick = (e: React.MouseEvent, pageNumber: number) => {
    if (!annotationMode) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    setTempPin({ x, y, pageNumber })
    setShowSidebar(true)
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !tempPin) return

    setIsSubmitting(true)
    try {
      const newCommentData: Comment = {
        id: Date.now().toString(),
        pageNumber: tempPin.pageNumber,
        x: tempPin.x,
        y: tempPin.y,
        content: newComment,
        user: { name: 'You' },
        createdAt: new Date().toISOString(),
      }

      setComments([newCommentData, ...comments])
      setNewComment('')
      setTempPin(null)
      setAnnotationMode(false)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const animatePageFlip = (direction: 'forward' | 'backward', targetIndex: number) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    setIsFlipping(true)
    setFlipDirection(direction)
    setFlipProgress(0)

    const duration = 1000 // 1 second for smooth animation
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for natural book flip motion
      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2

      setFlipProgress(easeProgress)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentPageIndex(targetIndex)
        setFlipProgress(0)
        setIsFlipping(false)
        animationRef.current = null
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const handleNext = () => {
    if (isFlipping || currentPageIndex >= pages.length - 1) return
    const targetIndex = Math.min(currentPageIndex + 1, pages.length - 1)
    animatePageFlip('forward', targetIndex)
  }

  const handlePrevious = () => {
    if (isFlipping || currentPageIndex <= 0) return
    const targetIndex = Math.max(currentPageIndex - 1, 0)
    animatePageFlip('backward', targetIndex)
  }

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  const renderPageContent = (page: any, pageNumber: number) => {
    const pageImages = page.images || []
    const layout = page.layout?.toLowerCase() || 'single'
    const isFull = layout === 'full' || page.type === 'cover'
    const isGrid = layout.includes('grid')
    const isTwoColumn = layout.includes('two column')
    const isThreeColumn = layout.includes('three column')
    const isMixed = layout.includes('mixed')

    return (
      <div
        className={`w-full h-full relative ${annotationMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
        onClick={(e) => handlePageClick(e, pageNumber)}
      >
        {/* Render Images */}
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
                className="absolute border border-gray-200 pointer-events-none"
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
          <div className="absolute inset-0 flex items-center justify-center opacity-10 font-black text-4xl uppercase select-none">
            {page.type || 'Empty'}
          </div>
        )}

        {/* Comment Pins */}
        {comments
          .filter((c) => c.pageNumber === pageNumber)
          .map((c, i) => (
            <div
              key={c.id}
              className="absolute w-6 h-6 -ml-3 -mt-3 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg z-20 cursor-pointer hover:scale-125 transition"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
              title={`${c.user.name}: ${c.content}`}
            >
              <span className="text-[9px] font-bold text-white">{i + 1}</span>
            </div>
          ))}

        {/* Temp Pin */}
        {tempPin && tempPin.pageNumber === pageNumber && (
          <div
            className="absolute w-6 h-6 -ml-3 -mt-3 bg-yellow-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg z-20 animate-bounce"
            style={{ left: `${tempPin.x}%`, top: `${tempPin.y}%` }}
          >
            <FiPlusCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
    )
  }

  // Get left and right pages for double-page spread
  const getSpreadPages = () => {
    const rightPageIndex = currentPageIndex
    const leftPageIndex = currentPageIndex > 0 ? currentPageIndex - 1 : null
    const nextPageIndex = currentPageIndex < pages.length - 1 ? currentPageIndex + 1 : null

    return {
      left: leftPageIndex !== null ? pages[leftPageIndex] : null,
      leftPageNumber: leftPageIndex !== null ? leftPageIndex + 1 : null,
      right: pages[rightPageIndex],
      rightPageNumber: rightPageIndex + 1,
      next: nextPageIndex !== null ? pages[nextPageIndex] : null,
      nextPageNumber: nextPageIndex !== null ? nextPageIndex + 1 : null,
    }
  }

  const { left, leftPageNumber, right, rightPageNumber, next, nextPageNumber } = getSpreadPages()

  // Calculate rotation for flipping right page
  const getRightPageRotation = () => {
    if (isFlipping && flipDirection === 'forward') {
      return 180 * flipProgress // Rotate from 0 to 180 degrees
    }
    return 0
  }

  // Calculate position for flipping right page
  const getRightPagePosition = () => {
    if (isFlipping && flipDirection === 'forward') {
      // Move from right position to left position as it flips
      return -400 * flipProgress // Move left by 400px (page width)
    }
    return 0
  }

  // Calculate rotation for backward flip (left page flips back)
  const getLeftPageRotation = () => {
    if (isFlipping && flipDirection === 'backward') {
      return -180 * (1 - flipProgress) // Rotate from -180 to 0
    }
    return 0
  }

  const getLeftPagePosition = () => {
    if (isFlipping && flipDirection === 'backward') {
      return 400 * (1 - flipProgress) // Move from left to right
    }
    return 0
  }

  return (
    <div className="h-full w-full flex flex-col bg-[#121212] overflow-hidden font-sans text-gray-200">
      {/* Header */}
      <header className="h-16 bg-[#1e1e1e] border-b border-black flex items-center justify-between px-6 z-20 shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg">
            Album Review <span className="text-gray-500 text-sm font-normal">| Live Preview</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 bg-[#252526] p-1 rounded-lg border border-gray-800">
          <button
            onClick={() => setScale((s) => Math.max(0.4, s - 0.1))}
            className="p-2 hover:bg-[#333] rounded text-gray-400"
          >
            <FiZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs px-2 font-mono">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            className="p-2 hover:bg-[#333] rounded text-gray-400"
          >
            <FiZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAnnotationMode(!annotationMode)
              setTempPin(null)
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
              annotationMode
                ? 'bg-blue-600 text-white shadow-blue-900/50 shadow-lg'
                : 'bg-[#333] hover:bg-[#444] text-gray-300'
            }`}
          >
            <FiPlusCircle className="w-4 h-4" />
            <span className="text-sm font-bold">
              {annotationMode ? 'Click Page to Pin' : 'Add Comment'}
            </span>
          </button>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-2 rounded-lg transition ${
              showSidebar ? 'bg-[#333] text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <FiMessageSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Viewer Area */}
        <main className="flex-1 relative flex items-center justify-center bg-[#0a0a0a] p-8">
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease-out',
            }}
            className="shadow-2xl shadow-black"
          >
            {/* Book Container with 3D Perspective */}
            <div
              className="relative flex items-center justify-center"
              style={{
                perspective: '2000px',
                perspectiveOrigin: 'center center',
                width: '816px', // 400 + 8 + 400 + 8 (pages + spine + spacing)
                height: '600px',
              }}
            >
              {/* Left Page Position */}
              <div className="absolute left-0" style={{ width: '400px', height: '600px' }}>
                <AnimatePresence mode="wait">
                  {left && leftPageNumber && (
                    <motion.div
                      key={`left-${leftPageNumber}-${currentPageIndex}`}
                      initial={{ rotateY: 0 }}
                      animate={{
                        rotateY: getLeftPageRotation(),
                      }}
                      exit={{ rotateY: -180, opacity: 0 }}
                      transition={{ duration: isFlipping ? 0 : 0.3 }}
                      className="relative shadow-2xl"
                      style={{
                        width: '400px',
                        height: '600px',
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'right center',
                      }}
                    >
                      {/* Page front */}
                      <div
                        className="absolute inset-0 rounded-l-lg overflow-hidden"
                        style={{
                          transform: 'translateZ(1px)',
                          backfaceVisibility: 'hidden',
                          boxShadow: 'inset -10px 0 20px rgba(0,0,0,0.3)',
                        }}
                      >
                        {renderPageContent(left, leftPageNumber)}
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-r from-transparent via-black/20 to-transparent"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Book Binding/Spine */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 z-5"
                style={{
                  width: '8px',
                  height: '600px',
                  background: 'linear-gradient(to right, #2d1b0e, #3d2815, #2d1b0e)',
                  boxShadow: 'inset -2px 0 10px rgba(0,0,0,0.5), inset 2px 0 10px rgba(0,0,0,0.5)',
                  borderRadius: '2px',
                }}
              ></div>

              {/* Right Page Position - This page flips over to become left */}
              <div className="absolute right-0" style={{ width: '400px', height: '600px' }}>
                <AnimatePresence mode="wait">
                  {right && rightPageNumber && (
                    <motion.div
                      key={`right-${rightPageNumber}-${currentPageIndex}`}
                      initial={false}
                      animate={{
                        rotateY: getRightPageRotation(),
                        x: getRightPagePosition(),
                      }}
                      exit={{ rotateY: 180, x: -400, opacity: 0 }}
                      transition={{ duration: isFlipping ? 0 : 0.3 }}
                      className="relative shadow-2xl"
                      style={{
                        width: '400px',
                        height: '600px',
                        transformStyle: 'preserve-3d',
                        transformOrigin: 'left center',
                        zIndex: isFlipping && flipDirection === 'forward' ? 20 : 1,
                      }}
                    >
                      {/* Page back (visible when flipped more than 90 degrees) */}
                      {isFlipping && flipDirection === 'forward' && flipProgress > 0.5 && next && (
                        <div
                          className="absolute inset-0 bg-gray-100 rounded-r-lg"
                          style={{
                            transform: 'rotateY(180deg) translateZ(1px)',
                            backfaceVisibility: 'hidden',
                          }}
                        >
                          <div className="w-full h-full bg-gradient-to-l from-gray-200 to-gray-100"></div>
                        </div>
                      )}

                      {/* Page front */}
                      <div
                        className="absolute inset-0 rounded-r-lg overflow-hidden"
                        style={{
                          transform: 'translateZ(1px)',
                          backfaceVisibility: 'hidden',
                          boxShadow: isFlipping && flipDirection === 'forward'
                            ? `inset ${10 - flipProgress * 20}px 0 ${20 + flipProgress * 30}px rgba(0,0,0,${0.3 + flipProgress * 0.2})`
                            : 'inset 10px 0 20px rgba(0,0,0,0.3)',
                        }}
                      >
                        {renderPageContent(right, rightPageNumber)}
                      </div>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-l from-transparent via-black/20 to-transparent"></div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Next Page (behind right page, becomes visible as right page flips) */}
                {next && nextPageNumber && (
                  <motion.div
                    key={`next-${nextPageNumber}-${currentPageIndex}`}
                    initial={{ rotateY: 180, opacity: 0 }}
                    animate={{
                      rotateY: isFlipping && flipDirection === 'forward' ? 180 - 180 * flipProgress : 180,
                      opacity: isFlipping && flipDirection === 'forward' ? Math.min(flipProgress * 2, 1) : 0,
                    }}
                    transition={{ duration: isFlipping ? 0 : 0.3 }}
                    className="absolute shadow-2xl"
                    style={{
                      width: '400px',
                      height: '600px',
                      transformStyle: 'preserve-3d',
                      transformOrigin: 'left center',
                      zIndex: 1,
                      top: 0,
                      left: 0,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-r-lg overflow-hidden"
                      style={{
                        transform: 'translateZ(1px)',
                        backfaceVisibility: 'hidden',
                        boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.3)',
                      }}
                    >
                      {renderPageContent(next, nextPageNumber)}
                    </div>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-l from-transparent via-black/20 to-transparent"></div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30">
              <button
                onClick={handlePrevious}
                disabled={currentPageIndex <= 0 || isFlipping}
                className="p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronLeft className="text-2xl" />
              </button>
            </div>

            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30">
              <button
                onClick={handleNext}
                disabled={currentPageIndex >= pages.length - 1 || isFlipping}
                className="p-3 bg-black/50 backdrop-blur-sm text-white rounded-full hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <FiChevronRight className="text-2xl" />
              </button>
            </div>

            {/* Page Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-sm">
                {currentPageIndex + 1} / {pages.length}
              </span>
            </div>
          </div>
        </main>

        {/* Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-96 bg-[#1e1e1e] border-l border-black flex flex-col z-30 shadow-2xl absolute right-0 top-16 bottom-0"
            >
              <div className="p-4 border-b border-black flex justify-between items-center bg-[#252526]">
                <h3 className="font-bold text-sm text-gray-200">COMMENTS</h3>
                <button onClick={() => setShowSidebar(false)}>
                  <FiX className="w-4 h-4 text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
                {comments.length === 0 ? (
                  <div className="text-center py-20 opacity-30">
                    <FiMessageSquare className="w-12 h-12 mx-auto mb-4" />
                    <p className="text-sm">No comments yet.</p>
                  </div>
                ) : (
                  comments.map((comment, idx) => (
                    <div
                      key={comment.id}
                      className="bg-[#1e1e1e] p-3 rounded border border-gray-800 hover:border-blue-500/30 transition group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-blue-900 text-blue-300 rounded-full flex items-center justify-center text-[10px] font-bold border border-blue-500/20">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-gray-300">
                            {comment.user.name}
                          </span>
                          <span className="text-[10px] text-gray-500 px-1.5 py-0.5 bg-black rounded">
                            Pg {comment.pageNumber}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-600">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 pl-7 group-hover:text-gray-200">
                        {comment.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-[#1e1e1e] border-t border-black">
                {tempPin ? (
                  <form onSubmit={handleAddComment}>
                    <div className="flex items-center justify-between text-xs text-yellow-500 mb-2 font-bold uppercase tracking-wider">
                      <span>New Comment</span>
                      <span>Page {tempPin.pageNumber}</span>
                    </div>
                    <textarea
                      className="w-full bg-black border border-gray-700 rounded p-3 text-white text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none placeholder-gray-600"
                      rows={3}
                      placeholder="Write your feedback..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      autoFocus
                    ></textarea>
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setTempPin(null)
                          setIsSubmitting(false)
                        }}
                        className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold uppercase rounded transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase rounded transition disabled:opacity-50"
                      >
                        {isSubmitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setAnnotationMode(true)
                    }}
                    className="w-full py-4 bg-[#121212] border border-dashed border-gray-700 text-gray-500 hover:text-white hover:border-gray-500 rounded text-xs font-bold uppercase transition flex items-center justify-center gap-2"
                  >
                    <FiPlusCircle className="w-4 h-4" />
                    Drop a Pin to Comment
                  </button>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

