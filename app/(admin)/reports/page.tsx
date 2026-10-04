import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'รายงาน | Solar O&M Manager' }
export const revalidate = 300

// ─── Types ────────────────────────────────────────────────────────────────────
type Task = {
  id: string
  status: string
  priority: string
  created_at: string
  is_auto_created: boolean
  site: { name: string } | null
}

type ReportData = {
  tasks: Task[]
  sites: { id: string; name: string; capacity_kw: number | null }[]
  technicians: { id: string; full_name: string; role: string }[]
  closed: number
  open: number
  inProgress: number
  critical: number
  autoTasks: number
  topSites: { name: string; count: number }[]
  monthlyData: { month: string; count: number; closed: number }[]
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
function getMockReportData(): ReportData {
  const now = new Date()
  const tasks: Task[] = [
    { id: '1', status: 'closed',          priority: 'high',     created_at: new Date(now.getFullYear(), now.getMonth() - 5, 5).toISOString(),  is_auto_created: false, site: { name: 'โรงงาน A' } },
    { id: '2', status: 'closed',          priority: 'medium',   created_at: new Date(now.getFullYear(), now.getMonth() - 5, 15).toISOString(), is_auto_created: true,  site: { name: 'โรงเรียน B' } },
    { id: '3', status: 'closed',          priority: 'low',      created_at: new Date(now.getFullYear(), now.getMonth() - 4, 3).toISOString(),  is_auto_created: false, site: { name: 'โรงงาน A' } },
    { id: '4', status: 'closed',          priority: 'critical', created_at: new Date(now.getFullYear(), now.getMonth() - 4, 20).toISOString(), is_auto_created: true,  site: { name: 'อาคาร C' } },
    { id: '5', status: 'closed',          priority: 'high',     created_at: new Date(now.getFullYear(), now.getMonth() - 3, 8).toISOString(),  is_auto_created: false, site: { name: 'โรงเรียน B' } },
    { id: '6', status: 'in_progress',     priority: 'high',     created_at: new Date(now.getFullYear(), now.getMonth() - 3, 18).toISOString(), is_auto_created: true,  site: { name: 'โรงงาน A' } },
    { id: '7', status: 'closed',          priority: 'medium',   created_at: new Date(now.getFullYear(), now.getMonth() - 2, 5).toISOString(),  is_auto_created: false, site: { name: 'โรงงาน A' } },
    { id: '8', status: 'pending_review',  priority: 'low',      created_at: new Date(now.getFullYear(), now.getMonth() - 2, 12).toISOString(), is_auto_created: false, site: { name: 'อาคาร C' } },
    { id: '9', status: 'closed',          priority: 'critical', created_at: new Date(now.getFullYear(), now.getMonth() - 2, 25).toISOString(), is_auto_created: true,  site: { name: 'โรงเรียน B' } },
    { id: '10', status: 'assigned',       priority: 'medium',   created_at: new Date(now.getFullYear(), now.getMonth() - 1, 3).toISOString(),  is_auto_created: false, site: { name: 'โรงงาน A' } },
    { id: '11', status: 'in_progress',    priority: 'high',     created_at: new Date(now.getFullYear(), now.getMonth() - 1, 14).toISOString(), is_auto_created: true,  site: { name: 'โรงงาน A' } },
    { id: '12', status: 'closed',         priority: 'low',      created_at: new Date(now.getFullYear(), now.getMonth() - 1, 28).toISOString(), is_auto_created: false, site: { name: 'อาคาร C' } },
    { id: '13', status: 'open',           priority: 'critical', created_at: new Date(now.getFullYear(), now.getMonth(), 2).toISOString(),       is_auto_created: true,  site: { name: 'โรงเรียน B' } },
    { id: '14', status: 'assigned',       priority: 'medium',   created_at: new Date(now.getFullYear(), now.getMonth(), 7).toISOString(),       is_auto_created: false, site: { name: 'โรงงาน A' } },
    { id: '15', status: 'open',           priority: 'high',     created_at: new Date(now.getFullYear(), now.getMonth(), 10).toISOString(),      is_auto_created: false, site: { name: 'อาคาร C' } },
  ]

  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const monthTasks = tasks.filter(t => {
      const td = new Date(t.created_at)
      return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
    })
    return {
      month: d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
      count: monthTasks.length,
      closed: monthTasks.filter(t => t.status === 'closed').length,
    }
  })

  const siteTaskMap: Record<string, { name: string; count: number }> = {}
  tasks.forEach(t => {
    if (t.site?.name) {
      if (!siteTaskMap[t.site.name]) siteTaskMap[t.site.name] = { name: t.site.name, count: 0 }
      siteTaskMap[t.site.name].count++
    }
  })

  return {
    tasks,
    sites: [
      { id: 's1', name: 'โรงงาน A - นิคมบางปู', capacity_kw: 100 },
      { id: 's2', name: 'โรงเรียน B - เชียงใหม่', capacity_kw: 50 },
      { id: 's3', name: 'อาคาร C - กรุงเทพ', capacity_kw: 200 },
    ],
    technicians: [
      { id: 'u1', full_name: 'สมศักดิ์ ช่างดี', role: 'technician' },
      { id: 'u2', full_name: 'มานะ ขยันดี', role: 'technician' },
      { id: 'u3', full_name: 'วิชัย ใจดี', role: 'technician' },
    ],
    closed: tasks.filter(t => t.status === 'closed').length,
    open: tasks.filter(t => t.status === 'open').length,
    inProgress: tasks.filter(t => ['assigned', 'in_progress', 'pending_review'].includes(t.status)).length,
    critical: tasks.filter(t => t.priority === 'critical').length,
    autoTasks: tasks.filter(t => t.is_auto_created).length,
    topSites: Object.values(siteTaskMap).sort((a, b) => b.count - a.count).slice(0, 6),
    monthlyData,
  }
}

