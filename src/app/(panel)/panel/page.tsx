import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function PanelPage() {
  const session = await getServerSession(authOptions)
  const dealerId = session?.user?.dealerId

  let stats = { customers: 0, products: 0, pendingOrders: 0, revenue: 0 }
  let recentOrders: {
    id: string
    customer: { name: string; shopName: string }
    totalAmount: number
    status: string
    createdAt: Date
  }[] = []

  if (dealerId) {
    try {
      const [customers, products, pendingOrders, ordersData, revenueData] = await Promise.all([
        prisma.customer.count({ where: { dealerId } }),
        prisma.product.count({ where: { dealerId } }),
        prisma.order.count({ where: { dealerId, status: 'PENDING' } }),
        prisma.order.findMany({
          where: { dealerId },
          include: { customer: true },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
        prisma.order.aggregate({
          where: { dealerId, status: 'DELIVERED' },
          _sum: { totalAmount: true },
        }),
      ])
      stats = {
        customers,
        products,
        pendingOrders,
        revenue: revenueData._sum.totalAmount || 0,
      }
      recentOrders = ordersData
    } catch {
      // DB not available
    }
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Bekliyor',
    PREPARING: 'Hazırlanıyor',
    ON_THE_WAY: 'Yolda',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal',
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Merhaba 👋</h1>
        <p className="text-gray-500">{session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center">
          <div className="text-2xl mb-1">👥</div>
          <div className="text-xl font-bold">{stats.customers}</div>
          <div className="text-xs text-gray-500">Müşteri</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">📦</div>
          <div className="text-xl font-bold">{stats.products}</div>
          <div className="text-xs text-gray-500">Ürün</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">⏳</div>
          <div className="text-xl font-bold">{stats.pendingOrders}</div>
          <div className="text-xs text-gray-500">Bekleyen</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xl font-bold">{stats.revenue.toLocaleString('tr-TR')}₺</div>
          <div className="text-xs text-gray-500">Ciro</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link href="/panel/siparisler" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🛒</span>
            <div>
              <div className="font-semibold text-gray-900">Siparişler</div>
              <div className="text-sm text-gray-500">{stats.pendingOrders} bekleyen sipariş</div>
            </div>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </Link>
        <Link href="/panel/urunler" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📦</span>
            <div>
              <div className="font-semibold text-gray-900">Ürünler</div>
              <div className="text-sm text-gray-500">{stats.products} ürün</div>
            </div>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </Link>
        <Link href="/panel/alisveris-listesi" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📋</span>
            <div>
              <div className="font-semibold text-gray-900">Alışveriş Listesi</div>
              <div className="text-sm text-gray-500">Toplu sipariş özeti</div>
            </div>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </Link>
        <Link href="/panel/raporlar" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📈</span>
            <div>
              <div className="font-semibold text-gray-900">Raporlar</div>
              <div className="text-sm text-gray-500">Satış raporları</div>
            </div>
            <span className="ml-auto text-gray-400">›</span>
          </div>
        </Link>
      </div>

      {recentOrders.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Son Siparişler</h2>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/panel/siparisler/${order.id}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium">{order.customer.shopName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{order.totalAmount.toLocaleString('tr-TR')}₺</div>
                  <div className="text-xs text-gray-500">{statusLabels[order.status]}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
