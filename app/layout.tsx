import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import ChunkErrorHandler from '@/components/ChunkErrorHandler';

export const metadata: Metadata = {
  title: 'ระบบยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง งานบริการกลาง คณะวิทยาศาสตร์',
  description: 'ระบบยืม-คืนอุปกรณ์สำหรับจัดเลี้ยง งานบริการกลาง คณะวิทยาศาสตร์ มหาวิทยาลัยสงขลานครินทร์',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/icon.svg',
  },
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
