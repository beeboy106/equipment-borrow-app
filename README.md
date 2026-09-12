# ระบบยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง งานบริการกลาง คณะวิทยาศาสตร์
### Faculty of Science, Prince of Songkla University (PSU)

เว็บแอปพลิเคชันจัดการการยืม-คืนอุปกรณ์สำหรับงานจัดเลี้ยงและกิจกรรม ของ**งานบริการกลาง คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์** พัฒนาด้วยเทคโนโลยีสมัยใหม่ **Next.js 15 (App Router)**, **React 19**, **Tailwind CSS**, และ **Google Firebase (Authentication + Cloud Firestore Real-time + Cloud Storage)** พร้อมระบบแจ้งเตือนทางอีเมลผ่าน **Resend API**

---

## 🌟 ฟีเจอร์หลักของระบบ (Key Features)

### 1. ฝั่งผู้ใช้งานทั่วไป (อาจารย์, นักศึกษา, บุคลากร)
- 🔐 **เข้าสู่ระบบด้วย Google Account (SSO)**: ปลอดภัย รวดเร็ว รองรับอีเมลมหาวิทยาลัย (`@psu.ac.th`) และบัญชี Google
- 🍽️ **แคตตาล็อกอุปกรณ์จัดเลี้ยง Real-time**: แสดงรายการอุปกรณ์จัดเลี้ยง (โต๊ะ, เก้าอี้, ภาชนะ, ผ้าปูโต๊ะ ฯลฯ) พร้อมรูปภาพ คำอธิบาย และสต็อกคงเหลือที่อัปเดตแบบสดๆ
- 🔍 **ระบบค้นหาและตัวกรองหมวดหมู่**: ค้นหาตามชื่ออุปกรณ์ หรือเลือกดูตามหมวดหมู่ได้อย่างรวดเร็ว
- 🛒 **ระบบตะกร้าเลือกยืม (Cart Drawer)**: เลือกอุปกรณ์ได้หลายรายการพร้อมกัน ปรับเพิ่ม-ลดจำนวนได้ตามสต็อกที่มีอยู่จริง พร้อมแถบลอยสรุปตะกร้า (Floating Cart Bar)
- 📝 **ฟอร์มยืนยันการยืมล่วงหน้า (Borrow Modal)**:
  - บังคับกรอกเบอร์โทรศัพท์ที่ถูกต้อง (ระบบตรวจเช็คเบอร์ไทย 9–10 หลัก)
  - บังคับเลือกสังกัด (4 สาขาวิชา หรือ 12 หน่วยงานสนับสนุน คณะวิทยาศาสตร์)
  - บังคับระบุวัตถุประสงค์การใช้งาน (รองรับการพิมพ์เครื่องหมาย `-` แทนการเขียนได้)
  - กำหนดวันใช้งานและวันส่งคืน
- 📋 **ติดตามสถานะคำขอของฉัน (`/my-requests`)**: ตรวจสอบสถานะคำขอของตนเองได้แบบสดๆ (รอพิจารณา, อนุมัติแล้ว, ปฏิเสธ, คืนแล้ว, ยกเลิกแล้ว) พร้อมปุ่มกดยกเลิกคำขอที่ยังไม่ได้พิจารณา
- 📱 **รองรับการใช้งานบนมือถือ 100%**: จัดวางสัดส่วนหน้าจออย่างสวยงาม ใช้งานสะดวกทั้งบนมือถือและคอมพิวเตอร์

### 2. ฝั่งผู้ดูแลระบบ (Admin Dashboard)
- 🛡️ **เข้าสู่ระบบ Admin ด้วย Google SSO**: เข้าใช้งานแอดมินได้ทันทีในคลิกเดียวผ่านบัญชี Google ที่ได้รับสิทธิ์ ปราศจากปัญหารหัสผ่านหายหรือถูกลบทับ
- 🔑 **ระบบลงทะเบียนสิทธิ์แอดมินด้วย Security Key**: เพิ่มสิทธิ์ผู้ดูแลระบบให้กับบัญชี Google ใหม่ได้ง่ายๆ ผ่านรหัสความปลอดภัย (`psu-admin-2026`)
- 📊 **แดชบอร์ดสถิติภาพรวม (Analytics Cards)**: สรุปจำนวนคำขอทั้งหมด, รอพิจารณา, อนุมัติแล้ว, และตรวจจับรายการที่**เกินกำหนดคืน (Overdue)**
- ⚡ **พิจารณาอนุมัติคำขอ (Approval Modal)**:
  - กำหนดจำนวนที่อนุมัติจริงให้เหมาะสมกับกิจกรรม
  - นัดหมายวันและเวลารับของ เพื่อให้ผู้ยืมมารับอุปกรณ์ที่งานบริการกลาง
  - ปฏิเสธคำขอพร้อมระบุเหตุผลให้ผู้ยืมทราบ
