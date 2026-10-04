import { cn } from '@/lib/utils/cn'
import {
  TASK_STATUS_LABELS, TASK_STATUS_COLORS,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_COLORS,
  ASSET_STATUS_LABELS, ASSET_STATUS_COLORS,
  ROLE_LABELS,
} from '@/lib/utils/roles'
import type { TaskStatus, TaskPriority, AssetStatus, UserRole } from '@/lib/supabase/types'

// ─── Task Status Badge ────────────────────────────────────────────────────────
export function TaskStatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border shadow-sm',
      TASK_STATUS_COLORS[status],
      className
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {TASK_STATUS_LABELS[status]}
    </span>
  )
}

// ─── Priority Badge ───────────────────────────────────────────────────────────
export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
  const isPulse = priority === 'critical'
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border shadow-sm',
      TASK_PRIORITY_COLORS[priority],
      className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full bg-current')} />
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  )
}

// ─── Asset Status Badge ───────────────────────────────────────────────────────
export function AssetStatusBadge({ status, className }: { status: AssetStatus; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', ASSET_STATUS_COLORS[status], className)}>
      <span className={cn(
        'w-2 h-2 rounded-full',
        status === 'normal'  && 'bg-green-500',
        status === 'warning' && 'bg-yellow-500',
        status === 'error'   && 'bg-red-500',
        status === 'offline' && 'bg-gray-400',
      )} />
      {ASSET_STATUS_LABELS[status]}
    </span>
  )
}

// ─── Role Badge ───────────────────────────────────────────────────────────────
export function RoleBadge({ role, className }: { role: UserRole; className?: string }) {
  const colors: Record<UserRole, string> = {
    admin:      'bg-purple-50 text-purple-700 border-purple-200',
    technician: 'bg-blue-50 text-blue-700 border-blue-200',
    client:     'bg-teal-50 text-teal-700 border-teal-200',
  }
  return (
    <span className={cn('inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase border shadow-sm', colors[role], className)}>
      {ROLE_LABELS[role]}
    </span>
  )
}

// ─── Auto-created Tag ─────────────────────────────────────────────────────────
export function AutoCreatedTag({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase',
      'bg-red-50 text-red-600 border border-red-200 shadow-sm',
      className
    )}>
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 8 8">
        <circle cx="4" cy="4" r="3" className="opacity-20" />
        <circle cx="4" cy="4" r="2" />
      </svg>
      IoT Auto
    </span>
  )
}
