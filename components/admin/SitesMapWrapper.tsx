'use client'

import dynamic from 'next/dynamic'

// Dynamically import the map component with ssr: false 
// because leaflet requires window object which isn't available on the server
const SitesMap = dynamic(() => import('./SitesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-200">
      <div className="flex flex-col items-center animate-pulse">
        <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <span className="text-sm font-medium text-gray-400">กำลังโหลดแผนที่...</span>
      </div>
    </div>
  )
})

export default SitesMap
