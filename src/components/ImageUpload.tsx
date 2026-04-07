'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface ImageUploadProps {
  currentImage?: string | null
  onUpload: (url: string) => void
}

export default function ImageUpload({ currentImage, onUpload }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya 5MB\'dan büyük olamaz')
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async () => {
        const base64 = reader.result as string
        setPreview(base64)

        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 }),
        })

        const data = await res.json()
        if (res.ok) {
          onUpload(data.url)
          toast.success('Fotoğraf yüklendi')
        } else {
          toast.error('Fotoğraf yüklenemedi')
          setPreview(currentImage || null)
        }
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
          <Image src={preview} alt="Ürün görseli" fill className="object-cover" />
        </div>
      ) : (
        <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
          <span className="text-3xl">📷</span>
        </div>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="btn-secondary text-sm"
      >
        {uploading ? 'Yükleniyor...' : preview ? 'Değiştir' : 'Fotoğraf Ekle'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
