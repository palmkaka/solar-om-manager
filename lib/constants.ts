/**
 * App-wide Constants
 */

// ─── Debounce Config (IoT Alert) ─────────────────────────────────────────────
/** จำนวนครั้งขั้นต่ำที่ Error ต้องเกิดก่อน Auto-create Task */
export const DEBOUNCE_MIN_ERROR_COUNT = 3

/** ระยะเวลาขั้นต่ำ (ms) ที่ Error ต้องคงอยู่ก่อน Auto-create Task (30 นาที) */
export const DEBOUNCE_MIN_DURATION_MS = 30 * 60 * 1000

// ─── Supabase Storage ────────────────────────────────────────────────────────
/** ชื่อ Bucket สำหรับรูปหน้างาน */
export const STORAGE_BUCKET_SITE_PHOTOS = 'site-photos'

/** นามสกุลไฟล์ที่อนุญาต */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/** ขนาดไฟล์สูงสุด (5 MB) */
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20

// ─── Cron / API Security ─────────────────────────────────────────────────────
/** Header name สำหรับ verify Cron secret */
export const CRON_SECRET_HEADER = 'x-cron-secret'

// ─── Realtime ────────────────────────────────────────────────────────────────
/** Supabase Realtime channel สำหรับ Admin Alert Feed */
export const REALTIME_CHANNEL_ALERTS = 'admin:alerts'

// ─── Inverter Brands ─────────────────────────────────────────────────────────
export const INVERTER_BRANDS = {
  HUAWEI: 'huawei',
  GROWATT: 'growatt',
} as const

export type InverterBrand = (typeof INVERTER_BRANDS)[keyof typeof INVERTER_BRANDS]
