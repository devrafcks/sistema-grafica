import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const jwtSecret = process.env.JWT_SECRET
const secret = jwtSecret ? new TextEncoder().encode(jwtSecret) : null

export async function proxy(request: NextRequest) {
  if (!secret) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  if (pathname === '/login' && token) {
    try {
      const { payload } = await jose.jwtVerify(token, secret)
      const role = payload.role as string

      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { payload } = await jose.jwtVerify(token, secret)

      if (payload.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  const sharedRoutes = ['/products', '/dashboard']

  if (sharedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      await jose.jwtVerify(token, secret)
    } catch {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/products/:path*', '/login'],
}