// ─── Data Fetching ─────────────────────────────────────────────────────────────
async function getReportData(): Promise<ReportData> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()

    const [tasksRes, sitesRes, profilesRes] = await Promise.all([
      supabase.from('tasks').select('id, status, priority, created_at, is_auto_created, site:sites(name)'),
      supabase.from('sites').select('id, name, capacity_kw'),
      supabase.from('profiles').select('id, full_name, role').eq('role', 'technician'),
    ])

    const tasks = (tasksRes.data ?? []) as Task[]
    const sites = sitesRes.data ?? []
    const technicians = profilesRes.data ?? []

    if (tasks.length === 0) return getMockReportData()

    const closed    = tasks.filter(t => t.status === 'closed').length
    const open      = tasks.filter(t => t.status === 'open').length
    const inProgress = tasks.filter(t => ['assigned', 'in_progress', 'pending_review'].includes(t.status)).length
    const critical  = tasks.filter(t => t.priority === 'critical').length
    const autoTasks = tasks.filter(t => t.is_auto_created).length

    const siteTaskMap: Record<string, { name: string; count: number }> = {}
    tasks.forEach(t => {
      if (t.site?.name) {
        if (!siteTaskMap[t.site.name]) siteTaskMap[t.site.name] = { name: t.site.name, count: 0 }
        siteTaskMap[t.site.name].count++
      }
    })
    const topSites = Object.values(siteTaskMap).sort((a, b) => b.count - a.count).slice(0, 6)

    const now = new Date()
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const monthTasks = tasks.filter(t => {
        const td = new Date(t.created_at)
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth()
      })
      return {
        month: d.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' }),
        count: monthTasks.length,
        closed: monthTasks.filter(t => t.status === 'closed').length,
      }
    })

    return { tasks, sites, technicians, closed, open, inProgress, critical, autoTasks, topSites, monthlyData }
  } catch {
    return getMockReportData()
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function ReportsPage() {
  const data = await getReportData()
  const total = data.tasks.length
  const completionRate = total > 0 ? Math.round((data.closed / total) * 100) : 0
  const maxMonthly = Math.max(...data.monthlyData.map(m => m.count), 1)
  const maxSiteCount = Math.max(...data.topSites.map(s => s.count), 1)

  const priorityBreakdown = [
    { label: 'วิกฤต', count: data.tasks.filter(t => t.priority === 'critical').length, color: '#ef4444', bg: '#fef2f2' },
    { label: 'สูง',   count: data.tasks.filter(t => t.priority === 'high').length,     color: '#f97316', bg: '#fff7ed' },
    { label: 'กลาง',  count: data.tasks.filter(t => t.priority === 'medium').length,   color: '#3b82f6', bg: '#eff6ff' },
    { label: 'ต่ำ',   count: data.tasks.filter(t => t.priority === 'low').length,      color: '#6b7280', bg: '#f9fafb' },
  ]

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">รายงานสรุป</h1>
          <p className="text-sm mt-0.5 text-gray-500">ภาพรวมประสิทธิภาพการบำรุงรักษา Solar O&M</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2.5 font-medium rounded-xl border transition-colors text-sm hover:bg-gray-50 bg-white border-gray-200 text-gray-700 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          ส่งออก / พิมพ์
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'งานทั้งหมด',    value: total,           sub: 'ตลอดระยะเวลา',              color: '#111827', bg: '#f9fafb', border: '#e5e7eb', icon: '📋' },
          { label: 'ปิดงานแล้ว',    value: data.closed,      sub: `อัตราสำเร็จ ${completionRate}%`, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', icon: '✅' },
          { label: 'กำลังดำเนินการ', value: data.inProgress, sub: 'ต้องติดตาม',                color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: '⚙️' },
          { label: 'งานวิกฤต',      value: data.critical,   sub: 'ต้องดูแลด่วน',              color: '#dc2626', bg: '#fef2f2', border: '#fecaca', icon: '🚨' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl border p-5 shadow-sm" style={{ backgroundColor: s.bg, borderColor: s.border }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
                <p className="text-sm font-semibold text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.sub}</p>
              </div>
              <span className="text-2xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Bar Chart + Status Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Monthly Trend Chart (2/3 width) */}
        <div className="xl:col-span-2 rounded-2xl border shadow-sm p-6 bg-white border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900">จำนวนงานรายเดือน (6 เดือนล่าสุด)</h2>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500 inline-block" />งานทั้งหมด</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-200 inline-block" />ปิดแล้ว</span>
            </div>
          </div>
          <div className="flex items-end gap-3" style={{ height: '180px' }}>
            {data.monthlyData.map(m => {
              const totalPct = maxMonthly > 0 ? (m.count / maxMonthly) * 100 : 0
              const closedPct = m.count > 0 ? (m.closed / m.count) * totalPct : 0
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs font-bold text-gray-700">{m.count || ''}</span>
                  <div className="w-full flex flex-col justify-end rounded-t-lg overflow-hidden relative" style={{ height: '140px', backgroundColor: '#f3f4f6' }}>
                    <div className="w-full rounded-t-lg bg-green-500 transition-all" style={{ height: `${Math.max(totalPct, 4)}%` }}>
                      <div className="w-full bg-green-200 rounded-t-lg" style={{ height: `${m.count > 0 ? (m.closed / m.count) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-gray-500">{m.month}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Status + Priority Breakdown (1/3 width) */}
        <div className="rounded-2xl border shadow-sm p-6 bg-white border-gray-200 space-y-6">
          {/* Status */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">สถานะงาน</h2>
            <div className="space-y-3">
              {[
                { label: 'รอดำเนินการ',    value: data.open,       color: '#6b7280' },
                { label: 'กำลังดำเนินการ', value: data.inProgress, color: '#3b82f6' },
                { label: 'ปิดแล้ว',         value: data.closed,     color: '#16a34a' },
                { label: 'สร้างจาก IoT',   value: data.autoTasks,  color: '#8b5cf6' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-600">{item.label}</span>
                    <span className="text-xs font-bold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div className="h-full rounded-full transition-all" style={{ width: total > 0 ? `${(item.value / total) * 100}%` : '0%', backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* Priority Breakdown */}
          <div>
            <h2 className="font-bold text-gray-900 mb-4">ความสำคัญ</h2>
            <div className="grid grid-cols-2 gap-2">
              {priorityBreakdown.map(p => (
                <div key={p.label} className="rounded-xl p-3 text-center border" style={{ backgroundColor: p.bg, borderColor: p.color + '33' }}>
                  <p className="text-xl font-extrabold" style={{ color: p.color }}>{p.count}</p>
                  <p className="text-xs font-medium text-gray-600 mt-0.5">{p.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Footer */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            {[
              { label: 'ไซต์งาน', value: `${data.sites.length} ไซต์` },
              { label: 'ช่างเทคนิค', value: `${data.technicians.length} คน` },
              { label: 'อัตราสำเร็จ', value: `${completionRate}%` },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{item.label}</span>
                <span className="text-xs font-bold text-green-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Sites by Task Count */}
      <div className="rounded-2xl border shadow-sm overflow-hidden bg-white border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
          <h2 className="font-bold text-gray-900">ไซต์ที่มีงานมากที่สุด</h2>
          <Link href="/sites" className="ml-auto text-sm font-semibold text-green-600 hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="p-6">
          {data.topSites.length === 0 ? (
            <div className="py-10 text-center text-gray-400">ยังไม่มีข้อมูล</div>
          ) : (
            <div className="space-y-5">
              {data.topSites.map((site, idx) => (
                <div key={site.name} className="flex items-center gap-4">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${idx < 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">{site.name}</p>
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0 ml-2">{site.count} งาน</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${(site.count / maxSiteCount) * 100}%`, backgroundColor: idx < 3 ? '#16a34a' : '#9ca3af' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
