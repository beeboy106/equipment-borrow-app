# Project Manifest & Architecture Context

> **Directive สำหรับ AI และนักพัฒนา**: เอกสารนี้สรุปบริบท สถาปัตยกรรม เทคโนโลยี และสถานะการทำงานจริงของโปรเจกต์ในปัจจุบัน เป็น Source of Truth หลักสำหรับระบบ

---

## 1. Project Overview & Core Goals
- **ชื่อผลิตภัณฑ์**: ระบบยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง งานบริการกลาง คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์ (Catering & Event Equipment Borrowing System)
- **หน่วยงานเจ้าของระบบ**: งานบริการกลาง คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์ (Central Services Unit, Faculty of Science, Prince of Songkla University)
- **กลุ่มผู้ใช้งานหลัก**:
  1. **ผู้ยืม (Borrowers)**: อาจารย์, นักศึกษา, และบุคลากรภายในคณะวิทยาศาสตร์ (สังกัด 4 สาขาวิชา: วิทยาศาสตร์กายภาพ, วิทยาศาสตร์ชีวภาพ, วิทยาศาสตร์การคำนวณ, วิทยาศาสตร์สุขภาพและวิทยาศาสตร์ประยุกต์ และ 12 หน่วยงานสนับสนุน)
  2. **ผู้ดูแลระบบ (Administrators)**: เจ้าหน้าที่งานบริการกลาง คณะวิทยาศาสตร์ สำหรับบริหารจัดการคลังอุปกรณ์ อนุมัติคำขอ และตรวจรับของคืน
- **Core Values & Capabilities**:
  - แคตตาล็อกอุปกรณ์สำหรับงานจัดเลี้ยงและกิจกรรม (โต๊ะ, เก้าอี้, ภาชนะ, อุปกรณ์จัดเลี้ยง ฯลฯ) แสดงสถานะสต็อกแบบ Real-time
  - ป้องกันสต็อกผิดพลาดหรือการแย่งยืมชนกัน (Race Condition) ด้วย **Cloud Firestore Atomic Transactions**
  - ยื่นคำขอยืมล่วงหน้าผ่านระบบตะกร้า (Cart Drawer) บังคับกรอกข้อมูลติดต่อ สังกัด และวัตถุประสงค์ (รองรับการกรอก `-`) อย่างรัดกุม
  - ผู้ใช้สามารถติดตามสถานะการพิจารณาคำขอของตนเองได้แบบสดๆ ที่หน้า `/my-requests` พร้อมฟังก์ชันยกเลิกคำขอที่รอพิจารณา
  - แดชบอร์ดผู้ดูแลระบบ (Admin Dashboard) ครบวงจร: วิเคราะห์สถิติ, อนุมัติคำขอ (ระบุจำนวนที่อนุมัติและเวลานัดรับ), ปฏิเสธคำขอ (ระบุเหตุผล), รับคืนอุปกรณ์พร้อมคืนสต็อกเข้าคลังอัตโนมัติ, ระบบตรวจจับคำขอเกินกำหนดคืน (Overdue)
  - ระบบคัดกรองข้อมูลขั้นสูง: คัดกรองตามสถานะ, กลุ่มผู้ใช้งาน, ระบุเดือน, ระบุวันที่, หรือเลือกช่วงวันที่ (Date Range) และส่งออกประวัติเป็นไฟล์ CSV รองรับภาษาไทย (UTF-8 BOM)
  - การจัดการคลังอุปกรณ์ (CRUD): เพิ่ม ลบ แก้ไข พร้อมระบบอัปโหลดรูปภาพขึ้น **Firebase Storage**
  - ระบบแจ้งเตือนอีเมลอัตโนมัติผ่าน **Resend API** ส่งตรงถึงเจ้าหน้าที่แอดมินทันทีที่มีคำขอยืมใหม่
  - การยืนยันตัวตนระดับองค์กร (Google OAuth SSO) ทั้งฝั่งผู้ใช้งานทั่วไปและฝั่งผู้ดูแลระบบ (Google SSO + Admin Role Whitelist & Security Key Binding)

---

## 2. Tech Stack & Environment
- **Runtime & Framework**: Next.js 15.1 (App Router), React 19, TypeScript 5.7+
- **Styling & Icons**: Tailwind CSS 3.4, Lucide React Icons
- **Backend & Database**: **Google Firebase**
  - **Firebase Authentication**: Google OAuth Single Sign-On (SSO)
  - **Cloud Firestore**: Real-time NoSQL Database, Security Rules (`firestore.rules`), Firestore Transactions
  - **Firebase Storage**: จัดเก็บรูปภาพอุปกรณ์คลังจัดเลี้ยง (`items/`)
- **Email Service**: Resend API (`POST /api/send-email`)
- **State Management**: Zustand (`cartStore`) ผสาน LocalStorage และ React Context (`CartContext`)
- **Unit Testing**: Vitest 5.0 (ทดสอบความปลอดภัย, Security Sanitization, Rate Limiting, Utility functions)
- **Deployment Platform**: Vercel (Production CI/CD เชื่อมต่อกับ GitHub `main` branch)

