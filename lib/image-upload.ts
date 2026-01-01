import imageCompression from 'browser-image-compression'
import { createClient } from './supabase-client'

export interface CompressionOptions {
    maxSizeMB?: number
    maxWidthOrHeight?: number
    useWebWorker?: boolean
    quality?: number
}

const defaultOptions: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    quality: 0.8,
}

/**
 * Compress an image file while maintaining quality
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const compressionOptions = { ...defaultOptions, ...options }

    try {
        const compressedFile = await imageCompression(file, compressionOptions)
        return compressedFile
    } catch (error) {
        console.error('Error compressing image:', error)
        throw error
    }
}

/**
 * Upload image to Supabase storage bucket
 */
export async function uploadImage(
    file: File,
    path: string,
    bucket: string = 'coin-images'
): Promise<string> {
    const supabase = createClient()

    try {
        // Compress image before upload
        const compressedFile = await compressImage(file)

        // Generate unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${path}-${Date.now()}.${fileExt}`

        // Upload to Supabase storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, compressedFile, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) {
            throw error
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName)

        return publicUrl
    } catch (error) {
        console.error('Error uploading image:', error)
        throw error
    }
}

/**
 * Delete image from Supabase storage
 */
export async function deleteImage(
    imageUrl: string,
    bucket: string = 'coin-images'
): Promise<void> {
    const supabase = createClient()

    try {
        // Extract filename from URL
        const urlParts = imageUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]

        const { error } = await supabase.storage
            .from(bucket)
            .remove([fileName])

        if (error) {
            throw error
        }
    } catch (error) {
        console.error('Error deleting image:', error)
        throw error
    }
}

/**
 * Get file size reduction info
 */
export function getCompressionInfo(
    originalSize: number,
    compressedSize: number
) {
    const reduction = originalSize - compressedSize
    const percentage = ((reduction / originalSize) * 100).toFixed(1)

    return {
        originalSize: (originalSize / 1024 / 1024).toFixed(2) + ' MB',
        compressedSize: (compressedSize / 1024 / 1024).toFixed(2) + ' MB',
        reduction: (reduction / 1024 / 1024).toFixed(2) + ' MB',
        percentage: percentage + '%',
    }
}
