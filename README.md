# ระบบยืม-คืนอุปกรณ์สำหรับอาจารย์และบุคลากรในสาขาวิชา (Equipment Borrowing System)

เว็บแอปพลิเคชันจัดการการยืม-คืนอุปกรณ์การเรียนการสอนและอุปกรณ์ไอที พัฒนาด้วย **Next.js (App Router)**, **Tailwind CSS**, **Lucide React Icons** และ **Supabase (PostgreSQL + Real-time + Storage + RLS)**

---

## 🌟 ฟีเจอร์หลักของระบบ

### 1. ส่วนผู้ใช้งานทั่วไป (อาจารย์ / เจ้าหน้าที่)
- 📦 **หน้าแสดงรายการอุปกรณ์ Real-time**: แสดงรายการอุปกรณ์ทั้งหมด พร้อมรูปภาพ หมวดหมู่ คำอธิบาย และจำนวนคงเหลือที่อัปเดตแบบสดๆ (Real-time) ทันทีที่มีการยืมหรือคืน
- 🛒 **ระบบตะกร้าเลือกยืม (Cart Drawer)**: เลือกอุปกรณ์ลงตะกร้าได้หลายชิ้น ปรับเพิ่ม-ลดจำนวนตามสต็อกที่มีอยู่จริง
- 📝 **ฟอร์มยืนยันการยืม**: กรอกชื่อผู้ยืม, อีเมล, เบอร์โทรศัพท์, วัตถุประสงค์ในการยืม และกำหนดวันส่งคืน
- ⚡ **Atomic Stock Deduction**: ตัดสต็อกทันทีด้วย PostgreSQL Stored Procedure (`borrow_equipment`) ป้องกันปัญหาแย่งกันยืม (Race Condition) หรือของติดลบ

### 2. ส่วนผู้ดูแลระบบ (Admin Dashboard)
- 🔐 **ระบบเข้าสู่ระบบ Admin**: ล็อกอินผ่าน Supabase Authentication ปลอดภัยตามมาตรฐาน
- 📊 **สถิติภาพรวม (Analytics Cards)**: สรุปจำนวนอุปกรณ์ที่กำลังถูกยืมอยู่, จำนวนที่คืนแล้ว, จำนวนอุปกรณ์คงเหลือ และชนิดของอุปกรณ์
- 🛠️ **จัดการอุปกรณ์ (CRUD)**: เพิ่ม แก้ไข ลบ อุปกรณ์ พร้อมระบบอัปโหลดรูปภาพเข้าสู่ **Supabase Storage Bucket (`equipment-images`)**
- 📋 **ตารางประวัติการยืม-คืน**: ตรวจสอบข้อมูลผู้ยืม รายการอุปกรณ์ และวันเวลาที่ยืม/กำหนดคืน
- 🔄 **ปุ่มกดรับคืนอุปกรณ์**: กดปุ่มเพื่อเปลี่ยนสถานะเป็น "คืนแล้ว" พร้อม**เพิ่มสต็อกอุปกรณ์กลับคืนอัตโนมัติ**ผ่าน Stored Procedure (`return_equipment`)
- 📥 **Export Data**: ปุ่มส่งออกประวัติการยืมทั้งหมดเป็นไฟล์ **CSV (Excel)** รองรับภาษาไทย (UTF-8 with BOM)

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มต้นใช้งาน (Quick Setup)

### 1. ตั้งค่าฐานข้อมูลบน Supabase
1. สมัครหรือเข้าสู่ระบบที่ [Supabase.com](https://supabase.com) แล้วสร้างโปรเจกต์ใหม่
2. ไปที่เมนู **SQL Editor** ใน Supabase Dashboard
3. คัดลอกโค้ดจากไฟล์ `supabase/schema.sql` ไปวางแล้วกด **Run** เพื่อสร้างตาราง, Stored Procedures, Storage Bucket และ RLS Policies
4. *(แนะนำ)* คัดลอกโค้ดจากไฟล์ `supabase/seed.sql` ไปวางแล้วกด **Run** เพื่อเพิ่มข้อมูลตัวอย่างอุปกรณ์เริ่มต้น 8 รายการสำหรับการทดสอบ
5. ไปที่เมนู **Authentication > Users** กด **Add User** เพื่อสร้างบัญชี Admin สำหรับเข้าใช้งาน Dashboard (เช่น `admin@univ.ac.th` และกำหนดรหัสผ่าน)

---

### 2. ตั้งค่าโปรเจกต์ Next.js
เปิด Terminal ในโฟลเดอร์โปรเจกต์ `equipment-borrow-app` แล้วดำเนินการดังนี้:

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. ตั้งค่าไฟล์ Environment Variables
# คัดลอก .env.local.example เป็น .env.local
cp .env.local.example .env.local
```

เปิดไฟล์ `.env.local` แล้วใส่ค่า URL และ Anon Key ที่ได้จาก Supabase Dashboard (**Project Settings > API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

### 3. รันโปรเจกต์

```bash
npm run dev
```

เปิดเว็บเบราว์เซอร์:
- 🌐 **หน้าผู้ใช้งานทั่วไป**: [http://localhost:3000](http://localhost:3000)
- 🔐 **หน้าเข้าสู่ระบบ Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- 📊 **หน้า Admin Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## 📁 โครงสร้างโฟลเดอร์ (Folder Structure)

```text
equipment-borrow-app/
├── app/
│   ├── globals.css                    # Tailwind Global Styles & Custom Scrollbar
│   ├── layout.tsx                     # Root Layout ครอบ CartProvider
│   ├── page.tsx                       # หน้าหลักผู้ใช้: รายการอุปกรณ์ Real-time + ตะกร้า
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx               # หน้าล็อกอิน Admin (Supabase Auth)
│   │   └── dashboard/
│   │       └── page.tsx               # Admin Dashboard จัดการครบวงจร
├── components/
│   ├── Navbar.tsx                     # Header เมนูด้านบน
│   ├── EquipmentCard.tsx              # การ์ดแสดงอุปกรณ์ พร้อมปุ่มยืม
│   ├── CartDrawer.tsx                 # แถบตะกร้าสินค้าสไลด์ออกด้านข้าง
│   ├── BorrowModal.tsx                # ฟอร์มยืนยันการยืมอุปกรณ์
│   └── admin/
│       ├── StatsCards.tsx             # การ์ดแสดงสถิติ Analytics
│       ├── ItemManagerModal.tsx       # Modal เพิ่ม/แก้ไขอุปกรณ์ + อัปโหลดรูปภาพ
│       └── BorrowHistoryTable.tsx     # ตารางประวัติการยืม + ปุ่มรับคืน
├── context/
│   └── CartContext.tsx                # State ตะกร้าสินค้า (Persistent with LocalStorage)
├── lib/
│   ├── supabase/
│   │   └── client.ts                  # Supabase Client setup
│   ├── types.ts                       # TypeScript Data Types
│   └── utils.ts                       # Helper functions (Date formatting, Export CSV)
├── supabase/
│   ├── schema.sql                     # SQL Schema, Stored Procedures, RLS, Storage Bucket
│   └── seed.sql                       # Mock Data สำหรับทดสอบ
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.mjs
└── .env.local
```
