import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Supabase Browser Client
 * ใช้ใน Client Components (React Components ที่ไม่ใช่ Server)
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
