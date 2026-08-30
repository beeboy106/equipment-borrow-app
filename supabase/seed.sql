-- =========================================================================
-- ข้อมูลตัวอย่างเริ่มต้น (Mock Data / Seed Data) สำหรับทดสอบระบบ
-- =========================================================================

INSERT INTO public.items (name, description, category, image_url, total_quantity, available_quantity)
VALUES
(
    'Apple iPad Air 5 (M1) 64GB พร้อม Apple Pencil 2',
    'ไอแพดสำหรับการเรียนการสอน พร้อมปากกา Apple Pencil รุ่นที่ 2 และเคสกันกระแทก',
    'แท็บเล็ต/ไอแพด',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    5,
    5
),
(
    'Sony Alpha 7 IV (Body + Lens 24-70mm F2.8)',
    'กล้อง Mirrorless Full-frame สำหรับถ่ายภาพกิจกรรมและงานวิชาการของสาขาวิชา',
    'กล้องและวิดีโอ',
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    2,
    2
),
(
    'Wireless Microphone DJI Mic 2 (2 TX + 1 RX)',
    'ชุดไมค์ไร้สาย 2 ตัวส่ง 1 ตัวรับ พร้อมกล่องชาร์จ สำหรับบันทึกเสียงบรรยายและสัมภาษณ์',
    'อุปกรณ์เสียง',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    4,
    4
),
(
    'Epson EB-X51 Portable Projector (3,800 Lumens)',
    'โปรเจกเตอร์พกพาความสว่างสูง พร้อมพอร์ต HDMI / VGA และสายเชื่อมต่อ',
    'โปรเจกเตอร์',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    3,
    3
),
(
    'Logitech Spotlight Presentation Remote',
    'พอยเตอร์ไร้สายระยะไกล พร้อมฟังก์ชัน Spotlight ไฮไลต์จุดสำคัญบนหน้าจอ',
    'อุปกรณ์เสริม',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&auto=format&fit=crop&q=80',
    6,
    6
),
(
    'Dell 4K USB-C Hub Monitor 27 นิ้ว (U2723QE)',
    'จอมอนิเตอร์ความละเอียด 4K IPS Black ต่อสายเส้นเดียวชาร์จไฟและส่งภาพได้ทันที',
    'จอภาพ',
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    2,
    2
),
(
    'Anker 737 Power Bank (PowerCore 24K, 140W)',
    'พาวเวอร์แบงค์จ่ายไฟแรงสูง ชาร์จโน้ตบุ๊กและมือถือได้พร้อมกัน',
    'อุปกรณ์เสริม',
    'https://images.unsplash.com/photo-1609592426508-cc82a8449c25?w=600&auto=format&fit=crop&q=80',
    5,
    5
),
(
    'Wacom Intuos Pro Medium Graphic Tablet',
    'เมาส์ปากกาสำหรับเขียนหน้าจอ ตรวจข้อสอบ และงานออกแบบกราฟิก',
    'แท็บเล็ต/ไอแพด',
    'https://images.unsplash.com/photo-1583225214464-9296029427aa?w=600&auto=format&fit=crop&q=80',
    3,
    3
);
