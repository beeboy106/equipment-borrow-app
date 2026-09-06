# Project Manifest & Architecture Context

> **Directive สำหรับ AI ทุกตัว**: อ่านเอกสารนี้เป็นลำดับแรกเพื่อทำความเข้าใจ State ปัจจุบัน, สถาปัตยกรรม, ข้อจำกัด และงานที่กำลังทำอยู่ ห้ามเริ่มแก้ไขโค้ดจนกว่าจะเข้าใจกฎในเอกสารนี้ และเมื่อทำงานในส่วน In Progress เสร็จสิ้น ให้อัปเดต Checklist ในหัวข้อ 5 ให้เป็นสถานะล่าสุดก่อนปิดงานเสมอ

---

## 1. Project Overview & Core Goals
- **Product**: ระบบยืม-คืนอุปกรณ์การเรียนการสอนและไอที (Equipment Borrowing System)
- **Core Value**: 
  - จัดการข้อมูลและสต็อกอุปกรณ์แบบ Real-time (Supabase Real-time)
  - ป้องกันการแย่งยืมหรือสต็อกติดลบ (Race Condition) ด้วย PostgreSQL Stored Procedures แบบ Atomic
  - อำนวยความสะดวกให้ผู้ยืม (อาจารย์, บุคลากร, นักศึกษา) ผ่านระบบตะกร้า (Cart Drawer) และหน้าติดตามสถานะคำขอของตนเอง (`/my-requests`)
  - มีระบบ Admin Dashboard จัดการอนุมัติคำขอ, กำหนดจำนวนที่อนุมัติจริง, นัดหมายเวลารับของ, จัดการคลังอุปกรณ์ (CRUD + รูปภาพ), และรับคืนอุปกรณ์พร้อมคืนสต็อกอัตโนมัติ
  - ระบบแจ้งเตือนทางอีเมลผ่าน Resend
- **Current Stage**: Active Development / Feature Enhancement

---

## 2. Tech Stack & Environment
- **Runtime & Language**: Node.js / TypeScript 5.7+
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Lucide React
- **Backend & Database**: Supabase (PostgreSQL 16, Supabase Auth, Supabase Storage, Real-time, Stored Procedures & RLS)
- **Email Service**: Resend API (`/api/send-email`)
- **State Management**: React Context (`CartContext`) ร่วมกับ `localStorage` สำหรับ Client-side Cart State
- **Key Libraries**: `@supabase/supabase-js`, `resend`, `clsx`, `tailwind-merge`, `lucide-react`

---

## 3. Directory Map & Architecture Pattern
- **Pattern**: Next.js App Router with Component-based / Modular Architecture
- **Key Directories**:
  - `app/`: Next.js App Router (Routes & Pages)
    - `app/page.tsx`: หน้าหลัก แสดงรายการอุปกรณ์ Real-time, ค้นหา, กรองหมวดหมู่, และระบบตะกร้า
    - `app/login/page.tsx`: หน้าเข้าสู่ระบบสำหรับผู้ใช้ทั่วไป (Google OAuth / Email)
    - `app/my-requests/page.tsx`: หน้ารายการและสถานะคำขอยืมของผู้ใช้
    - `app/admin/login/page.tsx`: หน้าเข้าสู่ระบบ Admin Dashboard
    - `app/admin/dashboard/page.tsx`: แดชบอร์ดผู้ดูแลระบบ (สถิติ, จัดการคำขอ, จัดการอุปกรณ์, ส่งออก CSV)
    - `app/api/send-email/route.ts`: API Route สำหรับส่งอีเมลแจ้งเตือนผ่าน Resend
  - `components/`: Reusable UI Components
    - `EquipmentCard.tsx`, `CartDrawer.tsx`, `BorrowModal.tsx`, `FloatingCartBar.tsx`, `Navbar.tsx`
  - `components/admin/`: แผงควบคุมและ Modal สำหรับผู้ดูแลระบบ
    - `StatsCards.tsx`: การ์ดแสดงสรุปสถิติ Analytics
    - `BorrowHistoryTable.tsx`: ตารางคำขอยืม-คืน พร้อมตัวกรองสถานะและปุ่มรับคืน
    - `ItemManagerModal.tsx`: ฟอร์มเพิ่ม/แก้ไขอุปกรณ์ พร้อมอัปโหลดรูปภาพเข้า Supabase Storage
    - `ApprovalModal.tsx`: โมดอลพิจารณาอนุมัติ/ปฏิเสธคำขอ พร้อมระบุจำนวนและเวลานัดรับ
  - `context/`:
    - `CartContext.tsx`: Context จัดการตะกร้าสินค้า พร้อมซิงก์ LocalStorage
  - `lib/`:
    - `lib/supabase/client.ts`: Supabase Client initialization
    - `lib/types.ts`: TypeScript Interfaces & Types (`Item`, `BorrowRequest`, `CartItem`, ฯลฯ)
    - `lib/utils.ts`: Helper functions (จัดรูปแบบวันที่, ส่งออก CSV with BOM)
    - `lib/resend.ts`: ฟังก์ชันสร้างเทมเพลตและส่งอีเมลด้วย Resend
  - `supabase/`:
    - `schema.sql`: โครงสร้างตาราง (`items`, `borrow_requests`, `borrow_items`), Stored Procedures, RLS policies, Storage bucket
    - `seed.sql`: ข้อมูลอุปกรณ์เริ่มต้นสำหรับการทดสอบ
  - `ck/`: Context Keeper utility สำหรับจัดการ Memory และบริบทของโปรเจกต์

