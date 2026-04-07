import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, shopName, phone, address, dealerCode } = await req.json()

    if (!name || !email || !password || !shopName || !dealerCode) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    // Find dealer by email (dealerCode is dealer's email)
    const dealerUser = await prisma.user.findUnique({
      where: { email: dealerCode },
      include: { dealerProfile: true },
    })

    if (!dealerUser || !dealerUser.dealerProfile) {
      return NextResponse.json({ error: 'Geçersiz toptancı kodu' }, { status: 400 })
    }

    const dealer = dealerUser.dealerProfile

    // Check if email already exists
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
        dealerId: dealer.id,
      },
    })

    const customer = await prisma.customer.create({
      data: {
        name,
        shopName,
        phone: phone || null,
        address: address || null,
        dealerId: dealer.id,
        userId: user.id,
      },
    })

    await prisma.account.create({
      data: {
        customerId: customer.id,
        dealerId: dealer.id,
        balance: 0,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
