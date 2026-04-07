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
  const product = await prisma.product.findFirst({
    where: { id, dealerId },
    include: {
      prices: {
        include: { customer: { select: { name: true, shopName: true } } },
      },
    },
  })

  if (!product) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })
  return NextResponse.json({ product })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  const dealerId = session.user.dealerId
  const existing = await prisma.product.findFirst({ where: { id, dealerId } })
  if (!existing) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })

  const { name, barcode, imageUrl } = await req.json()

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: name || existing.name,
      barcode: barcode !== undefined ? barcode || null : existing.barcode,
      imageUrl: imageUrl !== undefined ? imageUrl || null : existing.imageUrl,
    },
  })

  return NextResponse.json({ product })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const { id } = await params
  const dealerId = session.user.dealerId
  const existing = await prisma.product.findFirst({ where: { id, dealerId } })
  if (!existing) return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 })

  await prisma.productPrice.deleteMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
