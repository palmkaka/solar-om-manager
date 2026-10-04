import type { Metadata } from 'next'
import { getTasks } from '@/lib/actions/tasks'
import { getCurrentUser } from '@/lib/actions/auth'
import { TaskStatusBadge, PriorityBadge } from '@/components/ui/Badge'
import { formatRelativeTime } from '@/lib/utils/formatters'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { TaskStatus } from '@/lib/supabase/types'

export const metadata: Metadata = { title: 'งานของฉัน' }

export default async function MyTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const sp = await searchParams
  const activeTab = sp?.tab || 'today'

  // Fetch only tasks assigned to this technician
  const allTasks = await getTasks({ assignedTo: user.id })

  // Categorize tasks for tabs
  const todayTasks = allTasks.filter((t: any) => ['assigned', 'open'].includes(t.status))
  const inProgressTasks = allTasks.filter((t: any) => t.status === 'in_progress')
  const completedTasks = allTasks.filter((t: any) => ['pending_review', 'closed'].includes(t.status))

  const displayTasks =
    activeTab === 'in-progress' ? inProgressTasks :
    activeTab === 'completed'   ? completedTasks :
    todayTasks

  const TABS = [
    { id: 'today',       label: 'รอรับงาน',    count: todayTasks.length },
    { id: 'in-progress', label: 'กำลังทำ',     count: inProgressTasks.length },
    { id: 'completed',   label: 'เสร็จแล้ว',    count: completedTasks.length },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Tabs */}
      <div className="sticky top-[56px] z-10 bg-gray-50/90 backdrop-blur-xl border-b border-gray-200 px-4 pt-2">
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/my-tasks?tab=${tab.id}`}
              className={`pb-3 text-sm font-medium relative transition-colors ${
                activeTab === tab.id ? 'text-amber-400' : 'text-gray-500 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-100 text-gray-500'
                }`} suppressHydrationWarning>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-t-full" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Task List (Mobile Cards) */}
      <div className="p-4 space-y-4">
        {displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mb-4">🙌</div>
            <p className="text-gray-500 font-medium">ไม่มีงานในหมวดหมู่นี้</p>
            <p className="text-gray-500 text-xs mt-1">พักผ่อนให้เต็มที่ครับช่าง</p>
          </div>
        ) : (
          displayTasks.map((task: any) => (
            <Link
              key={task.id}
              href={`/my-tasks/${task.id}`}
              className="block bg-white border border-gray-200 rounded-2xl p-4 active:scale-[0.98] transition-transform relative overflow-hidden"
            >
              {/* Priority Indicator Line */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                task.priority === 'critical' ? 'bg-red-500' :
                task.priority === 'high'     ? 'bg-orange-500' :
                task.priority === 'medium'   ? 'bg-amber-500' : 'bg-slate-600'
              }`} />

              <div className="pl-2">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-gray-900 text-sm font-semibold leading-snug line-clamp-2">
                    {task.title}
                  </p>
                  <TaskStatusBadge status={task.status} className="flex-shrink-0" />
                </div>

                <div className="space-y-1.5 mt-3">
                  {task.site && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📍</span>
                      <span className="truncate">{task.site.name}</span>
                    </div>
                  )}
                  {task.asset && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>⚡</span>
                      <span className="truncate">{task.asset.name}</span>
                    </div>
                  )}
                  {task.due_date && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📅</span>
                      <span>กำหนด: {task.due_date}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                  <PriorityBadge priority={task.priority} />
                  <span className="text-[10px] text-gray-500">{formatRelativeTime(task.updated_at)}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
