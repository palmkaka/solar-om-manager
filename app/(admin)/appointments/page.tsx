import type { Metadata } from 'next'
import { formatRelativeTime } from '@/lib/utils/formatters'
import Link from 'next/link'

export const metadata: Metadata = { title: 'นัดหมาย | Solar O&M Manager' }
export const revalidate = 60

// ─── Types ────────────────────────────────────────────────────────────────────
type Appointment = {
  id: string
  scheduled_at: string
  duration_min: number
  notes: string | null
  created_at: string
  technician: { id: string; full_name: string } | null
  task: { id: string; title: string; status: string; priority: string; site: { name: string } | null } | null
}

// ─── Data Fetching ─────────────────────────────────────────────────────────────
async function getAppointments(): Promise<Appointment[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('appointments')
      .select(`
        id, scheduled_at, duration_min, notes, created_at,
        technician:profiles!appointments_technician_id_fkey(id, full_name),
        task:tasks!appointments_task_id_fkey(id, title, status, priority, site:sites(name))
      `)
      .order('scheduled_at', { ascending: true })
      .limit(50)
    if (data && data.length > 0) return data as Appointment[]
    return getMockAppointments()
  } catch {
    return getMockAppointments()
  }
}

function getMockAppointments(): Appointment[] {
  const now = new Date()
  const day = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString()
  return [
    {
      id: 'appt-1',
      scheduled_at: day(1),
      duration_min: 120,
      notes: 'ตรวจสอบสายไฟและทำความสะอาดแผง',
      created_at: day(-2),
      technician: { id: 'u1', full_name: 'สมศักดิ์ ช่างดี' },
      task: { id: 'mock-2', title: 'PM รายปี — ทำความสะอาดแผงโซลาร์', status: 'assigned', priority: 'medium', site: { name: 'โรงงาน A - นิคมบางปู' } },
    },
    {
      id: 'appt-2',
      scheduled_at: day(2),
      duration_min: 60,
      notes: null,
      created_at: day(-1),
      technician: { id: 'u2', full_name: 'มานะ ขยันดี' },
      task: { id: 'mock-3', title: 'ตรวจสอบแรงดันต่ำ Grid Point', status: 'in_progress', priority: 'high', site: { name: 'โรงงาน A - นิคมบางปู' } },
    },
    {
      id: 'appt-3',
      scheduled_at: day(5),
      duration_min: 180,
      notes: 'ต้องนำอุปกรณ์ทดแทนไปด้วย',
      created_at: day(-1),
      technician: { id: 'u1', full_name: 'สมศักดิ์ ช่างดี' },
      task: { id: 'mock-1', title: '[Auto] ตรวจสอบ Inverter #3 — Error ต่อเนื่อง', status: 'open', priority: 'critical', site: { name: 'โรงเรียน B - เชียงใหม่' } },
    },
    {
      id: 'appt-4',
      scheduled_at: day(7),
      duration_min: 90,
      notes: null,
      created_at: day(0),
      technician: { id: 'u3', full_name: 'วิชัย ใจดี' },
      task: { id: 'mock-4', title: 'ติดตั้ง Monitoring Module ใหม่', status: 'assigned', priority: 'low', site: { name: 'อาคาร C - กรุงเทพ' } },
    },
    // Past
    {
      id: 'appt-5',
      scheduled_at: day(-3),
      duration_min: 60,
      notes: 'เสร็จสิ้นตามแผน',
      created_at: day(-5),
      technician: { id: 'u1', full_name: 'สมศักดิ์ ช่างดี' },
      task: { id: 'mock-5', title: 'เปลี่ยน Fuse DC 1,000V', status: 'closed', priority: 'high', site: { name: 'โรงเรียน B - เชียงใหม่' } },
    },
    {
      id: 'appt-6',
      scheduled_at: day(-7),
      duration_min: 120,
      notes: null,
      created_at: day(-10),
      technician: { id: 'u2', full_name: 'มานะ ขยันดี' },
      task: { id: 'mock-6', title: 'ตรวจเช็คระบบ String Combiner', status: 'closed', priority: 'medium', site: { name: 'โรงงาน A - นิคมบางปู' } },
    },
  ]
}

// ─── UI Components ─────────────────────────────────────────────────────────────
function StatusBadge({ scheduledAt }: { scheduledAt: string }) {
  const now = new Date()
  const apptDate = new Date(scheduledAt)
  const isToday = apptDate.toDateString() === now.toDateString()
  const isPast = apptDate < now && !isToday
  const isSoon = !isPast && !isToday && (apptDate.getTime() - now.getTime()) < 3 * 86400000

  if (isToday) return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700 border border-green-300">📅 วันนี้</span>
  if (isSoon)  return <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">⏰ เร็วๆ นี้</span>
  if (isPast)  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 border border-gray-200">ผ่านแล้ว</span>
  return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">กำหนดการ</span>
}

