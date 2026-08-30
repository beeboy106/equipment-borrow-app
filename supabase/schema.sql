-- =========================================================================
-- ระบบยืม-คืนอุปกรณ์สำหรับอาจารย์และเจ้าหน้าที่ในสาขาวิชา
-- SQL Migration & Schema Definition สำหรับ Supabase (PostgreSQL)
-- =========================================================================

-- 1. สร้างตารางอุปกรณ์ (items)
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'ทั่วไป',
    image_url TEXT,
    total_quantity INTEGER NOT NULL CHECK (total_quantity >= 0),
    available_quantity INTEGER NOT NULL CHECK (available_quantity >= 0 AND available_quantity <= total_quantity),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. สร้างตารางประวัติการยืม (borrow_records)
CREATE TABLE IF NOT EXISTS public.borrow_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    borrower_name TEXT NOT NULL,
    borrower_email TEXT NOT NULL,
    borrower_phone TEXT NOT NULL,
    purpose TEXT NOT NULL,
    borrow_date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    expected_return_date DATE NOT NULL,
    actual_return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'borrowed' CHECK (status IN ('borrowed', 'returned', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. สร้างตารางรายการอุปกรณ์ในการยืมแต่ละครั้ง (borrow_items)
CREATE TABLE IF NOT EXISTS public.borrow_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id UUID NOT NULL REFERENCES public.borrow_records(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 4. Stored Procedure: ตัดสต็อกและบันทึกการยืมแบบ Atomic (ป้องกัน Race Condition)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.borrow_equipment(
    p_borrower_name TEXT,
    p_borrower_email TEXT,
    p_borrower_phone TEXT,
    p_purpose TEXT,
    p_expected_return_date DATE,
    p_items JSONB -- รูปแบบ: [{"item_id": "uuid", "quantity": 1}, ...]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_record_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_qty INT;
    v_current_avail INT;
    v_item_name TEXT;
BEGIN
    -- 1. ตรวจสอบสต็อกของทุกชิ้นก่อนทำการยืม
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_id := (v_item->>'item_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        SELECT name, available_quantity INTO v_item_name, v_current_avail
        FROM public.items
        WHERE id = v_item_id
        FOR UPDATE; -- Lock แถวนี้ไว้ระหว่าง Transaction เพื่อป้องกัน Race Condition

        IF NOT FOUND THEN
            RAISE EXCEPTION 'ไม่พบอุปกรณ์รหัส: %', v_item_id;
        END IF;

        IF v_current_avail < v_qty THEN
            RAISE EXCEPTION 'อุปกรณ์ "%" มีจำนวนคงเหลือไม่พอ (เหลือ % ชิ้น, ต้องการ % ชิ้น)', v_item_name, v_current_avail, v_qty;
        END IF;
    END LOOP;

    -- 2. สร้างบันทึกการยืมใน borrow_records
    INSERT INTO public.borrow_records (
        borrower_name,
        borrower_email,
        borrower_phone,
        purpose,
        expected_return_date,
        status
    )
    VALUES (
        p_borrower_name,
        p_borrower_email,
        p_borrower_phone,
        p_purpose,
        p_expected_return_date,
        'borrowed'
    )
    RETURNING id INTO v_record_id;

    -- 3. ตัดสต็อกและบันทึกรายการย่อยใน borrow_items
    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_id := (v_item->>'item_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        -- บันทึกรายการยืม
        INSERT INTO public.borrow_items (record_id, item_id, quantity)
        VALUES (v_record_id, v_item_id, v_qty);

        -- ตัดสต็อก
        UPDATE public.items
        SET available_quantity = available_quantity - v_qty,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_item_id;
    END LOOP;

    RETURN v_record_id;
END;
$$;

-- =========================================================================
-- 5. Stored Procedure: รับคืนอุปกรณ์ และเพิ่มสต็อกกลับคืนอัตโนมัติ
-- =========================================================================
CREATE OR REPLACE FUNCTION public.return_equipment(p_record_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_current_status TEXT;
BEGIN
    -- ตรวจสอบสถานะปัจจุบัน
    SELECT status INTO v_current_status
    FROM public.borrow_records
    WHERE id = p_record_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ไม่พบรายการยืมรหัส: %', p_record_id;
    END IF;

    IF v_current_status = 'returned' THEN
        RAISE EXCEPTION 'รายการนี้ได้ถูกคืนไปแล้ว';
    END IF;

    -- คืนสต็อกอุปกรณ์ทุกชิ้นในรายการ
    FOR v_item IN 
        SELECT item_id, quantity 
        FROM public.borrow_items 
        WHERE record_id = p_record_id
    LOOP
        UPDATE public.items
        SET available_quantity = available_quantity + v_item.quantity,
            updated_at = timezone('utc'::text, now())
        WHERE id = v_item.item_id;
    END LOOP;

    -- อัปเดตสถานะเป็นคืนแล้ว
    UPDATE public.borrow_records
    SET status = 'returned',
        actual_return_date = timezone('utc'::text, now())
    WHERE id = p_record_id;
END;
$$;

-- =========================================================================
-- 6. ตั้งค่า Supabase Storage Bucket สำหรับรูปภาพอุปกรณ์
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('equipment-images', 'equipment-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy สำหรับ Storage: ทุกคนดูรูปได้, แต่ Admin เท่านั้นที่อัปโหลด/แก้ไขได้
CREATE POLICY "Public Read Equipment Images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'equipment-images');

CREATE POLICY "Admin Upload Equipment Images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'equipment-images');

CREATE POLICY "Admin Delete Equipment Images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'equipment-images');

-- =========================================================================
-- 7. Row Level Security (RLS) Policies
-- =========================================================================
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_items ENABLE ROW LEVEL SECURITY;

-- items: ทุกคนดูได้ (Public Read), Admin (Authenticated) จัดการได้
CREATE POLICY "Allow public read items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow admin manage items" ON public.items FOR ALL TO authenticated USING (true);

-- borrow_records & borrow_items: ทุกคนเพิ่มได้ (Public Insert), Admin ดู/แก้ไขได้
CREATE POLICY "Allow public insert borrow_records" ON public.borrow_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage borrow_records" ON public.borrow_records FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow public insert borrow_items" ON public.borrow_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage borrow_items" ON public.borrow_items FOR ALL TO authenticated USING (true);

-- =========================================================================
-- 8. เปิดใช้งาน Real-time สำหรับตาราง items
-- =========================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.items;
