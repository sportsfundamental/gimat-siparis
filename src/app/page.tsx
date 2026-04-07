import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    if (session.user.role === 'SUPER_ADMIN') redirect('/admin')
    if (session.user.role === 'DEALER') redirect('/panel')
    if (session.user.role === 'CUSTOMER') redirect('/musteri')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-5xl mb-4">🏪</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gimat Sipariş</h1>
          <p className="text-gray-500 mb-8">Toptan Sipariş Yönetim Sistemi</p>
          <div className="space-y-3">
            <Link
              href="/giris"
              className="block w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/kayit"
              className="block w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold text-lg hover:bg-gray-200 transition-colors"
            >
              Müşteri Kaydı
            </Link>
          </div>
          <p className="mt-6 text-xs text-gray-400">
            Ankara Gimat Çarşısı · Toptan Satış Platformu
          </p>
        </div>
      </div>
    </div>
  )
}
