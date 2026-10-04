/**
 * lib/iot/index.ts
 * IoT Dispatcher — เลือก client ตาม brand
 * Import นี้ใน cron route และ API routes
 */

import type { InverterReading, InverterBrand, FetchConfig } from './types'
import { HuaweiClient } from './huawei'
import { GrowattClient } from './growatt'
import { generateMockReading, shouldUseMock } from './mock'

// Singleton clients (reused across cron invocations in same process)
let _huaweiClient: HuaweiClient | null = null
let _growattClient: GrowattClient | null = null

function getHuaweiClient(): HuaweiClient {
  if (!_huaweiClient) _huaweiClient = new HuaweiClient()
  return _huaweiClient
}

function getGrowattClient(): GrowattClient {
  if (!_growattClient) _growattClient = new GrowattClient()
  return _growattClient
}

/**
 * fetchInverterData — entry point หลักสำหรับ cron job
 *
 * ลำดับ:
 * 1. ตรวจสอบ credentials → ถ้าไม่มี → ใช้ mock
 * 2. Dispatch ไปยัง client ที่ถูกต้องตาม brand
 * 3. Return normalized InverterReading
 */
export async function fetchInverterData(config: FetchConfig): Promise<InverterReading> {
  const { brand, externalId } = config

  // ─── Mock Mode ────────────────────────────────────────────────────────────
  if (shouldUseMock(brand)) {
    console.log(`[IoT] Using mock data for ${brand}:${externalId}`)
    return generateMockReading(brand, externalId)
  }

  // ─── Real API ─────────────────────────────────────────────────────────────
  console.log(`[IoT] Fetching real data for ${brand}:${externalId}`)

  switch (brand) {
    case 'huawei':
      return getHuaweiClient().fetchDeviceReading(externalId, config.siteCode)

    case 'growatt':
      return getGrowattClient().fetchDeviceReading(externalId)

    default:
      // Brand ที่ยังไม่รองรับ — ใช้ mock
      console.warn(`[IoT] Brand "${brand}" not yet integrated, using mock`)
      return generateMockReading(brand, externalId)
  }
}

// Re-export types
export type { InverterReading, InverterBrand, FetchConfig }
export { generateMockReading, shouldUseMock }
