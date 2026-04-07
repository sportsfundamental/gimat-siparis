import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const customer = await prisma.customer.findFirst({
    where: { userId: session.user.id },
  })

  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })

  const products = await prisma.product.findMany({
    where: { dealerId: customer.dealerId },
    include: {
      prices: true,
    },
    orderBy: { name: 'asc' },
  })

  const catalog = products.map((product) => {
    // Customer-specific price or default
    const specificPrice = product.prices.find((p) => p.customerId === customer.id)
    const defaultPrice = product.prices.find((p) => p.customerId === null)
    const activePrice = specificPrice || defaultPrice

    return {
      id: product.id,
      name: product.name,
      barcode: product.barcode,
      imageUrl: product.imageUrl,
      price: activePrice?.salePrice ?? 0,
    }
  }).filter((p) => p.price > 0)

  return NextResponse.json({ products: catalog })
}
