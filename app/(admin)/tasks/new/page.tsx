'use client'

import { useActionState } from 'react'
import { createTask } from '@/lib/actions/tasks'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

type FormState = { error?: string; data?: { id: string } } | null

export default function NewTaskPage() {
  const router = useRouter()
  const [state, action, isPending] = useActionState<FormState, FormData>(
    async (prev, fd) => {
      const result = await createTask(fd)
      return result as FormState
    },
    null
  )

  useEffect(() => {
    if (state?.data?.id) {
      router.push(`/tasks/${state.data.id}`)
    }
  }, [state, router])

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/tasks" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สร้างงานใหม่</h1>
          <p className="text-gray-500 text-sm">สร้างงานซ่อมบำรุงด้วยตนเอง</p>
        </div>
      </div>

      {/* Error */}
      {state?.error && (
        <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      <form action={action} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-gray-600 mb-2">
            ชื่องาน <span className="text-red-400">*</span>
          </label>
          <input
            id="task-title"
            name="title"
            type="text"
            required
            placeholder="เช่น ตรวจสอบ Inverter #1 อุณหภูมิสูงผิดปกติ"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all shadow-sm"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className="block text-sm font-medium text-gray-600 mb-2">
            รายละเอียด
          </label>
          <textarea
            id="task-desc"
            name="description"
            rows={3}
            placeholder="อธิบายอาการที่พบ วิธีการตรวจสอบ หรือข้อมูลเพิ่มเติม..."
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all resize-none shadow-sm"
          />
        </div>

        {/* Priority + Due Date (2 col) */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-priority" className="block text-sm font-medium text-gray-600 mb-2">
              ความสำคัญ
            </label>
            <select
              id="task-priority"
              name="priority"
              defaultValue="medium"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all shadow-sm"
            >
              <option value="low">🟢 ต่ำ</option>
              <option value="medium">🔵 กลาง</option>
              <option value="high">🟠 สูง</option>
              <option value="critical">🔴 วิกฤต</option>
            </select>
          </div>
          <div>
            <label htmlFor="task-due" className="block text-sm font-medium text-gray-600 mb-2">
              กำหนดเสร็จ
            </label>
            <input
              id="task-due"
              name="dueDate"
              type="date"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/50 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Note about Supabase */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm">
          <p className="text-green-700 font-medium text-xs">
            💡 Site, Asset และ Assigned Technician selector จะใช้งานได้หลังตั้งค่า Supabase — ตอนนี้กรอกชื่อ/รายละเอียดได้เลย
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Link
            href="/tasks"
            className="flex-1 py-3 bg-gray-100 text-gray-600 font-semibold rounded-xl hover:bg-gray-200 transition-all text-sm text-center"
          >
            ยกเลิก
          </Link>
          <button
            id="create-task-btn"
            type="submit"
            disabled={isPending}
            className="flex-1 py-3 text-white font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            style={{ backgroundColor: 'var(--green-600)' }}
          >
            {isPending ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                กำลังสร้าง...
              </>
            ) : 'สร้างงาน'}
          </button>
        </div>
      </form>
    </div>
  )
}
