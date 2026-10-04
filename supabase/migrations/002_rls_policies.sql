-- ============================================================
-- Migration 002: Row-Level Security (RLS) Policies
-- Smart O&M Task & Appointment Manager
-- Run AFTER 001 initial schema is applied
-- ============================================================

-- ─── Enable RLS on all tables ────────────────────────────────────────────────
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_debounce ENABLE ROW LEVEL SECURITY;

-- Helper: ดึง role ของ user ปัจจุบัน
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── profiles ────────────────────────────────────────────────────────────────
CREATE POLICY "profiles: self read"
  ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY "profiles: self update"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "profiles: admin insert"
  ON public.profiles FOR INSERT
  WITH CHECK (public.get_my_role() = 'admin');

-- ─── sites ───────────────────────────────────────────────────────────────────
CREATE POLICY "sites: admin all"
  ON public.sites FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "sites: client own"
  ON public.sites FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "sites: technician assigned"
  ON public.sites FOR SELECT
  USING (
    public.get_my_role() = 'technician' AND
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.site_id = sites.id
        AND tasks.assigned_to = auth.uid()
    )
  );

-- ─── assets ──────────────────────────────────────────────────────────────────
CREATE POLICY "assets: admin all"
  ON public.assets FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "assets: client own sites"
  ON public.assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = assets.site_id
        AND sites.client_id = auth.uid()
    )
  );

CREATE POLICY "assets: technician assigned tasks"
  ON public.assets FOR SELECT
  USING (
    public.get_my_role() = 'technician' AND
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.asset_id = assets.id
        AND tasks.assigned_to = auth.uid()
    )
  );

-- ─── tasks ───────────────────────────────────────────────────────────────────
CREATE POLICY "tasks: admin all"
  ON public.tasks FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "tasks: technician own"
  ON public.tasks FOR SELECT
  USING (assigned_to = auth.uid());

CREATE POLICY "tasks: technician update own"
  ON public.tasks FOR UPDATE
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Client เห็นเฉพาะงานที่ปิดแล้ว ของไซต์ตัวเอง
CREATE POLICY "tasks: client closed view"
  ON public.tasks FOR SELECT
  USING (
    public.get_my_role() = 'client' AND
    status IN ('closed', 'pending_review') AND
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = tasks.site_id
        AND sites.client_id = auth.uid()
    )
  );

-- ─── task_logs ───────────────────────────────────────────────────────────────
CREATE POLICY "task_logs: admin all"
  ON public.task_logs FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "task_logs: technician read own"
  ON public.task_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_logs.task_id
        AND tasks.assigned_to = auth.uid()
    )
  );

CREATE POLICY "task_logs: technician insert own"
  ON public.task_logs FOR INSERT
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tasks
      WHERE tasks.id = task_logs.task_id
        AND tasks.assigned_to = auth.uid()
    )
  );

-- ─── appointments ─────────────────────────────────────────────────────────────
CREATE POLICY "appointments: admin all"
  ON public.appointments FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "appointments: technician own"
  ON public.appointments FOR SELECT
  USING (technician_id = auth.uid());

-- ─── error_debounce ──────────────────────────────────────────────────────────
CREATE POLICY "error_debounce: admin only"
  ON public.error_debounce FOR ALL
  USING (public.get_my_role() = 'admin');

-- ─── Auto-create profile Trigger ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── Storage Bucket ──────────────────────────────────────────────────────────
-- สร้าง bucket สำหรับรูปหลักฐานของช่าง (Public Read, Auth Write)
-- ทำผ่าน Supabase Dashboard → Storage → New Bucket → ชื่อ: task-photos → Public: ON
-- หรือรัน SQL ด้านล่างใน SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('task-photos', 'task-photos', true);
