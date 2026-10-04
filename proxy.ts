import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { ROLE_REDIRECT } from '@/lib/utils/roles'
import type { UserRole } from '@/lib/supabase/types'

// Routes ที่ไม่ต้อง Auth
const PUBLIC_PATHS = ['/login', '/register', '/auth/']

const ROLE_ROUTE_MAP: Record<UserRole, string> = {
  admin:      '/dashboard',
  technician: '/my-tasks',
  client:     '/my-tasks', // Force existing client accounts to technician dashboard
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Demo / dev bypass: อนุญาตผ่านทุก route ถ้า DEMO_BYPASS_AUTH=true
  const demoBypass = process.env.DEMO_BYPASS_AUTH === 'true'
  if (demoBypass) {
    return NextResponse.next({ request })
  }

  // ถ้ายังไม่มี Supabase credentials ที่ถูกต้อง — อนุญาตผ่านทุก route (dev/demo mode)
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your-anon-key-here'

  if (!hasSupabase) {
    // Demo mode: pass through ทั้งหมด (mock_role cookie ทำงานแทน)
    return NextResponse.next({ request })
  }

  // 1. อัปเดต Supabase session (wrapped in try/catch for resilience)
  let supabaseResponse: NextResponse
  let user: { id: string } | null = null
  try {
    const result = await updateSession(request)
    supabaseResponse = result.supabaseResponse
    user = result.user
  } catch {
    // ถ้า Supabase ไม่ตอบสนอง ให้ pass through ไปก่อน (ป้องกัน crash)
    return NextResponse.next({ request })
  }

  // 2. Public paths & API — ผ่านได้เสมอ
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  if (isPublicPath || pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  // 3. ยังไม่ login — redirect ไป login
  if (!user) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 4. ดึง role จาก Profile
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = createAdminClient() as any

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profileData as { role?: UserRole } | null)?.role

  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. Redirect / → Role home
  if (pathname === '/') {
    return NextResponse.redirect(new URL(ROLE_ROUTE_MAP[role], request.url))
  }

  // 6. Role-based route protection
  // Admin: /dashboard, /sites, /tasks, /appointments, /technicians, /reports
  const adminRoutes      = ['/dashboard', '/sites', '/tasks', '/appointments', '/technicians', '/reports']
  // Technician: /my-tasks
  const technicianRoutes = ['/my-tasks']
  // Client: /client/* (ทุก Route ใต้ /client/)
  const clientRoutes     = ['/client', '/overview']

  const isAdminRoute      = adminRoutes.some((r)      => pathname.startsWith(r))
  const isTechnicianRoute = technicianRoutes.some((r) => pathname.startsWith(r))
  const isClientRoute     = clientRoutes.some((r)     => pathname.startsWith(r))

  if (isAdminRoute      && role !== 'admin')                           return NextResponse.redirect(new URL(ROLE_ROUTE_MAP[role], request.url))
  // Allow both technician and client (legacy) to access technician routes
  if (isTechnicianRoute && role !== 'technician' && role !== 'admin' && role !== 'client') return NextResponse.redirect(new URL(ROLE_ROUTE_MAP[role], request.url))
  if (isClientRoute     && role !== 'client'     && role !== 'admin')  return NextResponse.redirect(new URL(ROLE_ROUTE_MAP[role], request.url))

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
