'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { TaskStatus, TaskPriority } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isSupabaseReady() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url !== 'https://your-project-ref.supabase.co'
}

// ─── Read ─────────────────────────────────────────────────────────────────────
export async function getTasks(filters?: {
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string
  siteId?: string
  limit?: number
}) {
  const getFilteredMock = () => {
    let mock = getMockTasks()
    if (filters?.status) mock = mock.filter(t => t.status === filters.status)
    if (filters?.priority) mock = mock.filter(t => t.priority === filters.priority)
    if (filters?.assignedTo) mock = mock.filter(t => t.assignee?.id === filters.assignedTo)
    if (filters?.siteId) mock = mock.filter(t => t.site?.id === filters.siteId)
    if (filters?.limit) mock = mock.slice(0, filters.limit)
    return mock
  }

  if (!isSupabaseReady()) return getFilteredMock()
  
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('tasks')
      .select(`
        *,
        site:sites(id, name),
        asset:assets(id, name, brand),
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url)
      `)
      .order('updated_at', { ascending: false })

    if (filters?.status)     query = query.eq('status', filters.status)
    if (filters?.priority)   query = query.eq('priority', filters.priority)
    if (filters?.assignedTo) query = query.eq('assigned_to', filters.assignedTo)
    if (filters?.siteId)     query = query.eq('site_id', filters.siteId)
    if (filters?.limit)      query = query.limit(filters.limit)

    const { data, error } = await query
    if (error) throw error
    return data ?? []
  } catch {
    return getFilteredMock()
  }
}

export async function getTaskById(taskId: string) {
  if (!isSupabaseReady()) return getMockTasks()[0]
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('tasks')
      .select(`
        *,
        site:sites(id, name, address),
        asset:assets(id, name, brand, serial_no, status),
        assignee:profiles!tasks_assigned_to_fkey(id, full_name, avatar_url, phone),
        logs:task_logs(*, author:profiles(id, full_name, avatar_url))
      `)
      .eq('id', taskId)
      .single()
    if (error) throw error
    return data
  } catch { return null }
}

export async function getDashboardStats() {
  if (!isSupabaseReady()) return getMockStats()
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any

    const [sites, tasks, critical, techs, assets] = await Promise.all([
      sb.from('sites').select('id', { count: 'exact', head: true }),
      sb.from('tasks').select('id', { count: 'exact', head: true }).neq('status', 'closed'),
      sb.from('tasks').select('id', { count: 'exact', head: true }).eq('priority', 'critical').neq('status', 'closed'),
      sb.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'technician'),
      sb.from('assets').select('id', { count: 'exact', head: true }).eq('status', 'error'),
    ])

    return {
      totalSites:       sites.count ?? 0,
      openTasks:        tasks.count ?? 0,
      criticalTasks:    critical.count ?? 0,
      totalTechnicians: techs.count ?? 0,
      errorAssets:      assets.count ?? 0,
    }
  } catch { return getMockStats() }
}

