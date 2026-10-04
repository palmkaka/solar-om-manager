import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchInverterData } from '@/lib/iot'
import type { InverterBrand } from '@/lib/iot'

/**
 * POST /api/assets/[assetId]/refresh
 * Admin-triggered manual refresh — ดึงข้อมูล Inverter ทันที
 * (ไม่ต้องรอ Cron 15 นาที)
 *
 * Body: { secret: string }  (ใช้ CRON_SECRET เดียวกันชั่วคราว)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params

  // Auth check (Admin only — TODO: ใช้ Supabase session จริงใน Phase 7)
  const body = await request.json().catch(() => ({}))
  if (body.secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  // ดึง asset
  const { data: asset, error } = await supabase
    .from('assets')
    .select('id, name, brand, external_id, site_id')
    .eq('id', assetId)
    .single()

  if (error || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  if (!asset.external_id) {
    return NextResponse.json({ error: 'Asset has no external_id' }, { status: 400 })
  }

  try {
    const reading = await fetchInverterData({
      brand:      asset.brand as InverterBrand,
      externalId: asset.external_id as string,
    })

    await supabase
      .from('assets')
      .update({
        status:     reading.status,
        last_data:  reading,
        updated_at: new Date().toISOString(),
      })
      .eq('id', assetId)

    return NextResponse.json({
      message: `Refreshed ${asset.name}`,
      reading,
    })
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}

/**
 * GET /api/assets/[assetId]/refresh
 * ดึงข้อมูล last_data ล่าสุดโดยไม่ fetch API (ใช้ที่ cache อยู่)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const { assetId } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any

  const { data: asset, error } = await supabase
    .from('assets')
    .select('id, name, brand, status, last_data, updated_at')
    .eq('id', assetId)
    .single()

  if (error || !asset) {
    return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
  }

  return NextResponse.json(asset)
}
