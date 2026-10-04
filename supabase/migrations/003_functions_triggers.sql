-- ============================================================
-- Migration 003: Functions & Triggers
-- ============================================================

-- ─── Auto-create Profile on new User ─────────────────────────────────────────
-- เมื่อมีผู้ใช้ใหม่สมัครผ่าน Supabase Auth จะสร้าง profile อัตโนมัติ
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)  -- fallback: ใช้ username จาก email
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::user_role,
      'client'  -- default role
    )
  )
  ON CONFLICT (id) DO NOTHING;  -- ป้องกัน duplicate ในกรณี retry
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: ยิงหลัง INSERT ใน auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Auto-log Task Status Changes ────────────────────────────────────────────
-- เมื่อ status ของ Task เปลี่ยน จะบันทึก log อัตโนมัติ
CREATE OR REPLACE FUNCTION public.log_task_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.task_logs (task_id, author_id, action, payload)
    VALUES (
      NEW.id,
      auth.uid(),
      'status_changed',
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;

  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    INSERT INTO public.task_logs (task_id, author_id, action, payload)
    VALUES (
      NEW.id,
      auth.uid(),
      'assigned',
      jsonb_build_object(
        'assigned_to', NEW.assigned_to
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tasks_status_change_log
  AFTER UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.log_task_status_change();

-- ─── Auto-update Asset updated_at ────────────────────────────────────────────
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
