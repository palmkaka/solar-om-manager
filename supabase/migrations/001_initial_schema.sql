-- ============================================================
-- Migration 001: Initial Schema
-- Smart O&M Task & Appointment Manager
-- ============================================================

-- ENUM Types
CREATE TYPE user_role    AS ENUM ('admin', 'technician', 'client');
CREATE TYPE task_status  AS ENUM ('open', 'assigned', 'in_progress', 'pending_review', 'closed');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE asset_status AS ENUM ('normal', 'warning', 'error', 'offline');

-- ─── profiles ────────────────────────────────────────────────────────────────
-- ขยายจาก auth.users — สร้างอัตโนมัติผ่าน Trigger
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  role        user_role   NOT NULL DEFAULT 'client',
  phone       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'ข้อมูลผู้ใช้งาน (ขยายจาก auth.users)';

-- ─── sites ───────────────────────────────────────────────────────────────────
CREATE TABLE public.sites (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID        NOT NULL REFERENCES public.profiles(id),
  name         TEXT        NOT NULL,
  address      TEXT,
  lat          NUMERIC(10, 7),
  lng          NUMERIC(10, 7),
  capacity_kw  NUMERIC(8, 2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.sites IS 'ไซต์ติดตั้งโซลาร์เซลล์';
CREATE INDEX idx_sites_client_id ON public.sites(client_id);

-- ─── assets ──────────────────────────────────────────────────────────────────
CREATE TABLE public.assets (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id       UUID         NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  name          TEXT         NOT NULL,
  brand         TEXT,                              -- 'huawei' | 'growatt' | etc.
  serial_no     TEXT         UNIQUE,
  external_id   TEXT,                              -- ID จาก API ภายนอก
  status        asset_status NOT NULL DEFAULT 'normal',
  last_data     JSONB,                             -- Raw data ล่าสุดจาก Inverter
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.assets IS 'อุปกรณ์โซลาร์ เช่น Inverter, Solar Panel';
CREATE INDEX idx_assets_site_id   ON public.assets(site_id);
CREATE INDEX idx_assets_status    ON public.assets(status);
CREATE INDEX idx_assets_external  ON public.assets(external_id);

-- ─── tasks ───────────────────────────────────────────────────────────────────
CREATE TABLE public.tasks (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id         UUID          REFERENCES public.sites(id),
  asset_id        UUID          REFERENCES public.assets(id),
  assigned_to     UUID          REFERENCES public.profiles(id),
  created_by      UUID          REFERENCES public.profiles(id),
  title           TEXT          NOT NULL,
  description     TEXT,
  status          task_status   NOT NULL DEFAULT 'open',
  priority        task_priority NOT NULL DEFAULT 'medium',
  is_auto_created BOOLEAN       NOT NULL DEFAULT FALSE,
  due_date        DATE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.tasks IS 'งานซ่อมบำรุง — ทั้งสร้างด้วยตนเองและจาก IoT Alert';
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_status      ON public.tasks(status);
CREATE INDEX idx_tasks_site_id     ON public.tasks(site_id);
CREATE INDEX idx_tasks_asset_id    ON public.tasks(asset_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── appointments ────────────────────────────────────────────────────────────
CREATE TABLE public.appointments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         UUID        REFERENCES public.tasks(id) ON DELETE CASCADE,
  technician_id   UUID        REFERENCES public.profiles(id),
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_min    INT         NOT NULL DEFAULT 60,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.appointments IS 'นัดหมายการเข้าปฏิบัติงาน';
CREATE INDEX idx_appointments_task_id       ON public.appointments(task_id);
CREATE INDEX idx_appointments_technician_id ON public.appointments(technician_id);
CREATE INDEX idx_appointments_scheduled_at  ON public.appointments(scheduled_at);

-- ─── task_logs ───────────────────────────────────────────────────────────────
CREATE TABLE public.task_logs (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID        NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id   UUID        REFERENCES public.profiles(id),
  action      TEXT        NOT NULL,  -- 'status_changed' | 'comment' | 'photo_uploaded' | 'assigned'
  payload     JSONB,                 -- { old_status, new_status, photo_url, comment, ... }
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.task_logs IS 'Timeline ประวัติการเปลี่ยนแปลงของแต่ละ Task';
CREATE INDEX idx_task_logs_task_id   ON public.task_logs(task_id);
CREATE INDEX idx_task_logs_author_id ON public.task_logs(author_id);

-- ─── error_debounce ──────────────────────────────────────────────────────────
CREATE TABLE public.error_debounce (
  asset_id       UUID        PRIMARY KEY REFERENCES public.assets(id) ON DELETE CASCADE,
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_count    INT         NOT NULL DEFAULT 1,
  task_created   BOOLEAN     NOT NULL DEFAULT FALSE
);
COMMENT ON TABLE public.error_debounce IS 'State machine สำหรับ debounce IoT Error — ป้องกันแจ้งเตือนมั่ว';
