'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isSupabaseReady() {
  if (process.env.DEMO_BYPASS_AUTH === 'true') return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return !!(url && url !== 'https://your-project-ref.supabase.co')
}

// Role → Home route mapping
const ROLE_HOME: Record<UserRole, string> = {
  admin:      '/dashboard',
  technician: '/my-tasks',
  client:     '/my-tasks', // Force existing client accounts to technician dashboard
}

// ─── Sign In ──────────────────────────────────────────────────────────────────
export async function signIn(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error: string }> {
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)

  if (!email || !password) {
    return { error: 'กรุณากรอกอีเมลและรหัสผ่าน' }
  }

  // --- MOCK MODE BYPASS ---
  if (!isSupabaseReady()) {
    let mockRole: UserRole = 'client'
    if (email === 'admin@solar.com') mockRole = 'admin'
    else if (email === 'tech@solar.com') mockRole = 'technician'
    else if (email === 'client@solar.com') mockRole = 'client'
    else return { error: 'โหมดสาธิต: กรุณาใช้อีเมล demo (admin@solar.com, tech@solar.com, client@solar.com)' }

    const cookieStore = await cookies()
    cookieStore.set('mock_role', mockRole, { path: '/' })
    redirect(ROLE_HOME[mockRole])
  }
  // ------------------------

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ' }
    }
    return { error: error.message }
  }

  // ดึง role สำหรับ redirect
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile as { role?: UserRole } | null)?.role ?? 'technician'
  redirect(ROLE_HOME[role])
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
export async function signUp(
  _prevState: { error?: string; success?: boolean } | null,
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const fullName       = (formData.get('fullName')       as string)?.trim()
  const email          = (formData.get('email')          as string)?.trim()
  const password       = (formData.get('password')       as string)
  const confirmPassword = (formData.get('confirmPassword') as string)

  // Validation
  if (!fullName || !email || !password) {
    return { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' }
  }
  if (password.length < 8) {
    return { error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' }
  }
  if (password !== confirmPassword) {
    return { error: 'รหัสผ่านไม่ตรงกัน' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'technician', // default role (Admin can change to admin later)
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น' }
    }
    return { error: error.message }
  }

  return { success: true }
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────
export async function signOut() {
  if (!isSupabaseReady()) {
    const cookieStore = await cookies()
    cookieStore.delete('mock_role')
    redirect('/login')
  }

  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ─── Get Current User + Profile ───────────────────────────────────────────────
export async function getCurrentUser() {
  if (!isSupabaseReady()) {
    const cookieStore = await cookies()
    const mockRole = cookieStore.get('mock_role')?.value as UserRole | undefined
    if (!mockRole) return null

    return {
      id: `mock-user-${mockRole}`,
      full_name: mockRole === 'admin' ? 'Demo Admin' : mockRole === 'technician' ? 'Demo Technician' : 'Demo Client',
      role: mockRole,
      avatar_url: null,
      phone: null
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (supabase as any)
    .from('profiles')
    .select('id, full_name, role, avatar_url, phone')
    .eq('id', user.id)
    .single()

  const roleFromDb = profile?.role ?? 'technician'
  const finalRole = roleFromDb === 'client' ? 'technician' : roleFromDb

  return {
    id: profile?.id ?? user.id,
    full_name: profile?.full_name ?? user.email ?? 'Unknown User',
    role: finalRole,
    avatar_url: profile?.avatar_url ?? null,
    phone: profile?.phone ?? null,
  } as {
    id: string
    full_name: string
    role: UserRole
    avatar_url: string | null
    phone: string | null
  }
}
