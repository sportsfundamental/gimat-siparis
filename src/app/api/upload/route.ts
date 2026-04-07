import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  }

  try {
    const { image } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'Görsel gerekli' }, { status: 400 })
    }

    const url = await uploadImage(image)
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 })
  }
}
