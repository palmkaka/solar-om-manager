-- ============================================================
-- Seed Data (Development Only)
-- ============================================================

-- ⚠️ ไฟล์นี้ใช้สำหรับ Development เท่านั้น
-- ก่อน run seed ต้องสร้าง user ผ่าน Supabase Auth UI ก่อน แล้วแทน UUID ด้านล่าง

-- ─── Admin User ───────────────────────────────────────────────────────────────
-- สมมติ UUID ของ Admin จาก auth.users (แทนด้วย UUID จริงหลัง signup)
DO $$
DECLARE
  admin_id    UUID := '00000000-0000-0000-0000-000000000001';
  tech_id     UUID := '00000000-0000-0000-0000-000000000002';
  client_id   UUID := '00000000-0000-0000-0000-000000000003';
  site1_id    UUID := gen_random_uuid();
  asset1_id   UUID := gen_random_uuid();
  task1_id    UUID := gen_random_uuid();
BEGIN

-- อัปเดต Role (Trigger จะสร้าง profile อัตโนมัติ แต่ Role default = 'client')
UPDATE public.profiles SET role = 'admin',       full_name = 'สมชาย แอดมิน'    WHERE id = admin_id;
UPDATE public.profiles SET role = 'technician',  full_name = 'สมศักดิ์ ช่างดี'  WHERE id = tech_id;
UPDATE public.profiles SET role = 'client',      full_name = 'บริษัท โซลาร์ไทย' WHERE id = client_id;

-- ─── Sites ──────────────────────────────────────────────────────────────────
INSERT INTO public.sites (id, client_id, name, address, lat, lng, capacity_kw) VALUES
  (site1_id, client_id, 'โรงงาน A - นิคมบางปู', '9 ถ.สุขุมวิท ต.แพรกษา อ.เมือง สมุทรปราการ', 13.5656, 100.8987, 100.0);

-- ─── Assets ─────────────────────────────────────────────────────────────────
INSERT INTO public.assets (id, site_id, name, brand, serial_no, external_id, status) VALUES
  (asset1_id, site1_id, 'Inverter #1 (Huawei SUN2000-100KTL)', 'huawei', 'HW-SN-20240001', 'EXT-INV-001', 'normal');

-- ─── Tasks ──────────────────────────────────────────────────────────────────
INSERT INTO public.tasks (id, site_id, asset_id, assigned_to, created_by, title, description, status, priority) VALUES
  (task1_id, site1_id, asset1_id, tech_id, admin_id,
   'ตรวจสอบ Inverter #1 อุณหภูมิสูงผิดปกติ',
   'ระบบตรวจพบ Inverter #1 มีอุณหภูมิสูงกว่า 85°C ต่อเนื่อง 30 นาที กรุณาตรวจสอบพัดลม และ Heat Sink',
   'assigned', 'high');

-- ─── Appointments ────────────────────────────────────────────────────────────
INSERT INTO public.appointments (task_id, technician_id, scheduled_at, duration_min, notes) VALUES
  (task1_id, tech_id, NOW() + INTERVAL '1 day', 120, 'เตรียมอุปกรณ์ทำความสะอาด Heat Sink และ Thermal Paste สำรอง');

END $$;
