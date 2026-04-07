import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith('/admin') && token?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/giris', req.url))
    }

    if (pathname.startsWith('/panel') && token?.role !== 'DEALER') {
      return NextResponse.redirect(new URL('/giris', req.url))
    }

    if (pathname.startsWith('/musteri') && token?.role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL('/giris', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/panel/:path*', '/musteri/:path*'],
}