- 🔄 **ระบบรับคืนอุปกรณ์ (Return Equipment)**: บันทึกรับคืนอุปกรณ์พร้อม**คืนสต็อกกลับเข้าคลังอัตโนมัติ**ด้วย Cloud Firestore Atomic Transaction
- 🔍 **ระบบคัดกรองคำขอขั้นสูง**: คัดกรองตามสถานะ, กลุ่มผู้ใช้งาน, ระบุเดือน, ระบุวันที่, หรือเลือกช่วงวันที่ (Date Range)
- 📥 **ส่งออกข้อมูล CSV (Excel ภาษาไทย)**: ดาวน์โหลดประวัติการยืม-คืนเป็นไฟล์ Excel พร้อมแนบ UTF-8 BOM แสดงภาษาไทยถูกต้อง 100%
- 🛠️ **จัดการคลังอุปกรณ์ (CRUD)**: เพิ่ม แก้ไข ลบ อุปกรณ์ พร้อมระบบอัปโหลดรูปภาพเข้า **Firebase Storage**
- 📱 **Mobile Floating Cards View**: บนหน้าจอมือถือ ตารางคำขอจะปรับเปลี่ยนเป็นการ์ดข้อมูลอิสระ พร้อมระบบคลี่ดูรายละเอียด (Accordion) และปุ่ม Action ชัดเจน

### 3. ระบบแจ้งเตือนทางอีเมล (Email Notifications)
- ✉️ ส่งอีเมลแจ้งเตือนเจ้าหน้าที่งานบริการกลางอัตโนมัติผ่าน **Resend API** ทันทีที่มีคำขอยืมใหม่
- ดีไซน์เทมเพลตอีเมล HTML คมชัด พร้อมรายละเอียดผู้ยืม, รายการอุปกรณ์, สังกัด, วัตถุประสงค์ และปุ่มลิงก์ตรงเข้าสู่หน้า Admin

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS 3.4, Lucide React Icons
- **Backend & Database**: Google Firebase
  - **Firebase Authentication**: Google OAuth
  - **Cloud Firestore**: Real-time Database with Security Rules & Transactions
  - **Firebase Storage**: Image Upload Bucket
- **Email Service**: Resend API
- **State Management**: Zustand, React Context, LocalStorage
- **Testing**: Vitest

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มต้นใช้งาน (Installation & Setup)

### 1. Clone โปรเจกต์ และติดตั้ง Dependencies
```bash
git clone https://github.com/beeboy106/equipment-borrow-app.git
cd equipment-borrow-app
npm install
```

### 2. ตั้งค่าไฟล์ Environment Variables
คัดลอกไฟล์ตัวอย่าง `.env.local.example` ไปเป็น `.env.local`:
```bash
cp .env.local.example .env.local
```

กำหนดค่าในไฟล์ `.env.local`:
```env
# Firebase Credentials (จาก Firebase Console -> Project Settings -> General)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=equipment-borrow-4942d.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=equipment-borrow-4942d
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=equipment-borrow-4942d.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Resend API Key สำหรับระบบส่งอีเมลแจ้งเตือน
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=onboarding@resend.dev
ADMIN_NOTIFICATION_EMAIL=your-admin-email@gmail.com

# รหัสยืนยันสิทธิ์สร้างบัญชี Admin
NEXT_PUBLIC_ADMIN_REGISTRATION_KEY=psu-admin-2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. รันโปรเจกต์สำหรับ Development
```bash
npm run dev
```

เปิดเว็บเบราว์เซอร์ที่:
- 🌐 **หน้าผู้ใช้งานทั่วไป**: [http://localhost:3000](http://localhost:3000)
- 🔐 **หน้าเข้าสู่ระบบ Admin**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- 📊 **หน้า Admin Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

### 4. ทดสอบ Build โปรเจกต์
```bash
npm run build
```

---

## 🏛️ สังกัดหน่วยงานภายในคณะวิทยาศาสตร์ที่รองรับ

### สาขาวิชา (Departments):
1. วิทยาศาสตร์กายภาพ
2. วิทยาศาสตร์ชีวภาพ
3. วิทยาศาสตร์การคำนวณ
4. วิทยาศาสตร์สุขภาพและวิทยาศาสตร์ประยุกต์

### หน่วยงานสนับสนุน (Support Units):
1. งานสนับสนุนการจัดการศึกษา
2. งานสนับสนุนการวิจัย
3. งานสนับสนุนการบริการวิชาการ
4. งานพัฒนานักศึกษาและศิษย์เก่าสัมพันธ์
5. งานสนับสนุนข้อมูลสารสนเทศและเทคโนโลยี
6. งานเครือข่ายและประชาสัมพันธ์ (หน่วยวิเทศสัมพันธ์)
7. งานเครือข่ายและประชาสัมพันธ์ (หน่วยประชาสัมพันธ์)
8. งานบริหารทรัพยากรมนุษย์
9. **งานบริการกลาง** (เจ้าของระบบคลังจัดเลี้ยง)
10. งานสนับสนุนด้านกายภาพและสิ่งแวดล้อม
11. งานพัสดุ
12. งานการเงินและบัญชี

---

## 📄 ใบอนุญาต (License)
โปรเจกต์นี้พัฒนาขึ้นเพื่อใช้งานภายในงานบริการกลาง คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์
