import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  let dealerCount = 0
  let customerCount = 0
  let orderCount = 0

  try {
    ;[dealerCount, customerCount, orderCount] = await Promise.all([
      prisma.dealer.count(),
      prisma.customer.count(),
      prisma.order.count(),
    ])
  } catch {
    // DB not available
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Hoş Geldiniz 👑</h1>
        <p className="text-gray-500">{session?.user?.name} · Sistem Yöneticisi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="card">
          <div className="text-3xl mb-2">🏪</div>
          <div className="text-2xl font-bold text-gray-900">{dealerCount}</div>
          <div className="text-sm text-gray-500">Toptancı</div>
        </div>
        <div className="card">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-2xl font-bold text-gray-900">{customerCount}</div>
          <div className="text-sm text-gray-500">Müşteri</div>
        </div>
        <div className="card col-span-2 md:col-span-1">
          <div className="text-3xl mb-2">🛒</div>
          <div className="text-2xl font-bold text-gray-900">{orderCount}</div>
          <div className="text-sm text-gray-500">Sipariş</div>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Hızlı Erişim</h2>
        <div className="space-y-2">
          <Link
            href="/admin/toptancilar"
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🏪</span>
            <div>
              <div className="font-medium text-gray-900">Toptancılar</div>
              <div className="text-sm text-gray-500">Toptancı hesaplarını yönet</div>
            </div>
            <span className="ml-auto text-gray-400">›</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
