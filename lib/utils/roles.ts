import type { TaskPriority, TaskStatus, AssetStatus, UserRole } from '@/lib/supabase/types'

// ─── Role ────────────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'admin',
  TECHNICIAN: 'technician',
  CLIENT: 'client',
} as const satisfies Record<string, UserRole>

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ผู้ดูแลระบบ',
  technician: 'ช่างเทคนิค',
  client: 'ลูกค้า',
}

export const ROLE_REDIRECT: Record<UserRole, string> = {
  admin: '/dashboard',
  technician: '/my-tasks',
  client: '/overview',
}

/** Type guard: ตรวจว่า value เป็น UserRole ที่ถูกต้อง */
export function isValidRole(value: unknown): value is UserRole {
  return typeof value === 'string' && Object.values(ROLES).includes(value as UserRole)
}

// ─── Task Status ─────────────────────────────────────────────────────────────

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'รอดำเนินการ',
  assigned: 'มอบหมายแล้ว',
  in_progress: 'กำลังดำเนินการ',
  pending_review: 'รอตรวจสอบ',
  closed: 'เสร็จสิ้น',
}

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  open: 'bg-gray-100 text-gray-700 border-gray-200',
  assigned: 'bg-blue-50 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  pending_review: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-green-50 text-green-700 border-green-200',
}

// ─── Task Priority ───────────────────────────────────────────────────────────

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'ต่ำ',
  medium: 'กลาง',
  high: 'สูง',
  critical: 'วิกฤต',
}

export const TASK_PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-50 text-gray-600 border-gray-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
}

// ─── Asset Status ─────────────────────────────────────────────────────────────

export const ASSET_STATUS_LABELS: Record<AssetStatus, string> = {
  normal: 'ปกติ',
  warning: 'แจ้งเตือน',
  error: 'ผิดปกติ',
  offline: 'ออฟไลน์',
}

export const ASSET_STATUS_COLORS: Record<AssetStatus, string> = {
  normal: 'text-green-600',
  warning: 'text-yellow-600',
  error: 'text-red-600',
  offline: 'text-gray-500',
}
