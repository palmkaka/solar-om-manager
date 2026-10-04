/**
 * lib/iot/huawei.ts
 * Huawei FusionSolar Third-party API Client
 *
 * API Docs: https://forum.huawei.com/enterprise/en/communication/solar-developer-resources
 * Endpoint: https://sg5.fusionsolar.huawei.com/thirdData
 *
 * Auth Flow:
 *   POST /login → roarand token (valid 30 min)
 *   Header: XSRF-TOKEN: <roarand>
 */

import type { InverterReading, InverterApiError } from './types'
import { InverterApiError as ApiError } from './types'

// ─── Huawei API Constants ──────────────────────────────────────────────────────
const HUAWEI_BASE_URL = process.env.HUAWEI_FUSION_SOLAR_URL
  ?? 'https://sg5.fusionsolar.huawei.com/thirdData'

// Huawei device status codes → our status
const HUAWEI_STATUS_MAP: Record<number, InverterReading['status']> = {
  1:   'normal',
  2:   'normal',   // Generating
  45:  'offline',
  128: 'warning',
  256: 'error',
  512: 'error',
}

// ─── Huawei Raw Types ────────────────────────────────────────────────────────
interface HuaweiLoginResponse {
  success: boolean
  failCode: number
  data: { xsrfToken: string } | null
}

interface HuaweiDeviceRealKpiItem {
  devId:   number
  devSn:   string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataItemMap: Record<string, any>
}

interface HuaweiApiResponse<T> {
  success: boolean
  failCode: number
  message:  string | null
  data:     T | null
}

// ─── Token Cache (in-memory, resets per cold start) ───────────────────────────
let _huaweiToken: string | null = null
let _huaweiTokenExpiry = 0

// ─── Huawei Client ────────────────────────────────────────────────────────────
export class HuaweiClient {
  private readonly username: string
  private readonly systemCode: string
  private readonly timeout: number

  constructor() {
    this.username   = process.env.HUAWEI_FUSION_SOLAR_USER ?? ''
    this.systemCode = process.env.HUAWEI_FUSION_SOLAR_SYSTEM_CODE ?? ''
    this.timeout    = 15_000
  }

  /** Login และ cache token 25 นาที (token อายุ 30 นาที) */
  private async getToken(): Promise<string> {
    const now = Date.now()
    if (_huaweiToken && now < _huaweiTokenExpiry) {
      return _huaweiToken
    }

    const res = await fetch(`${HUAWEI_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName:   this.username,
        systemCode: this.systemCode,
      }),
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!res.ok) {
      throw new ApiError(`Huawei login HTTP ${res.status}`, 'AUTH_HTTP_ERROR', 'huawei')
    }

    const body: HuaweiLoginResponse = await res.json()
    if (!body.success || !body.data?.xsrfToken) {
      throw new ApiError(
        `Huawei login failed: code=${body.failCode}`,
        `AUTH_${body.failCode}`,
        'huawei'
      )
    }

    _huaweiToken  = body.data.xsrfToken
    _huaweiTokenExpiry = now + 25 * 60 * 1000  // 25 นาที
    return _huaweiToken
  }

  /** Generic authenticated request */
  private async request<T>(path: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
    const token = await this.getToken()
    const res = await fetch(`${HUAWEI_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'XSRF-TOKEN':   token,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!res.ok) {
      // Token หมดอายุ → force refresh
      if (res.status === 401 || res.status === 403) {
        _huaweiToken = null
        _huaweiTokenExpiry = 0
        throw new ApiError('Token expired, will retry', 'TOKEN_EXPIRED', 'huawei')
      }
      throw new ApiError(`Huawei API HTTP ${res.status}`, 'HTTP_ERROR', 'huawei')
    }

    const data: HuaweiApiResponse<T> = await res.json()
    if (!data.success) {
      throw new ApiError(
        `Huawei API error: ${data.message ?? data.failCode}`,
        `API_${data.failCode}`,
        'huawei'
      )
    }
    return data.data as T
  }

  /**
   * ดึงข้อมูล Real-time ของ Inverter
   * @param devSn - Device Serial Number (external_id ใน assets table)
   * @param stationCode - Station code สำหรับ auth scope
   */
  async fetchDeviceReading(devSn: string, stationCode?: string): Promise<InverterReading> {
    try {
      // ดึง Device ID จาก SN ก่อน (ถ้าไม่รู้ devId)
      const devList = await this.request<{ data: Array<{ devSn: string; devId: number; devStatus: number }> }>(
        '/getDevList',
        'GET'
      )

      const device = devList.data?.find((d) => d.devSn === devSn)
      if (!device) {
        return this.makeOfflineReading(`Device SN ${devSn} not found in station`)
      }

      // ดึง Real-time KPI
      const kpiResult = await this.request<HuaweiDeviceRealKpiItem[]>(
        '/getDevRealKpi',
        'POST',
        {
          devIds:    device.devId.toString(),
          devTypeId: 1, // Inverter
        }
      )

      const kpiItem = kpiResult?.[0]
      if (!kpiItem) {
        return this.makeOfflineReading('No KPI data returned')
      }

      return this.normalizeKpi(kpiItem, device.devStatus)
    } catch (err) {
      if (err instanceof ApiError) throw err
      return this.makeErrorReading((err as Error).message)
    }
  }

  /** แปลง Huawei raw KPI → InverterReading */
  private normalizeKpi(
    item: HuaweiDeviceRealKpiItem,
    devStatus: number
  ): InverterReading {
    const d = item.dataItemMap

    // Determine status
    const status: InverterReading['status'] = HUAWEI_STATUS_MAP[devStatus] ?? 'error'
    const errorMsg = d['alarm_count'] > 0 ? `${d['alarm_count']} active alarm(s)` : null

    return {
      power_kw:         parseFloat(d['active_power']    ?? 0),
      daily_energy_kwh: parseFloat(d['day_power']       ?? 0),
      total_energy_kwh: parseFloat(d['total_power']     ?? 0),
      temperature_c:    parseFloat(d['temperature']     ?? 0) || null,
      dc_voltage_v:     parseFloat(d['pv1_u']           ?? 0) || null,
      dc_current_a:     parseFloat(d['pv1_i']           ?? 0) || null,
      ac_voltage_v:     parseFloat(d['ab_u']            ?? 0) || null,
      efficiency_pct:   parseFloat(d['efficiency']      ?? 0) || null,
      status,
      error_message:    errorMsg,
      error_code:       d['alarm_count'] > 0 ? `ALARM_${d['alarm_count']}` : null,
      fetched_at:       new Date().toISOString(),
      raw:              process.env.NODE_ENV === 'development' ? d : undefined,
    }
  }

  private makeOfflineReading(reason: string): InverterReading {
    return {
      power_kw: 0, daily_energy_kwh: 0, total_energy_kwh: 0,
      temperature_c: null, dc_voltage_v: null, dc_current_a: null,
      ac_voltage_v: null, efficiency_pct: null,
      status: 'offline', error_message: reason, error_code: 'OFFLINE',
      fetched_at: new Date().toISOString(),
    }
  }

  private makeErrorReading(reason: string): InverterReading {
    return {
      power_kw: 0, daily_energy_kwh: 0, total_energy_kwh: 0,
      temperature_c: null, dc_voltage_v: null, dc_current_a: null,
      ac_voltage_v: null, efficiency_pct: null,
      status: 'error', error_message: reason, error_code: 'FETCH_ERROR',
      fetched_at: new Date().toISOString(),
    }
  }
}
