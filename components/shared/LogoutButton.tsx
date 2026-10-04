'use client'

import { useTransition } from 'react'
import { signOut } from '@/lib/actions/auth'
import { cn } from '@/lib/utils/cn'

interface LogoutButtonProps {
  variant?: 'icon' | 'full' | 'text'
  className?: string
}

/**
 * LogoutButton — ปุ่ม Sign Out สำหรับใช้ใน Header/Sidebar ทุก Role
 */
export function LogoutButton({ variant = 'full', className }: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleLogout = () => {
    startTransition(async () => {
      await signOut()
    })
  }

  if (variant === 'icon') {
    return (
      <button
        id="logout-icon-btn"
        onClick={handleLogout}
        disabled={isPending}
        title="ออกจากระบบ"
        className={cn(
          'p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50',
          className
        )}
      >
        <svg className={cn('w-5 h-5', isPending && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          {isPending ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          )}
        </svg>
      </button>
    )
  }

  if (variant === 'text') {
    return (
      <button
        id="logout-text-btn"
        onClick={handleLogout}
        disabled={isPending}
        className={cn(
          'text-sm text-slate-400 hover:text-red-400 transition-colors disabled:opacity-50',
          className
        )}
      >
        {isPending ? 'กำลังออก...' : 'ออกจากระบบ'}
      </button>
    )
  }

  return (
    <button
      id="logout-full-btn"
      onClick={handleLogout}
      disabled={isPending}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium w-full disabled:opacity-50',
        className
      )}
    >
      <svg className={cn('w-4 h-4', isPending && 'animate-spin')} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        {isPending ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
        )}
      </svg>
      {isPending ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
    </button>
  )
}
