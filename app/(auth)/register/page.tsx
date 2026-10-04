'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'

type FormState = { error?: string; success?: boolean } | null

export default function RegisterPage() {
  const [state, action, isPending] = useActionState<FormState, FormData>(signUp, null)

  // Show success state
  if (state?.success) {
    return (
      <div className="animate-fade-in text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6">
          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">สมัครสำเร็จ! 🎉</h2>
        <p className="text-gray-500 text-sm mb-2">
          กรุณาตรวจสอบอีเมลของคุณเพื่อยืนยันการสมัคร
        </p>
        <p className="text-gray-500 text-xs mb-8">
          หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์ Spam
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-amber-400 text-gray-900 font-semibold rounded-xl hover:opacity-90 transition text-sm"
        >
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">สมัครใช้งาน</h1>
        <p className="text-gray-500 text-sm mt-1">สร้างบัญชีเพื่อเข้าถึงระบบ Solar O&amp;M</p>
      </div>

      {/* Error Alert */}
      {state?.error && (
        <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 animate-fade-in">
          <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-400 text-sm">{state.error}</p>
        </div>
      )}

      {/* Form */}
      <form action={action} className="space-y-4">
        {/* Full Name */}
        <div>
          <label htmlFor="reg-fullname" className="block text-sm font-medium text-gray-600 mb-2">
            ชื่อ-นามสกุล / ชื่อบริษัท
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <input
              id="reg-fullname"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              placeholder="สมชาย ใจดี / บริษัท โซลาร์ไทย จำกัด"
              className="w-full pl-10 pr-4 py-3 bg-gray-100/70 border border-gray-300 rounded-xl text-gray-900 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all disabled:opacity-50"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-gray-600 mb-2">
            อีเมล
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="reg-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="email@example.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-100/70 border border-gray-300 rounded-xl text-gray-900 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all disabled:opacity-50"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-gray-600 mb-2">
            รหัสผ่าน <span className="text-gray-500 font-normal">(อย่างน้อย 8 ตัวอักษร)</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <input
              id="reg-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-100/70 border border-gray-300 rounded-xl text-gray-900 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all disabled:opacity-50"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="reg-confirm" className="block text-sm font-medium text-gray-600 mb-2">
            ยืนยันรหัสผ่าน
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <input
              id="reg-confirm"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              className="w-full pl-10 pr-4 py-3 bg-gray-100/70 border border-gray-300 rounded-xl text-gray-900 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all disabled:opacity-50"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="reg-terms"
            name="terms"
            type="checkbox"
            required
            className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-gray-100 text-amber-400 focus:ring-amber-400/50 flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="reg-terms" className="text-xs text-gray-500 cursor-pointer leading-relaxed">
            ฉันยอมรับ{' '}
            <a href="#" className="text-amber-400 hover:text-amber-300">นโยบายความเป็นส่วนตัว</a>
            {' '}และ{' '}
            <a href="#" className="text-amber-400 hover:text-amber-300">ข้อกำหนดการใช้งาน</a>
          </label>
        </div>

        {/* Submit Button */}
        <button
          id="register-submit-btn"
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm mt-2"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              กำลังสมัคร...
            </>
          ) : (
            'สร้างบัญชีใหม่'
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-gray-500 text-sm mt-6">
        มีบัญชีแล้ว?{' '}
        <Link href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  )
}
