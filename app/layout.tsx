import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import ChunkErrorHandler from '@/components/ChunkErrorHandler';

export const metadata: Metadata = {
  title: 'ระบบยืม-คืนอุปกรณ์สำหรับอาจารย์ในสาขาวิชา',
  description: 'ระบบยืม-คืนอุปกรณ์ไอทีและสื่อการสอนสำหรับคณาจารย์และบุคลากร',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="overflow-x-hidden w-full max-w-full">
      <body className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden w-full max-w-full">
        <ChunkErrorHandler />
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
