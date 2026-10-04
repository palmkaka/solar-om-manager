import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './types'

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co'
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

/**
 * updateSession — ต้องเรียกใน middleware.ts ทุก request
 * เพื่อ refresh session token และจัดการ Cookie อัตโนมัติ
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ดึง user session (อย่าลบบรรทัดนี้ — จำเป็นสำหรับ refresh token)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
