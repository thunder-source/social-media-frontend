import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import imageCompression from 'browser-image-compression';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function setCookie(name: string, value: string, days: number = 7): void {
  if (typeof document === "undefined") return;
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  
  // Set cookie with path, secure, and SameSite attributes for better compatibility
  document.cookie = `${name}=${value}; ${expires}; path=/; SameSite=Lax`;
}

export async function compressFile(file: File): Promise<File | Blob> {
  // Handle Image Compression
  if (file.type.startsWith('image/')) {
    const options = {
      maxSizeMB: .5, // Compress to 500KB
      maxWidthOrHeight: 1920, // Max width/height
      useWebWorker: true,
    };
    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Image compression failed:', error);
      return file; // Return original if compression fails
    }
  }
  
  // Handle Video Compression (Placeholder)
  // Video compression in the browser is resource-intensive and typically requires libraries like ffmpeg.wasm.
  // For now, we return the original file. 
  if (file.type.startsWith('video/')) {
    // TODO: Implement video compression using ffmpeg.wasm or similar if needed.
    // Note: ffmpeg.wasm requires SharedArrayBuffer which needs specific server headers (COOP/COEP).
    return file;
  }

  return file;
}
