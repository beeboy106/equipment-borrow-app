import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'ระบบยืม-คืนอุปกรณ์สำหรับอาจารย์ในสาขาวิชา',
  description: 'ระบบยืม-คืนอุปกรณ์ไอทีและสื่อการสอนสำหรับคณาจารย์และบุคลากร',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-slate-50 flex flex-col">
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
