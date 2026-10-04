import { redirect } from 'next/navigation'

/**
 * Root page — redirect ไปหน้า Login
 * Middleware จะ intercept และ redirect ตาม Role หากล็อกอินแล้ว
 */
export default function RootPage() {
  redirect('/login')
}
