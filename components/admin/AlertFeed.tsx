'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils/cn'

interface Alert {
  id:         string
  title:      string
  siteName:   string
  priority:   string
  createdAt:  string
  isNew?:     boolean
}

const INITIAL_ALERTS: Alert[] = [
  {
    id: 'a1',
    title: 'Inverter #3 Error ต่อเนื่อง 30+ นาที',
    siteName: 'โรงงาน A - นิคมบางปู',
    priority: 'critical',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'a2',
    title: 'DC Voltage ต่ำผิดปกติ',
    siteName: 'อาคาร C - กรุงเทพ',
    priority: 'high',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'a3',
    title: 'Communication Loss — Growatt MAX',
    siteName: 'โรงเรียน B - เชียงใหม่',
    priority: 'high',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
]

export function AlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS)
  const [isConnected, setIsConnected] = useState(false)
  const [newCount, setNewCount] = useState(0)

  const isSupabaseReady = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    return url && url !== 'https://your-project-ref.supabase.co' && url !== 'https://placeholder.supabase.co'
  }, [])

  useEffect(() => {
    if (!isSupabaseReady()) return

    const supabase = createClient()

    const channel = supabase
      .channel('admin:alerts')
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        {
          event:  'INSERT',
          schema: 'public',
          table:  'tasks',
          filter: 'is_auto_created=eq.true',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (payload: any) => {
          const newTask = payload.new
          const newAlert: Alert = {
            id:        newTask.id,
            title:     newTask.title,
            siteName:  'กำลังโหลด...',
            priority:  newTask.priority,
            createdAt: newTask.created_at,
            isNew:     true,
          }
          setAlerts((prev) => [newAlert, ...prev.slice(0, 19)])
          setNewCount((n) => n + 1)

          try {
            const ctx = new AudioContext()
            const osc = ctx.createOscillator()
            osc.connect(ctx.destination)
            osc.frequency.value = 440
            osc.start(); osc.stop(ctx.currentTime + 0.1)
          } catch { /* ignore */ }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [isSupabaseReady])

  return (
    <div className="bg-white border rounded-2xl flex flex-col h-full shadow-sm" style={{ borderColor: 'var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-gray-50/50 rounded-t-2xl" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                {newCount > 9 ? '9+' : newCount}
              </span>
            )}
          </div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>IoT Alert Feed</p>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <span className={cn(
            'w-2 h-2 rounded-full',
            isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'
          )} />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-secondary)' }}>
            {isConnected ? 'Realtime' : 'Demo'}
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>ระบบปกติ</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>ไม่มี Alert ในขณะนี้</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <AlertItem key={alert.id} alert={alert} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t bg-gray-50/50 rounded-b-2xl" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={() => { setNewCount(0) }}
          className="text-xs font-medium hover:text-green-600 transition-colors w-full text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
        </button>
      </div>
    </div>
  )
}

function AlertItem({ alert }: { alert: Alert }) {
  const [isNew, setIsNew] = useState(alert.isNew ?? false)

  useEffect(() => {
    if (isNew) {
      const t = setTimeout(() => setIsNew(false), 5000)
      return () => clearTimeout(t)
    }
  }, [isNew])

  const priorityConfig = {
    critical: { color: 'text-red-700',    bg: 'bg-red-50 border-red-200',    dot: 'bg-red-500' },
    high:     { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
    medium:   { color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
    low:      { color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200',    dot: 'bg-gray-500' },
  }[alert.priority] ?? { color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', dot: 'bg-gray-400' }

  return (
    <div className={cn(
      'px-5 py-4 transition-colors cursor-pointer hover:bg-gray-50',
      isNew && 'animate-fade-in bg-red-50'
    )}>
      <div className="flex items-start gap-3">
        <div className={cn('w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-sm', priorityConfig.dot)} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-snug truncate" style={{ color: 'var(--text-primary)' }}>{alert.title}</p>
          <p className="text-[11px] font-medium mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{alert.siteName}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border', priorityConfig.bg, priorityConfig.color)}>
              {alert.priority}
            </span>
            <span suppressHydrationWarning className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              {formatRelativeTime(alert.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
