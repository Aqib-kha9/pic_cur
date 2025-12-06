'use client'

import { useState, useRef, useCallback } from 'react'
import { FiUpload, FiX, FiImage, FiCheck } from 'react-icons/fi'
import { imageStorage } from '@/utils/imageStorage'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  onImagesUploaded: (imageIds: string[]) => void
  multiple?: boolean
  maxFiles?: number
}

export default function ImageUploader({
  onImagesUploaded,
  multiple = true,
  maxFiles = 100,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return

      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith('image/')
      )

      if (imageFiles.length === 0) {
        toast.error('Please select image files only')
        return
      }

      if (imageFiles.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files allowed`)
        return
      }

      setUploading(true)
      const uploadedIds: string[] = []

      try {
        for (const file of imageFiles) {
          const id = await imageStorage.saveImage(file)
          uploadedIds.push(id)
        }

        setUploadedImages((prev) => [...prev, ...uploadedIds])
        onImagesUploaded(uploadedIds)
        toast.success(`Successfully uploaded ${uploadedIds.length} image(s)`)
      } catch (error) {
        toast.error('Failed to upload images')
        console.error(error)
      } finally {
        setUploading(false)
      }
    },
    [maxFiles, onImagesUploaded]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition
          ${
            isDragging
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FiUpload className="text-4xl text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-gray-500">
              {multiple
                ? `Upload up to ${maxFiles} images (JPG, PNG, etc.)`
                : 'Select an image file'}
            </p>
          </div>
        )}
      </div>

      {uploadedImages.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {uploadedImages.length} image(s) uploaded
          </p>
        </div>
      )}
    </div>
  )
}

