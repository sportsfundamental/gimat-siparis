import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  if (!dealerId) return NextResponse.json({ error: 'Toptancı bulunamadı' }, { status: 400 })

  const { searchParams } = new URL(req.url)
  const statusParam = searchParams.get('status')

  const where: { dealerId: string; status?: OrderStatus } = { dealerId }
  if (statusParam && Object.values(OrderStatus).includes(statusParam as OrderStatus)) {
    where.status = statusParam as OrderStatus
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      customer: { select: { name: true, shopName: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ orders })
}
