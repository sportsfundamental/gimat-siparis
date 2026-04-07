'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function GirisPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Hatalı e-posta veya şifre')
      } else {
        // Redirect based on role - fetch session
        const res = await fetch('/api/auth/session')
        const session = await res.json()
        if (session?.user?.role === 'SUPER_ADMIN') router.push('/admin')
        else if (session?.user?.role === 'DEALER') router.push('/panel')
        else router.push('/musteri')
        router.refresh()
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
            <div className="text-4xl mb-2">🏪</div>
            <h1 className="text-2xl font-bold text-gray-900">Gimat Sipariş</h1>
            <p className="text-gray-500 text-sm mt-1">Hesabınıza giriş yapın</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-posta</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="ornek@email.com"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Hesabınız yok mu?{' '}
            <Link href="/kayit" className="text-blue-600 font-medium">
              Müşteri Kaydı
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
