import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /auth/callback
 * Supabase Auth callback handler สำหรับ:
 * - Email confirmation (หลังสมัครใหม่)
 * - Magic Link login
 * - OAuth providers (ถ้าเพิ่มในอนาคต)
 *
 * Supabase จะ redirect มาที่ URL นี้พร้อม code parameter
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code         = searchParams.get('code')
  const next         = searchParams.get('next') ?? '/'
  const errorParam   = searchParams.get('error')
  const errorDesc    = searchParams.get('error_description')

  // Handle error from Supabase
  if (errorParam) {
    console.error('Auth callback error:', errorParam, errorDesc)
    const loginUrl = new URL('/login', origin)
    loginUrl.searchParams.set('error', errorDesc ?? errorParam)
    return NextResponse.redirect(loginUrl)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Exchange สำเร็จ — redirect ไปหน้าถัดไป (middleware จะจัดการ role redirect)
      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    console.error('Code exchange error:', error.message)
  }

  // Fallback: redirect ไป login พร้อม error message
  const loginUrl = new URL('/login', origin)
  loginUrl.searchParams.set('error', 'ไม่สามารถยืนยันตัวตนได้ กรุณาลองใหม่')
  return NextResponse.redirect(loginUrl)
}
