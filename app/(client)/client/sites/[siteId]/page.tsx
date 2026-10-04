import type { Metadata } from 'next'
import { getClientSiteDetails } from '@/lib/actions/client'
import { InverterCard } from '@/components/admin/InverterCard'
import { formatDateTime, formatDate } from '@/lib/utils/formatters'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { TaskStatusBadge } from '@/components/ui/Badge'

export async function generateMetadata({ params }: { params: Promise<{ siteId: string }> }): Promise<Metadata> {
  const { siteId } = await params
  const site = await getClientSiteDetails(siteId)
  return { title: site ? `ไซต์: ${site.name}` : 'ไม่พบไซต์' }
}

export default async function ClientSiteDetailPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params
  const site = await getClientSiteDetails(siteId)

  if (!site) notFound()

  // Aggregate stats
  const assets = site.assets ?? []
  const totalPowerKw = assets.reduce((sum: number, a: any) => sum + Number(a.last_data?.power_kw || 0), 0)
  const dailyEnergyKwh = assets.reduce((sum: number, a: any) => sum + Number(a.last_data?.daily_energy_kwh || 0), 0)
  const totalCapacityKw = site.capacity_kw || 0
  const powerPct = totalCapacityKw > 0 ? (totalPowerKw / totalCapacityKw) * 100 : 0

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <Link href="/client/dashboard" className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 mb-4 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          กลับหน้าหลัก
        </Link>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{site.name}</h1>
        {site.address && <p className="text-gray-500 mt-1.5 text-sm flex items-center gap-1.5"><span className="text-amber-500">📍</span> {site.address}</p>}
      </div>

      {/* Aggregate Stats Card (Light Theme) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 divide-x divide-slate-100">
          <div className="px-2">
            <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-2">กำลังผลิตปัจจุบัน</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-bold text-slate-800">{totalPowerKw.toFixed(1)}</span>
              <span className="text-gray-500 font-medium">kW</span>
            </div>
            {totalCapacityKw > 0 && (
              <div className="mt-3">
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${Math.min(powerPct, 100)}%` }} />
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6">
            <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-2">พลังงานวันนี้</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-bold text-slate-800">{dailyEnergyKwh.toFixed(1)}</span>
              <span className="text-gray-500 font-medium">kWh</span>
            </div>
          </div>

          <div className="px-6 hidden md:block">
            <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-2">อุปกรณ์เชื่อมต่อ</p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl md:text-4xl font-bold text-slate-800">{assets.length}</span>
              <span className="text-gray-500 font-medium">ชุด</span>
            </div>
          </div>

          <div className="px-6 hidden md:block">
            <p className="text-gray-500 text-[10px] md:text-xs font-semibold uppercase tracking-wider mb-2">เริ่มใช้งาน</p>
            <p className="text-lg font-medium text-gray-600 mt-2">
              {/* Fake installation date for demo or derived from earliest created_at */}
              {site.created_at ? formatDate(site.created_at) : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Inverters */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>สถานะอุปกรณ์</span>
            <span className="text-xs font-medium bg-slate-100 text-gray-500 px-2 py-0.5 rounded-full">{assets.length}</span>
          </h2>
          {assets.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
              <p className="text-gray-500">ไม่มีข้อมูลอุปกรณ์</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assets.map((asset: any) => (
                <div key={asset.id} className="relative">
                  {/* Reuse InverterCard but in readOnly mode. It's naturally dark themed, 
                      which provides a nice contrast for technical data on the light dashboard */}
                  <InverterCard asset={asset} siteId={siteId} readOnly={true} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Maintenance History */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">ประวัติการบำรุงรักษา</h2>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            {(!site.history || site.history.length === 0) ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">✨</div>
                <p className="text-gray-500 text-sm">ยังไม่มีประวัติการซ่อมบำรุง</p>
                <p className="text-gray-500 text-xs mt-1">ระบบทำงานเป็นปกติ</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {site.history.map((task: any) => (
                  <div key={task.id} className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center text-gray-500 shrink-0 z-10 relative">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0 bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <p className="text-sm font-bold text-slate-800 leading-snug">{task.title}</p>
                        <TaskStatusBadge status={task.status} className="shrink-0" />
                      </div>
                      <p className="text-gray-500 text-[10px] font-medium">
                        อัปเดตเมื่อ: {formatDateTime(task.updated_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
