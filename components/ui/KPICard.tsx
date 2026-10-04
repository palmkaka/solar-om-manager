import { cn } from '@/lib/utils/cn'
import type { ReactNode } from 'react'

const Icons: Record<string, ReactNode> = {
  sites: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  tasks: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  critical: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  tech: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

interface KPICardProps {
  label:      string
  value:      string | number
  unit?:      string
  icon:       string
  gradient:   string
  trend?:     { value: number; label: string }
  alert?:     boolean
  className?: string
}

export function KPICard({ label, value, unit, icon, gradient, trend, alert, className }: KPICardProps) {
  return (
    <div className={cn(
      'relative bg-white border rounded-2xl p-6 overflow-hidden group transition-all hover:shadow-md hover:-translate-y-0.5',
      alert ? 'border-red-200 bg-red-50/30' : 'border-gray-200',
      className
    )}>
      {/* Subtle background glow on hover */}
      <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br', gradient)} />

      {/* Alert pulse */}
      {alert && (
        <span className="absolute top-4 right-4 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-20" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}

      {/* Icon Area */}
      <div className={cn(
        'inline-flex w-12 h-12 rounded-xl items-center justify-center text-white mb-4 bg-gradient-to-br shadow-sm',
        gradient
      )}>
        {Icons[icon] || <span>{icon}</span>}
      </div>

      <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
        {value}
        {unit && <span className="text-lg font-normal ml-1" style={{ color: 'var(--text-secondary)' }}>{unit}</span>}
      </p>
      <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>

      {trend && (
        <div className={cn(
          'flex items-center gap-1 mt-3 text-xs font-semibold',
          trend.value > 0 ? 'text-red-500 bg-red-50 px-2 py-0.5 rounded-full w-fit' : 'text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit'
        )}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={trend.value > 0 ? 'M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18' : 'M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3'} />
          </svg>
          {Math.abs(trend.value)} {trend.label}
        </div>
      )}
    </div>
  )
}

// ─── Simple Stat Box ──────────────────────────────────────────────────────────
export function StatBox({ label, value, children }: { label: string; value: string | number; children?: ReactNode }) {
  return (
    <div className="flex flex-col">
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {children}
    </div>
  )
}
