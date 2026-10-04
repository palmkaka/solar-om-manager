import type { Metadata } from 'next'
import { getDashboardStats, getTasks } from '@/lib/actions/tasks'
import { getTechnicianWorkloads } from '@/lib/actions/profiles'
import { KPICard } from '@/components/ui/KPICard'
import { AlertFeed } from '@/components/admin/AlertFeed'
import { TaskStatusBadge, PriorityBadge, AutoCreatedTag } from '@/components/ui/Badge'
import { formatRelativeTime, formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Dashboard | Solar O&M Manager' }
export const revalidate = 60

export default async function AdminDashboardPage() {
  const [stats, recentTasks, workloads] = await Promise.all([
    getDashboardStats(),
    getTasks({ limit: 8 }),
    getTechnicianWorkloads(),
  ])

  const kpis = [
    {
      label: 'ไซต์งานทั้งหมด', value: stats.totalSites,
      icon: 'sites', gradient: 'from-green-500 to-emerald-600',
    },
    {
      label: 'งานค้างอยู่', value: stats.openTasks,
      icon: 'tasks', gradient: 'from-blue-500 to-cyan-600',
      trend: stats.openTasks > 5 ? { value: stats.openTasks - 5, label: 'เกินปกติ' } : undefined,
    },
    {
      label: 'งานวิกฤต', value: stats.criticalTasks,
      icon: 'critical', gradient: 'from-red-500 to-rose-600',
      alert: stats.criticalTasks > 0,
    },
    {
      label: 'ช่างทีมงาน', value: stats.totalTechnicians,
      icon: 'tech', gradient: 'from-violet-500 to-purple-600',
    },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            ภาพรวมระบบ · อัปเดต {formatDate(new Date())}
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md text-white"
          style={{ backgroundColor: 'var(--green-600)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          สร้างงานใหม่
        </Link>
      </div>

      {/* ─── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* ─── Main Content: Tasks + Alert Feed ───────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Tasks Table (2/3) */}
        <div className="xl:col-span-2 rounded-xl border flex flex-col shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>งานล่าสุด</h2>
            <Link href="/tasks" className="text-sm font-medium transition-colors" style={{ color: 'var(--green-600)' }}>
              ดูทั้งหมด →
            </Link>
          </div>

          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {recentTasks.slice(0, 6).map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-start gap-4 px-6 py-4 transition-colors hover:bg-gray-50 group"
              >
                {/* Priority indicator */}
                <div className={`w-1 h-12 rounded-full flex-shrink-0 mt-1 ${
                  task.priority === 'critical' ? 'bg-red-500' :
                  task.priority === 'high'     ? 'bg-orange-500' :
                  task.priority === 'medium'   ? 'bg-amber-400' : 'bg-gray-300'
                }`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap">
                    <p className="text-sm font-medium leading-snug truncate flex-1 transition-colors group-hover:text-green-700" style={{ color: 'var(--text-primary)' }}>
                      {task.title}
                    </p>
                    {task.is_auto_created && <AutoCreatedTag />}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {task.site && (
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{task.site.name}</span>
                    )}
                    {task.assignee && (
                      <>
                        <span style={{ color: 'var(--border-dark)' }}>·</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{task.assignee.full_name}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <TaskStatusBadge status={task.status} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(task.updated_at)}</span>
                </div>
              </Link>
            ))}
          </div>

          {recentTasks.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>ยังไม่มีงาน</p>
              <Link href="/tasks/new" className="text-sm mt-2 font-medium" style={{ color: 'var(--green-600)' }}>
                สร้างงานแรก →
              </Link>
            </div>
          )}
        </div>

        {/* Alert Feed (1/3) */}
        <div className="min-h-96">
          <AlertFeed />
        </div>
      </div>

      {/* ─── Technician Workload ────────────────────────────────────── */}
      <div className="rounded-xl border shadow-sm" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>ภาระงานช่างเทคนิค</h2>
          <Link href="/technicians" className="text-sm font-medium transition-colors" style={{ color: 'var(--green-600)' }}>
            จัดการทีม →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 divide-x divide-y md:divide-y-0" style={{ borderColor: 'var(--border)' }}>
          {workloads.map((tech: any) => {
            const load = tech.totalTasks > 0 ? (tech.activeTasks / Math.max(tech.totalTasks, 5)) * 100 : 0
            const initials = (tech.full_name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join('')
            return (
              <div key={tech.id as string} className="px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-900 text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'var(--green-600)' }}>
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{tech.full_name as string}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{tech.activeTasks as number} งานที่ทำอยู่</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(load, 100)}%`,
                      backgroundColor: load > 80 ? '#dc2626' : load > 50 ? '#d97706' : '#16a34a'
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
