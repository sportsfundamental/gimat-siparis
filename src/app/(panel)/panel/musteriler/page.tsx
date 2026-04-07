'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Customer {
  id: string
  name: string
  shopName: string
  phone: string | null
  address: string | null
  account: { balance: number } | null
  _count: { orders: number }
}

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    shopName: '',
    phone: '',
    address: '',
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/panel/customers')
      const data = await res.json()
      setCustomers(data.customers || [])
    } catch {
      toast.error('Müşteriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/panel/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Müşteri eklendi')
        setShowForm(false)
        setFormData({ name: '', shopName: '', phone: '', address: '', email: '', password: '' })
        fetchCustomers()
      } else {
        toast.error(data.error || 'Hata oluştu')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Ekle
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Yeni Müşteri</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Ad Soyad *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="label">Dükkan Adı *</label>
                <input type="text" value={formData.shopName} onChange={(e) => setFormData(p => ({ ...p, shopName: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Adres</label>
                <input type="text" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">E-posta (giriş için)</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} className="input" />
              </div>
              <div>
                <label className="label">Şifre (giriş için)</label>
                <input type="password" value={formData.password} onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))} className="input" minLength={6} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary">{submitting ? 'Kaydediliyor...' : 'Kaydet'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">İptal</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : customers.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">👥</div>
          <p className="text-gray-500">Henüz müşteri yok</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/panel/musteriler/${customer.id}`}
              className="card flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="font-medium text-gray-900">{customer.shopName}</div>
                <div className="text-sm text-gray-500">{customer.name}</div>
                {customer.phone && <div className="text-xs text-gray-400">{customer.phone}</div>}
              </div>
              <div className="text-right">
                <div className={`font-semibold text-sm ${(customer.account?.balance ?? 0) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {customer.account ? `${customer.account.balance.toLocaleString('tr-TR')}₺` : '—'}
                </div>
                <div className="text-xs text-gray-500">{customer._count.orders} sipariş</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
