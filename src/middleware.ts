import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) return NextResponse.next()

  const user = process.env.ADMIN_USERNAME ?? 'admin'
  const pass = process.env.ADMIN_PASSWORD

  // If no password set, block access entirely in production
  if (!pass) {
    if (process.env.NODE_ENV === 'production') {
      return new NextResponse('Admin non configuré.', { status: 503 })
    }
    return NextResponse.next()
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ')
    if (scheme === 'Basic' && encoded) {
      const decoded = Buffer.from(encoded, 'base64').toString('utf-8')
      const [inputUser, inputPass] = decoded.split(':')
      if (inputUser === user && inputPass === pass) {
        return NextResponse.next()
      }
    }
  }

  return new NextResponse('Authentification requise.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin", charset="UTF-8"',
    },
  })
}

export const config = {
  matcher: '/admin/:path*',
}
