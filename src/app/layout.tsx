import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import SessionProvider from '@/components/SessionProvider'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Gimat Sipariş',
  description: 'Gimat Çarşısı Toptan Sipariş Yönetim Sistemi',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="tr">
      <body className="font-sans">
        <SessionProvider session={session}>
          {children}
          <Toaster position="top-center" />
        </SessionProvider>
      </body>
    </html>
  )
}
