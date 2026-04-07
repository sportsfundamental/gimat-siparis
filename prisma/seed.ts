import { PrismaClient, Role, OrderStatus, StockMovementType, PaymentMethod } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed başlıyor...')

  // Super Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gimat.com' },
    update: {},
    create: {
      email: 'admin@gimat.com',
      password: adminPassword,
      name: 'Sistem Yöneticisi',
      role: Role.SUPER_ADMIN,
    },
  })
  console.log('Admin oluşturuldu:', admin.email)

  // Dealer Hasan
  const hasanPassword = await bcrypt.hash('hasan123', 10)
  const hasanUser = await prisma.user.upsert({
    where: { email: 'hasan@gimat.com' },
    update: {},
    create: {
      email: 'hasan@gimat.com',
      password: hasanPassword,
      name: 'Hasan Yılmaz',
      role: Role.DEALER,
    },
  })

  const hasanDealer = await prisma.dealer.upsert({
    where: { userId: hasanUser.id },
    update: {},
    create: {
      name: 'Hasan Toptancılık',
      phone: '0312 555 1234',
      address: 'Gimat Çarşısı No:42, Yenimahalle, Ankara',
      userId: hasanUser.id,
    },
  })
  console.log('Toptancı oluşturuldu:', hasanDealer.name)

  // Customer Ali
  const aliPassword = await bcrypt.hash('ali123', 10)
  const aliUser = await prisma.user.upsert({
    where: { email: 'ali@market.com' },
    update: {},
    create: {
      email: 'ali@market.com',
      password: aliPassword,
      name: 'Ali Kaya',
      role: Role.CUSTOMER,
      dealerId: hasanDealer.id,
    },
  })

  const aliCustomer = await prisma.customer.upsert({
    where: { userId: aliUser.id },
    update: {},
    create: {
      name: 'Ali Kaya',
      shopName: 'Ali Market',
      address: 'Atatürk Mahallesi No:15, Etimesgut, Ankara',
      phone: '0312 666 7890',
      dealerId: hasanDealer.id,
      userId: aliUser.id,
    },
  })
  console.log('Müşteri oluşturuldu:', aliCustomer.shopName)

  // Customer account
  await prisma.account.upsert({
    where: { customerId: aliCustomer.id },
    update: {},
    create: {
      customerId: aliCustomer.id,
      dealerId: hasanDealer.id,
      balance: -250.00,
    },
  })

  // Sample Products
  const products = [
    { name: 'Deterjan 5kg', barcode: '8690804110017' },
    { name: 'Çamaşır Suyu 1L', barcode: '8690804523017' },
    { name: 'Sıvı Sabun 1L', barcode: '8690526001234' },
    { name: 'Tuvalet Kağıdı 32li', barcode: '8690604019876' },
    { name: 'Kağıt Havlu 12li', barcode: '8691500075432' },
  ]

  const priceData = [
    { cost: 85, sale: 120 },
    { cost: 18, sale: 28 },
    { cost: 22, sale: 35 },
    { cost: 65, sale: 95 },
    { cost: 45, sale: 68 },
  ]

  const createdProducts = []
  for (let i = 0; i < products.length; i++) {
    const product = await prisma.product.create({
      data: {
        ...products[i],
        dealerId: hasanDealer.id,
      },
    })

    // Default price
    await prisma.productPrice.create({
      data: {
        productId: product.id,
        costPrice: priceData[i].cost,
        salePrice: priceData[i].sale,
      },
    })

    // Stock in
    await prisma.stockMovement.create({
      data: {
        productId: product.id,
        quantity: 100,
        type: StockMovementType.IN,
        note: 'Açılış stoğu',
      },
    })

    createdProducts.push(product)
  }
  console.log('Ürünler oluşturuldu:', createdProducts.length)

  // Ali için özel fiyat (Deterjan)
  await prisma.productPrice.create({
    data: {
      productId: createdProducts[0].id,
      customerId: aliCustomer.id,
      costPrice: 85,
      salePrice: 110,
    },
  })

  // Sample Order
  const order = await prisma.order.create({
    data: {
      customerId: aliCustomer.id,
      dealerId: hasanDealer.id,
      status: OrderStatus.DELIVERED,
      totalAmount: 250.00,
      items: {
        create: [
          {
            productId: createdProducts[0].id,
            quantity: 1,
            unitPrice: 110,
            totalPrice: 110,
          },
          {
            productId: createdProducts[1].id,
            quantity: 5,
            unitPrice: 28,
            totalPrice: 140,
          },
        ],
      },
    },
  })

  // Invoice
  await prisma.invoice.create({
    data: {
      orderId: order.id,
      invoiceNumber: 'FTR-2024-0001',
      totalAmount: 250.00,
    },
  })

  console.log('Sipariş ve fatura oluşturuldu')
  console.log('\n=== Seed tamamlandı ===')
  console.log('Admin: admin@gimat.com / admin123')
  console.log('Toptancı: hasan@gimat.com / hasan123')
  console.log('Müşteri: ali@market.com / ali123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
