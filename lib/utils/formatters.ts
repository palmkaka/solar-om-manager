/**
 * Formatters — ฟังก์ชัน format สำหรับใช้ทั่วทั้งโปรเจกต์
 */

// ─── Date & Time ─────────────────────────────────────────────────────────────

const thLocale = 'th-TH'

/** แสดงวันที่แบบไทย เช่น "10 กันยายน 2568" */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(thLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/** แสดงวันที่+เวลา เช่น "10 ก.ย. 2568, 09:30" */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString(thLocale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** แสดงเวลาสัมพัทธ์ เช่น "3 ชั่วโมงที่แล้ว" */
export function formatRelativeTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  const diff = Date.now() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'เมื่อกี้'
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`
  if (days < 7) return `${days} วันที่แล้ว`
  return formatDate(date)
}

// ─── Energy / Power ──────────────────────────────────────────────────────────

/** แสดง kW หรือ MW อัตโนมัติ */
export function formatPower(kw: number): string {
  if (kw >= 1000) return `${(kw / 1000).toFixed(2)} MW`
  return `${kw.toFixed(2)} kW`
}

/** แสดง kWh หรือ MWh อัตโนมัติ */
export function formatEnergy(kwh: number): string {
  if (kwh >= 1000) return `${(kwh / 1000).toFixed(2)} MWh`
  return `${kwh.toFixed(2)} kWh`
}

/** แสดงการประหยัด CO₂ (kg → ตัน อัตโนมัติ) */
export function formatCO2(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} ตัน CO₂`
  return `${kg.toFixed(1)} kg CO₂`
}

// ─── Number ──────────────────────────────────────────────────────────────────

/** แสดงตัวเลขพร้อม comma separator */
export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString(thLocale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** แสดง % */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}