---

## 3. Directory Map & Component Architecture
```text
equipment-borrow-app/
├── app/                                  # Next.js App Router
│   ├── page.tsx                          # หน้าแรก (Hero, Catalog อุปกรณ์จัดเลี้ยง, ค้นหา, กรองหมวดหมู่)
│   ├── layout.tsx                        # Root Layout, Title metadata, Viewport, Providers
│   ├── login/
│   │   └── page.tsx                      # หน้าล็อกอินผู้ใช้งานทั่วไป (Google OAuth)
│   ├── my-requests/
│   │   └── page.tsx                      # หน้าประวัติและติดตามสถานะคำขอยืมของผู้ใช้
│   ├── admin/
│   │   ├── page.tsx                      # Redirect ไปที่ /admin/login
│   │   ├── login/
│   │   │   └── page.tsx                  # หน้าเข้าสู่ระบบและลงทะเบียนสิทธิ์ Admin ด้วย Google + Security Key
│   │   └── dashboard/
│   │       └── page.tsx                  # หน้าแดชบอร์ดแอดมิน (Analytics, จัดการคำขอ, จัดการคลังอุปกรณ์)
│   └── api/
│       └── send-email/
│           └── route.ts                  # API Endpoint ส่งอีเมลแจ้งเตือนแอดมินผ่าน Resend
├── components/                           # Reusable UI Components
│   ├── Navbar.tsx                        # แถบนำทางด้านบน (แบรนด์งานบริการกลาง คณะวิทยาศาสตร์, ปุ่มตะกร้า, โปรไฟล์)
│   ├── EquipmentCard.tsx                 # การ์ดแสดงอุปกรณ์จัดเลี้ยง (รูป, สต็อก, ป้ายสถานะ, ปุ่มหยิบใส่ตะกร้า)
│   ├── CartDrawer.tsx                    # สไลด์ตะกร้าสินค้า ปรับเพิ่ม-ลดจำนวน ตรวจเช็คสต็อก
│   ├── FloatingCartBar.tsx               # แถบลอยล่างจอสรุปตะกร้าและปุ่มเปิดดูรายการ
│   ├── BorrowModal.tsx                   # ฟอร์มยื่นคำขอยืมอุปกรณ์ล่วงหน้า (Validate เบอร์โทร, สังกัด, วัตถุประสงค์)
│   ├── ChunkErrorHandler.tsx             # ดักจับข้อผิดพลาดการโหลด Chunk บน Next.js
│   ├── ui/
│   │   ├── ConfirmModal.tsx              # โมดอลยืนยันการดำเนินการ (เช่น ยกเลิกคำขอ, ลบอุปกรณ์)
│   │   └── Toast.tsx                     # แจ้งเตือนข้อความสถานะ (Success, Error, Warning, Info)
│   └── admin/                            # โมดูลฝั่งผู้ดูแลระบบ
│       ├── StatsCards.tsx                # การ์ดสรุปตัวเลขสถิติภาพรวม
│       ├── BorrowHistoryTable.tsx        # ตารางและ Mobile Floating Cards แสดงคำขอยืม-คืน พร้อมปุ่ม Action
│       ├── ItemManagerModal.tsx          # โมดอลเพิ่ม/แก้ไขอุปกรณ์ พร้อมอัปโหลดรูปเข้า Firebase Storage
│       └── ApprovalModal.tsx             # โมดอลพิจารณาอนุมัติ (กำหนดจำนวนและนัดรับ) หรือปฏิเสธคำขอ
├── context/
│   └── CartContext.tsx                   # Cart Context Provider จัดการตะกร้าสินค้าระดับแอป
├── lib/
│   ├── firebase/
│   │   ├── client.ts                     # Firebase Client (App, Auth, Firestore, Storage)
│   │   ├── authService.ts                # ฟังก์ชันจัดการ Google OAuth และ Auth State
│   │   └── firestoreService.ts           # ฟังก์ชัน CRUD และ Transactions ของ Firestore (Items, Requests, Admins)
│   ├── store/
│   │   └── cartStore.ts                  # Zustand Cart Store
│   ├── types.ts                          # TypeScript Data Contracts (Item, BorrowRequest, UserGroup ฯลฯ)
│   ├── utils.ts                          # ฟังก์ชันจัดรูปแบบวันที่ภาษาไทย และ Export CSV with UTF-8 BOM
│   ├── security.ts                       # ระบบความปลอดภัย (XSS Sanitization, Regex Phone, Rate Limiting)
│   └── resend.ts                         # Resend Client และ Email HTML Template
├── firestore.rules                       # กฎความปลอดภัย Cloud Firestore (RLS & Admin Permissions)
└── package.json                          # Dependencies และ Scripts
```

---

## 4. Key Workflows & Business Rules

