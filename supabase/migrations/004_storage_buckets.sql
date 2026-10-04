-- ============================================================
-- Migration 004: Storage Buckets
-- ============================================================

-- Bucket สำหรับรูปหน้างาน (อัปโหลดโดยช่าง)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-photos',
  'site-photos',
  false,                          -- Private: ต้องใช้ Signed URL
  5242880,                        -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket สำหรับ Avatar ผู้ใช้
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,                           -- Public: แสดงได้โดยตรง
  2097152,                        -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ─── Storage RLS Policies ─────────────────────────────────────────────────────

-- site-photos: ช่างอัปโหลดได้ | Admin เห็นทั้งหมด | Client เห็นของไซต์ตัวเอง
CREATE POLICY "site-photos: technician upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'site-photos' AND
    (get_my_role() = 'admin' OR get_my_role() = 'technician')
  );

CREATE POLICY "site-photos: admin read all"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'site-photos' AND get_my_role() = 'admin'
  );

CREATE POLICY "site-photos: technician read own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'site-photos' AND
    get_my_role() = 'technician' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatars: ทุกคน read | เจ้าของ upload/update/delete
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: self upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars: self update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
