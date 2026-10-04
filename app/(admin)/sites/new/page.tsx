import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'เพิ่มไซต์ใหม่' }

export default function NewSitePage() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      
      {/* Back & Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/sites" className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>เพิ่มไซต์งานใหม่</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>กรอกข้อมูลพื้นฐานเพื่อสร้างไซต์งาน</p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-sm" style={{ borderColor: 'var(--border)' }}>
        
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>แบบฟอร์มการเพิ่มไซต์งาน</h2>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            ฟีเจอร์นี้อยู่ระหว่างการพัฒนาใน Phase 2 (ส่วนของการเชื่อมต่อกับระบบฐานข้อมูลลูกค้าและอุปกรณ์จริง)
          </p>
          <div className="mt-8">
            <Link 
              href="/sites" 
              className="px-6 py-2.5 bg-gray-100 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
              style={{ color: 'var(--text-primary)' }}
            >
              กลับไปหน้าไซต์งาน
            </Link>
          </div>
        </div>

      </div>
    </div>
  )
}
