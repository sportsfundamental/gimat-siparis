import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  const dealerId = session.user.dealerId
  const order = await prisma.order.findFirst({
    where: { id, dealerId },
    include: {
      customer: true,
      items: {
        include: { product: { select: { name: true, barcode: true } } },
      },
      invoice: { select: { id: true, invoiceNumber: true } },
    },
  })

  if (!order) return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 })
  return NextResponse.json({ order })
}
