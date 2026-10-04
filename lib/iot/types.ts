/**
 * lib/iot/types.ts
 * Normalized data types สำหรับทุก Inverter brand
 */

// ─── Inverter Brand ───────────────────────────────────────────────────────────
export type InverterBrand = 'huawei' | 'growatt' | 'sungrow' | 'other'

// ─── Normalized Reading (stored in assets.last_data) ─────────────────────────
export interface InverterReading {
  /** กำลังผลิตปัจจุบัน (kW) */
  power_kw:         number
  /** พลังงานสะสมวันนี้ (kWh) */
  daily_energy_kwh: number
  /** พลังงานสะสมทั้งหมด (kWh) */
  total_energy_kwh: number
  /** อุณหภูมิ Inverter (°C) */
  temperature_c:    number | null
  /** แรงดันไฟฟ้า DC (V) */
  dc_voltage_v:     number | null
  /** กระแสไฟฟ้า DC (A) */
  dc_current_a:     number | null
  /** แรงดันไฟฟ้า AC (V) */
  ac_voltage_v:     number | null
  /** ค่า efficiency (%) */
  efficiency_pct:   number | null
  /** สถานะ Inverter */
  status:           'normal' | 'warning' | 'error' | 'offline'
  /** ข้อความ error (ถ้ามี) */
  error_message:    string | null
  /** Error code จาก API (ถ้ามี) */
  error_code:       string | null
  /** เวลาที่ fetch ข้อมูล */
  fetched_at:       string
  /** ข้อมูลดิบจาก API (debug) */
  raw?:             Record<string, unknown>
}

// ─── Fetch Config ─────────────────────────────────────────────────────────────
export interface FetchConfig {
  brand:       InverterBrand
  externalId:  string   // device SN หรือ plant ID
  siteCode?:   string   // Huawei station code
  timeout?:    number   // ms
}

// ─── API Error ────────────────────────────────────────────────────────────────
export class InverterApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly brand: InverterBrand
  ) {
    super(message)
    this.name = 'InverterApiError'
  }
}
