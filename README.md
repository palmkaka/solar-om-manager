# Solar O&M Manager 🌞

**Smart O&M Task & Appointment Manager** — ระบบบริหารจัดการงานซ่อมบำรุงโซลาร์เซลล์แบบครบวงจร

Built with **Next.js 16 (App Router)** · **Supabase** · **Tailwind CSS** · **Vercel**

---

## ✨ Features

| Feature | Description |
|---|---|
| **Admin Dashboard** | ภาพรวมระบบ, IoT Alerts, Realtime Monitoring |
| **Task Management** | สร้าง/มอบหมาย/ติดตามงานซ่อมบำรุง |
| **IoT Integration** | เชื่อมต่อ Huawei FusionSolar & Growatt API |
| **Technician PWA** | Mobile-first app สำหรับช่าง (GPS Check-in, Photo Upload) |
| **Client Portal** | Read-only Dashboard สำหรับเจ้าของโซลาร์ |
| **Role-based Auth** | Admin / Technician / Client (Supabase Auth + RLS) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase project ([supabase.com](https://supabase.com))
- Vercel account (สำหรับ deploy)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd solar-om-manager
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

แก้ไขค่าใน `.env.local`:

```env
# Supabase (ดูจาก Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # ใช้ใน Server-side เท่านั้น

# IoT (ใส่เฉพาะที่ใช้)
HUAWEI_FUSION_SOLAR_URL=https://sg5.fusionsolar.huawei.com/thirdData
HUAWEI_FUSION_SOLAR_USER=your-username
HUAWEI_FUSION_SOLAR_SYSTEM_CODE=your-code

GROWATT_API_URL=https://server.growatt.com
GROWATT_USERNAME=your-username
GROWATT_PASSWORD=your-password

# Security
CRON_SECRET=your-random-secret-min-32-chars
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```

### 3. Supabase Setup

**Step 1:** รัน Migration ใน [SQL Editor](https://supabase.com/dashboard) ตามลำดับ:
```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_rls_policies.sql
```

**Step 2:** สร้าง Storage Bucket ชื่อ `task-photos` (Public)
- ไปที่ **Storage → New Bucket**
- ชื่อ: `task-photos`
- Public: ✅ เปิด

**Step 3:** สร้าง Admin User คนแรกผ่าน Supabase Dashboard:
- **Authentication → Users → Invite User**
- จากนั้น update `role = 'admin'` ในตาราง `profiles`

### 4. Development

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

> **Demo Mode**: หากยังไม่ได้ตั้งค่า Supabase จริง ระบบจะเข้า Demo Mode อัตโนมัติ
> สามารถล็อกอินด้วย Demo Accounts ที่หน้า Login ได้เลย

---

## 📦 Deploy บน Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial Solar O&M Manager"
git remote add origin <your-github-repo>
git push -u origin main
```

### 2. Import to Vercel
1. ไปที่ [vercel.com/new](https://vercel.com/new)
2. Import GitHub Repository นี้
3. เพิ่ม **Environment Variables** ทั้งหมดจาก `.env.local`
4. กด **Deploy**

### 3. Vercel Cron Job
`vercel.json` ตั้งค่า Cron ไว้แล้ว:
```json
{
  "crons": [{ "path": "/api/cron/fetch-inverter-data", "schedule": "*/15 * * * *" }]
}
```

> ⚠️ Cron Job ต้องการ Vercel **Pro Plan** หรือใช้ [GitHub Actions](https://docs.github.com/en/actions/writing-workflows/quickstart) แทน Free Plan ได้

---

## 🗂️ Project Structure

```
solar-om-manager/
├── app/
│   ├── (admin)/         # Admin: /dashboard, /tasks, /sites, /technicians
│   ├── (auth)/          # Login, Register
│   ├── (client)/        # Client Portal: /client/dashboard, /client/sites/[siteId]
│   ├── (technician)/    # Technician PWA: /my-tasks, /my-tasks/[taskId]
│   └── api/             # API Routes (Cron, Storage, Asset Refresh)
├── components/
│   ├── admin/           # InverterCard, Alert components
│   ├── technician/      # BottomNav, TaskActions, PhotoUploader
│   ├── shared/          # LogoutButton
│   └── ui/              # Badge, etc.
├── lib/
│   ├── actions/         # Server Actions (auth, tasks, sites, client, iot)
│   ├── iot/             # IoT Dispatcher + Huawei/Growatt/Mock clients
│   ├── supabase/        # Supabase client (server + browser)
│   └── utils/           # formatters, roles
└── supabase/
    └── migrations/      # 001: Schema, 002: RLS Policies
```

---

## 👥 User Roles

| Role | เข้าถึง | Home Page |
|---|---|---|
| **admin** | ทุก Route | `/dashboard` |
| **technician** | `/my-tasks/*` | `/my-tasks` |
| **client** | `/client/*` | `/client/dashboard` |

---

## 🔒 Security

- **Supabase Auth** — JWT-based authentication
- **Row Level Security (RLS)** — ทุกตารางมี Policy กำกับ (ดู `002_rls_policies.sql`)
- **Server Actions** — ทุก mutation ผ่าน Server-side เท่านั้น
- **Security Headers** — X-Frame-Options, X-Content-Type-Options (ใน `next.config.ts`)
- **CRON_SECRET** — ป้องกัน Cron endpoint ถูกเรียกโดยไม่ได้รับอนุญาต

---

## 📄 License

MIT
