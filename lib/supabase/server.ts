import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Supabase Server Client
 * ใช้ใน Server Components, Server Actions, Route Handlers
 * อ่าน/เขียน Cookie อัตโนมัติผ่าน Next.js cookies()
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll ใน Server Component จะ throw — ไม่ต้องทำอะไร
            // Middleware จะ handle session refresh แทน
          }
        },
      },
    }
  )
}

/**
 * Supabase Admin Client (Service Role)
 * ใช้เฉพาะใน API Routes / Cron Jobs ที่ต้องการ bypass RLS
 * ห้ามใช้ใน Client Components เด็ดขาด
 */
export function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  )
}
