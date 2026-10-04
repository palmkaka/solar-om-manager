import type { Metadata } from 'next'
import { getSites } from '@/lib/actions/sites'
import { AssetStatusBadge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils/formatters'
import Link from 'next/link'
import SitesMap from '@/components/admin/SitesMapWrapper'

export const metadata: Metadata = { title: 'ไซต์งาน' }

export default async function SitesPage() {
  const sites = await getSites()

  return (
    <div className="p-6 lg:p-8 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>ไซต์งาน</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>{sites.length} ไซต์ทั้งหมด</p>
        </div>
        <Link href="/sites/new" className="flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm shadow-md text-white" style={{ backgroundColor: 'var(--green-600)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          เพิ่มไซต์ใหม่
        </Link>
      </div>

      {/* Map */}
      <div className="rounded-2xl overflow-hidden shadow-sm border" style={{ borderColor: 'var(--border)' }}>
        <SitesMap sites={sites} />
      </div>

      {/* Sites Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {sites.map((site: any) => {
          const assets = site.assets as Array<{ id: string; name: string; status: string }>
          const errorCount   = assets.filter((a) => a.status === 'error').length
          const warningCount = assets.filter((a) => a.status === 'warning').length
          const hasAlert     = errorCount > 0 || warningCount > 0

          return (
            <Link
              key={site.id}
              href={`/sites/${site.id}`}
              className={`bg-white border rounded-2xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group ${
                errorCount > 0 ? 'border-red-200 shadow-red-100/50 shadow-sm' :
                warningCount > 0 ? 'border-yellow-200' : 'border-gray-200'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="font-bold group-hover:text-green-600 transition-colors" style={{ color: 'var(--text-primary)' }}>{site.name}</p>
                  <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-secondary)' }}>{site.address ?? '—'}</p>
                </div>
                {hasAlert && (
                  <span className="flex h-2.5 w-2.5 ml-2 mt-1">
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${errorCount > 0 ? 'bg-red-500' : 'bg-yellow-500'}`} />
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'กำลังไฟ', value: `${site.capacity_kw ?? '—'} kW` },
                  { label: 'Inverter', value: assets.length },
                  { label: 'Error', value: errorCount, alert: errorCount > 0 },
                ].map((s) => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-2.5 text-center border" style={{ borderColor: 'var(--border)' }}>
                    <p className={`text-sm font-bold ${s.alert ? 'text-red-500' : 'text-gray-900'}`}>{s.value}</p>
                    <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Assets */}
              <div className="space-y-1.5">
                {assets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex items-center justify-between bg-gray-50/50 px-2 py-1.5 rounded-lg">
                    <p className="text-xs truncate font-medium" style={{ color: 'var(--text-secondary)' }}>{asset.name}</p>
                    <AssetStatusBadge status={asset.status as 'normal' | 'warning' | 'error' | 'offline'} />
                  </div>
                ))}
                {assets.length > 3 && (
                  <p className="text-xs font-medium text-center mt-2" style={{ color: 'var(--text-muted)' }}>+{assets.length - 3} เพิ่มเติม</p>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{site.client?.full_name}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{formatDate(site.created_at)}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