---

## 4. Design Patterns & Coding Standards (Non-Negotiable)
- **Database & Stock Integrity**: การตัดสต็อกและคืนสต็อกอุปกรณ์ต้องทำผ่าน PostgreSQL Stored Procedures (`borrow_equipment`, `return_equipment`) เสมอเพื่อความเป็น Atomic และป้องกัน Race Condition
- **Role-Based Access Control**:
  - ผู้ใช้งานทั่วไป: เข้าสู่ระบบผ่าน Google OAuth หรือ Email (สิทธิ์ดูอุปกรณ์, ขอยืม, ดูคำขอตนเอง)
  - แอดมิน: ตรวจสอบสิทธิ์โดยต้องเป็นบัญชีที่ล็อกอินด้วย Email & Password ที่กำหนดไว้ใน Supabase Auth เท่านั้น
- **Data Validation & Formatting**:
  - ข้อมูลวันที่และเวลาใช้ฟังก์ชันใน `lib/utils.ts` เพื่อแสดงผลภาษาไทยอย่างสม่ำเสมอ
  - การส่งออกไฟล์ CSV ต้องแนบ UTF-8 BOM (`\uFEFF`) เพื่อให้อ่านภาษาไทยใน Microsoft Excel ได้ถูกต้อง
- **Styling**: ใช้ Tailwind CSS Utility classes เท่านั้น ห้ามเขียน Inline styles หรือ vanilla CSS ที่ไม่จำเป็น

---

