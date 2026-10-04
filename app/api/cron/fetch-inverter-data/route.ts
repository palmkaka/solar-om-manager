import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { fetchInverterData } from '@/lib/iot'
import type { InverterBrand } from '@/lib/iot'
import {
  CRON_SECRET_HEADER,
  DEBOUNCE_MIN_ERROR_COUNT,
  DEBOUNCE_MIN_DURATION_MS,
} from '@/lib/constants'

/**
 * GET /api/cron/fetch-inverter-data
 * Vercel Cron Job ทุก 15 นาที
 *
 * Flow:
 * 1. ดึง assets ที่มี external_id (Inverter ที่เชื่อมต่อ)
 * 2. Dispatch ไปยัง IoT client (Huawei/Growatt/Mock)
 * 3. Upsert ข้อมูลเข้า assets.last_data + assets.status
 * 4. Debounce error → Auto-create Task ถ้าผ่าน threshold
 * 5. Broadcast Supabase Realtime หากสร้าง task ใหม่
 */
export async function GET(request: NextRequest) {
  // ─── Security ─────────────────────────────────────────────────────────────
  const cronSecret = request.headers.get(CRON_SECRET_HEADER)
  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any
  const results: {
    assetId: string
    name:    string
    brand:   string
    status:  string
    powerKw: number
    action?: string
  }[] = []

  const startTime = Date.now()

  try {
    // ─── 1. ดึง Assets ────────────────────────────────────────────────────
    const { data: assets, error: fetchError } = await supabase
      .from('assets')
      .select('id, site_id, name, brand, external_id, status, capacity_kw')
      .not('external_id', 'is', null)

    if (fetchError) throw fetchError
    if (!assets || assets.length === 0) {
      return NextResponse.json({ message: 'No assets to process', results: [] })
    }

    // ─── 2. Process แต่ละ Asset (sequential เพื่อ rate-limit safety) ─────
    for (const asset of assets) {
      try {
        const reading = await fetchInverterData({
          brand:      asset.brand as InverterBrand,
          externalId: asset.external_id as string,
          timeout:    12_000,
        })

        // ─── 3. Upsert ─────────────────────────────────────────────────────
        await supabase
          .from('assets')
          .update({
            status:    reading.status,
            last_data: reading,
            updated_at: new Date().toISOString(),
          })
          .eq('id', asset.id)

        // ─── 4. Debounce Logic ──────────────────────────────────────────────
        const isError = reading.status === 'error' || reading.status === 'offline'
        if (isError) {
          const action = await handleErrorDebounce(supabase, asset, reading)
          results.push({ assetId: asset.id, name: asset.name, brand: asset.brand, status: reading.status, powerKw: reading.power_kw, action })
        } else {
          // Error หายแล้ว — reset debounce
          await supabase.from('error_debounce').delete().eq('asset_id', asset.id)
          results.push({ assetId: asset.id, name: asset.name, brand: asset.brand, status: reading.status, powerKw: reading.power_kw })
        }

      } catch (assetError) {
        console.error(`[Cron] Failed to process asset ${asset.id} (${asset.name}):`, assetError)
        results.push({
          assetId: asset.id, name: asset.name, brand: asset.brand,
          status: 'fetch_error', powerKw: 0, action: (assetError as Error).message,
        })
      }
    }

    const elapsed = Date.now() - startTime
    const summary = {
      total:   assets.length,
      normal:  results.filter((r) => r.status === 'normal').length,
      warning: results.filter((r) => r.status === 'warning').length,
      error:   results.filter((r) => ['error', 'offline', 'fetch_error'].includes(r.status)).length,
    }

    console.log(`[Cron] Completed in ${elapsed}ms`, summary)
    return NextResponse.json({
      message:   `Processed ${assets.length} assets in ${elapsed}ms`,
      timestamp: new Date().toISOString(),
      summary,
      results,
    })

  } catch (error) {
    console.error('[Cron] Fatal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Error Debounce Helper ────────────────────────────────────────────────────
async function handleErrorDebounce(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  asset: { id: string; site_id: string | null; name: string; brand: string },
  reading: { status: string; error_message: string | null; error_code: string | null; power_kw: number }
): Promise<string> {
  const now = new Date()

  const { data: existing } = await supabase
    .from('error_debounce')
    .select('*')
    .eq('asset_id', asset.id)
    .single()

  if (!existing) {
    await supabase.from('error_debounce').insert({
      asset_id:     asset.id,
      first_seen_at: now.toISOString(),
      last_seen_at:  now.toISOString(),
      error_count:   1,
      task_created:  false,
      error_payload: {
        status:       reading.status,
        error_message: reading.error_message,
        error_code:   reading.error_code,
      },
    })
    return 'debounce_started'
  }

  // Update count + last seen
  const newCount = (existing.error_count as number) + 1
  await supabase
    .from('error_debounce')
    .update({
      last_seen_at: now.toISOString(),
      error_count:  newCount,
      error_payload: {
        status:        reading.status,
        error_message: reading.error_message,
        error_code:    reading.error_code,
      },
    })
    .eq('asset_id', asset.id)

  // ตรวจเงื่อนไข Auto-create Task
  const duration = now.getTime() - new Date(existing.first_seen_at as string).getTime()
  const shouldCreateTask =
    newCount >= DEBOUNCE_MIN_ERROR_COUNT &&
    duration >= DEBOUNCE_MIN_DURATION_MS &&
    !existing.task_created

  if (!shouldCreateTask) {
    return `debounce_count:${newCount} (${Math.round(duration / 60000)}min)`
  }

  // ─── Auto-create Task ───────────────────────────────────────────────────────
  const minutesDown = Math.round(duration / 60000)
  const errorInfo = reading.error_message ?? reading.status

  const { data: task } = await supabase
    .from('tasks')
    .insert({
      site_id:        asset.site_id,
      asset_id:       asset.id,
      title:          `[Auto] ตรวจสอบ ${asset.name} — ${errorInfo}`,
      description:    [
        `ระบบตรวจพบ Error ต่อเนื่อง ${newCount} ครั้ง เป็นเวลา ${minutesDown} นาที`,
        `Error: ${errorInfo}`,
        reading.error_code ? `Code: ${reading.error_code}` : '',
        `Brand: ${asset.brand.toUpperCase()}`,
      ].filter(Boolean).join('\n'),
      status:          'open',
      priority:        minutesDown >= 60 ? 'critical' : 'high',
      is_auto_created: true,
    })
    .select('id')
    .single()

  // Mark debounce as task_created
  await supabase
    .from('error_debounce')
    .update({ task_created: true })
    .eq('asset_id', asset.id)

  // ─── Broadcast Realtime → Admin AlertFeed ──────────────────────────────────
  try {
    await supabase
      .channel('admin:alerts')
      .send({
        type:    'broadcast',
        event:   'new_alert',
        payload: {
          taskId:    task?.id,
          assetId:   asset.id,
          assetName: asset.name,
          brand:     asset.brand,
          error:     errorInfo,
          severity:  minutesDown >= 60 ? 'critical' : 'high',
          createdAt: now.toISOString(),
        },
      })
  } catch (rtErr) {
    console.warn('[Cron] Realtime broadcast failed:', rtErr)
  }

  return `task_created:${task?.id ?? 'unknown'}`
}
