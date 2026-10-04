import type { Metadata } from 'next'
import { getSiteById } from '@/lib/actions/sites'
import { getTasks } from '@/lib/actions/tasks'
import { InverterCard } from '@/components/admin/InverterCard'
import { TaskStatusBadge, PriorityBadge, AutoCreatedTag } from '@/components/ui/Badge'
import { formatRelativeTime, formatDate } from '@/lib/utils/formatters'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ siteId: string }> }): Promise<Metadata> {
  const { siteId } = await params
  const site = await getSiteById(siteId)
  return { title: site ? `ไซต์: ${site.name}` : 'ไม่พบไซต์' }
}

export default async function SiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const [site, siteTasks] = await Promise.all([
    getSiteById(siteId),
    getTasks({ siteId, limit: 5 }),
  ])

  if (!site) notFound()

  const assets = (site.assets ?? []) as Array<{
    id: string; name: string; brand: string; serial_no: string | null
    capacity_kw: number | null; status: string; last_data: Record<string, unknown> | null
  }>

  // คำนวณ site-level stats
  const totalPowerKw = assets.reduce((sum, a) => sum + ((a.last_data as {power_kw?: number})?.power_kw ?? 0), 0)
  const totalCapacityKw = assets.reduce((sum, a) => sum + (a.capacity_kw ?? 0), 0)
  const dailyEnergyKwh = assets.reduce((sum, a) => sum + ((a.last_data as {daily_energy_kwh?: number})?.daily_energy_kwh ?? 0), 0)
  const errorCount = assets.filter((a) => a.status === 'error' || a.status === 'offline').length

  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Back + Header */}
      <div className="flex items-start gap-4">
        <Link href="/sites" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors mt-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{site.name}</h1>
          {site.address && <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{site.address}</p>}
          <div className="flex items-center gap-3 mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1.5"><span className="text-[10px]">📞</span> {site.client?.phone ?? '—'}</span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5"><span className="text-[10px]">👤</span> {site.client?.full_name ?? '—'}</span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1.5"><span className="text-[10px]">📅</span> เพิ่มเมื่อ {formatDate(site.created_at)}</span>
          </div>
        </div>
        <Link
          href={`/tasks/new?siteId=${siteId}`}
          className="flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md text-white"
          style={{ backgroundColor: 'var(--green-600)' }}
        >
          + สร้างงาน
        </Link>
      </div>

      {/* Site Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'กำลังผลิตรวม', value: `${totalPowerKw.toFixed(1)}`,
            unit: 'kW', icon: '⚡',
            sub: totalCapacityKw > 0 ? `${Math.round((totalPowerKw / totalCapacityKw) * 100)}% ของ ${totalCapacityKw} kW` : '',
          },
          {
            label: 'พลังงานวันนี้', value: `${dailyEnergyKwh.toFixed(1)}`,
            unit: 'kWh', icon: '☀️',
          },
          {
            label: 'Inverter ทั้งหมด', value: assets.length,
            unit: 'ตัว', icon: '🔧',
          },
          {
            label: 'Inverter มีปัญหา', value: errorCount,
            unit: 'ตัว', icon: '🚨',
            alert: errorCount > 0,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`bg-white border rounded-2xl p-5 shadow-sm transition-transform hover:-translate-y-0.5 ${s.alert ? 'border-red-200 bg-red-50/30' : 'border-gray-200'}`}
          >
            <p className="text-2xl mb-2 opacity-80">
              {typeof s.icon === 'string' ? s.icon : null}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold tabular-nums ${s.alert ? 'text-red-500' : 'text-gray-900'}`}>{s.value}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{s.unit}</span>
            </div>
            <p className="text-xs font-semibold mt-1" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            {s.sub && <p className="text-[10px] font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Inverter Cards Grid */}
      <div>
        <h2 className="font-bold mb-4 text-lg" style={{ color: 'var(--text-primary)' }}>Inverter Status ({assets.length} ตัว)</h2>
        {assets.length === 0 ? (
          <div className="bg-white border border-dashed rounded-2xl p-12 text-center shadow-sm" style={{ borderColor: 'var(--border-dark)' }}>
            <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>ยังไม่มี Inverter ในไซต์นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {assets.map((asset) => (
              <InverterCard
                key={asset.id}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                asset={asset as any}
                siteId={siteId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Tasks for this site */}
      {siteTasks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>งานซ่อมบำรุงล่าสุด</h2>
            <Link href={`/tasks?siteId=${siteId}`} className="text-sm font-semibold hover:underline" style={{ color: 'var(--green-600)' }}>ดูทั้งหมด →</Link>
          </div>
          <div className="bg-white border rounded-2xl divide-y shadow-sm" style={{ borderColor: 'var(--border)' }}>
            {siteTasks.map((task: any) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
              >
                {task.is_auto_created && <AutoCreatedTag className="flex-shrink-0" />}
                <p className="text-sm font-semibold flex-1 truncate group-hover:text-green-600 transition-colors" style={{ color: 'var(--text-primary)' }}>
                  {task.title}
                </p>
                <PriorityBadge priority={task.priority} />
                <TaskStatusBadge status={task.status} />
                <span className="text-[11px] font-medium flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{formatRelativeTime(task.updated_at)}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
