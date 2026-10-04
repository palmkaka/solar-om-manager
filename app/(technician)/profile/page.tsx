import { getCurrentUser, signOut } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

export default async function TechnicianProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto animate-fade-in">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-900">โปรไฟล์ของฉัน</h1>

      {/* Profile Card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-md mb-4 border-2 border-white">
          {user.full_name.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-lg font-bold text-gray-900">{user.full_name}</h2>
        <p className="text-sm font-medium text-gray-500 mt-1">ช่างเทคนิค (Technician)</p>
        <p className="text-sm text-gray-400 mt-0.5">{user.phone || 'ยังไม่มีเบอร์โทรศัพท์'}</p>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold py-3.5 rounded-xl hover:bg-red-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            ออกจากระบบ
          </button>
        </form>
      </div>
    </div>
  )
}
