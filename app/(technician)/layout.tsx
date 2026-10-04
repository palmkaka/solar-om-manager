import { getCurrentUser } from '@/lib/actions/auth'
import { LogoutButton } from '@/components/shared/LogoutButton'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/my-tasks',     icon: '🔧', label: 'งานของฉัน'   },
  { href: '/appointments', icon: '📅', label: 'นัดหมาย'     },
  { href: '/profile',      icon: '👤', label: 'โปรไฟล์'     },
] as const

export default async function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.role !== 'technician') redirect('/login')

  const initials = user.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Mobile Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow shadow-amber-500/20">
            <svg className="w-4.5 h-4.5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-900 font-semibold text-sm leading-none">Solar O&amp;M</p>
            <p className="text-gray-500 text-[10px]">ช่างเทคนิค</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Avatar + name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-500/20 border border-blue-400/20 flex items-center justify-center text-blue-300 text-xs font-bold">
              {initials}
            </div>
          </div>
          <LogoutButton variant="icon" />
        </div>
      </header>

      {/* Content */}
      <main className="pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 flex items-center justify-around py-2 z-20 safe-b">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-5 py-1.5 text-gray-500 hover:text-amber-400 active:text-amber-400 transition-colors min-w-0"
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
