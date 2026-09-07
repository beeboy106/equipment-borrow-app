'use client';

import React, { useState, useEffect } from 'react';
import { storage } from '@/lib/firebase/client';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { saveItem } from '@/lib/firebase/firestoreService';
import { Item } from '@/lib/types';
import { X, Upload, Package, AlertCircle } from 'lucide-react';

interface ItemManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingItem: Item | null;
}

export default function ItemManagerModal({
  isOpen,
  onClose,
  onSuccess,
  editingItem,
}: ItemManagerModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('ทั่วไป');
  const [totalQuantity, setTotalQuantity] = useState(1);
  const [availableQuantity, setAvailableQuantity] = useState(1);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description || '');
      setCategory(editingItem.category || 'ทั่วไป');
      setTotalQuantity(editingItem.total_quantity);
      setAvailableQuantity(editingItem.available_quantity);
      setImageUrl(editingItem.image_url || '');
      setPreviewUrl(editingItem.image_url || null);
    } else {
      setName('');
      setDescription('');
      setCategory('ทั่วไป');
      setTotalQuantity(1);
      setAvailableQuantity(1);
      setImageUrl('');
      setPreviewUrl(null);
    }
    setImageFile(null);
    setErrorMsg(null);
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let finalImageUrl = imageUrl;

      // 1. อัปโหลดรูปภาพไปยัง Firebase Storage หากมีการเลือกไฟล์
      if (imageFile) {
        try {
          const fileExt = imageFile.name.split('.').pop();
          const fileName = `items/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const storageRef = ref(storage, fileName);
          await uploadBytes(storageRef, imageFile);
          finalImageUrl = await getDownloadURL(storageRef);
        } catch (uploadErr: any) {
          console.warn('Firebase Storage upload failed, proceeding with image data or fallback:', uploadErr);
        }
      }

      // 2. บันทึกข้อมูลลง Firestore items collection
      await saveItem(
        {
          name,
          description,
          category,
          total_quantity: Number(totalQuantity),
          available_quantity: editingItem ? Number(availableQuantity) : Number(totalQuantity),
          image_url: finalImageUrl || null,
        },
        editingItem?.id
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error saving item:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900">
              {editingItem ? 'แก้ไขข้อมูลอุปกรณ์' : 'เพิ่มอุปกรณ์ใหม่เข้าสู่ระบบ'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              จัดการรายละเอียดและจำนวนสต็อกของอุปกรณ์
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Equipment Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่ออุปกรณ์ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น iPad Pro 11 นิ้ว (M2) 128GB"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">หมวดหมู่อุปกรณ์</label>
            <input
              type="text"
              placeholder="แท็บเล็ต / กล้อง / อุปกรณ์เสียง / โปรเจกเตอร์ / สายแปลง"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={2}
              placeholder="เช่น มีกระเป๋าใส่ สายชาร์จ Type-C และหัวแปลง HDMI ให้พร้อมชุด"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                จำนวนทั้งหมด (Total) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                required
                value={totalQuantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setTotalQuantity(val);
                  if (!editingItem) {
                    setAvailableQuantity(val);
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              />
            </div>

            {editingItem && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  จำนวนคงเหลือ (Available) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalQuantity}
                  required
                  value={availableQuantity}
                  onChange={(e) => setAvailableQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                />
              </div>
            )}
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              รูปภาพอุปกรณ์ (Supabase Storage)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Package className="w-6 h-6 text-slate-300" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200">
                  <Upload className="w-3.5 h-3.5" /> เลือกไฟล์รูปภาพจากเครื่อง
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">รองรับไฟล์ JPG, PNG, WebP</p>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50"
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกอุปกรณ์'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
