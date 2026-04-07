'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface CustomerDetail {
  id: string
  name: string
  shopName: string
  phone: string | null
  address: string | null
  user: { email: string } | null
  account: { balance: number } | null
  orders: {
    id: string
    totalAmount: number
    status: string
    createdAt: string
  }[]
}

export default function MusteriDetayPage() {
  const params = useParams()
  const router = useRouter()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', shopName: '', phone: '', address: '' })

  const fetchCustomer = useCallback(async () => {
    try {
      const res = await fetch(`/api/panel/customers/${params.id}`)
      const data = await res.json()
      setCustomer(data.customer)
      if (data.customer) {
        setEditData({
          name: data.customer.name,
          shopName: data.customer.shopName,
          phone: data.customer.phone || '',
          address: data.customer.address || '',
        })
      }
    } catch {
      toast.error('Müşteri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/panel/customers/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        toast.success('Müşteri güncellendi')
        setEditing(false)
        fetchCustomer()
      } else {
        toast.error('Güncelleme başarısız')
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
  }

  const statusLabels: Record<string, string> = {
    PENDING: 'Bekliyor',
    PREPARING: 'Hazırlanıyor',
    ON_THE_WAY: 'Yolda',
    DELIVERED: 'Teslim Edildi',
    CANCELLED: 'İptal',
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
  if (!customer) return <div className="text-center py-12 text-gray-500">Müşteri bulunamadı</div>

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Geri</button>
      </div>

      <div className="card mb-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{customer.shopName}</h1>
            <p className="text-gray-500">{customer.name}</p>
          </div>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">✏️ Düzenle</button>
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="label">Ad Soyad</label>
              <input type="text" value={editData.name} onChange={(e) => setEditData(p => ({ ...p, name: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Dükkan Adı</label>
              <input type="text" value={editData.shopName} onChange={(e) => setEditData(p => ({ ...p, shopName: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input type="tel" value={editData.phone} onChange={(e) => setEditData(p => ({ ...p, phone: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Adres</label>
              <input type="text" value={editData.address} onChange={(e) => setEditData(p => ({ ...p, address: e.target.value }))} className="input" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Kaydet</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">İptal</button>
            </div>
          </form>
        ) : (
          <div className="space-y-2 text-sm">
            {customer.phone && <p className="text-gray-600">📞 {customer.phone}</p>}
            {customer.address && <p className="text-gray-600">📍 {customer.address}</p>}
            {customer.user && <p className="text-gray-600">📧 {customer.user.email}</p>}
          </div>
        )}
      </div>

      {/* Account Balance */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-2">Hesap Durumu</h2>
        <div className={`text-3xl font-bold ${(customer.account?.balance ?? 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {customer.account ? `${customer.account.balance.toLocaleString('tr-TR')}₺` : '0₺'}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {(customer.account?.balance ?? 0) < 0 ? 'Alacaklı (müşteri borçlu)' : (customer.account?.balance ?? 0) > 0 ? 'Borçlu (müşteri alacaklı)' : 'Hesap sıfır'}
        </p>
      </div>

      {/* Orders */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Siparişler</h2>
        {customer.orders.length === 0 ? (
          <p className="text-gray-500 text-sm">Henüz sipariş yok</p>
        ) : (
          <div className="space-y-2">
            {customer.orders.map((order) => (
              <Link
                key={order.id}
                href={`/panel/siparisler/${order.id}`}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</div>
                  <div className="text-xs text-gray-500">{statusLabels[order.status]}</div>
                </div>
                <div className="font-semibold text-sm">{order.totalAmount.toLocaleString('tr-TR')}₺</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
