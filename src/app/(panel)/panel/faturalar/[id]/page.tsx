'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface InvoiceDetail {
  id: string
  invoiceNumber: string
  totalAmount: number
  createdAt: string
  order: {
    id: string
    customer: { name: string; shopName: string; phone: string | null; address: string | null }
    items: {
      id: string
      quantity: number
      unitPrice: number
      totalPrice: number
      product: { name: string }
    }[]
  }
  payments: {
    id: string
    amount: number
    method: string
    note: string | null
    createdAt: string
  }[]
}

export default function FaturaDetayPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentForm, setPaymentForm] = useState({ amount: '', method: 'CASH', note: '' })
  const [savingPayment, setSavingPayment] = useState(false)

  const fetchInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/panel/invoices/${params.id}`)
      const data = await res.json()
      setInvoice(data.invoice)
    } catch {
      toast.error('Fatura yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingPayment(true)
    try {
      const res = await fetch(`/api/panel/invoices/${params.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          method: paymentForm.method,
          note: paymentForm.note || undefined,
        }),
      })
      if (res.ok) {
        toast.success('Ödeme kaydedildi')
        setPaymentForm({ amount: '', method: 'CASH', note: '' })
        fetchInvoice()
      } else {
        toast.error('Ödeme kaydedilemedi')
      }
    } catch {
      toast.error('Bir hata oluştu')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
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
    doc.text(`Müşteri: ${invoice.order.customer.shopName}`, 14, 49)
    doc.text(`Yetkili: ${invoice.order.customer.name}`, 14, 56)
    if (invoice.order.customer.phone) {
      doc.text(`Tel: ${invoice.order.customer.phone}`, 14, 63)
    }

    const tableData = invoice.order.items.map((item) => [
      item.product.name,
      item.quantity.toString(),
      `${item.unitPrice.toLocaleString('tr-TR')} TL`,
      `${item.totalPrice.toLocaleString('tr-TR')} TL`,
    ])

    autoTable(doc, {
      startY: 72,
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

  if (loading) return <div className="text-center py-12 text-gray-500">Yükleniyor...</div>
  if (!invoice) return <div className="text-center py-12 text-gray-500">Fatura bulunamadı</div>

  const totalPaid = invoice.payments.reduce((s, p) => s + p.amount, 0)
  const remaining = invoice.totalAmount - totalPaid

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">← Geri</button>
      </div>

      <div className="card mb-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <p className="text-gray-500">{invoice.order.customer.shopName}</p>
            <p className="text-xs text-gray-400">{new Date(invoice.createdAt).toLocaleDateString('tr-TR')}</p>
          </div>
          <button onClick={handleDownloadPDF} className="btn-secondary text-sm">
            📥 PDF
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Ürünler</h2>
        {invoice.order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
            <div>
              <div className="font-medium">{item.product.name}</div>
              <div className="text-xs text-gray-500">{item.quantity} × {item.unitPrice.toLocaleString('tr-TR')}₺</div>
            </div>
            <div className="font-semibold">{item.totalPrice.toLocaleString('tr-TR')}₺</div>
          </div>
        ))}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 font-bold">
          <span>Toplam</span>
          <span className="text-blue-600 text-lg">{invoice.totalAmount.toLocaleString('tr-TR')}₺</span>
        </div>
      </div>

      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Ödemeler</h2>
          <div className={`text-sm font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {remaining > 0 ? `Kalan: ${remaining.toLocaleString('tr-TR')}₺` : 'Ödendi ✓'}
          </div>
        </div>

        {invoice.payments.length > 0 && (
          <div className="space-y-2 mb-4">
            {invoice.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">{p.method === 'CASH' ? '💵 Nakit' : '📆 Vadeli'}</span>
                  {p.note && <span className="text-gray-500 ml-2">· {p.note}</span>}
                  <div className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString('tr-TR')}</div>
                </div>
                <div className="font-semibold text-green-600">{p.amount.toLocaleString('tr-TR')}₺</div>
              </div>
            ))}
          </div>
        )}

        {remaining > 0 && (
          <form onSubmit={handlePayment} className="space-y-3 border-t pt-3">
            <h3 className="text-sm font-medium text-gray-700">Ödeme Ekle</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Tutar (₺)</label>
                <input
                  type="number"
                  step="0.01"
                  max={remaining}
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm(p => ({ ...p, amount: e.target.value }))}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Ödeme Türü</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm(p => ({ ...p, method: e.target.value }))}
                  className="input"
                >
                  <option value="CASH">Nakit</option>
                  <option value="CREDIT">Vadeli</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Not</label>
              <input
                type="text"
                value={paymentForm.note}
                onChange={(e) => setPaymentForm(p => ({ ...p, note: e.target.value }))}
                className="input"
                placeholder="İsteğe bağlı"
              />
            </div>
            <button type="submit" disabled={savingPayment} className="btn-primary w-full">
              {savingPayment ? 'Kaydediliyor...' : 'Ödeme Kaydet'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
