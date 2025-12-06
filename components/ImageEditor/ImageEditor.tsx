'use client'

import { useState, useRef, useEffect } from 'react'
import { FiRotateCw, FiRotateCcw, FiZoomIn, FiZoomOut, FiCrop, FiSave, FiX, FiFilter } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface ImageEditorProps {
  imageUrl: string
  imageId: string
  onSave: (editedImageUrl: string) => void
  onClose: () => void
}

export default function ImageEditor({
  imageUrl,
  imageId,
  onSave,
  onClose,
}: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [saturation, setSaturation] = useState(100)
  const [filter, setFilter] = useState<string>('none')
  const [isCropping, setIsCropping] = useState(false)
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 })
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 })
  const [image, setImage] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImage(img)
      drawImage()
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    drawImage()
  }, [rotation, scale, brightness, contrast, saturation, filter, image])

  const drawImage = () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const maxWidth = 800
    const maxHeight = 600
    const aspectRatio = image.width / image.height
    
    let canvasWidth = maxWidth
    let canvasHeight = maxHeight
    
    if (aspectRatio > 1) {
      canvasHeight = maxWidth / aspectRatio
    } else {
      canvasWidth = maxHeight * aspectRatio
    }
    
    canvas.width = canvasWidth
    canvas.height = canvasHeight

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()

    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    // Apply filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`

    // Draw image centered
    const imgWidth = image.width
    const imgHeight = image.height
    let drawWidth = canvas.width * 0.8
    let drawHeight = drawWidth / aspectRatio

    if (drawHeight > canvas.height * 0.8) {
      drawHeight = canvas.height * 0.8
      drawWidth = drawHeight * aspectRatio
    }

    ctx.drawImage(
      image,
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight
    )

    // Apply color filters
    if (filter !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        if (filter === 'grayscale') {
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
          data[i] = gray
          data[i + 1] = gray
          data[i + 2] = gray
        } else if (filter === 'sepia') {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189)
          data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168)
          data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131)
        } else if (filter === 'vintage') {
          data[i] = Math.min(255, data[i] * 1.1)
          data[i + 1] = Math.min(255, data[i + 1] * 0.9)
          data[i + 2] = Math.min(255, data[i + 2] * 0.8)
        }
      }

      ctx.putImageData(imageData, 0, 0)
    }

    ctx.restore()

    // Draw crop rectangle if cropping
    if (isCropping && cropStart.x !== cropEnd.x && cropStart.y !== cropEnd.y) {
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.strokeRect(
        Math.min(cropStart.x, cropEnd.x),
        Math.min(cropStart.y, cropEnd.y),
        Math.abs(cropEnd.x - cropStart.x),
        Math.abs(cropEnd.y - cropStart.y)
      )
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const editedImageUrl = canvas.toDataURL('image/jpeg', 0.9)
    onSave(editedImageUrl)
    toast.success('Image saved!')
  }

  const handleRotate = (direction: 'left' | 'right') => {
    setRotation((prev) => prev + (direction === 'right' ? 90 : -90))
  }

  const handleReset = () => {
    setRotation(0)
    setScale(1)
    setBrightness(100)
    setContrast(100)
    setSaturation(100)
    setFilter('none')
    setIsCropping(false)
    toast.success('Reset to original')
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Image</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[60vh] border border-gray-300 rounded"
                />
              </div>
            </div>

            <div className="w-80 space-y-4">
              {/* Rotation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rotation
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRotate('left')}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <FiRotateCcw />
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={rotation}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1"
                  />
                  <button
                    onClick={() => handleRotate('right')}
                    className="p-2 bg-white border border-gray-300 rounded hover:bg-gray-50"
                  >
                    <FiRotateCw />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">{rotation}°</p>
              </div>

              {/* Zoom */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom
                </label>
                <div className="flex items-center space-x-2">
                  <FiZoomOut className="text-gray-400" />
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={scale}
                    onChange={(e) => setScale(Number(e.target.value))}
                    className="flex-1"
                  />
                  <FiZoomIn className="text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(scale * 100)}%
                </p>
              </div>

              {/* Brightness */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brightness: {brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Contrast */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contrast: {contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Saturation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturation: {saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filters
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="none">None</option>
                  <option value="grayscale">Grayscale</option>
                  <option value="sepia">Sepia</option>
                  <option value="vintage">Vintage</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center space-x-2"
                >
                  <FiSave />
                  <span>Save</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

