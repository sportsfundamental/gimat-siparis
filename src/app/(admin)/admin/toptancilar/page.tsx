'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface Dealer {
  id: string
  name: string
  phone: string | null
  address: string | null
  user: { email: string; name: string }
  createdAt: string
  _count: { customers: number; products: number; orders: number }
}

export default function ToptancilarPage() {
  const [dealers, setDealers] = useState<Dealer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDealers()
  }, [])

  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/admin/dealers')
      const data = await res.json()
      setDealers(data.dealers || [])
    } catch {
      toast.error('Veriler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/dealers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Toptancı eklendi')
        setShowForm(false)
        setFormData({ name: '', email: '', password: '', phone: '', address: '' })
        fetchDealers()
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Toptancılar</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Yeni Toptancı
        </button>
      </div>

      {showForm && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Yeni Toptancı Ekle</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label">Firma Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input"
                  required
                  placeholder="Hasan Toptancılık"
                />
              </div>
              <div>
                <label className="label">E-posta *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="input"
                  required
                  placeholder="hasan@gimat.com"
                />
              </div>
              <div>
                <label className="label">Şifre *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="input"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="label">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="input"
                  placeholder="0312 000 0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Adres</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  className="input"
                  placeholder="Gimat Çarşısı No:..."
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : dealers.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🏪</div>
          <p className="text-gray-500">Henüz toptancı yok</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dealers.map((dealer) => (
            <div key={dealer.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{dealer.name}</h3>
                  <p className="text-sm text-gray-500">{dealer.user.email}</p>
                  {dealer.phone && <p className="text-sm text-gray-500">{dealer.phone}</p>}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>{dealer._count.customers} müşteri</div>
                  <div>{dealer._count.products} ürün</div>
                  <div>{dealer._count.orders} sipariş</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
