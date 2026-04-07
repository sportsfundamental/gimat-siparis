import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  if (!dealerId) return NextResponse.json({ error: 'Toptancı bulunamadı' }, { status: 400 })

  const invoices = await prisma.invoice.findMany({
    where: { order: { dealerId } },
    include: {
      order: {
        include: { customer: { select: { name: true, shopName: true } } },
      },
      payments: { select: { amount: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ invoices })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  if (!dealerId) return NextResponse.json({ error: 'Toptancı bulunamadı' }, { status: 400 })

  try {
    const { orderId } = await req.json()

    const order = await prisma.order.findFirst({
      where: { id: orderId, dealerId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
    }

    const existing = await prisma.invoice.findUnique({ where: { orderId } })
    if (existing) {
      return NextResponse.json({ error: 'Bu sipariş için zaten fatura var', invoice: existing }, { status: 400 })
    }

    // Generate invoice number
    const count = await prisma.invoice.count()
    const invoiceNumber = `FTR-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const invoice = await prisma.invoice.create({
      data: {
        orderId,
        invoiceNumber,
        totalAmount: order.totalAmount,
      },
    })

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
