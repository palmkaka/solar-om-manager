'use server'

import { createClient } from '@/lib/supabase/server'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isSupabaseReady() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url !== 'https://your-project-ref.supabase.co'
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/** ดึงรายชื่อไซต์ทั้งหมดที่เป็นของ Client คนนี้ */
export async function getClientSites() {
  if (!isSupabaseReady()) return getMockClientSites()
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('sites')
      .select(`
        id, name, address, lat, lng, capacity_kw,
        assets(id, status, capacity_kw, last_data)
      `)
      .eq('client_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
  } catch {
    return getMockClientSites()
  }
}

/** ดึงรายละเอียดของ 1 ไซต์ พร้อม Inverter และประวัติงานซ่อม */
export async function getClientSiteDetails(siteId: string) {
  if (!isSupabaseReady()) return getMockClientSiteDetails(siteId)
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // 1. ดึงข้อมูลไซต์และ assets
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: site, error: siteErr } = await (supabase as any)
      .from('sites')
      .select(`
        id, name, address, lat, lng, capacity_kw,
        assets(id, name, brand, serial_no, capacity_kw, status, last_data)
      `)
      .eq('id', siteId)
      .eq('client_id', user.id) // Security check
      .single()

    if (siteErr || !site) return null

    // 2. ดึงประวัติงานซ่อมที่ปิดแล้ว (closed หรือ pending_review)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: tasks } = await (supabase as any)
      .from('tasks')
      .select(`
        id, title, status, created_at, updated_at,
        logs:task_logs(action, created_at)
      `)
      .eq('site_id', siteId)
      .in('status', ['closed', 'pending_review'])
      .order('updated_at', { ascending: false })
      .limit(10)

    return { ...site, history: tasks ?? [] }
  } catch {
    return getMockClientSiteDetails(siteId)
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
function getMockClientSites() {
  return [
    {
      id: 'mock-site-1',
      name: 'บ้านคุณลูกค้า (กรุงเทพ)',
      address: '123 สุขุมวิท กรุงเทพ',
      capacity_kw: 10,
      assets: [
        { id: 'a1', status: 'normal', capacity_kw: 10, last_data: { power_kw: 7.5, daily_energy_kwh: 25.4 } }
      ]
    },
    {
      id: 'mock-site-2',
      name: 'โรงงานสาขาชลบุรี',
      address: 'นิคมอุตสาหกรรม ชลบุรี',
      capacity_kw: 100,
      assets: [
        { id: 'a2', status: 'warning', capacity_kw: 50, last_data: { power_kw: 40.2, daily_energy_kwh: 120.0 } },
        { id: 'a3', status: 'normal', capacity_kw: 50, last_data: { power_kw: 45.1, daily_energy_kwh: 135.5 } }
      ]
    }
  ]
}

function getMockClientSiteDetails(siteId: string) {
  const sites = getMockClientSites()
  const site = sites.find(s => s.id === siteId) || sites[0]
  
  return {
    ...site,
    assets: site.assets.map(a => ({ ...a, name: 'Inverter #1', brand: 'huawei' })),
    history: [
      {
        id: 'task-1', title: 'PM ประจำปี', status: 'closed',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 29 * 86400000).toISOString(),
        logs: []
      }
    ]
  }
}
