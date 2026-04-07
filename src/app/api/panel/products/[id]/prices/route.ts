import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  const product = await prisma.product.findFirst({ where: { id: params.id, dealerId } })
  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })

  const { customerId, costPrice, salePrice } = await req.json()

  // Delete existing price for this customer (or default)
  await prisma.productPrice.deleteMany({
    where: {
      productId: params.id,
      customerId: customerId || null,
    },
  })

  const price = await prisma.productPrice.create({
    data: {
      productId: params.id,
      customerId: customerId || null,
      costPrice: parseFloat(costPrice),
      salePrice: parseFloat(salePrice),
    },
  })

  return NextResponse.json({ price }, { status: 201 })
}
