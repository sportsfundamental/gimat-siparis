'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export default function SepetPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const loadCart = useCallback(async () => {
    const saved = localStorage.getItem('cart')
    if (!saved) {
      setLoading(false)
      return
    }
    const cartData: Record<string, number> = JSON.parse(saved)
    if (Object.keys(cartData).length === 0) {
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/musteri/catalog')
      const data = await res.json()
      const products: { id: string; name: string; price: number }[] = data.products || []

      const items: CartItem[] = []
      for (const [productId, quantity] of Object.entries(cartData)) {
        const product = products.find((p) => p.id === productId)
        if (product && quantity > 0) {
          items.push({ productId, name: product.name, price: product.price, quantity })
        }
      }
      setCartItems(items)
    } catch {
      toast.error('Sepet yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      const updated = prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      ).filter((item) => item.quantity > 0)

      const cartObj: Record<string, number> = {}
      updated.forEach((item) => { cartObj[item.productId] = item.quantity })
      localStorage.setItem('cart', JSON.stringify(cartObj))
      return updated
    })
  }

  const handleOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Sepet boş')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/musteri/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Sipariş verildi!')
        localStorage.removeItem('cart')
        setCartItems([])
        router.push('/musteri/siparislerim')
      } else {
        toast.error(data.error || 'Sipariş verilemedi')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const total = cartItems.reduce((s, item) => s + item.price * item.quantity, 0)

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Sepetim</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : cartItems.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🛒</div>
          <p className="text-gray-500">Sepet boş</p>
          <a href="/musteri/katalog" className="btn-primary mt-4 inline-block">
            Kataloga Git
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="card flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-blue-600 font-semibold">{(item.price * item.quantity).toLocaleString('tr-TR')}₺</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold"
                  >
                    −
                  </button>
                  <span className="w-8 text-center font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card mb-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Toplam</span>
              <span className="font-bold text-2xl text-blue-600">{total.toLocaleString('tr-TR')}₺</span>
            </div>
          </div>

          <button
            onClick={handleOrder}
            disabled={submitting}
            className="btn-primary w-full py-4 text-base"
          >
            {submitting ? 'Sipariş veriliyor...' : '✅ Sipariş Ver'}
          </button>
        </>
      )}
    </div>
  )
}
