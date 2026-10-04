import type { Metadata } from 'next'
import InteractiveLeftPanel from '@/components/auth/InteractiveLeftPanel'

export const metadata: Metadata = {
  title: {
    default: 'เข้าสู่ระบบ',
    template: '%s | Solar O&M Manager',
  },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex animate-fade-in">

      <InteractiveLeftPanel />

      {/* ─── Right Panel: Form (White) ────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-gray-50/50">
        
        {/* Subtle decorative elements for the right panel */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
        
        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg bg-green-600">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-xl text-gray-900 block">Solar O&amp;M</span>
              <span className="font-bold text-xs text-green-600 uppercase tracking-widest">Manager</span>
            </div>
          </div>

          {/* Form Card with hover lift effect */}
          <div className="rounded-[2rem] border bg-white shadow-xl shadow-gray-200/50 p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:shadow-green-900/5 hover:-translate-y-1" style={{ borderColor: 'var(--border)' }}>
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}
