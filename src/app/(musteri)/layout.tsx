import CustomerNav from '@/components/CustomerNav'

export default function MusteriLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNav />
      <main className="pb-20 pt-0">
        {children}
      </main>
    </div>
  )
}
