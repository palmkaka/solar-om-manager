/**
 * lib/iot/mock.ts
 * Realistic mock data generator สำหรับ:
 * 1. Dev mode ที่ยังไม่มี Inverter credentials
 * 2. Testing / CI
 *
 * จำลอง daily curve ของโซลาร์ตามเวลาจริง
 */

import type { InverterReading, InverterBrand } from './types'

/**
 * สร้าง realistic mock reading ตาม Solar irradiance curve
 * กำลังผลิตสูงช่วง 8:00–16:00 (peak 12:00–14:00)
 */
export function generateMockReading(
  brand: InverterBrand,
  externalId: string,
  capacityKw: number = 50,
  forceError: boolean = false
): InverterReading {

  if (forceError) {
    return {
      power_kw: 0, daily_energy_kwh: 0, total_energy_kwh: 0,
      temperature_c: null, dc_voltage_v: null, dc_current_a: null,
      ac_voltage_v: null, efficiency_pct: null,
      status: 'error',
      error_message: 'Communication timeout with inverter',
      error_code: 'COMM_TIMEOUT',
      fetched_at: new Date().toISOString(),
    }
  }

  // คำนวณ Solar output ตามเวลา
  const hour = new Date().getHours()
  const minute = new Date().getMinutes()
  const timeDecimal = hour + minute / 60

  // Gaussian curve: peak ที่ 13:00 (ค่า sigma ~2.5 hr)
  const peakHour = 13.0
  const sigma = 2.5
  const solarFactor = timeDecimal >= 6 && timeDecimal <= 18
    ? Math.exp(-Math.pow(timeDecimal - peakHour, 2) / (2 * sigma * sigma))
    : 0

  // เพิ่ม random noise ±5%
  const noise = 0.95 + Math.random() * 0.10
  const powerKw = Math.round(capacityKw * solarFactor * noise * 100) / 100

  // Daily energy สะสม (approximate)
  const hoursElapsed = Math.max(0, timeDecimal - 6)
  const dailyEnergyKwh = Math.round(capacityKw * hoursElapsed * 0.35 * noise * 10) / 10

  // Temperature: สูงขึ้นตาม solar irradiance
  const baseTemp = 25
  const tempIncrease = solarFactor * 30 + Math.random() * 5
  const temperature = Math.round((baseTemp + tempIncrease) * 10) / 10

  // DC/AC values
  const dcVoltage = solarFactor > 0 ? Math.round((600 + Math.random() * 100) * 10) / 10 : null
  const dcCurrent = solarFactor > 0 && dcVoltage
    ? Math.round((powerKw * 1000 / dcVoltage) * 10) / 10
    : null

  // Total energy: mock ตาม externalId hash
  const hashCode = externalId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const totalEnergyKwh = Math.round(capacityKw * (100 + hashCode % 500) * 10) / 10

  // Status
  const status: InverterReading['status'] = solarFactor === 0
    ? 'normal'    // กลางคืน = normal (ไม่ใช่ error)
    : powerKw > capacityKw * 0.95
    ? 'warning'   // เกิน rated capacity
    : 'normal'

  return {
    power_kw:         powerKw,
    daily_energy_kwh: dailyEnergyKwh,
    total_energy_kwh: totalEnergyKwh,
    temperature_c:    temperature,
    dc_voltage_v:     dcVoltage,
    dc_current_a:     dcCurrent,
    ac_voltage_v:     solarFactor > 0 ? 220 + Math.round(Math.random() * 10) : null,
    efficiency_pct:   solarFactor > 0 ? Math.round((0.92 + Math.random() * 0.06) * 1000) / 10 : null,
    status,
    error_message:    null,
    error_code:       null,
    fetched_at:       new Date().toISOString(),
  }
}

/**
 * ตรวจสอบว่าควรใช้ Mock หรือ Real API
 */
export function shouldUseMock(brand: InverterBrand): boolean {
  if (brand === 'huawei') {
    return !process.env.HUAWEI_FUSION_SOLAR_USER ||
           !process.env.HUAWEI_FUSION_SOLAR_SYSTEM_CODE
  }
  if (brand === 'growatt') {
    return !process.env.GROWATT_USERNAME ||
           !process.env.GROWATT_PASSWORD
  }
  return true
}
