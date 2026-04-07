import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { PaymentMethod } from '@prisma/client'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  const dealerId = session.user.dealerId

  const invoice = await prisma.invoice.findFirst({
    where: { id, order: { dealerId } },
    include: { order: { select: { customerId: true } } },
  })

  if (!invoice) return NextResponse.json({ error: 'Fatura bulunamadı' }, { status: 404 })

  const { amount, method, note } = await req.json()

  if (!amount || !method) {
    return NextResponse.json({ error: 'Tutar ve ödeme yöntemi gerekli' }, { status: 400 })
  }

  if (!Object.values(PaymentMethod).includes(method)) {
    return NextResponse.json({ error: 'Geçersiz ödeme yöntemi' }, { status: 400 })
  }

  const payment = await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      customerId: invoice.order.customerId,
      amount: parseFloat(amount),
      method,
      note: note || null,
    },
  })

  // Update account balance
  await prisma.account.updateMany({
    where: {
      customerId: invoice.order.customerId,
      dealerId,
    },
    data: {
      balance: {
        increment: parseFloat(amount),
      },
    },
  })

  return NextResponse.json({ payment }, { status: 201 })
}
