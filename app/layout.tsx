import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Solar O&M Manager',
    template: '%s | Solar O&M Manager',
  },
  description: 'ระบบจัดการงานซ่อมบำรุงโซลาร์เซลล์อัจฉริยะ',
  keywords: ['solar', 'O&M', 'maintenance', 'inverter', 'photovoltaic'],
  authors: [{ name: 'Solar O&M Team' }],
  robots: 'noindex, nofollow', // internal system
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full antialiased">
        {children}
      </body>
    </html>
  )
}
