import { OrderStatus } from '@prisma/client'

const statusMap: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: 'Bekliyor', className: 'badge-pending' },
  PREPARING: { label: 'Hazırlanıyor', className: 'badge-preparing' },
  ON_THE_WAY: { label: 'Yolda', className: 'badge-on-the-way' },
  DELIVERED: { label: 'Teslim Edildi', className: 'badge-delivered' },
  CANCELLED: { label: 'İptal', className: 'badge-cancelled' },
}

export default function StatusBadge({ status }: { status: OrderStatus }) {
  const { label, className } = statusMap[status]
  return <span className={className}>{label}</span>
}
