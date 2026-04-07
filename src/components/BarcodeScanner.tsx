'use client'

import { useEffect, useRef, useState } from 'react'

interface BarcodeScannerProps {
  onScan: (barcode: string) => void
  onClose: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Html5QrcodeType = any

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5QrcodeType>(null)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let html5QrCode: Html5QrcodeType = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (!divRef.current) return

        html5QrCode = new Html5Qrcode('barcode-reader')
        scannerRef.current = html5QrCode

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 150 } },
          (decodedText: string) => {
            onScan(decodedText)
            html5QrCode?.stop().catch(() => {})
          },
          () => {}
        )
      } catch (err) {
        setError('Kamera erişimi sağlanamadı. Lütfen izin verin.')
        console.error(err)
      }
    }

    startScanner()

    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {})
      }
    }
  }, [onScan])

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Barkod Tara</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
        </div>
        <div className="p-4">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-500 text-sm">{error}</p>
              <button onClick={onClose} className="btn-secondary mt-4">Kapat</button>
            </div>
          ) : (
            <>
              <div id="barcode-reader" ref={divRef} className="rounded-lg overflow-hidden" />
              <p className="text-center text-sm text-gray-500 mt-3">
                Barkodu kamera çerçevesi içine yerleştirin
              </p>
              <button onClick={onClose} className="btn-secondary w-full mt-3">İptal</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
