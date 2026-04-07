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

  const invoices = await prisma.invoice.findMany({
    where: { order: { customerId: customer.id } },
    include: {
      payments: { select: { amount: true } },
      order: {
        include: {
          items: {
            include: { product: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ invoices })
}
