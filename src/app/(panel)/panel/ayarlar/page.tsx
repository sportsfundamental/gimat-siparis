'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { signOut } from 'next-auth/react'
import toast from 'react-hot-toast'

export default function AyarlarPage() {
  const { data: session } = useSession()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor')
      return
    }
    if (formData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalı')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/panel/settings/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })
      if (res.ok) {
        toast.success('Şifre güncellendi')
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const data = await res.json()
        toast.error(data.error || 'Şifre güncellenemedi')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Hesap Bilgileri</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Ad Soyad</span>
            <span className="font-medium">{session?.user?.name}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-500">E-posta</span>
            <span className="font-medium">{session?.user?.email}</span>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Şifre Değiştir</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="label">Mevcut Şifre</label>
            <input
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData(p => ({ ...p, currentPassword: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Yeni Şifre</label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData(p => ({ ...p, newPassword: e.target.value }))}
              className="input"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="label">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(p => ({ ...p, confirmPassword: e.target.value }))}
              className="input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-3">Oturum</h2>
        <button
          onClick={() => signOut({ callbackUrl: '/giris' })}
          className="btn-danger w-full"
        >
          🚪 Çıkış Yap
        </button>
      </div>
    </div>
  )
}
