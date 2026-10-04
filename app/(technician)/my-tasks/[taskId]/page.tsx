import type { Metadata } from 'next'
import { getTaskById } from '@/lib/actions/tasks'
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { formatDateTime, formatDate } from '@/lib/utils/formatters'
import { PhotoUploader } from '@/components/technician/PhotoUploader'
import { TaskActions } from '@/components/technician/TaskActions'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { TaskStatus } from '@/lib/supabase/types'

export async function generateMetadata({ params }: { params: Promise<{ taskId: string }> }): Promise<Metadata> {
  const { taskId } = await params
  const task = await getTaskById(taskId)
  return { title: task ? `งาน: ${task.title}` : 'ไม่พบงาน' }
}

export default async function TechnicianTaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  const task = await getTaskById(taskId)
  if (!task) notFound()

  const LOG_ICONS: Record<string, string> = {
    status_changed:  '🔄',
    comment:         '💬',
    photo_uploaded:  '📷',
    assigned:        '👷',
    check_in:        '📍',
  }

  // Calculate Map URL for Site
  const mapUrl = task.site?.address
    ? `https://maps.google.com/?q=${encodeURIComponent(task.site.address)}`
    : null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative pb-32">
      {/* Header (Sticky) */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 pt-safe">
        <Link href="/my-tasks" className="p-2 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0 text-center pr-8">
          <p className="text-gray-900 font-semibold text-sm truncate">รายละเอียดงาน</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Title Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <h1 className="text-lg font-bold text-gray-900 leading-snug">{task.title}</h1>
          <p className="text-gray-500 text-xs mt-2">เปิดงานเมื่อ {formatDateTime(task.created_at)}</p>

          {task.description && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">รายละเอียดปัญหา</p>
              <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}
        </div>

        {/* Location & Asset Card */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-4">
          {/* Site */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 text-lg flex-shrink-0">
              📍
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">สถานที่</p>
              <p className="text-gray-900 text-sm font-medium leading-snug">{task.site?.name ?? '—'}</p>
              {task.site?.address && <p className="text-gray-500 text-xs mt-0.5 truncate">{task.site.address}</p>}

              {mapUrl && (
                <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-amber-400 text-xs font-medium bg-amber-500/10 px-2.5 py-1.5 rounded-lg active:bg-amber-500/20 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                  นำทาง
                </a>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100/60 w-full" />

          {/* Asset */}
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 text-lg flex-shrink-0">
              ⚡
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">อุปกรณ์</p>
              <p className="text-gray-900 text-sm font-medium">{task.asset ? `${task.asset.name}` : '—'}</p>
              {task.asset?.brand && <p className="text-gray-500 text-xs mt-0.5">{task.asset.brand}</p>}
            </div>
          </div>

          {/* Due date */}
          {task.due_date && (
            <>
              <div className="h-px bg-gray-100/60 w-full" />
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 text-lg flex-shrink-0">
                  📅
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-0.5">กำหนดเสร็จ</p>
                  <p className="text-gray-900 text-sm font-medium">{formatDate(task.due_date)}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action: Photo Upload (Only visible when in progress) */}
        {task.status === 'in_progress' && (
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
            <h3 className="text-gray-900 font-semibold text-sm mb-3">📸 หลักฐานการปฏิบัติงาน</h3>
            <PhotoUploader taskId={task.id} />
            <p className="text-gray-500 text-[10px] text-center mt-3">ภาพจะถูกบันทึกลง Timeline อัตโนมัติ</p>
          </div>
        )}

        {/* Timeline Logs */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm">
          <h3 className="text-gray-900 font-semibold text-sm mb-5">ประวัติการดำเนินการ</h3>

          {(!task.logs || task.logs.length === 0) ? (
            <p className="text-gray-500 text-sm text-center py-6">ยังไม่มีประวัติ</p>
          ) : (
            <div className="space-y-5 relative">
              <div className="absolute left-4 top-2 bottom-2 w-px bg-gray-100" />
              {(task.logs as Array<{id:string; action:string; payload: Record<string,unknown>|null; created_at:string; author?: {full_name:string}|null}>)
                .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map((log) => {
                  const isPhoto = log.action === 'photo_uploaded' && !!log.payload?.url
                  const isCheckIn = log.action === 'check_in' && !!log.payload?.lat
                  return (
                    <div key={log.id} className="flex gap-4 relative">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm flex-shrink-0 z-10 shadow-sm">
                        {LOG_ICONS[log.action] ?? '📝'}
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 pb-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-gray-900 text-sm font-medium">
                            {log.action === 'status_changed' && `สถานะ: ${log.payload?.new_status as string}`}
                            {log.action === 'assigned'       && 'มอบหมายงาน'}
                            {log.action === 'comment'        && 'บันทึกเพิ่มเติม'}
                            {log.action === 'photo_uploaded' && 'อัปโหลดรูปภาพ'}
                            {log.action === 'check_in'       && 'เช็คอินเข้าพื้นที่'}
                            {!['status_changed','assigned','comment','photo_uploaded','check_in'].includes(log.action) && log.action}
                          </span>
                          <span className="text-gray-500 text-[10px] whitespace-nowrap">{formatDateTime(log.created_at).split(' ')[1]}</span>
                        </div>

                        {/* Payload content */}
                        {isPhoto && (
                          <div className="mt-2 relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                            <Image
                              src={log.payload?.url as string}
                              alt="Evidence"
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {isCheckIn && (
                          <div className="mt-2 bg-gray-50 rounded-lg p-2.5 flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono">
                              <span>Lat: {log.payload?.lat as number}</span>
                              <span>Lng: {log.payload?.lng as number}</span>
                            </div>
                            <a
                              href={`https://maps.google.com/?q=${log.payload?.lat},${log.payload?.lng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:underline text-[10px] font-medium"
                            >
                              ดูบนแผนที่
                            </a>
                          </div>
                        )}

                        {log.action === 'comment' && !!log.payload?.text && (
                          <div className="mt-2 bg-gray-50 border border-gray-100 rounded-xl p-3 text-gray-600 text-sm">
                            {log.payload.text as string}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              }
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <TaskActions taskId={task.id} status={task.status as TaskStatus} />
    </div>
  )
}
