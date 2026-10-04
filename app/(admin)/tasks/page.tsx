import type { Metadata } from 'next'
import { getTasks } from '@/lib/actions/tasks'
import { TaskStatusBadge, PriorityBadge, AutoCreatedTag } from '@/components/ui/Badge'
import { formatRelativeTime, formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import type { TaskStatus, TaskPriority } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'งานซ่อมบำรุง' }

const STATUS_TABS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'ทั้งหมด',        value: 'all' },
  { label: 'รอดำเนินการ',    value: 'open' },
  { label: 'มอบหมายแล้ว',    value: 'assigned' },
  { label: 'กำลังทำ',        value: 'in_progress' },
  { label: 'รอตรวจสอบ',      value: 'pending_review' },
  { label: 'เสร็จสิ้น',      value: 'closed' },
]

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>
}) {
  const sp = await searchParams
  const statusFilter = sp?.status as TaskStatus | undefined
  const priorityFilter = sp?.priority as TaskPriority | undefined

  const tasks = await getTasks({
    status:   statusFilter,
    priority: priorityFilter,
  })

  const counts = tasks.reduce(
    (acc: Record<string, number>, t: any) => { acc[t.status as TaskStatus] = (acc[t.status as TaskStatus] ?? 0) + 1; return acc },
    {} as Record<TaskStatus, number>
  )

  return (
    <div className="p-6 lg:p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">งานซ่อมบำรุง</h1>
          <p className="text-gray-500 text-sm mt-0.5">{tasks.length} รายการ</p>
        </div>
        <Link
          href="/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-lg shadow-amber-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          สร้างงานใหม่
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const isActive = (!statusFilter && tab.value === 'all') || statusFilter === tab.value
          const count = tab.value === 'all' ? tasks.length : (counts[tab.value as TaskStatus] ?? 0)
          return (
            <Link
              key={tab.value}
              href={tab.value === 'all' ? '/tasks' : `/tasks?status=${tab.value}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-400 text-gray-900 shadow-md shadow-amber-500/20'
                  : 'bg-gray-100/60 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/30 text-gray-900' : 'bg-gray-200 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Task Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl mb-4">🔧</div>
            <p className="text-gray-500 font-medium">ไม่พบงานในหมวดนี้</p>
            <Link href="/tasks/new" className="text-amber-400 text-sm mt-3 hover:text-amber-300 transition-colors">
              + สร้างงานใหม่
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left">
                {['ชื่องาน', 'ไซต์', 'ผู้รับผิดชอบ', 'ความสำคัญ', 'สถานะ', 'อัปเดต'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.map((task: any) => (
                <tr key={task.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Title */}
                  <td className="px-5 py-4 max-w-xs">
                    <Link href={`/tasks/${task.id}`} className="block">
                      <div className="flex items-start gap-2">
                        {task.is_auto_created && <AutoCreatedTag className="mt-0.5 flex-shrink-0" />}
                        <p className="text-gray-900 text-sm font-medium group-hover:text-amber-400 transition-colors leading-snug line-clamp-2">
                          {task.title}
                        </p>
                      </div>
                    </Link>
                  </td>
                  {/* Site */}
                  <td className="px-5 py-4">
                    <p className="text-gray-500 text-sm">{task.site?.name ?? '—'}</p>
                  </td>
                  {/* Assignee */}
                  <td className="px-5 py-4">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/20 flex items-center justify-center text-blue-300 text-[10px] font-bold flex-shrink-0">
                          {(task.assignee.full_name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join('')}
                        </div>
                        <span className="text-gray-600 text-sm">{task.assignee.full_name as string}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">ยังไม่มอบหมาย</span>
                    )}
                  </td>
                  {/* Priority */}
                  <td className="px-5 py-4">
                    <PriorityBadge priority={task.priority} />
                  </td>
                  {/* Status */}
                  <td className="px-5 py-4">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  {/* Updated */}
                  <td className="px-5 py-4">
                    <span className="text-gray-500 text-xs">{formatRelativeTime(task.updated_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
