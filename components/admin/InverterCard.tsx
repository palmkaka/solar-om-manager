'use client'

import { useState, useTransition } from 'react'
import { AssetStatusBadge } from '@/components/ui/Badge'
import { formatDateTime } from '@/lib/utils/formatters'
import type { InverterReading } from '@/lib/iot/types'

interface Asset {
  id:          string
  name:        string
  brand:       string
  serial_no:   string | null
  capacity_kw: number | null
  status:      string
  last_data:   InverterReading | null
}

interface InverterCardProps {
  asset:  Asset
  siteId: string
  readOnly?: boolean
}

const BRAND_LOGO: Record<string, string> = {
  huawei:  '🔶',
  growatt: '🟢',
  sungrow: '🔵',
  other:   '⚡',
}

export function InverterCard({ asset, siteId, readOnly = false }: InverterCardProps) {
  const [data, setData] = useState<InverterReading | null>(asset.last_data)
  const [isPending, startTransition] = useTransition()
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/assets/${asset.id}/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ secret: process.env.NEXT_PUBLIC_REFRESH_SECRET ?? 'dev' }),
        })
        const result = await res.json()
        if (result.reading) {
          setData(result.reading)
          setLastRefresh(new Date())
        }
      } catch { /* silent fail */ }
    })
  }

  const status = (data?.status ?? asset.status) as 'normal' | 'warning' | 'error' | 'offline'
  const brandIcon = BRAND_LOGO[asset.brand] ?? '⚡'

  const isGenerating = (data?.power_kw ?? 0) > 0
  const capacityPct = asset.capacity_kw && data?.power_kw
    ? Math.min((data.power_kw / asset.capacity_kw) * 100, 100)
    : 0

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden transition-transform hover:-translate-y-0.5 shadow-sm ${
      status === 'error'   ? 'border-red-200' :
      status === 'warning' ? 'border-yellow-200' :
      status === 'offline' ? 'border-gray-200 opacity-75' :
                             'border-gray-200 hover:border-gray-300'
    }`}>

      {/* Header */}
      <div className={`px-5 py-4 flex items-center justify-between border-b ${
        status === 'error'   ? 'border-red-100 bg-red-50/50' :
        status === 'warning' ? 'border-yellow-100 bg-yellow-50/50' :
                               'border-gray-100 bg-gray-50/50'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl drop-shadow-sm">{brandIcon}</span>
          <div>
            <p className="font-bold text-sm leading-tight" style={{ color: 'var(--text-primary)' }}>{asset.name}</p>
            {asset.serial_no && (
              <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--text-secondary)' }}>SN: {asset.serial_no}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AssetStatusBadge status={status} />
          {!readOnly && (
            <button
              onClick={handleRefresh}
              disabled={isPending}
              title="Refresh data"
              className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 ${isPending ? 'animate-spin text-green-500' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Stats */}
      <div className="p-5">
        {data ? (
          <>
            {/* Power output — main metric */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-4xl font-bold tabular-nums ${
                  isGenerating ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {data.power_kw.toFixed(1)}
                </span>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>kW</span>
                {isGenerating && (
                  <span className="ml-auto flex items-center gap-1.5 text-green-600 text-[11px] font-bold tracking-wide uppercase bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    กำลังผลิต
                  </span>
                )}
              </div>

              {/* Capacity bar */}
              {asset.capacity_kw && (
                <div className="mt-3">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        capacityPct > 90 ? 'bg-yellow-400' :
                        capacityPct > 0  ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${capacityPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-semibold mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
                    {Math.round(capacityPct)}% ของ {asset.capacity_kw} kW
                  </p>
                </div>
              )}
            </div>

            {/* Secondary metrics grid */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: 'วันนี้',    value: `${data.daily_energy_kwh.toFixed(1)} kWh`,      icon: '☀️' },
                { label: 'รวม',       value: `${(data.total_energy_kwh / 1000).toFixed(1)} MWh`, icon: '⚡' },
                { label: 'อุณหภูมิ', value: data.temperature_c ? `${data.temperature_c}°C` : '—', icon: '🌡️' },
                { label: 'AC Volt',  value: data.ac_voltage_v ? `${data.ac_voltage_v}V` : '—',   icon: '🔌' },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 border rounded-xl px-3 py-2.5 shadow-sm" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] opacity-80">{m.icon}</span>
                    <p className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                  </div>
                  <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* DC String info */}
            {data.dc_voltage_v && (
              <div className="flex items-center justify-between text-[11px] font-medium bg-gray-50 border rounded-lg px-3 py-2.5 mb-4" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>DC: {data.dc_voltage_v}V / {data.dc_current_a}A</span>
                {data.efficiency_pct && (
                  <span style={{ color: 'var(--text-muted)' }}>η {data.efficiency_pct}%</span>
                )}
              </div>
            )}

            {/* Error message */}
            {data.error_message && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-3 py-3 mt-2 shadow-sm">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <div>
                  <p className="text-red-700 font-semibold text-xs leading-snug">{data.error_message}</p>
                  {data.error_code && (
                    <p className="text-red-500 text-[10px] mt-1 font-mono font-bold bg-red-100/50 px-1.5 py-0.5 rounded inline-block">{data.error_code}</p>
                  )}
                </div>
              </div>
            )}

            {/* Last update */}
            <p className="text-[10px] font-medium mt-4 text-right" style={{ color: 'var(--text-muted)' }}>
              อัปเดต {lastRefresh
                ? formatDateTime(lastRefresh.toISOString())
                : formatDateTime(data.fetched_at)}
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>ยังไม่มีข้อมูล</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>รอ Cron Job รอบถัดไป (ทุก 15 นาที)</p>
            {!readOnly && (
              <button
                onClick={handleRefresh}
                disabled={isPending}
                className="mt-4 text-xs font-bold hover:underline transition-colors disabled:opacity-50"
                style={{ color: 'var(--green-600)' }}
              >
                {isPending ? 'กำลังดึงข้อมูล...' : '↻ ดึงข้อมูลทันที'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
