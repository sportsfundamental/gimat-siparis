import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { Role } from '@prisma/client'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  if (!dealerId) return NextResponse.json({ error: 'Toptancı bulunamadı' }, { status: 400 })

  const customers = await prisma.customer.findMany({
    where: { dealerId },
    include: {
      account: true,
      _count: { select: { orders: true } },
    },
    orderBy: { shopName: 'asc' },
  })

  return NextResponse.json({ customers })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'DEALER') {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  const dealerId = session.user.dealerId
  if (!dealerId) return NextResponse.json({ error: 'Toptancı bulunamadı' }, { status: 400 })

  try {
    const { name, shopName, phone, address, email, password } = await req.json()

    if (!name || !shopName) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    let userId: string | undefined

    if (email && password) {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) {
        return NextResponse.json({ error: 'Bu e-posta zaten kullanılıyor' }, { status: 400 })
      }
      const hashedPassword = await bcrypt.hash(password, 10)
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: Role.CUSTOMER,
          dealerId,
        },
      })
      userId = user.id
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        shopName,
        phone: phone || null,
        address: address || null,
        dealerId,
        userId: userId || null,
      },
    })

    await prisma.account.create({
      data: {
        customerId: customer.id,
        dealerId,
        balance: 0,
      },
    })

    return NextResponse.json({ customer }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
