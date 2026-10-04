import type { Metadata } from 'next'
import { getTaskById } from '@/lib/actions/tasks'
import { TaskStatusBadge, PriorityBadge, AutoCreatedTag } from '@/components/ui/Badge'
import { formatDateTime, formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ taskId: string }> }): Promise<Metadata> {
  const { taskId } = await params
  const task = await getTaskById(taskId)
  return { title: task ? `งาน: ${task.title}` : 'ไม่พบงาน' }
}

export default async function TaskDetailPage({ params }: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await params
  const task = await getTaskById(taskId)
  if (!task) notFound()

  const LOG_ICONS: Record<string, string> = {
    status_changed:  '🔄',
    comment:         '💬',
    photo_uploaded:  '📷',
    assigned:        '👷',
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl space-y-6">

      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/tasks" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all mt-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 flex-wrap">
            {task.is_auto_created && <AutoCreatedTag />}
            <h1 className="text-xl font-bold text-gray-900 leading-snug">{task.title}</h1>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <span className="text-gray-500 text-xs">สร้าง {formatDateTime(task.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Main: Description + Logs ───────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          {task.description && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">รายละเอียด</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Timeline Logs */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-5">ประวัติการดำเนินการ</h3>

            {(!task.logs || task.logs.length === 0) ? (
              <p className="text-gray-500 text-sm text-center py-6">ยังไม่มีประวัติ</p>
            ) : (
              <div className="space-y-4 relative">
                <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gray-100" />
                {(task.logs as Array<{id:string; action:string; payload: Record<string,unknown>|null; created_at:string; author?: {full_name:string}|null}>)
                  .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                  .map((log) => (
                    <div key={log.id} className="flex gap-4 relative">
                      <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-sm flex-shrink-0 z-10">
                        {LOG_ICONS[log.action] ?? '📝'}
                      </div>
                      <div className="flex-1 pb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-gray-900 text-sm font-medium">
                            {log.action === 'status_changed' && `สถานะเปลี่ยนเป็น "${log.payload?.new_status}"`}
                            {log.action === 'assigned'       && 'มอบหมายงาน'}
                            {log.action === 'comment'        && 'แสดงความคิดเห็น'}
                            {log.action === 'photo_uploaded' && 'อัปโหลดรูปภาพ'}
                            {!['status_changed','assigned','comment','photo_uploaded'].includes(log.action) && log.action}
                          </span>
                          {log.author && (
                            <span className="text-gray-500 text-xs">โดย {log.author.full_name}</span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5">{formatDateTime(log.created_at)}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* ─── Sidebar: Meta ───────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Info Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider">ข้อมูลงาน</h3>

            {[
              { label: 'ไซต์', value: task.site?.name ?? '—' },
              { label: 'อุปกรณ์', value: task.asset ? `${task.asset.name} (${task.asset.brand})` : '—' },
              { label: 'กำหนดเสร็จ', value: task.due_date ? formatDate(task.due_date) : 'ไม่ระบุ' },
              { label: 'อัปเดตล่าสุด', value: formatDateTime(task.updated_at) },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-gray-500 text-xs mb-0.5">{item.label}</p>
                <p className="text-gray-600 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Assignee Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">ผู้รับผิดชอบ</h3>
            {task.assignee ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-300 text-xs font-bold">
                  {(task.assignee.full_name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-gray-900 text-sm font-medium">{task.assignee.full_name as string}</p>
                  {task.assignee.phone && (
                    <p className="text-gray-500 text-xs mt-0.5">{task.assignee.phone as string}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <p className="text-gray-500 text-sm">ยังไม่มอบหมาย</p>
                <button className="mt-2 text-amber-400 text-xs hover:text-amber-300 transition-colors">
                  + มอบหมายช่าง
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-2">
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-3">การดำเนินการ</h3>
            {[
              { label: '✅ ปิดงาน',       color: 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20' },
              { label: '🔄 เปลี่ยนสถานะ',  color: 'hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20' },
              { label: '👷 มอบหมายช่าง',   color: 'hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20' },
            ].map((a) => (
              <button
                key={a.label}
                className={`w-full py-2.5 px-3 rounded-xl text-gray-500 border border-gray-300 text-sm font-medium transition-all text-left ${a.color}`}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
