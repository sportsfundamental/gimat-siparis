'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/panel', icon: '📊', label: 'Panel' },
  { href: '/panel/urunler', icon: '📦', label: 'Ürünler' },
  { href: '/panel/musteriler', icon: '👥', label: 'Müşteriler' },
  { href: '/panel/siparisler', icon: '🛒', label: 'Siparişler' },
  { href: '/panel/faturalar', icon: '🧾', label: 'Faturalar' },
]

export default function DealerNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 min-h-screen bg-white border-r border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="text-2xl mb-1">🏪</div>
          <h2 className="font-bold text-lg text-gray-900">Gimat Sipariş</h2>
          <p className="text-xs text-gray-500">Toptancı Paneli</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <Link
            href="/panel/alisveris-listesi"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/panel/alisveris-listesi'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📋</span>
            Alışveriş Listesi
          </Link>
          <Link
            href="/panel/raporlar"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/panel/raporlar'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">📈</span>
            Raporlar
          </Link>
          <Link
            href="/panel/ayarlar"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/panel/ayarlar'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg">⚙️</span>
            Ayarlar
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => signOut({ callbackUrl: '/giris' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="text-lg">🚪</span>
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
        <div className="flex">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
