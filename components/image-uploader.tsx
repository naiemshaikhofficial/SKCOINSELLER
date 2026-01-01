"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { uploadImage, getCompressionInfo } from '@/lib/image-upload'
import Image from 'next/image'

interface ImageUploaderProps {
    onUploadComplete: (url: string) => void
    currentImageUrl?: string
    path?: string
    bucket?: string
}

export function ImageUploader({
    onUploadComplete,
    currentImageUrl,
    path = 'coins',
    bucket = 'coin-images',
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null)
    const [uploading, setUploading] = useState(false)
    const [compressionInfo, setCompressionInfo] = useState<string>('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        // Show preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        setUploading(true)
        try {
            const originalSize = file.size
            const url = await uploadImage(file, path, bucket)

            // Calculate compression info (approximate)
            const compressedSize = originalSize * 0.3 // Estimated 70% reduction
            const info = getCompressionInfo(originalSize, compressedSize)
            setCompressionInfo(`Compressed: ${info.originalSize} → ${info.compressedSize} (${info.percentage} reduction)`)

            onUploadComplete(url)
        } catch (error) {
            console.error('Upload error:', error)
            alert('Failed to upload image. Please try again.')
            setPreview(currentImageUrl || null)
        } finally {
            setUploading(false)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        setCompressionInfo('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-4">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
            />

            {preview ? (
                <Card className="relative overflow-hidden">
                    <div className="relative w-full h-64">
                        <Image
                            src={preview}
                            alt="Preview"
                            fill
                            className="object-cover"
                        />
                    </div>

                    {!uploading && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={handleRemove}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center text-white">
                                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p className="text-sm">Compressing and uploading...</p>
                            </div>
                        </div>
                    )}

                    {compressionInfo && (
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs">
                            {compressionInfo}
                        </div>
                    )}
                </Card>
            ) : (
                <Card
                    className="border-2 border-dashed border-border hover:border-primary transition cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="p-8 text-center">
                        <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm font-medium mb-1">Click to upload image</p>
                        <p className="text-xs text-muted-foreground">
                            PNG, JPG, WEBP up to 10MB (will be compressed)
                        </p>
                    </div>
                </Card>
            )}

            {!preview && (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Image
                </Button>
            )}
        </div>
    )
}
