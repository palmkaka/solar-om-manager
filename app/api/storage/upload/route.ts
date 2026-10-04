import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { STORAGE_BUCKET_SITE_PHOTOS, ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/constants'

/**
 * POST /api/storage/upload
 * สร้าง Signed URL สำหรับอัปโหลดรูปหน้างาน
 * ต้องล็อกอินแล้วเท่านั้น (Technician)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // ตรวจ Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as {
    fileName: string
    fileType: string
    fileSize: number
    taskId: string
  }

  // Validate
  if (!ALLOWED_IMAGE_TYPES.includes(body.fileType)) {
    return NextResponse.json(
      { error: `ไฟล์ต้องเป็น ${ALLOWED_IMAGE_TYPES.join(', ')} เท่านั้น` },
      { status: 400 }
    )
  }
  if (body.fileSize > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'ขนาดไฟล์ต้องไม่เกิน 5 MB' },
      { status: 400 }
    )
  }

  // Path: {userId}/{taskId}/{timestamp}_{fileName}
  const timestamp = Date.now()
  const ext = body.fileName.split('.').pop()
  const filePath = `${user.id}/${body.taskId}/${timestamp}.${ext}`

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET_SITE_PHOTOS)
    .createSignedUploadUrl(filePath)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    filePath,
    publicPath: filePath,
  })
}
