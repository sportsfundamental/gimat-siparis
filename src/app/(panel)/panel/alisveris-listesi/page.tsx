import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export default async function AlisverisListesiPage() {
  const session = await getServerSession(authOptions)
  const dealerId = session?.user?.dealerId

  let shoppingList: {
    productId: string
    productName: string
    barcode: string | null
    totalQuantity: number
  }[] = []

  if (dealerId) {
    try {
      const items = await prisma.orderItem.findMany({
        where: {
          order: {
            dealerId,
            status: { in: ['PENDING', 'PREPARING'] },
          },
        },
        include: {
          product: true,
        },
      })

      const map = new Map<string, { productId: string; productName: string; barcode: string | null; totalQuantity: number }>()
      for (const item of items) {
        const existing = map.get(item.productId)
        if (existing) {
          existing.totalQuantity += item.quantity
        } else {
          map.set(item.productId, {
            productId: item.productId,
            productName: item.product.name,
            barcode: item.product.barcode,
            totalQuantity: item.quantity,
          })
        }
      }
      shoppingList = Array.from(map.values()).sort((a, b) => a.productName.localeCompare(b.productName))
    } catch {
      // DB not available
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Alışveriş Listesi</h1>
        <p className="text-gray-500 text-sm">Bekleyen ve hazırlanan siparişlerin özeti</p>
      </div>

      {shoppingList.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">Aktif sipariş yok</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-0">
            {shoppingList.map((item, i) => (
              <div
                key={item.productId}
                className={`flex items-center justify-between py-3 ${
                  i !== shoppingList.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">{item.productName}</div>
                  {item.barcode && <div className="text-xs text-gray-500">📊 {item.barcode}</div>}
                </div>
                <div className="bg-blue-100 text-blue-800 font-bold text-lg px-4 py-1 rounded-full">
                  {item.totalQuantity}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-500 text-right">
            Toplam {shoppingList.length} farklı ürün
          </div>
        </div>
      )}
    </div>
  )
}
