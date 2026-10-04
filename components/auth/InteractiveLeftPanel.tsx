'use client'

import { useRef, useState } from 'react'

const FeatureIcons = {
  iot: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  tasks: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  ),
  mobile: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
    </svg>
  ),
}

export default function InteractiveLeftPanel() {
  const panelRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!panelRef.current) return
    const rect = panelRef.current.getBoundingClientRect()
    // Add a small smooth delay using CSS transition on the background or just direct state
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="hidden lg:flex lg:w-[60%] relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-green-50 to-emerald-100"
    >
      {/* ─── Interactive Mouse Glow ───────────────────────────────────────── */}
      <div 
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.9), transparent 40%)`
        }}
      />
      
      {/* Additional ambient static glow */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/40 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3" />



      {/* Logo */}
      <div className="relative z-10 pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-md bg-green-600">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-xl leading-none text-gray-900">Solar O&amp;M</p>
            <p className="text-xs font-bold tracking-widest uppercase mt-0.5 text-green-700">Smart Manager</p>
          </div>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 w-full max-w-lg pointer-events-none">
        <div className="p-4">
          <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            ระบบศูนย์กลางจัดการ
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
              งานโซลาร์เซลล์อัจฉริยะ
            </span>
          </h2>
          <p className="text-base leading-relaxed text-gray-600 mb-8 font-medium">
            แอปพลิเคชันสำหรับใช้งานภายในองค์กร สำหรับ <span className="text-green-700 font-bold">Admin</span> และ <span className="text-green-700 font-bold">ช่างเทคนิค</span> พร้อมเชื่อมต่อระบบ IoT Monitoring 
          </p>

          {/* Feature list */}
          <div className="space-y-6">
            {[
              { icon: 'iot',    title: 'Realtime IoT',         desc: 'เชื่อมต่อข้อมูลอินเวอร์เตอร์แบบเรียลไทม์' },
              { icon: 'tasks',  title: 'Smart Task Management',  desc: 'วิเคราะห์และสร้างงานอัตโนมัติเมื่อพบปัญหา' },
              { icon: 'mobile', title: 'Technician Hub',         desc: 'รับงานและอัปเดตสถานะผ่านมือถือได้ทันที' },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-green-600 bg-white border border-green-100 shadow-sm">
                  {FeatureIcons[f.icon as keyof typeof FeatureIcons]}
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-gray-900 font-bold text-sm tracking-wide">{f.title}</p>
                  <p className="text-xs mt-0.5 text-gray-500 font-medium">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative z-10 pointer-events-none">
        <p className="text-xs font-medium text-gray-400">
          © 2026 EV Power Energy Co., Ltd. Internal Use Only.
        </p>
      </div>
    </div>
  )
}
