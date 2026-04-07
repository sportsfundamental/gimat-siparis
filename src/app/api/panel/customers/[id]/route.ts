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
  const customer = await prisma.customer.findFirst({
    where: { id, dealerId },
    include: {
      user: { select: { email: true } },
      account: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        select: { id: true, totalAmount: true, status: true, createdAt: true },
        take: 10,
      },
    },
  })

  if (!customer) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
  return NextResponse.json({ customer })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  const dealerId = session.user.dealerId
  const existing = await prisma.customer.findFirst({ where: { id, dealerId } })
  if (!existing) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })

  const { name, shopName, phone, address } = await req.json()

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: name || existing.name,
      shopName: shopName || existing.shopName,
      phone: phone !== undefined ? phone || null : existing.phone,
      address: address !== undefined ? address || null : existing.address,
    },
  })

  return NextResponse.json({ customer })
}
