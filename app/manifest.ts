import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Solar O&M Manager',
    short_name: 'Solar O&M',
    description: 'Smart Solar Operations & Maintenance Task Manager',
    start_url: '/my-tasks',
    display: 'standalone',
    background_color: '#0f172a', // slate-900
    theme_color: '#0f172a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
