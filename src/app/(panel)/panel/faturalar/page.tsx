'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  createdAt: string
  order: {
    customer: { name: string; shopName: string }
    status: string
  }
  payments: { amount: number }[]
}

export default function FaturalarPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/panel/invoices')
      const data = await res.json()
      setInvoices(data.invoices || [])
    } catch {
      toast.error('Faturalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Faturalar</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🧾</div>
          <p className="text-gray-500">Henüz fatura yok</p>
          <p className="text-xs text-gray-400 mt-2">Sipariş detayından fatura oluşturabilirsiniz</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => {
            const paid = invoice.payments.reduce((s, p) => s + p.amount, 0)
            const remaining = invoice.totalAmount - paid
            return (
              <Link
                key={invoice.id}
                href={`/panel/faturalar/${invoice.id}`}
                className="card flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                  <div className="text-sm text-gray-500">{invoice.order.customer.shopName}</div>
                  <div className="text-xs text-gray-400">{new Date(invoice.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{invoice.totalAmount.toLocaleString('tr-TR')}₺</div>
                  {remaining > 0 ? (
                    <div className="text-xs text-red-500">Kalan: {remaining.toLocaleString('tr-TR')}₺</div>
                  ) : (
                    <div className="text-xs text-green-600">Ödendi ✓</div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
