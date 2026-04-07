import DealerNav from '@/components/DealerNav'

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DealerNav />
      <main className="flex-1 md:ml-64 p-4 pb-24 md:pb-4">
        {children}
      </main>
    </div>
  )
}
