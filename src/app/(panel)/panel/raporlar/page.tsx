import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export default async function RaporlarPage() {
  const session = await getServerSession(authOptions)
  const dealerId = session?.user?.dealerId

  let stats = {
    todayOrders: 0,
    todayRevenue: 0,
    monthOrders: 0,
    monthRevenue: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingInvoices: 0,
  }

  let topCustomers: { shopName: string; name: string; total: number }[] = []
  let topProducts: { name: string; total: number }[] = []

  if (dealerId) {
    try {
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const [
        todayResult,
        monthResult,
        customers,
        products,
        invoiceData,
        customerOrders,
        productItems,
      ] = await Promise.all([
        prisma.order.aggregate({
          where: { dealerId, status: 'DELIVERED', createdAt: { gte: todayStart } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.order.aggregate({
          where: { dealerId, status: 'DELIVERED', createdAt: { gte: monthStart } },
          _sum: { totalAmount: true },
          _count: true,
        }),
        prisma.customer.count({ where: { dealerId } }),
        prisma.product.count({ where: { dealerId } }),
        prisma.invoice.count({
          where: {
            order: { dealerId },
            payments: { none: {} },
          },
        }),
        prisma.order.findMany({
          where: { dealerId, status: 'DELIVERED' },
          include: { customer: true },
          orderBy: { totalAmount: 'desc' },
          take: 5,
        }),
        prisma.orderItem.findMany({
          where: { order: { dealerId, status: 'DELIVERED' } },
          include: { product: true },
        }),
      ])

      stats = {
        todayOrders: todayResult._count,
        todayRevenue: todayResult._sum.totalAmount || 0,
        monthOrders: monthResult._count,
        monthRevenue: monthResult._sum.totalAmount || 0,
        totalCustomers: customers,
        totalProducts: products,
        pendingInvoices: invoiceData,
      }

      topCustomers = customerOrders.map((o) => ({
        shopName: o.customer.shopName,
        name: o.customer.name,
        total: o.totalAmount,
      }))

      const productMap = new Map<string, { name: string; total: number }>()
      for (const item of productItems) {
        const existing = productMap.get(item.productId)
        if (existing) {
          existing.total += item.quantity
        } else {
          productMap.set(item.productId, { name: item.product.name, total: item.quantity })
        }
      }
      topProducts = Array.from(productMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5)
    } catch {
      // DB not available
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card text-center">
          <div className="text-2xl mb-1">📅</div>
          <div className="text-xl font-bold">{stats.todayOrders}</div>
          <div className="text-xs text-gray-500">Bugün Sipariş</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">💰</div>
          <div className="text-xl font-bold">{stats.todayRevenue.toLocaleString('tr-TR')}₺</div>
          <div className="text-xs text-gray-500">Bugün Ciro</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">📆</div>
          <div className="text-xl font-bold">{stats.monthOrders}</div>
          <div className="text-xs text-gray-500">Bu Ay Sipariş</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl mb-1">💹</div>
          <div className="text-xl font-bold">{stats.monthRevenue.toLocaleString('tr-TR')}₺</div>
          <div className="text-xs text-gray-500">Bu Ay Ciro</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">En İyi Müşteriler</h2>
          {topCustomers.length === 0 ? (
            <p className="text-gray-500 text-sm">Veri yok</p>
          ) : (
            <div className="space-y-2">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>
                    {c.shopName}
                  </div>
                  <div className="text-sm font-semibold text-blue-600">{c.total.toLocaleString('tr-TR')}₺</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">En Çok Satılan Ürünler</h2>
          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-sm">Veri yok</p>
          ) : (
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400 mr-2">{i + 1}.</span>
                    {p.name}
                  </div>
                  <div className="text-sm font-semibold">{p.total} adet</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
