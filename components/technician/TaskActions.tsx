'use client'

import { useState } from 'react'
import { checkInTask, resolveTask } from '@/lib/actions/tasks'
import type { TaskStatus } from '@/lib/supabase/types'

interface TaskActionsProps {
  taskId: string
  status: TaskStatus
}

export function TaskActions({ taskId, status }: TaskActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [notes, setNotes] = useState('')

  // ─── Check In (with GPS) ──────────────────────────────────────────────────
  const handleCheckIn = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError('บราว์เซอร์ของคุณไม่รองรับ GPS')
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        const res = await checkInTask(taskId, latitude, longitude)
        if (res.error) setError(res.error)
        setIsLoading(false)
      },
      (err) => {
        setError(err.message === 'User denied Geolocation'
          ? 'กรุณาอนุญาตการเข้าถึงตำแหน่ง (GPS) เพื่อเช็คอิน'
          : 'ไม่สามารถดึงพิกัด GPS ได้')
        setIsLoading(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  // ─── Resolve Task ─────────────────────────────────────────────────────────
  const handleResolve = async () => {
    setIsLoading(true)
    setError(null)

    const res = await resolveTask(taskId, notes)
    if (res.error) {
      setError(res.error)
      setIsLoading(false)
    } else {
      setShowResolveModal(false)
      setIsLoading(false)
    }
  }

  if (status === 'closed' || status === 'pending_review') return null

  return (
    <>
      <div className="fixed bottom-[72px] left-0 right-0 p-4 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 z-30 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {error && (
          <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center animate-fade-in">
            {error}
          </div>
        )}

        {status === 'assigned' || status === 'open' ? (
          <button
            onClick={handleCheckIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-base rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70"
          >
            {isLoading ? 'กำลังขอพิกัด GPS...' : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                เช็คอินเริ่มงาน (GPS)
              </>
            )}
          </button>
        ) : status === 'in_progress' ? (
          <button
            onClick={() => setShowResolveModal(true)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 font-bold text-base rounded-2xl active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            ปิดงาน (ส่งให้ Admin ตรวจสอบ)
          </button>
        ) : null}
      </div>

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowResolveModal(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl animate-fade-in mb-safe">
            <h3 className="text-lg font-bold text-white mb-2">สรุปการซ่อมบำรุง</h3>
            <p className="text-slate-400 text-xs mb-4">โปรดระบุรายละเอียดการแก้ปัญหาให้ Admin ทราบก่อนปิดงาน</p>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ตัวอย่าง: เปลี่ยนฟิวส์และทำความสะอาดแผงเรียบร้อย ทดสอบระบบปกติ"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none h-24 mb-6"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowResolveModal(false)}
                className="flex-1 py-3.5 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm active:scale-[0.98] transition-transform"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleResolve}
                disabled={isLoading}
                className="flex-1 py-3.5 bg-emerald-500 text-slate-900 font-bold rounded-xl text-sm active:scale-[0.98] transition-transform shadow-lg shadow-emerald-500/20 disabled:opacity-70"
              >
                {isLoading ? 'กำลังส่ง...' : 'ยืนยันปิดงาน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
