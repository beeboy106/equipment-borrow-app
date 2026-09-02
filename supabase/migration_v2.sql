-- =========================================================================
-- SQL Migration สำหรับอัปเกรดฐานข้อมูลสู่ระบบยืม-คืนล่วงหน้า (V2)
-- รันไฟล์นี้ใน Supabase SQL Editor
-- =========================================================================

-- 1. สร้างหรือปรับปรุงตาราง borrow_requests
CREATE TABLE IF NOT EXISTS public.borrow_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    borrower_name TEXT NOT NULL,
    borrower_email TEXT NOT NULL,
    phone TEXT NOT NULL,
    user_group TEXT NOT NULL CHECK (user_group IN ('อาจารย์', 'นักศึกษา', 'บุคลากรภายใน')),
    purpose TEXT NOT NULL,
    use_date DATE NOT NULL,
    return_date DATE NOT NULL,
    pickup_time TEXT,
    admin_note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'returned', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. สร้างหรือปรับปรุงตาราง borrow_items
CREATE TABLE IF NOT EXISTS public.borrow_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.borrow_requests(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    requested_qty INTEGER NOT NULL CHECK (requested_qty > 0),
    approved_qty INTEGER CHECK (approved_qty >= 0),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- เพิ่มคอลัมน์ใหม่อัตโนมัติและปลดล็อก record_id และ quantity หากมีตารางเดิมอยู่แล้ว
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='borrow_items' AND column_name='record_id') THEN
        ALTER TABLE public.borrow_items ALTER COLUMN record_id DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='borrow_items' AND column_name='quantity') THEN
        ALTER TABLE public.borrow_items ALTER COLUMN quantity DROP NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='borrow_items' AND column_name='requested_qty') THEN
        ALTER TABLE public.borrow_items ADD COLUMN requested_qty INTEGER NOT NULL DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='borrow_items' AND column_name='approved_qty') THEN
        ALTER TABLE public.borrow_items ADD COLUMN approved_qty INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='borrow_items' AND column_name='request_id') THEN
        ALTER TABLE public.borrow_items ADD COLUMN request_id UUID REFERENCES public.borrow_requests(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Stored Procedures (ลบตัวเก่าที่ signature ซ้ำซ้อนก่อนสร้างใหม่)
DROP FUNCTION IF EXISTS public.submit_advance_borrow_request(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, DATE, JSONB);
DROP FUNCTION IF EXISTS public.approve_borrow_request(UUID, JSONB, TEXT);
DROP FUNCTION IF EXISTS public.reject_borrow_request(UUID, TEXT);
DROP FUNCTION IF EXISTS public.return_advance_borrow_request(UUID);

CREATE OR REPLACE FUNCTION public.submit_advance_borrow_request(
    p_user_id UUID,
    p_borrower_name TEXT,
    p_borrower_email TEXT,
    p_phone TEXT,
    p_user_group TEXT,
    p_purpose TEXT,
    p_use_date DATE,
    p_return_date DATE,
    p_items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_request_id UUID;
    v_item JSONB;
    v_item_id UUID;
    v_qty INT;
BEGIN
    INSERT INTO public.borrow_requests (
        user_id,
        borrower_name,
        borrower_email,
        phone,
        user_group,
        purpose,
        use_date,
        return_date,
        status
    )
    VALUES (
        p_user_id,
        p_borrower_name,
        p_borrower_email,
        p_phone,
        p_user_group,
        p_purpose,
        p_use_date,
        p_return_date,
        'pending'
    )
    RETURNING id INTO v_request_id;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_id := (v_item->>'item_id')::UUID;
        v_qty := (v_item->>'quantity')::INT;

        INSERT INTO public.borrow_items (request_id, item_id, requested_qty)
        VALUES (v_request_id, v_item_id, v_qty);
    END LOOP;

    RETURN v_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_borrow_request(
    p_request_id UUID,
    p_items JSONB,
    p_pickup_time TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item JSONB;
    v_item_id UUID;
    v_approved_qty INT;
    v_current_avail INT;
    v_item_name TEXT;
    v_current_status TEXT;
BEGIN
    SELECT status INTO v_current_status
    FROM public.borrow_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ไม่พบคำขอยืมรหัส: %', p_request_id;
    END IF;

    IF v_current_status != 'pending' THEN
        RAISE EXCEPTION 'คำขอนี้ไม่ได้อยู่ในสถานะรออนุมัติ';
    END IF;

    FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
        v_item_id := (v_item->>'item_id')::UUID;
        v_approved_qty := (v_item->>'approved_qty')::INT;

        IF v_approved_qty > 0 THEN
            SELECT name, available_quantity INTO v_item_name, v_current_avail
            FROM public.items
            WHERE id = v_item_id
            FOR UPDATE;

            IF v_current_avail < v_approved_qty THEN
                RAISE EXCEPTION 'อุปกรณ์ "%" มีจำนวนคงเหลือไม่พอสำหรับอนุมัติ (คงเหลือ % ชิ้น, อนุมัติ % ชิ้น)', v_item_name, v_current_avail, v_approved_qty;
            END IF;

            UPDATE public.items
            SET available_quantity = available_quantity - v_approved_qty,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_item_id;
        END IF;

        UPDATE public.borrow_items
        SET approved_qty = v_approved_qty
        WHERE request_id = p_request_id AND item_id = v_item_id;
    END LOOP;

    UPDATE public.borrow_requests
    SET status = 'approved',
        pickup_time = p_pickup_time,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_borrow_request(
    p_request_id UUID,
    p_admin_note TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.borrow_requests
    SET status = 'rejected',
        admin_note = p_admin_note,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_request_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.return_advance_borrow_request(
    p_request_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_item RECORD;
    v_current_status TEXT;
BEGIN
    SELECT status INTO v_current_status
    FROM public.borrow_requests
    WHERE id = p_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'ไม่พบคำขอยืมรหัส: %', p_request_id;
    END IF;

    IF v_current_status = 'returned' THEN
        RAISE EXCEPTION 'รายการนี้ได้ถูกคืนไปแล้ว';
    END IF;

    FOR v_item IN 
        SELECT item_id, COALESCE(approved_qty, requested_qty, 0) AS qty_to_return
        FROM public.borrow_items 
        WHERE request_id = p_request_id
    LOOP
        IF v_item.qty_to_return > 0 THEN
            UPDATE public.items
            SET available_quantity = available_quantity + v_item.qty_to_return,
                updated_at = timezone('utc'::text, now())
            WHERE id = v_item.item_id;
        END IF;
    END LOOP;

    UPDATE public.borrow_requests
    SET status = 'returned',
        updated_at = timezone('utc'::text, now())
    WHERE id = p_request_id;
END;
$$;

-- 4. จัดการ RLS Policies แบบปลอดภัย (ลบก่อนสร้างใหม่เพื่อป้องกัน policy already exists)
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select borrow_requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Allow public insert borrow_requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Allow admin manage borrow_requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Allow users read own borrow_requests" ON public.borrow_requests;
DROP POLICY IF EXISTS "Allow authenticated insert borrow_requests" ON public.borrow_requests;

CREATE POLICY "Allow public select borrow_requests" ON public.borrow_requests FOR SELECT USING (true);
CREATE POLICY "Allow public insert borrow_requests" ON public.borrow_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage borrow_requests" ON public.borrow_requests FOR ALL TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow public select borrow_items" ON public.borrow_items;
DROP POLICY IF EXISTS "Allow public insert borrow_items" ON public.borrow_items;
DROP POLICY IF EXISTS "Allow admin manage borrow_items" ON public.borrow_items;
DROP POLICY IF EXISTS "Allow read borrow_items" ON public.borrow_items;
DROP POLICY IF EXISTS "Allow insert borrow_items" ON public.borrow_items;

CREATE POLICY "Allow public select borrow_items" ON public.borrow_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert borrow_items" ON public.borrow_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin manage borrow_items" ON public.borrow_items FOR ALL TO authenticated USING (true);

-- Realtime publication
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'borrow_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.borrow_requests;
    END IF;
END $$;
