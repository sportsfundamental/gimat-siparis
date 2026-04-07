'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'
import BarcodeScanner from '@/components/BarcodeScanner'

interface Product {
  id: string
  name: string
  barcode: string | null
  imageUrl: string | null
  prices: { salePrice: number; costPrice: number; customerId: string | null }[]
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    costPrice: '',
    salePrice: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/panel/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error('Ürünler yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleBarcodeScan = (barcode: string) => {
    setFormData((p) => ({ ...p, barcode }))
    setShowScanner(false)
    setShowForm(true)
    toast.success(`Barkod okundu: ${barcode}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/panel/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          barcode: formData.barcode || undefined,
          costPrice: parseFloat(formData.costPrice),
          salePrice: parseFloat(formData.salePrice),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Ürün eklendi')
        setShowForm(false)
        setFormData({ name: '', barcode: '', costPrice: '', salePrice: '' })
        fetchProducts()
      } else {
        toast.error(data.error || 'Hata oluştu')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.barcode && p.barcode.includes(search))
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowScanner(true)} className="btn-secondary text-sm">
            📷 Barkod
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
            + Ekle
          </button>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          placeholder="Ürün adı veya barkod ile ara..."
        />
      </div>

      {showForm && (
        <div className="card mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Yeni Ürün</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Ürün Adı *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="input"
                required
                placeholder="Deterjan 5kg"
              />
            </div>
            <div>
              <label className="label">Barkod</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.barcode}
                  onChange={(e) => setFormData((p) => ({ ...p, barcode: e.target.value }))}
                  className="input"
                  placeholder="8690804110017"
                />
                <button
                  type="button"
                  onClick={() => setShowScanner(true)}
                  className="btn-secondary whitespace-nowrap"
                >
                  📷
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Maliyet Fiyatı (₺) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData((p) => ({ ...p, costPrice: e.target.value }))}
                  className="input"
                  required
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="label">Satış Fiyatı (₺) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.salePrice}
                  onChange={(e) => setFormData((p) => ({ ...p, salePrice: e.target.value }))}
                  className="input"
                  required
                  placeholder="0.00"
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
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500">{search ? 'Arama sonucu bulunamadı' : 'Henüz ürün yok'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => {
            const defaultPrice = product.prices.find((p) => !p.customerId)
            return (
              <Link
                key={product.id}
                href={`/panel/urunler/${product.id}`}
                className="card flex items-center gap-3 hover:shadow-md transition-shadow"
              >
                {product.imageUrl ? (
                  <div className="w-14 h-14 relative rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📦</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  {product.barcode && (
                    <div className="text-xs text-gray-500">📊 {product.barcode}</div>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  {defaultPrice ? (
                    <>
                      <div className="font-semibold text-blue-600">{defaultPrice.salePrice.toLocaleString('tr-TR')}₺</div>
                      <div className="text-xs text-gray-400">Maliyet: {defaultPrice.costPrice.toLocaleString('tr-TR')}₺</div>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">Fiyat yok</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {showScanner && (
        <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  )
}
