'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function KayitPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    shopName: '',
    phone: '',
    address: '',
    dealerCode: '',
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/kayit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Kayıt oluşturulamadı')
      } else {
        toast.success('Kayıt başarılı! Giriş yapabilirsiniz.')
        router.push('/giris')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📝</div>
            <h1 className="text-2xl font-bold text-gray-900">Müşteri Kaydı</h1>
            <p className="text-gray-500 text-sm mt-1">Yeni hesap oluşturun</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="label">Adınız Soyadınız *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                placeholder="Ali Kaya"
                required
              />
            </div>
            <div>
              <label className="label">Dükkan Adı *</label>
              <input
                type="text"
                name="shopName"
                value={formData.shopName}
                onChange={handleChange}
                className="input"
                placeholder="Ali Market"
                required
              />
            </div>
            <div>
              <label className="label">E-posta *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
                placeholder="ali@market.com"
                required
              />
            </div>
            <div>
              <label className="label">Şifre *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input"
                placeholder="En az 6 karakter"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="label">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="0312 000 0000"
              />
            </div>
            <div>
              <label className="label">Adres</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="input"
                placeholder="Mahalle, sokak, il"
              />
            </div>
            <div>
              <label className="label">Toptancı Kodu *</label>
              <input
                type="text"
                name="dealerCode"
                value={formData.dealerCode}
                onChange={handleChange}
                className="input"
                placeholder="Toptancınızdan alın"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base mt-2"
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Hesabınız var mı?{' '}
            <Link href="/giris" className="text-blue-600 font-medium">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
