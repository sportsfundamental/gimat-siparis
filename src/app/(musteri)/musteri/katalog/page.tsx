'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import toast from 'react-hot-toast'

interface CatalogProduct {
  id: string
  name: string
  barcode: string | null
  imageUrl: string | null
  price: number
}

export default function KatalogPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<Record<string, number>>({})

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/musteri/catalog')
      const data = await res.json()
      setProducts(data.products || [])
    } catch {
      toast.error('Katalog yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCatalog()
    // Load cart from localStorage
    const saved = localStorage.getItem('cart')
    if (saved) setCart(JSON.parse(saved))
  }, [fetchCatalog])

  const updateCart = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0
      const next = Math.max(0, current + delta)
      const updated = { ...prev }
      if (next === 0) delete updated[productId]
      else updated[productId] = next
      localStorage.setItem('cart', JSON.stringify(updated))
      return updated
    })
  }

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const cartCount = Object.values(cart).reduce((s, v) => s + v, 0)

  return (
    <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Katalog</h1>
        {cartCount > 0 && (
          <a href="/musteri/sepet" className="btn-primary text-sm relative">
            🛒 Sepet ({cartCount})
          </a>
        )}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input"
          placeholder="Ürün ara..."
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">📦</div>
          <p className="text-gray-500">{search ? 'Sonuç bulunamadı' : 'Katalog boş'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <div key={product.id} className="card flex items-center gap-3">
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
                <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                <div className="font-bold text-blue-600">{product.price.toLocaleString('tr-TR')}₺</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {cart[product.id] ? (
                  <>
                    <button
                      onClick={() => updateCart(product.id, -1)}
                      className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold">{cart[product.id]}</span>
                    <button
                      onClick={() => updateCart(product.id, 1)}
                      className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateCart(product.id, 1)}
                    className="btn-primary text-sm py-1.5 px-3"
                  >
                    Ekle
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
