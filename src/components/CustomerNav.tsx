'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/musteri', icon: '🏠', label: 'Ana Sayfa' },
  { href: '/musteri/katalog', icon: '📦', label: 'Katalog' },
  { href: '/musteri/sepet', icon: '🛒', label: 'Sepet' },
  { href: '/musteri/siparislerim', icon: '📋', label: 'Siparişlerim' },
  { href: '/musteri/faturalarim', icon: '🧾', label: 'Faturalarım' },
]

export default function CustomerNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          <span className="font-bold text-gray-900">Gimat Sipariş</span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/giris' })}
          className="text-sm text-gray-500"
        >
          Çıkış
        </button>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center py-2 text-xs font-medium transition-colors ${
                pathname === item.href || (item.href !== '/musteri' && pathname.startsWith(item.href))
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
