'use server'

import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/types'

function isSupabaseReady() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url !== 'https://your-project-ref.supabase.co'
}

// ─── Technicians ──────────────────────────────────────────────────────────────
export async function getTechnicians() {
  if (!isSupabaseReady()) return getMockTechnicians()
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('profiles')
      .select('id, full_name, avatar_url, phone')
      .eq('role', 'technician')
      .order('full_name')
    if (error) throw error
    return data ?? []
  } catch { return getMockTechnicians() }
}

// ─── All Profiles (for Admin) ─────────────────────────────────────────────────
export async function getProfiles(role?: UserRole) {
  if (!isSupabaseReady()) return getMockTechnicians()
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('profiles')
      .select('id, full_name, role, avatar_url, phone, created_at')
      .order('role')
    if (role) query = query.eq('role', role)
    const { data, error } = await query
    if (error) throw error
    return data ?? []
  } catch { return getMockTechnicians() }
}

// ─── Technician Workload ──────────────────────────────────────────────────────
export async function getTechnicianWorkloads() {
  if (!isSupabaseReady()) return getMockWorkloads()
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: techs, error } = await (supabase as any)
      .from('profiles')
      .select(`
        id, full_name, avatar_url,
        tasks:tasks!tasks_assigned_to_fkey(id, status, priority, title, site:sites(name))
      `)
      .eq('role', 'technician')
    if (error) throw error
    return (techs ?? []).map((t: Record<string, unknown>) => ({
      ...t,
      activeTasks: (t.tasks as Array<{status: string}>).filter((tk) => tk.status !== 'closed').length,
      totalTasks: (t.tasks as unknown[]).length,
    }))
  } catch { return getMockWorkloads() }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
function getMockTechnicians() {
  return [
    { id: 'u1', full_name: 'สมศักดิ์ ช่างดี',   avatar_url: null, phone: '081-234-5678' },
    { id: 'u2', full_name: 'มานะ ขยันดี',        avatar_url: null, phone: '082-345-6789' },
    { id: 'u3', full_name: 'วิชัย ซ่อมเก่ง',     avatar_url: null, phone: '083-456-7890' },
    { id: 'u4', full_name: 'สุชาติ ไฟฟ้าดี',     avatar_url: null, phone: '084-567-8901' },
    { id: 'u5', full_name: 'ประสิทธิ์ โซลาร์',   avatar_url: null, phone: '085-678-9012' },
  ]
}

function getMockWorkloads() {
  return [
    { id: 'u1', full_name: 'สมศักดิ์ ช่างดี',   avatar_url: null, activeTasks: 3, totalTasks: 5 },
    { id: 'u2', full_name: 'มานะ ขยันดี',        avatar_url: null, activeTasks: 1, totalTasks: 4 },
    { id: 'u3', full_name: 'วิชัย ซ่อมเก่ง',     avatar_url: null, activeTasks: 2, totalTasks: 3 },
    { id: 'u4', full_name: 'สุชาติ ไฟฟ้าดี',     avatar_url: null, activeTasks: 0, totalTasks: 2 },
    { id: 'u5', full_name: 'ประสิทธิ์ โซลาร์',   avatar_url: null, activeTasks: 2, totalTasks: 2 },
  ]
}
