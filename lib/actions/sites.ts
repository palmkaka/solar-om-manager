'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function isSupabaseReady() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url !== 'https://your-project-ref.supabase.co'
}

// ─── Read ─────────────────────────────────────────────────────────────────────
export async function getSites() {
  if (!isSupabaseReady()) return getMockSites()
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('sites')
      .select(`
        *,
        client:profiles!sites_client_id_fkey(id, full_name, phone),
        assets(id, name, status)
      `)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data ?? []
  } catch { return getMockSites() }
}

export async function getSiteById(siteId: string) {
  if (!isSupabaseReady()) return getMockSites()[0]
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('sites')
      .select(`
        *,
        client:profiles!sites_client_id_fkey(id, full_name, phone),
        assets(*)
      `)
      .eq('id', siteId)
      .single()
    if (error) throw error
    return data
  } catch { 
    return getMockSites().find(s => s.id === siteId) || null 
  }
}

export async function createSite(formData: FormData) {
  if (!isSupabaseReady()) return { error: 'กรุณาตั้งค่า Supabase ก่อน' }
  try {
    const supabase = await createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('sites')
      .insert({
        name:        formData.get('name') as string,
        address:     formData.get('address') as string || null,
        client_id:   formData.get('clientId') as string,
        capacity_kw: parseFloat(formData.get('capacityKw') as string) || null,
        lat:         parseFloat(formData.get('lat') as string) || null,
        lng:         parseFloat(formData.get('lng') as string) || null,
      })
      .select()
      .single()
    if (error) throw error
    revalidatePath('/sites')
    return { data }
  } catch (e: unknown) { return { error: (e as Error).message } }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
function getMockSites() {
  return [
    {
      id: 's1', name: 'โรงงาน A - นิคมบางปู',
      address: '9 ถ.สุขุมวิท ต.แพรกษา อ.เมือง สมุทรปราการ',
      capacity_kw: 100, lat: 13.5656, lng: 100.8987,
      client: { id: 'c1', full_name: 'บริษัท โซลาร์ไทย จำกัด', phone: '02-234-5678' },
      assets: [
        { id: 'a1', name: 'Huawei SUN2000-100KTL', status: 'error' },
        { id: 'a2', name: 'Huawei SUN2000-60KTL', status: 'normal' },
      ],
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      id: 's2', name: 'โรงเรียน B - เชียงใหม่',
      address: '123 ถ.นิมมานเหมินท์ ต.สุเทพ อ.เมือง เชียงใหม่',
      capacity_kw: 50, lat: 18.7956, lng: 98.9674,
      client: { id: 'c2', full_name: 'โรงเรียน บี วิทยาลัย', phone: '053-234-5678' },
      assets: [
        { id: 'a3', name: 'Growatt MAX 50KTL3', status: 'normal' },
      ],
      created_at: '2024-02-20T10:00:00Z',
    },
    {
      id: 's3', name: 'อาคาร C - กรุงเทพ',
      address: '55/2 ถ.พระราม 9 แขวงห้วยขวาง กรุงเทพ',
      capacity_kw: 200, lat: 13.7654, lng: 100.5678,
      client: { id: 'c3', full_name: 'บริษัท อาคาร ซี จำกัด', phone: '02-345-6789' },
      assets: [
        { id: 'a4', name: 'Huawei SUN2000-200KTL', status: 'warning' },
        { id: 'a5', name: 'Huawei SUN2000-100KTL', status: 'normal' },
      ],
      created_at: '2024-03-10T10:00:00Z',
    },
  ]
}
