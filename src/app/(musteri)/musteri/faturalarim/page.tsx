'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  totalAmount: number
  createdAt: string
  payments: { amount: number }[]
  order: {
    items: {
      quantity: number
      unitPrice: number
      totalPrice: number
      product: { name: string }
    }[]
  }
}

export default function FaturalarimPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchInvoices = useCallback(async () => {
    try {
      const res = await fetch('/api/musteri/invoices')
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

  const handleDownloadPDF = async (invoice: Invoice) => {
    const { default: jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('FATURA', 105, 20, { align: 'center' })
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    doc.text(`Fatura No: ${invoice.invoiceNumber}`, 14, 35)
    doc.text(`Tarih: ${new Date(invoice.createdAt).toLocaleDateString('tr-TR')}`, 14, 42)

    const tableData = invoice.order.items.map((item) => [
      item.product.name,
      item.quantity.toString(),
      `${item.unitPrice.toLocaleString('tr-TR')} TL`,
      `${item.totalPrice.toLocaleString('tr-TR')} TL`,
    ])

    autoTable(doc, {
      startY: 55,
      head: [['Ürün', 'Adet', 'Birim Fiyat', 'Toplam']],
      body: tableData,
      foot: [['', '', 'TOPLAM:', `${invoice.totalAmount.toLocaleString('tr-TR')} TL`]],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      footStyles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
    })

    doc.save(`${invoice.invoiceNumber}.pdf`)
    toast.success('PDF indirildi')
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Faturalarım</h1>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
      ) : invoices.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-3">🧾</div>
          <p className="text-gray-500">Henüz fatura yok</p>
        </div>
      ) : (
        <div className="space-y-2">
          {invoices.map((invoice) => {
            const paid = invoice.payments.reduce((s, p) => s + p.amount, 0)
            const remaining = invoice.totalAmount - paid
            const isExpanded = expanded === invoice.id
            return (
              <div key={invoice.id} className="card">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : invoice.id)}
                >
                  <div>
                    <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                    <div className="text-xs text-gray-400">{new Date(invoice.createdAt).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{invoice.totalAmount.toLocaleString('tr-TR')}₺</div>
                    {remaining > 0 ? (
                      <div className="text-xs text-red-500">Kalan: {remaining.toLocaleString('tr-TR')}₺</div>
                    ) : (
                      <div className="text-xs text-green-600">Ödendi ✓</div>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {invoice.order.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div>
                          <span>{item.product.name}</span>
                          <span className="text-gray-500 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-medium">{item.totalPrice.toLocaleString('tr-TR')}₺</span>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      className="btn-secondary text-sm w-full mt-2"
                    >
                      📥 PDF İndir
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
