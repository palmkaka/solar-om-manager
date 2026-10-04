import { getCurrentUser } from '@/lib/actions/auth'
import { LogoutButton } from '@/components/shared/LogoutButton'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  
  // อนุญาตให้เข้าได้ถ้าเป็น client (ถ้าเป็น admin อยากเข้ามาดูมุมมองลูกค้าก็ได้)
  if (user.role === 'technician') redirect('/my-tasks')

  const initials = user.full_name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-900 selection:bg-amber-500/30">
      
      {/* Light & Premium Header for Clients */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          <Link href="/client/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg className="w-5 h-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-slate-800 leading-none tracking-tight">Solar Monitor</p>
              <p className="text-gray-500 text-[10px] mt-0.5">Client Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-semibold text-gray-600 leading-none">{user.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">ลูกค้า</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-gray-500 text-sm font-bold shadow-sm">
              {initials}
            </div>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <LogoutButton variant="icon" className="text-gray-500 hover:text-red-500 hover:bg-red-50" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto p-4 md:p-6 pb-20">
        {children}
      </main>

    </div>
  )
}
