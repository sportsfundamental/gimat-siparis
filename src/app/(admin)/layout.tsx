import Link from 'next/link'
import { signOut } from 'next-auth/react'
import AdminNav from '@/components/AdminNav'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNav />
      <main className="flex-1 md:ml-64 p-4 pb-24 md:pb-4">
        {children}
      </main>
    </div>
  )
}
