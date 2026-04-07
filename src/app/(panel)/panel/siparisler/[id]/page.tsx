'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import StatusBadge from '@/components/StatusBadge'
import { OrderStatus } from '@prisma/client'

interface OrderDetail {
  id: string
  totalAmount: number
  status: OrderStatus
  createdAt: string
  customer: { id: string; name: string; shopName: string; phone: string | null; address: string | null }
  items: {
    id: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: { name: string; barcode: string | null }
  }[]
  invoice: { id: string; invoiceNumber: string } | null
}

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'PENDING', label: 'Bekliyor' },
  { value: 'PREPARING', label: 'Hazırlanıyor' },
  { value: 'ON_THE_WAY', label: 'Yolda' },
  { value: 'DELIVERED', label: 'Teslim Edildi' },
  { value: 'CANCELLED', label: 'İptal' },
]

export default function SiparisDetayPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/panel/orders/${params.id}`)
      const data = await res.json()
      setOrder(data.order)
    } catch {
      toast.error('Sipariş yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  const handleStatusChange = async (status: OrderStatus) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/panel/orders/${params.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('Durum güncellendi')
        fetchOrder()
      } else {
        toast.error('Güncelleme başarısız')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleCreateInvoice = async () => {
    try {
      const res = await fetch('/api/panel/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: params.id }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Fatura oluşturuldu')
        router.push(`/panel/faturalar/${data.invoice.id}`)
      } else {
        toast.error(data.error || 'Fatura oluşturulamadı')
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
  if (!order) return <div className="text-center py-12 text-gray-500">Sipariş bulunamadı</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Geri</button>
      </div>

      <div className="card mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{order.customer.shopName}</h1>
            <p className="text-gray-500 text-sm">{order.customer.name}</p>
            <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {order.customer.phone && <p className="text-sm text-gray-600 mb-1">📞 {order.customer.phone}</p>}
        {order.customer.address && <p className="text-sm text-gray-600">📍 {order.customer.address}</p>}
      </div>

      {/* Items */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Ürünler</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <div className="font-medium text-sm">{item.product.name}</div>
                <div className="text-xs text-gray-500">{item.quantity} adet × {item.unitPrice.toLocaleString('tr-TR')}₺</div>
              </div>
              <div className="font-semibold text-sm">{item.totalPrice.toLocaleString('tr-TR')}₺</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-200">
          <span className="font-bold">Toplam</span>
          <span className="font-bold text-lg text-blue-600">{order.totalAmount.toLocaleString('tr-TR')}₺</span>
        </div>
      </div>

      {/* Status Update */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Durum Güncelle</h2>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              disabled={updatingStatus || order.status === option.value}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                order.status === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice */}
      <div className="card">
        {order.invoice ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Fatura</div>
              <div className="text-sm text-gray-500">{order.invoice.invoiceNumber}</div>
            </div>
            <a
              href={`/panel/faturalar/${order.invoice.id}`}
              className="btn-secondary text-sm"
            >
              Görüntüle →
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Fatura henüz oluşturulmadı</div>
            <button onClick={handleCreateInvoice} className="btn-primary text-sm">
              🧾 Fatura Oluştur
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
