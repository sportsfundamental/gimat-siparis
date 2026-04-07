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

  const products = await prisma.product.findMany({
    where: { dealerId },
    include: {
      prices: {
        include: { customer: { select: { name: true, shopName: true } } },
      },
    },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ products })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  if (!dealerId) return NextResponse.json({ error: 'Toptancı bulunamadı' }, { status: 400 })

  try {
    const { name, barcode, costPrice, salePrice } = await req.json()

    if (!name || costPrice == null || salePrice == null) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name,
        barcode: barcode || null,
        dealerId,
        prices: {
          create: {
            costPrice: parseFloat(costPrice),
            salePrice: parseFloat(salePrice),
          },
        },
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
