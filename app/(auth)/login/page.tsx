'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'

type FormState = { error?: string } | null

export default function LoginPage() {
  const [state, action, isPending] = useActionState<FormState, FormData>(signIn, null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">เข้าสู่ระบบ</h1>
        <p className="text-sm font-medium text-gray-500">กรุณากรอกอีเมลและรหัสผ่านเพื่อดำเนินการต่อ</p>
      </div>

      {/* Error Alert */}
      {state?.error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl px-4 py-3 border bg-red-50 border-red-200 shadow-sm animate-fade-in">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-700 font-semibold">{state.error}</p>
        </div>
      )}

      {/* Form */}
      <form action={action} className="space-y-6">
        {/* Email */}
        <div>
          <label htmlFor="login-email" className="block text-sm font-bold text-gray-700 mb-2">
            อีเมล
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-green-600 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="login-email"
              ref={emailRef}
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="admin@solar.com"
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 font-medium text-sm focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all duration-300 disabled:opacity-50"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="login-password" className="block text-sm font-bold text-gray-700">
              รหัสผ่าน
            </label>
            <a href="#" className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">
              ลืมรหัสผ่าน?
            </a>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-green-600 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 font-medium text-sm focus:outline-none focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 transition-all duration-300 disabled:opacity-50 tracking-widest"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={isPending}
          className="w-full py-4 mt-2 font-bold rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm text-white bg-green-600"
        >
          {isPending ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            <>
              เข้าสู่ระบบ
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </>
          )}
        </button>
      </form>

      {/* Register link */}
      <p className="text-center text-sm text-gray-500 mt-8">
        ยังไม่มีบัญชี?{' '}
        <Link href="/register" className="font-bold text-green-600 hover:text-green-700 transition-colors">
          ติดต่อขอรับสิทธิ์เข้าใช้งาน
        </Link>
      </p>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gray-200" />
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Internal Use Only</p>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Demo Accounts */}
      <div className="p-5 rounded-2xl border bg-gray-50/50 border-gray-100 flex flex-col items-center justify-center">
        <p className="text-xs font-bold text-gray-500 mb-3 tracking-widest uppercase">Demo Accounts</p>
        <div className="flex gap-4 text-xs text-gray-600 font-medium">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Admin: <span className="font-bold text-gray-900">admin@solar.com</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            Tech: <span className="font-bold text-gray-900">tech@solar.com</span>
          </div>
        </div>
        <p className="text-xs font-bold text-gray-500 mt-4 bg-gray-200/50 px-3 py-1 rounded-md">Password: Solar1234!</p>
      </div>
    </div>
  )
}
