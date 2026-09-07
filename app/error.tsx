'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error.name === 'ChunkLoadError' ||
      error.message?.includes('Loading chunk') ||
      error.message?.includes('Failed to fetch');

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          ↻
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">มีเวอร์ชันใหม่ของระบบ</h2>
        <p className="text-sm text-slate-500 mb-6">
          ระบบได้รับการอัปเดตเวอร์ชันใหม่ กรุณากดปุ่มด้านล่างเพื่อโหลดข้อมูลล่าสุด
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl transition shadow-md shadow-indigo-200"
        >
          โหลดหน้าเว็บใหม่ (Reload)
        </button>
      </div>
    </div>
  );
}
