import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import Link from 'next/link'

export default async function MusteriPage() {
  const session = await getServerSession(authOptions)

  let customerData: {
    name: string
    shopName: string
    account: { balance: number } | null
    pendingOrders: number
    dealer: { name: string } | null
  } | null = null

  if (session?.user?.id) {
    try {
      const customer = await prisma.customer.findFirst({
        where: { userId: session.user.id },
        include: {
          account: true,
          dealer: true,
          orders: { where: { status: { in: ['PENDING', 'PREPARING', 'ON_THE_WAY'] } } },
        },
      })

      if (customer) {
        customerData = {
          name: customer.name,
          shopName: customer.shopName,
          account: customer.account,
          pendingOrders: customer.orders.length,
          dealer: customer.dealer,
        }
      }
    } catch {
      // DB not available
    }
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          Hoş Geldiniz{customerData ? `, ${customerData.shopName}` : ''}! 👋
        </h1>
        {customerData?.dealer && (
          <p className="text-gray-500 text-sm">{customerData.dealer.name}</p>
        )}
      </div>

      {customerData?.account && (
        <div className={`card mb-4 ${(customerData.account.balance) < 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
          <div className="text-sm text-gray-600 mb-1">Hesap Durumunuz</div>
          <div className={`text-2xl font-bold ${(customerData.account.balance) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {Math.abs(customerData.account.balance).toLocaleString('tr-TR')}₺
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {(customerData.account.balance) < 0 ? 'Borç (ödenecek)' : (customerData.account.balance) > 0 ? 'Alacak' : 'Hesap sıfır'}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link href="/musteri/katalog" className="card flex flex-col items-center py-6 hover:shadow-md transition-shadow">
          <span className="text-4xl mb-2">📦</span>
          <span className="font-medium text-gray-900">Katalog</span>
          <span className="text-xs text-gray-500">Ürünleri incele</span>
        </Link>
        <Link href="/musteri/sepet" className="card flex flex-col items-center py-6 hover:shadow-md transition-shadow">
          <span className="text-4xl mb-2">🛒</span>
          <span className="font-medium text-gray-900">Sepet</span>
          <span className="text-xs text-gray-500">Sipariş ver</span>
        </Link>
        <Link href="/musteri/siparislerim" className="card flex flex-col items-center py-6 hover:shadow-md transition-shadow relative">
          <span className="text-4xl mb-2">📋</span>
          <span className="font-medium text-gray-900">Siparişlerim</span>
          {customerData && customerData.pendingOrders > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {customerData.pendingOrders}
            </span>
          )}
        </Link>
        <Link href="/musteri/faturalarim" className="card flex flex-col items-center py-6 hover:shadow-md transition-shadow">
          <span className="text-4xl mb-2">🧾</span>
          <span className="font-medium text-gray-900">Faturalarım</span>
        </Link>
      </div>
    </div>
  )
}
