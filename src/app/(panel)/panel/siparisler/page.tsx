'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import StatusBadge from '@/components/StatusBadge'
import { OrderStatus } from '@prisma/client'

interface Order {
  id: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  customer: { name: string; shopName: string }
  _count: { items: number }
}

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      const url = statusFilter ? `/api/panel/orders?status=${statusFilter}` : '/api/panel/orders'
      const res = await fetch(url)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      toast.error('Siparişler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
      </div>

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">Tüm Siparişler</option>
          <option value="PENDING">Bekleyen</option>
          <option value="PREPARING">Hazırlanıyor</option>
          <option value="ON_THE_WAY">Yolda</option>
          <option value="DELIVERED">Teslim Edildi</option>
          <option value="CANCELLED">İptal</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-gray-500">Sipariş bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/panel/siparisler/${order.id}`}
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="font-medium text-gray-900">{order.customer.shopName}</div>
                <div className="text-sm text-gray-500">{order.customer.name}</div>
                <div className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR')} · {order._count.items} ürün
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900 mb-1">{order.totalAmount.toLocaleString('tr-TR')}₺</div>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