// ─── Write ────────────────────────────────────────────────────────────────────
export async function createTask(formData: FormData) {
  if (!isSupabaseReady()) return { error: 'กรุณาตั้งค่า Supabase ก่อน' }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'กรุณาเข้าสู่ระบบ' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('tasks')
      .insert({
        title:       formData.get('title') as string,
        description: formData.get('description') as string || null,
        priority:    (formData.get('priority') as TaskPriority) || 'medium',
        site_id:     formData.get('siteId') as string || null,
        asset_id:    formData.get('assetId') as string || null,
        assigned_to: formData.get('assignedTo') as string || null,
        due_date:    formData.get('dueDate') as string || null,
        created_by:  user.id,
        status:      'open',
      })
      .select()
      .single()

    if (error) throw error
    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { data }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  if (!isSupabaseReady()) return { error: 'กรุณาตั้งค่า Supabase ก่อน' }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) throw error
    revalidatePath('/tasks')
    revalidatePath(`/tasks/${taskId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function assignTask(taskId: string, technicianId: string) {
  if (!isSupabaseReady()) return { error: 'กรุณาตั้งค่า Supabase ก่อน' }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('tasks')
      .update({
        assigned_to: technicianId,
        status: 'assigned',
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (error) throw error
    revalidatePath('/tasks')
    revalidatePath(`/tasks/${taskId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function deleteTask(taskId: string) {
  if (!isSupabaseReady()) return { error: 'กรุณาตั้งค่า Supabase ก่อน' }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) throw error
    revalidatePath('/tasks')
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

// ─── PWA Technician Actions ───────────────────────────────────────────────────

export async function checkInTask(taskId: string, lat: number, lng: number) {
  if (!isSupabaseReady()) return { success: true } // mock success
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // 1. Update task status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: taskErr } = await (supabase as any)
      .from('tasks')
      .update({ status: 'in_progress', updated_at: new Date().toISOString() })
      .eq('id', taskId)
    if (taskErr) throw taskErr

    // 2. Add GPS log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('task_logs').insert({
      task_id: taskId,
      author_id: user.id,
      action: 'check_in',
      payload: { lat, lng }
    })

    revalidatePath(`/my-tasks/${taskId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function resolveTask(taskId: string, notes: string) {
  if (!isSupabaseReady()) return { success: true }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('tasks')
      .update({ status: 'pending_review', updated_at: new Date().toISOString() })
      .eq('id', taskId)
    if (error) throw error

    if (notes.trim()) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('task_logs').insert({
        task_id: taskId,
        author_id: user.id,
        action: 'comment',
        payload: { text: notes }
      })
    }

    revalidatePath(`/my-tasks/${taskId}`)
    revalidatePath('/dashboard')
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

export async function uploadTaskPhotoRecord(taskId: string, publicUrl: string) {
  if (!isSupabaseReady()) return { success: true }
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('task_logs').insert({
      task_id: taskId,
      author_id: user.id,
      action: 'photo_uploaded',
      payload: { url: publicUrl }
    })
    if (error) throw error

    revalidatePath(`/my-tasks/${taskId}`)
    return { success: true }
  } catch (e: unknown) {
    return { error: (e as Error).message }
  }
}

// ─── Mock Data (Dev / No Supabase) ───────────────────────────────────────────
function getMockStats() {
  return { totalSites: 12, openTasks: 8, criticalTasks: 2, totalTechnicians: 5, errorAssets: 3 }
}

function getMockTasks() {
  const now = new Date()
  return [
    {
      id: 'mock-1', title: '[Auto] ตรวจสอบ Inverter #3 — Error ต่อเนื่อง',
      status: 'open', priority: 'critical', is_auto_created: true,
      site: { id: 's1', name: 'โรงงาน A - นิคมบางปู' },
      asset: { id: 'a1', name: 'Huawei SUN2000-100KTL', brand: 'huawei' },
      assignee: null, created_at: new Date(now.getTime() - 3600000).toISOString(),
      updated_at: new Date(now.getTime() - 1800000).toISOString(), due_date: null,
      description: 'ระบบตรวจพบ Error ต่อเนื่อง 3 ครั้ง นานกว่า 30 นาที',
    },
    {
      id: 'mock-2', title: 'PM รายปี — ทำความสะอาดแผงโซลาร์',
      status: 'assigned', priority: 'medium', is_auto_created: false,
      site: { id: 's2', name: 'โรงเรียน B - เชียงใหม่' },
      asset: { id: 'a2', name: 'Growatt MAX 80KTL3', brand: 'growatt' },
      assignee: { id: 'u1', full_name: 'สมศักดิ์ ช่างดี', avatar_url: null },
      created_at: new Date(now.getTime() - 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 7200000).toISOString(),
      due_date: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
      description: 'ทำความสะอาดแผงโซลาร์และตรวจสอบสภาพโครงสร้าง',
    },
    {
      id: 'mock-3', title: 'ตรวจสอบแรงดันต่ำ Grid Point',
      status: 'in_progress', priority: 'high', is_auto_created: false,
      site: { id: 's1', name: 'โรงงาน A - นิคมบางปู' },
      asset: null, assignee: { id: 'u1', full_name: 'สมศักดิ์ ช่างดี', avatar_url: null },
      created_at: new Date(now.getTime() - 172800000).toISOString(),
      updated_at: new Date(now.getTime() - 3600000).toISOString(), due_date: null,
      description: null,
    },
    {
      id: 'mock-4', title: 'ติดตั้ง Monitoring Module ใหม่',
      status: 'pending_review', priority: 'low', is_auto_created: false,
      site: { id: 's3', name: 'อาคาร C - กรุงเทพ' }, asset: null,
      assignee: { id: 'u2', full_name: 'มานะ ขยันดี', avatar_url: null },
      created_at: new Date(now.getTime() - 259200000).toISOString(),
      updated_at: new Date(now.getTime() - 43200000).toISOString(), due_date: null,
      description: null,
    },
    {
      id: 'mock-5', title: 'เปลี่ยน Fuse DC 1,000V',
      status: 'closed', priority: 'high', is_auto_created: false,
      site: { id: 's2', name: 'โรงเรียน B - เชียงใหม่' }, asset: null,
      assignee: { id: 'u1', full_name: 'สมศักดิ์ ช่างดี', avatar_url: null },
      created_at: new Date(now.getTime() - 432000000).toISOString(),
      updated_at: new Date(now.getTime() - 86400000).toISOString(), due_date: null,
      description: null,
    },
  ]
}
