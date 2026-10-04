'use client'

import { useState } from 'react'
import { uploadTaskPhotoRecord } from '@/lib/actions/tasks'

export function PhotoUploader({ taskId }: { taskId: string }) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      // 1. Get signed URL
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          taskId,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to get upload URL')

      // 2. Upload file directly to Supabase Storage
      const uploadRes = await fetch(data.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadRes.ok) throw new Error('Upload to storage failed')

      // 3. Save record to task logs
      // publicUrl can be constructed based on NEXT_PUBLIC_SUPABASE_URL
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/site-photos/${data.publicPath}`
      const actionRes = await uploadTaskPhotoRecord(taskId, publicUrl)

      if (actionRes.error) throw new Error(actionRes.error)

    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsUploading(false)
      e.target.value = '' // reset input
    }
  }

  return (
    <div>
      <input
        type="file"
        id={`photo-upload-${taskId}`}
        accept="image/*"
        capture="environment" // Force mobile camera
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <label
        htmlFor={`photo-upload-${taskId}`}
        className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          isUploading
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-600 border border-slate-700'
        }`}
      >
        {isUploading ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            กำลังอัปโหลด...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            ถ่ายรูป / อัปโหลดหลักฐาน
          </>
        )}
      </label>

      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
