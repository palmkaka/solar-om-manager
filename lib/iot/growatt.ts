/**
 * lib/iot/growatt.ts
 * Growatt Server API Client
 *
 * API Docs: https://www.growatt.com/growattUser/help
 * Endpoint: https://server.growatt.com
 *
 * Auth Flow:
 *   POST /newTwoLoginAPI.do → session cookie (JSESSIONID)
 *   Cookie-based session (valid ~30 min of inactivity)
 */

import type { InverterReading } from './types'
import { InverterApiError as ApiError } from './types'

const GROWATT_BASE_URL = process.env.GROWATT_API_URL ?? 'https://server.growatt.com'

// Growatt device status → our status
const GROWATT_STATUS_MAP: Record<number, InverterReading['status']> = {
  0: 'offline',
  1: 'normal',
  2: 'normal',  // Normal (non-generating, e.g., night)
  3: 'error',
}

// ─── Token Cache ──────────────────────────────────────────────────────────────
let _growattCookie: string | null = null
let _growattCookieExpiry = 0

// ─── Growatt Client ───────────────────────────────────────────────────────────
export class GrowattClient {
  private readonly username: string
  private readonly password: string
  private readonly timeout: number

  constructor() {
    this.username = process.env.GROWATT_USERNAME ?? ''
    this.password = process.env.GROWATT_PASSWORD ?? ''
    this.timeout  = 15_000
  }

  /** Login และ cache session cookie 25 นาที */
  private async getSession(): Promise<string> {
    const now = Date.now()
    if (_growattCookie && now < _growattCookieExpiry) {
      return _growattCookie
    }

    const params = new URLSearchParams({
      userName: this.username,
      password: this.password,
    })

    const res = await fetch(`${GROWATT_BASE_URL}/newTwoLoginAPI.do`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
      signal: AbortSignal.timeout(this.timeout),
      credentials: 'include',
    })

    if (!res.ok) {
      throw new ApiError(`Growatt login HTTP ${res.status}`, 'AUTH_HTTP_ERROR', 'growatt')
    }

    const cookie = res.headers.get('set-cookie')
    if (!cookie) {
      throw new ApiError('Growatt login: no session cookie returned', 'AUTH_NO_COOKIE', 'growatt')
    }

    // Extract JSESSIONID
    const jsessionMatch = cookie.match(/JSESSIONID=([^;]+)/)
    if (!jsessionMatch) {
      throw new ApiError('Growatt login: JSESSIONID not found', 'AUTH_NO_JSESSION', 'growatt')
    }

    _growattCookie  = `JSESSIONID=${jsessionMatch[1]}`
    _growattCookieExpiry = now + 25 * 60 * 1000
    return _growattCookie
  }

  /** Generic authenticated GET */
  private async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    const session = await this.getSession()
    const url = new URL(`${GROWATT_BASE_URL}${path}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const res = await fetch(url.toString(), {
      headers: { Cookie: session },
      signal: AbortSignal.timeout(this.timeout),
    })

    if (!res.ok) {
      if (res.status === 401 || res.status === 302) {
        _growattCookie = null
        _growattCookieExpiry = 0
        throw new ApiError('Session expired, will retry', 'SESSION_EXPIRED', 'growatt')
      }
      throw new ApiError(`Growatt API HTTP ${res.status}`, 'HTTP_ERROR', 'growatt')
    }

    return res.json() as Promise<T>
  }

  /**
   * ดึงข้อมูล Real-time ของ Inverter
   * @param deviceSn - Device Serial Number (external_id)
   */
  async fetchDeviceReading(deviceSn: string): Promise<InverterReading> {
    try {
      // ดึง inverter detail โดยตรงจาก SN
      const data = await this.get<{
        obj: {
          status: number
          pac:          string  // kW (current power output)
          eToday:       string  // kWh
          eTotal:       string  // kWh
          temperature:  string  // °C
          vpv1:         string  // DC voltage string 1
          ipv1:         string  // DC current string 1
          vac1:         string  // AC voltage phase 1
          fac1:         string  // AC frequency
          lost:         boolean
          msg:          string | null
        }
      }>('/device/api', { plantId: '', deviceSn })

      if (!data.obj) {
        return this.makeOfflineReading(`Device SN ${deviceSn} not found`)
      }

      return this.normalizeReading(data.obj)
    } catch (err) {
      if (err instanceof ApiError) throw err
      return this.makeErrorReading((err as Error).message)
    }
  }

  /** แปลง Growatt raw data → InverterReading */
  private normalizeReading(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    obj: any
  ): InverterReading {
    const status: InverterReading['status'] = obj.lost
      ? 'offline'
      : GROWATT_STATUS_MAP[obj.status as number] ?? 'error'

    const power = parseFloat(obj.pac ?? 0) / 1000  // W → kW

    return {
      power_kw:         power,
      daily_energy_kwh: parseFloat(obj.eToday     ?? 0),
      total_energy_kwh: parseFloat(obj.eTotal      ?? 0),
      temperature_c:    parseFloat(obj.temperature ?? 0) || null,
      dc_voltage_v:     parseFloat(obj.vpv1        ?? 0) || null,
      dc_current_a:     parseFloat(obj.ipv1        ?? 0) || null,
      ac_voltage_v:     parseFloat(obj.vac1        ?? 0) || null,
      efficiency_pct:   null,  // Growatt ไม่ให้ efficiency โดยตรง
      status,
      error_message:    obj.msg ?? null,
      error_code:       obj.status !== 1 ? `STATUS_${obj.status}` : null,
      fetched_at:       new Date().toISOString(),
      raw:              process.env.NODE_ENV === 'development' ? obj : undefined,
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