### 4.1 การยืมอุปกรณ์จัดเลี้ยง (Borrowing Workflow)
1. **การยืนยันตัวตน**: ผู้ใช้เข้าสู่ระบบด้วย Google Account เท่านั้น (Zero-Flash Route Guard)
2. **การเลือกอุปกรณ์**: ผู้ใช้สามารถเลือกอุปกรณ์จากคลังจัดเลี้ยงลงในตะกร้าได้หลายรายการตามจำนวนสต็อกคงเหลือจริง
3. **การส่งคำขอ**:
   - บังคับกรอกเบอร์โทรศัพท์ที่ถูกต้อง (9–10 หลัก รูปแบบเบอร์ไทย เช่น `081-234-5678`)
   - บังคับระบุสังกัด (4 สาขาวิชา หรือ 12 หน่วยงานสนับสนุน คณะวิทยาศาสตร์)
   - บังคับระบุวัตถุประสงค์ (อนุญาตให้ใส่ `-` แทนการเขียนได้)
   - ระบุวันใช้งานและกำหนดส่งคืน (วันส่งคืนต้องไม่น้อยกว่าวันใช้งาน)
4. **การบันทึกและแจ้งเตือน**:
   - บันทึกลง Cloud Firestore คอลเลกชัน `borrow_requests`
   - เรียกส่งอีเมลแจ้งเตือนเจ้าหน้าที่งานบริการกลางทันทีผ่าน Resend API

### 4.2 การพิจารณาและรับคืนอุปกรณ์ (Admin Operations)
1. **การเข้าสู่ระบบแอดมิน**:
   - เข้าสู่ระบบด้วย Google Account ที่ได้รับสิทธิ์ (ตรวจสอบผ่าน Whitelist และคอลเลกชัน `admins`)
   - บัญชี Google ใหม่สามารถลงทะเบียนรับสิทธิ์ได้ด้วย Admin Security Key (`psu-admin-2026`)
2. **การอนุมัติคำขอ**:
   - เจ้าหน้าที่สามารถระบุ "จำนวนที่อนุมัติจริง" (ปรับลดได้ตามความเหมาะสมของงาน)
   - กำหนด "วันและเวลานัดรับอุปกรณ์" เพื่อให้ผู้ยืมมารับของที่งานบริการกลาง
3. **การตัดสต็อกและการคืนของ**:
   - การตัดสต็อกและคืนสต็อกทำงานผ่าน **Firestore RunTransaction** เพื่อรับประกันว่าสต็อกคงเหลือถูกต้องเสมอ
   - เมื่อกดรับคืน สถานะเปลี่ยนเป็น `returned` และสต็อกอุปกรณ์จะบวกกลับคืนทันที

---

## 5. Security & Data Integrity Highlights
1. **Atomic Stock Management**: ป้องกันการแย่งยืมหรือสต็อกติดลบด้วย Firestore Transactions
2. **Strict Client & Server Validation**: ตรวจสอบทั้งหน้าบ้านและหลังบ้าน ไม่ยอมรับข้อมูลที่ไม่สมบูรณ์
3. **Rate Limiting Protection**: API ส่งอีเมลมีระบบ Rate Limiter ป้องกันการส่งสแปม (จำกัด 5 ครั้งต่อ 2 นาทีต่อ IP)
4. **HTML & XSS Sanitization**: ทุก Input ที่ส่งเข้าอีเมลและฐานข้อมูลผ่านฟังก์ชัน sanitize ป้องกัน XSS Injection
5. **Excel Compatibility**: การ Export ประวัติการยืม-คืน มีการแนบ UTF-8 BOM (`\uFEFF`) แสดงผลภาษาไทยใน Microsoft Excel ได้ถูกต้อง ไม่เป็นภาษาต่างดาว

---

## 6. Progress & Accomplishments
- [x] ย้ายระบบฐานข้อมูลและ Authentication จาก Supabase สู่ Google Firebase (Auth, Firestore, Storage) สมบูรณ์แบบ 100%
- [x] นำโค้ดและ Dependencies ของ Supabase ที่ไม่ได้ใช้ออกทั้งหมด
- [x] ระบบยืนยันตัวตนระดับองค์กรด้วย Google SSO ทั้งฝั่งผู้ใช้ทั่วไปและแอดมิน
- [x] ระบบเพิ่มสิทธิ์ผู้ดูแลระบบผ่าน Google Login + Admin Security Key (`psu-admin-2026`)
- [x] ปรับปรุงสัดส่วนหน้าจอบนอุปกรณ์มือถือ (Mobile Responsive UI) ให้กระชับ สวยงาม และคงรูปแบบ Desktop 100%
- [x] ระบบตรวจสอบความถูกต้อง (Validation) ของเบอร์โทรและวัตถุประสงค์ (รองรับเครื่องหมาย `-`) พร้อมบล็อกการบันทึกหากข้อมูลไม่ครบ
- [x] ระบบแจ้งเตือนทางอีเมลด้วย Resend API และเทมเพลตอีเมล HTML คมชัด
