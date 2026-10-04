'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import Link from 'next/link'

// Create custom icons for different statuses
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-leaflet-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        position: relative;
        top: -12px;
        left: -12px;
      ">
        <div style="
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px 6px 0;
          border-style: solid;
          border-color: ${color} transparent transparent transparent;
        "></div>
      </div>
    `,
    iconSize: [0, 0], // The size is handled by CSS/HTML above relative to the pin
    iconAnchor: [0, 0],
  })
}

const icons = {
  normal: createIcon('#22c55e'), // green-500
  warning: createIcon('#eab308'), // yellow-500
  error: createIcon('#ef4444'), // red-500
}

interface Site {
  id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  capacity_kw: number | null
  assets: { status: string }[]
}

export default function SitesMap({ sites }: { sites: Site[] }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // We need to wait for client-side mounting because react-leaflet 
    // uses window/document which breaks SSR.
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <div className="w-full h-[400px] bg-gray-50 flex items-center justify-center rounded-2xl border border-gray-200">
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-sm font-medium text-gray-400">กำลังโหลดแผนที่...</span>
        </div>
      </div>
    )
  }

  // Filter sites with valid coordinates
  const mappedSites = sites.filter(s => s.lat != null && s.lng != null)
  
  // Center map on Thailand if no sites, otherwise center on the first site
  const center: [number, number] = mappedSites.length > 0 
    ? [mappedSites[0].lat!, mappedSites[0].lng!]
    : [13.736717, 100.523186]

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
      <MapContainer 
        center={center} 
        zoom={mappedSites.length > 0 ? 6 : 5} 
        scrollWheelZoom={false} 
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mappedSites.map(site => {
          // Determine overall status
          const hasError = site.assets.some(a => a.status === 'error' || a.status === 'offline')
          const hasWarning = site.assets.some(a => a.status === 'warning')
          const status = hasError ? 'error' : hasWarning ? 'warning' : 'normal'
          
          return (
            <Marker 
              key={site.id} 
              position={[site.lat!, site.lng!]}
              icon={icons[status]}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-gray-900 text-base mb-1">{site.name}</h3>
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                    {site.address || 'ไม่มีข้อมูลที่อยู่'}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3 text-sm">
                    <span className="text-gray-600 font-medium">ความจุ:</span>
                    <span className="font-bold text-gray-900">{site.capacity_kw} kW</span>
                  </div>
                  
                  <Link 
                    href={`/sites/${site.id}`}
                    className="block w-full py-2 bg-green-50 text-green-700 text-center text-xs font-bold rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                  >
                    ดูรายละเอียดไซต์
                  </Link>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      {/* CSS adjustments for leaflet to make it look cleaner within our UI */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container { font-family: inherit; z-index: 10; }
        .leaflet-popup-content-wrapper { border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
        .leaflet-popup-content { margin: 12px; }
      `}} />
    </div>
  )
}
