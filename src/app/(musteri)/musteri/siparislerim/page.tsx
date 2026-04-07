'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import StatusBadge from '@/components/StatusBadge'
import { OrderStatus } from '@prisma/client'

interface Order {
  id: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  _count: { items: number }
}

export default function SiparislerimPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/musteri/orders')
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      toast.error('Siparişler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Siparişlerim</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : orders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500">Henüz sipariş yok</p>
          <a href="/musteri/katalog" className="btn-primary mt-4 inline-block">
            Sipariş Ver
          </a>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <div className="text-xs text-gray-500">{order._count.items} ürün</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600 mb-1">{order.totalAmount.toLocaleString('tr-TR')}₺</div>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* Status progress */}
              {order.status !== 'CANCELLED' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    {['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'].map((s, i) => {
                      const steps = ['PENDING', 'PREPARING', 'ON_THE_WAY', 'DELIVERED']
                      const currentIndex = steps.indexOf(order.status)
                      const stepIndex = steps.indexOf(s)
                      const labels = ['Alındı', 'Hazırlanıyor', 'Yolda', 'Teslim']
                      return (
                        <div key={s} className="flex flex-col items-center flex-1">
                          <div className={`w-4 h-4 rounded-full flex-shrink-0 ${stepIndex <= currentIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                          <span className={`text-xs mt-1 ${stepIndex <= currentIndex ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                            {labels[i]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
