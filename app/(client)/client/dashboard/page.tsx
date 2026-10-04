import type { Metadata } from 'next'
import { getClientSites } from '@/lib/actions/client'
import Link from 'next/link'

export const metadata: Metadata = { title: 'ภาพรวมระบบ | Client Portal' }

export default async function ClientDashboardPage() {
  const sites = await getClientSites()

  // Aggregate stats
  const totalSites = sites.length
  let totalCapacity = 0
  let currentPower = 0
  let totalEnergyToday = 0
  let onlineAssets = 0
  let offlineAssets = 0

  sites.forEach((site: any) => {
    totalCapacity += Number(site.capacity_kw || 0)
    
    site.assets?.forEach((asset: any) => {
      if (asset.status === 'normal' || asset.status === 'warning') onlineAssets++
      else offlineAssets++

      if (asset.last_data) {
        currentPower += Number(asset.last_data.power_kw || 0)
        totalEnergyToday += Number(asset.last_data.daily_energy_kwh || 0)
      }
    })
  })

  const powerPct = totalCapacity > 0 ? (currentPower / totalCapacity) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ภาพรวมระบบโซลาร์ของคุณ</h1>
        <p className="text-gray-500 mt-1 text-sm">อัปเดตข้อมูลล่าสุดแบบ Real-time</p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm">⚡</div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">กำลังผลิตปัจจุบัน</p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-bold text-slate-800">{currentPower.toFixed(1)}</span>
            <span className="text-gray-500 font-medium">kW</span>
          </div>
          {totalCapacity > 0 && (
            <div className="mt-3">
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${Math.min(powerPct, 100)}%` }} />
              </div>
              <p className="text-gray-500 text-[10px] mt-1.5 font-medium">
                {powerPct.toFixed(1)}% จากความจุติดตั้งทั้งหมด {totalCapacity} kW
              </p>
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm">☀️</div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">พลังงานวันนี้</p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-bold text-slate-800">{totalEnergyToday.toFixed(1)}</span>
            <span className="text-gray-500 font-medium">kWh</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm">📍</div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">ไซต์ทั้งหมด</p>
          </div>
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-bold text-slate-800">{totalSites}</span>
            <span className="text-gray-500 font-medium">แห่ง</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-gray-500 text-sm">🔧</div>
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">สถานะอุปกรณ์</p>
          </div>
          <div className="flex gap-4 mt-2">
            <div>
              <p className="text-2xl font-bold text-emerald-600">{onlineAssets}</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase mt-0.5">Online</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${offlineAssets > 0 ? 'text-red-500' : 'text-gray-600'}`}>{offlineAssets}</p>
              <p className="text-gray-500 text-[10px] font-medium uppercase mt-0.5">Offline/Error</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sites List */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mt-8 mb-4">ไซต์ของคุณ</h2>
        {sites.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
            <p className="text-gray-500">ไม่พบไซต์ข้อมูลโซลาร์เซลล์ที่เชื่อมโยงกับบัญชีของคุณ</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sites.map((site: any) => {
              const sitePower = site.assets?.reduce((sum: number, a: any) => sum + Number(a.last_data?.power_kw || 0), 0) || 0
              const siteEnergy = site.assets?.reduce((sum: number, a: any) => sum + Number(a.last_data?.daily_energy_kwh || 0), 0) || 0
              
              const hasErrors = site.assets?.some((a: any) => a.status === 'error' || a.status === 'offline')

              return (
                <Link
                  key={site.id}
                  href={`/client/sites/${site.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-amber-200 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className={`w-2.5 h-2.5 rounded-full ${hasErrors ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`} />
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg group-hover:text-amber-600 transition-colors pr-8 truncate">
                    {site.name}
                  </h3>
                  <p className="text-gray-500 text-xs mt-1 truncate">{site.address}</p>

                  <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">กำลังผลิต</p>
                      <p className="text-lg font-bold text-gray-600">{sitePower.toFixed(1)} <span className="text-xs font-medium text-gray-500">kW</span></p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-[10px] font-semibold uppercase tracking-wider mb-1">พลังงานวันนี้</p>
                      <p className="text-lg font-bold text-gray-600">{siteEnergy.toFixed(1)} <span className="text-xs font-medium text-gray-500">kWh</span></p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
