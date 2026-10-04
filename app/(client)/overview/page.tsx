import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ภาพรวมระบบ | Solar O&M Manager',
  description: 'ติดตามสถานะการผลิตพลังงานแสงอาทิตย์และงานซ่อมบำรุง',
}

export default function ClientOverviewPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบโซลาร์เซลล์</h1>
        <p className="text-gray-500 text-sm mt-1">ข้อมูล ณ วันนี้</p>
      </div>

      {/* Energy Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { label: 'พลังงานวันนี้', value: '—', unit: 'kWh', icon: '⚡' },
          { label: 'ประหยัดค่าไฟ', value: '—', unit: 'บาท', icon: '💰' },
          { label: 'ลด CO₂', value: '—', unit: 'kg', icon: '🌱' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">{stat.icon}</div>
            <p className="text-2xl font-bold text-gray-900">{stat.value} <span className="text-base font-normal text-gray-500">{stat.unit}</span></p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 border-dashed rounded-2xl p-12 text-center">
        <p className="text-gray-500 text-sm">🚧 Energy Chart และ Site Status Cards จะเพิ่มใน Phase 6</p>
      </div>
    </div>
  )
}