## 5. Current State & Pending Tasks (Progress Tracker)
- **Completed**:
  - [x] ออกแบบ Database Schema (`items`, `borrow_requests`, `borrow_items`) และ Stored Procedures
  - [x] ติดตั้ง Supabase Auth และ Storage Bucket (`equipment-images`)
  - [x] หน้าแสดงรายการอุปกรณ์ Real-time พร้อมระบบค้นหาและตัวกรองหมวดหมู่ (`app/page.tsx`)
  - [x] ระบบตะกร้ายืมอุปกรณ์ (Cart Drawer + Floating Cart Bar + LocalStorage Persistence)
  - [x] ฟอร์มยื่นคำขอยืมอุปกรณ์และบันทึกแบบ Atomic Transaction (`components/BorrowModal.tsx`)
  - [x] หน้ารายการและติดตามสถานะคำขอยืมของฉัน (`app/my-requests/page.tsx`)
  - [x] แดชบอร์ดผู้ดูแลระบบพร้อมการ์ดสรุปสถิติ Analytics (`components/admin/StatsCards.tsx`)
  - [x] ระบบจัดการคลังอุปกรณ์ CRUD พร้อมอัปโหลดรูปภาพ (`components/admin/ItemManagerModal.tsx`)
  - [x] ตารางประวัติและจัดการคำขอยืม-คืน (`components/admin/BorrowHistoryTable.tsx`)
  - [x] โมดอลพิจารณาอนุมัติ/ปฏิเสธ และนัดหมายเวลารับของ (`components/admin/ApprovalModal.tsx`)
  - [x] ระบบรับคืนอุปกรณ์และคืนสต็อกอัตโนมัติ
  - [x] ฟังก์ชันส่งออกประวัติการยืมเป็นไฟล์ CSV (Excel ภาษาไทย)
  - [x] สร้างโครงสร้าง API ส่งอีเมลแจ้งเตือนผ่าน Resend (`app/api/send-email/route.ts`)
  - [x] เชื่อมต่อและลงทะเบียน Context Keeper (`ck/`) ให้กับโปรเจกต์
  - [x] ปรับปรุง UX/UI: สร้าง Reusable `ToastContainer` และ `ConfirmModal` แทนที่ browser `alert()` / `confirm()` ทั้งหมด
  - [x] ระบบตัวกรองอิสระฝั่ง Admin: แท็บสถานะพร้อมป้ายนับจำนวน (Badge counters), แท็บ **⚠️ เกินกำหนดคืน (Overdue)**, ตัวกรองกลุ่มผู้ใช้, ระบบจัดเรียง (Sorting), และปุ่มล้างตัวกรอง
  - [x] ฟังก์ชัน "ยกเลิกคำขอ" (Cancel Request) ฝั่งผู้ใช้ในหน้า `/my-requests` สำหรับคำขอสถานะ `pending` พร้อม Modal ยืนยัน
  - [x] ปรับปรุงการ Export CSV ให้ส่งออกเฉพาะรายการที่ผ่านการกรองบนหน้าจอ
  - [x] ปรับปรุงระบบอีเมล: ส่งแจ้งเตือนคำขอยืมใหม่เฉพาะอีเมล Admin (`ADMIN_NOTIFICATION_EMAIL`) และให้ผู้ใช้ติดตามสถานะผ่านหน้าเว็บแทน
  - [x] แก้ไขสีส่วนหัวของอีเมลแจ้งเตือน Admin ให้แสดงผลคมชัดใน Outlook (ใช้สีตัวอักษรเข้มบนพื้นหลังอ่อน ป้องกันพื้นหลังถูกบล็อก)
  - [x] ปรับปรุง Typography และ Responsive Layout ของตารางใน Admin Dashboard: กำหนด `min-w` ป้องกันการบีบอัดของคอลัมน์, จัดสรรสัดส่วนความกว้างอย่างลงตัว, และเพิ่ม `whitespace-nowrap` ให้กับป้ายสถานะ (Status Badges), ปุ่มกดจัดการ และวันที่ เพื่อแก้ปัญหาคำและพยางค์ภาษาไทยตกบรรทัด
  - [x] เพิ่มระบบกรองคำขอตามวันที่และเดือนใน Admin Dashboard: รองรับการเลือกตาม "ระบุเดือน" (Month Picker พร้อมปุ่มลัดเดือนนี้), "ระบุวันที่" (Date Picker พร้อมปุ่มลัดวันนี้), และ "ช่วงวันที่" (Date Range จาก-ถึง) พร้อมตัวเลือกฟิลด์วันที่อิงตาม (วันที่ส่งคำขอ / วันใช้งาน / กำหนดคืน)
  - [x] ปรับปรุง Mobile Responsive Layout ให้เสถียรและใช้งานง่าย: แก้ไข Header ตัดตกขอบบน, ปรับปุ่มลัดให้กะทัดรัดไม่ตกบรรทัด, ปรับ Stats Cards เป็น 2x2 Grid ประหยัดพื้นที่บนมือถือ, ปรับขนาด Tab และ Search Tools ให้พอดีกับหน้าจอ, และเพิ่มแถบคำแนะนำการเลื่อนตารางแนวนอน (Swipe Hint)
  - [x] ยกระดับ UX บนมือถือด้วย Mobile Card View & Expandable Accordion: แปลงตารางเลื่อนแนวนอนบนมือถือ (<768px) เป็นการ์ดที่แสดงข้อมูลสำคัญและปุ่มอนุมัติ/ไม่อนุมัติ/รับคืนให้กดได้ทันที พร้อมปุ่มคลี่กางดูรายละเอียดติดต่อและวัตถุประสงค์ในหน้าเดียว สำหรับทั้งคำขอยืมและคลังอุปกรณ์ (โดยคงตารางเต็มไว้บน Desktop)
  - [x] ออกแบบ Mobile Floating Cards ใน Admin Dashboard ให้แยกเป็นรายคำขออย่างชัดเจนและเด็ดขาด: เปลี่ยนจากการ์ดติดกันในกล่องเดียว เป็น Floating Cards อิสระแยกกันด้วยระยะห่าง มีแถบสีซ้ายมือระบุสถานะ (`border-l-[6px]`), แถบหัวการ์ดแสดงลำดับคำขอ (`คำขอที่ #X`) พร้อมรหัสคำขอ, และแยกปุ่ม Action ("อนุมัติ"/"ไม่อนุมัติ"/"รับคืน") เข้ากล่อง Action Footer สีเทาด้านล่างการ์ดอย่างชัดเจน ป้องกันการสับสนหรือกดอนุมัติผิดรายการ 100%
  - [x] ยกระดับ UX/UI ฝั่ง Mobile สำหรับผู้ใช้งาน (Client-Side Mobile Optimization): แก้ไข Navbar ชื่อแบรนด์ถูกตัดทอน (`ระบบยื...`), ปรับขนาดปุ่มขวามือและ Avatar ให้กะทัดรัด, ปรับขนาดความสูง Hero Banner ให้กระชับไม่กินพื้นที่ครึ่งจอ, ปรับ FloatingCartBar ข้อความไม่ถูกบีบตัดทอน (`เลือ...`), ปรับปรุงการ์ดอุปกรณ์ (`EquipmentCard`), ตะกร้ายืม (`CartDrawer`), ฟอร์มยืนยัน (`BorrowModal`), และหน้าประวัติ (`MyRequestsPage`) ให้แสดงผลคมจัด ไม่ล้นจอ และคงรูปแบบ Desktop 100%
