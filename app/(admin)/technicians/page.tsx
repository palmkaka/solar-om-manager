import type { Metadata } from 'next'
import { getTechnicianWorkloads } from '@/lib/actions/profiles'
import Link from 'next/link'

export const metadata: Metadata = { title: 'ทีมช่างเทคนิค' }

export default async function TechniciansPage() {
  const technicians = await getTechnicianWorkloads()

  return (
    <div className="p-6 lg:p-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>ทีมช่างเทคนิค</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{technicians.length} คน</p>
        </div>
      </div>

      {/* Workload Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {technicians.map((tech: any) => {
          const load = tech.totalTasks > 0 ? (tech.activeTasks / Math.max(tech.totalTasks, 5)) * 100 : 0
          const initials = (tech.full_name as string).split(' ').map((w: string) => w[0]).slice(0, 2).join('')
          const loadColor =
            load > 80 ? { bar: 'bg-red-500',     text: 'text-red-600',     badge: 'bg-red-50 text-red-700 border-red-200' } :
            load > 50 ? { bar: 'bg-yellow-500',  text: 'text-yellow-600',  badge: 'bg-yellow-50 text-yellow-700 border-yellow-200' } :
                        { bar: 'bg-green-500',   text: 'text-green-600',   badge: 'bg-green-50 text-green-700 border-green-200' }

          return (
            <div
              key={tech.id as string}
              className="bg-white border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Profile */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center text-green-700 text-base font-bold flex-shrink-0 shadow-sm">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug truncate" style={{ color: 'var(--text-primary)' }}>{tech.full_name as string}</p>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>ช่างเทคนิค</p>
                </div>
                <span className={`text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md border shadow-sm ${loadColor.badge}`}>
                  {load > 80 ? 'เต็ม' : load > 50 ? 'ยุ่ง' : 'ว่าง'}
                </span>
              </div>

              {/* Load bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[11px] font-medium mb-1.5">
                  <span style={{ color: 'var(--text-secondary)' }}>ภาระงาน</span>
                  <span className={`font-bold ${loadColor.text}`}>{Math.round(load)}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${loadColor.bar}`}
                    style={{ width: `${Math.min(load, 100)}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 border rounded-xl p-3 text-center shadow-sm" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{tech.activeTasks as number}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>งานที่ทำอยู่</p>
                </div>
                <div className="bg-gray-50 border rounded-xl p-3 text-center shadow-sm" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>{tech.totalTasks as number}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--text-secondary)' }}>งานทั้งหมด</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/tasks?assignedTo=${tech.id}`}
                  className="flex-1 py-2.5 bg-white border text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 hover:text-green-600 transition-colors text-center shadow-sm"
                  style={{ borderColor: 'var(--border)' }}
                >
                  ดูงาน
                </Link>
                <button className="flex-1 py-2.5 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-xl hover:bg-green-100 transition-colors shadow-sm">
                  มอบงาน
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
