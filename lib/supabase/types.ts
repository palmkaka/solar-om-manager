/**
 * Database Types สำหรับ Supabase
 *
 * ⚠️  ไฟล์นี้เป็น placeholder — หลังจาก run migrations แล้ว
 * ให้ generate ไฟล์นี้ใหม่ด้วยคำสั่ง:
 *
 *   npx supabase gen types typescript --project-id <your-project-ref> > lib/supabase/types.ts
 *
 * หรือใช้ local Supabase:
 *   npx supabase gen types typescript --local > lib/supabase/types.ts
 */

export type UserRole = 'admin' | 'technician' | 'client'
export type TaskStatus = 'open' | 'assigned' | 'in_progress' | 'pending_review' | 'closed'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type AssetStatus = 'normal' | 'warning' | 'error' | 'offline'

export type Profile = {
  id: string
  full_name: string
  role: UserRole
  phone: string | null
  avatar_url: string | null
  created_at: string
}

export type Site = {
  id: string
  client_id: string
  name: string
  address: string | null
  lat: number | null
  lng: number | null
  capacity_kw: number | null
  created_at: string
}

export type Asset = {
  id: string
  site_id: string
  name: string
  brand: string | null
  serial_no: string | null
  external_id: string | null
  status: AssetStatus
  last_data: Record<string, unknown> | null
  updated_at: string
}

export type Task = {
  id: string
  site_id: string | null
  asset_id: string | null
  assigned_to: string | null
  created_by: string | null
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  is_auto_created: boolean
  due_date: string | null
  created_at: string
  updated_at: string
}

export type Appointment = {
  id: string
  task_id: string | null
  technician_id: string | null
  scheduled_at: string
  duration_min: number
  notes: string | null
  created_at: string
}

export type TaskLog = {
  id: string
  task_id: string
  author_id: string | null
  action: string
  payload: Record<string, unknown> | null
  created_at: string
}

export type ErrorDebounce = {
  asset_id: string
  first_seen_at: string
  last_seen_at: string
  error_count: number
  task_created: boolean
}

// ----- Joined / Extended Types -----

export type TaskWithRelations = Task & {
  site?: Pick<Site, 'id' | 'name'>
  asset?: Pick<Asset, 'id' | 'name' | 'brand'>
  assignee?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  logs?: TaskLog[]
}

export type SiteWithAssets = Site & {
  assets: Asset[]
  client?: Pick<Profile, 'id' | 'full_name' | 'phone'>
}

// ----- Supabase Database type (stub — replace after gen types) -----
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, 'created_at'>; Update: Partial<Profile> }
      sites: { Row: Site; Insert: Omit<Site, 'id' | 'created_at'>; Update: Partial<Site> }
      assets: { Row: Asset; Insert: Omit<Asset, 'id' | 'updated_at'>; Update: Partial<Asset> }
      tasks: { Row: Task; Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Task> }
      appointments: { Row: Appointment; Insert: Omit<Appointment, 'id' | 'created_at'>; Update: Partial<Appointment> }
      task_logs: { Row: TaskLog; Insert: Omit<TaskLog, 'id' | 'created_at'>; Update: Partial<TaskLog> }
      error_debounce: { Row: ErrorDebounce; Insert: ErrorDebounce; Update: Partial<ErrorDebounce> }
    }
    Enums: {
      user_role: UserRole
      task_status: TaskStatus
      task_priority: TaskPriority
      asset_status: AssetStatus
    }
  }
}