- **In Progress (งานที่กำลังทำค้างอยู่)**:
  - [/] การวางแผนยกระดับความปลอดภัย (Security & RLS): ปิดช่องโหว่ RLS บน Supabase สำหรับตาราง `items` และ `borrow_requests`
- **Next Up (งานที่ต้องทำถัดไป)**:
  - [ ] ปรับปรุงการแสดงผลรูปภาพด้วย Next.js Image Optimization และสร้าง Database Indexes



---

## 6. Critical Do's and Don'ts (Guardrails)
- **DO**: รัน `npm run build` หรือ `npm run lint` เพื่อตรวจสอบ Type checking และ Syntax ก่อนส่งมอบงาน
- **DO**: **อัปเดต Checklist ในหัวข้อ 5 (Current State & Pending Tasks) ของไฟล์นี้ให้เป็นสถานะล่าสุดก่อนปิดงานเสมอ** เมื่อทำงานในส่วน In Progress เสร็จสิ้น
- **DON'T**: ห้ามแก้ไขจำนวนสต็อกอุปกรณ์ในตาราง `items` โดยตรง ให้เรียกใช้ Stored Procedure ที่เตรียมไว้
- **DON'T**: ห้ามแก้ไขไฟล์ `context.json` หรือ `CONTEXT.md` ของ Context Keeper (`ck`) ด้วยตนเอง ให้ใช้สคริปต์ของ `ck`
- **DON'T**: ห้ามติดตั้ง Dependencies ใหม่เพิ่มเติมโดยไม่ได้รับความเห็นชอบจากผู้ใช้
