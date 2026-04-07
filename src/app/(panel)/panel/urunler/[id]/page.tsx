'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import ImageUpload from '@/components/ImageUpload'

interface ProductPrice {
  id: string
  customerId: string | null
  costPrice: number
  salePrice: number
  customer?: { name: string; shopName: string }
}

interface Product {
  id: string
  name: string
  barcode: string | null
  imageUrl: string | null
  prices: ProductPrice[]
}

interface Customer {
  id: string
  name: string
  shopName: string
}

export default function UrunDetayPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', barcode: '', imageUrl: '' })
  const [priceForm, setPriceForm] = useState({ customerId: '', costPrice: '', salePrice: '' })
  const [savingPrice, setSavingPrice] = useState(false)

  const fetchProduct = useCallback(async () => {
    try {
      const [prodRes, custRes] = await Promise.all([
        fetch(`/api/panel/products/${params.id}`),
        fetch('/api/panel/customers'),
      ])
      const prodData = await prodRes.json()
      const custData = await custRes.json()
      setProduct(prodData.product)
      setCustomers(custData.customers || [])
      if (prodData.product) {
        setEditData({
          name: prodData.product.name,
          barcode: prodData.product.barcode || '',
          imageUrl: prodData.product.imageUrl || '',
        })
      }
    } catch {
      toast.error('Ürün yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/panel/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        toast.success('Ürün güncellendi')
        setEditing(false)
        fetchProduct()
      } else {
        toast.error('Güncelleme başarısız')
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz?')) return
    try {
      const res = await fetch(`/api/panel/products/${params.id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Ürün silindi')
        router.push('/panel/urunler')
      } else {
        toast.error('Silinemedi')
      }
    } catch {
      toast.error('Bir hata oluştu')
    }
  }

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPrice(true)
    try {
      const res = await fetch(`/api/panel/products/${params.id}/prices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: priceForm.customerId || null,
          costPrice: parseFloat(priceForm.costPrice),
          salePrice: parseFloat(priceForm.salePrice),
        }),
      })
      if (res.ok) {
        toast.success('Fiyat kaydedildi')
        setPriceForm({ customerId: '', costPrice: '', salePrice: '' })
        fetchProduct()
      } else {
        toast.error('Fiyat kaydedilemedi')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setSavingPrice(false)
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
  if (!product) return <div className="text-center py-12 text-gray-500">Ürün bulunamadı</div>

  const defaultPrice = product.prices.find((p) => !p.customerId)
  const customerPrices = product.prices.filter((p) => p.customerId)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          ← Geri
        </button>
      </div>

      <div className="card mb-4">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">{product.name}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm">
              ✏️ Düzenle
            </button>
            <button onClick={handleDelete} className="btn-danger text-sm">
              🗑️
            </button>
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleUpdate} className="space-y-3">
            <div>
              <label className="label">Ürün Adı</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Barkod</label>
              <input
                type="text"
                value={editData.barcode}
                onChange={(e) => setEditData((p) => ({ ...p, barcode: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">Fotoğraf</label>
              <ImageUpload
                currentImage={editData.imageUrl}
                onUpload={(url) => setEditData((p) => ({ ...p, imageUrl: url }))}
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Kaydet</button>
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">İptal</button>
            </div>
          </form>
        ) : (
          <div className="flex gap-4">
            {product.imageUrl ? (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">📦</span>
              </div>
            )}
            <div>
              {product.barcode && (
                <p className="text-sm text-gray-500">Barkod: {product.barcode}</p>
              )}
              {defaultPrice && (
                <div className="mt-2">
                  <p className="text-sm">Satış: <span className="font-semibold text-blue-600">{defaultPrice.salePrice}₺</span></p>
                  <p className="text-sm">Maliyet: <span className="font-semibold">{defaultPrice.costPrice}₺</span></p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Customer Prices */}
      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Müşteri Özel Fiyatları</h2>
        <form onSubmit={handleSavePrice} className="space-y-3 mb-4">
          <div>
            <label className="label">Müşteri (Boş = Varsayılan Fiyat)</label>
            <select
              value={priceForm.customerId}
              onChange={(e) => setPriceForm((p) => ({ ...p, customerId: e.target.value }))}
              className="input"
            >
              <option value="">Varsayılan (Tüm Müşteriler)</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.shopName} - {c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Maliyet (₺)</label>
              <input
                type="number"
                step="0.01"
                value={priceForm.costPrice}
                onChange={(e) => setPriceForm((p) => ({ ...p, costPrice: e.target.value }))}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Satış (₺)</label>
              <input
                type="number"
                step="0.01"
                value={priceForm.salePrice}
                onChange={(e) => setPriceForm((p) => ({ ...p, salePrice: e.target.value }))}
                className="input"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={savingPrice} className="btn-primary text-sm">
            {savingPrice ? 'Kaydediliyor...' : 'Fiyat Kaydet'}
          </button>
        </form>

        {customerPrices.length > 0 && (
          <div className="border-t pt-3 space-y-2">
            {customerPrices.map((price) => (
              <div key={price.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{price.customer?.shopName}</span>
                <span className="font-semibold text-blue-600">{price.salePrice}₺</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