function PriorityDot({ priority }: { priority: string }) {
  const map: Record<string, string> = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-500', low: 'bg-gray-400' }
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${map[priority] ?? 'bg-gray-400'}`} />
}

function TechAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  return (
    <div className="w-8 h-8 rounded-lg bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-bold text-green-700">{initials}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function AppointmentsPage() {
  const appointments = await getAppointments()
  const now = new Date()

  const upcoming = appointments.filter(a => new Date(a.scheduled_at) >= now)
  const past     = appointments.filter(a => new Date(a.scheduled_at) < now)
  const today    = upcoming.filter(a => new Date(a.scheduled_at).toDateString() === now.toDateString())

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">นัดหมาย</h1>
          <p className="text-sm mt-0.5 text-gray-500">ตารางนัดหมายช่างเทคนิคเข้าปฏิบัติงาน</p>
        </div>
        <Link
          href="/tasks/new"
          className="flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl hover:opacity-90 transition-all text-sm shadow-md text-white"
          style={{ backgroundColor: 'var(--green-600)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          สร้างนัดหมายใหม่
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'นัดหมายทั้งหมด',  value: appointments.length, icon: '📋', color: 'text-gray-900',  bg: 'bg-gray-50',   border: 'border-gray-200' },
          { label: 'วันนี้',            value: today.length,        icon: '📅', color: 'text-green-700', bg: 'bg-green-50',  border: 'border-green-200' },
          { label: 'กำหนดการล่วงหน้า', value: upcoming.length,     icon: '⏰', color: 'text-blue-700',  bg: 'bg-blue-50',   border: 'border-blue-200' },
          { label: 'ผ่านมาแล้ว',       value: past.length,          icon: '✅', color: 'text-gray-500',  bg: 'bg-gray-50',   border: 'border-gray-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-5 shadow-sm ${s.bg} ${s.border}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xl">{s.icon}</span>
              <span className={`text-3xl font-extrabold ${s.color}`}>{s.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-600">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Upcoming Appointments */}
      <div className="rounded-2xl border shadow-sm overflow-hidden bg-white border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
          <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
          <h2 className="font-bold text-gray-900">กำหนดการล่วงหน้า</h2>
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-bold bg-green-100 text-green-700">
            {upcoming.length} รายการ
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center text-3xl">📅</div>
            <p className="text-gray-500 font-medium">ยังไม่มีนัดหมายล่วงหน้า</p>
            <p className="text-xs text-gray-400 mt-1">นัดหมายจะถูกสร้างเมื่อมอบหมายงานให้ช่าง</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {upcoming.map(appt => {
              const d = new Date(appt.scheduled_at)
              return (
                <div key={appt.id} className="flex items-start gap-5 px-6 py-5 hover:bg-green-50/30 transition-colors group">
                  {/* Date Block */}
                  <div className="flex-shrink-0 w-16 text-center bg-green-50 border border-green-100 rounded-2xl py-2.5 px-1">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
                      {d.toLocaleDateString('th-TH', { month: 'short' })}
                    </p>
                    <p className="text-2xl font-extrabold text-green-800 leading-none mt-0.5">
                      {d.getDate()}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <PriorityDot priority={appt.task?.priority ?? 'medium'} />
                          <p className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors leading-snug">
                            {appt.task?.title ?? 'งานที่ไม่ระบุ'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                          {appt.task?.site?.name && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                              </svg>
                              {appt.task.site.name}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {d.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น. ({appt.duration_min} นาที)
                          </span>
                        </div>
                        {appt.notes && (
                          <p className="text-xs text-gray-400 mt-1 italic">📝 {appt.notes}</p>
                        )}
                      </div>
                      <StatusBadge scheduledAt={appt.scheduled_at} />
                    </div>

                    {/* Technician */}
                    {appt.technician && (
                      <div className="flex items-center gap-2 mt-3">
                        <TechAvatar name={appt.technician.full_name} />
                        <span className="text-xs font-medium text-gray-600">{appt.technician.full_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Link to task */}
                  {appt.task?.id && (
                    <Link
                      href={`/tasks/${appt.task.id}`}
                      className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 hover:border-green-300 hover:text-green-700"
                    >
                      ดูงาน →
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      {past.length > 0 && (
        <div className="rounded-2xl border shadow-sm overflow-hidden bg-white border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="font-bold text-gray-900">ประวัตินัดหมาย</h2>
            <span className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium bg-gray-100 text-gray-500">
              {past.length} รายการ
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {past.slice(0, 10).map(appt => {
              const d = new Date(appt.scheduled_at)
              return (
                <div key={appt.id} className="flex items-center gap-5 px-6 py-4 opacity-60 hover:opacity-80 transition-opacity">
                  <div className="flex-shrink-0 w-12 text-center">
                    <p className="text-[10px] text-gray-400 uppercase">{d.toLocaleDateString('th-TH', { month: 'short' })}</p>
                    <p className="text-lg font-bold text-gray-500 leading-none">{d.getDate()}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{appt.task?.title ?? 'งานที่ไม่ระบุ'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {appt.technician?.full_name} · {formatRelativeTime(appt.scheduled_at)}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">✓ ผ่านแล้ว</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
