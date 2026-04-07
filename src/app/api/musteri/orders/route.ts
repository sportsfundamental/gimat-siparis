import { NextRequest, NextResponse } from 'next/server'
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

  const orders = await prisma.order.findMany({
    where: { customerId: customer.id },
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'CUSTOMER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: { userId: session.user.id },
    })

    if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })

    const { items } = await req.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 })
    }

    // Validate products and get prices
    const orderItems: { productId: string; quantity: number; unitPrice: number; totalPrice: number }[] = []
    let totalAmount = 0

    for (const item of items) {
      const product = await prisma.product.findFirst({
        where: { id: item.productId, dealerId: customer.dealerId },
        include: { prices: true },
      })

      if (!product) continue

      const specificPrice = product.prices.find((p) => p.customerId === customer.id)
      const defaultPrice = product.prices.find((p) => p.customerId === null)
      const activePrice = specificPrice || defaultPrice

      if (!activePrice) continue

      const unitPrice = activePrice.salePrice
      const totalPrice = unitPrice * item.quantity

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      })

      totalAmount += totalPrice
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'Geçerli ürün bulunamadı' }, { status: 400 })
    }

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        dealerId: customer.dealerId,
        totalAmount,
        items: {
          create: orderItems,
        },
      },
    })

    // Update account balance (debit)
    await prisma.account.updateMany({
      where: { customerId: customer.id },
      data: { balance: { decrement: totalAmount } },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
